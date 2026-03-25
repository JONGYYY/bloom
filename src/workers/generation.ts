import { Worker, Job } from 'bullmq'
import OpenAI from 'openai'
import { connection } from './queue'
import { prisma } from '@/lib/db'
import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { compressBrandProfile, isAssetMetadata } from '@/lib/prompt'
import { runGenerationPipeline, type GenerationInput, type PipelineContext, type BrandAssetWithMetadata, type CompressedBrandProfile } from '@/lib/generation-pipeline'

interface GenerationJobData {
  generationId: string
  studioId: string
  prompt: string
  parameters: {
    outputType?: string
    aesthetic?: string
    aspectRatio?: string
    variants?: number
    brandStrength?: string
    textPresence?: string
    composition?: string
    mood?: string
    artMovement?: string[]
    quality?: string
    referenceImages?: string[]
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET || 'bloom-assets'
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read', // Make generated images publicly accessible
    },
  })

  await upload.done()
  
  // Generate a pre-signed URL that expires in 7 days (for generated assets)
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 604800 })
  
  return signedUrl
}

// Legacy function - now replaced by new prompt pipeline
// Kept for reference but no longer used
function buildEnhancedPrompt_DEPRECATED(
  userPrompt: string,
  studioProfile: any,
  parameters: GenerationJobData['parameters']
): string {
  console.warn('[Generation] Using deprecated buildEnhancedPrompt - should use new pipeline')
  let enhancedPrompt = userPrompt
  enhancedPrompt += ', high quality, professional design'
  return enhancedPrompt
}

function getDallESize(aspectRatio?: string): '1024x1024' | '1024x1792' | '1792x1024' {
  const sizes: Record<string, '1024x1024' | '1024x1792' | '1792x1024'> = {
    square: '1024x1024',
    portrait: '1024x1792',
    landscape: '1792x1024',
    wide: '1792x1024',
    story: '1024x1792',
  }
  
  return sizes[aspectRatio || 'square'] || '1024x1024'
}

async function processGenerationJob(job: Job<GenerationJobData>) {
  const { generationId, studioId, prompt, parameters } = job.data

  try {
    console.log(`[Generation] Starting for generation ${generationId}`)

    // Update generation status
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'processing' },
    })

    // Fetch studio with profile and tagged brand assets
    const studioWithProfile = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { 
        profile: true,
        brandAssets: {
          where: {
            metadata: {
              not: null as any
            }
          }
        }
      },
    })

    if (!studioWithProfile) {
      throw new Error('Studio not found')
    }

    // ========================================================================
    // NEW 4-STAGE PIPELINE
    // ========================================================================
    
    // Prepare brand profile (compressed)
    const brandProfile: CompressedBrandProfile | null = studioWithProfile.profile 
      ? compressBrandProfile(studioWithProfile as any)
      : null

    if (brandProfile) {
      console.log(`[Generation] Brand profile compressed:`, {
        brandName: brandProfile.brandName,
        palette: brandProfile.paletteSummary,
        tone: brandProfile.toneSummary,
      })
    }

    // Prepare brand assets with metadata
    const brandAssets: BrandAssetWithMetadata[] = studioWithProfile.brandAssets
      .filter((a: any) => a.metadata && isAssetMetadata(a.metadata))
      .map((a: any) => ({
        id: a.id,
        type: a.type,
        url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${a.storageKey}`,
        storageKey: a.storageKey,
        metadata: a.metadata,
      }))

    // Build pipeline context
    const pipelineContext: PipelineContext = {
      studioId,
      brandProfile,
      availableAssets: brandAssets,
    }

    // Build pipeline input
    const pipelineInput: GenerationInput = parameters.outputType
      ? {
          type: 'idea_selection',
          ideaTemplateId: parameters.outputType,
          subject: prompt,
          parameters: {
            aspectRatio: (parameters.aspectRatio as any) || '1:1',
            quality: parameters.quality === 'hd' ? 'final' : 'draft',
            variants: parameters.variants || 1,
            artStyle: parameters.aesthetic,
            mood: parameters.mood,
            composition: parameters.composition,
            textPresence: (parameters.textPresence as any) || 'minimal',
            brandStrength: (parameters.brandStrength as any) || 'balanced',
          },
        }
      : {
          type: 'raw_prompt',
          prompt: prompt,
          parameters: {
            aspectRatio: (parameters.aspectRatio as any) || '1:1',
            quality: parameters.quality === 'hd' ? 'final' : 'draft',
            variants: parameters.variants || 1,
            artStyle: parameters.aesthetic,
            mood: parameters.mood,
            composition: parameters.composition,
            textPresence: (parameters.textPresence as any) || 'minimal',
            brandStrength: (parameters.brandStrength as any) || 'balanced',
          },
        }

    // Run the 4-stage pipeline
    console.log(`[Generation] Running 4-stage pipeline...`)
    const pipelineResult = await runGenerationPipeline(pipelineInput, pipelineContext)

    if (!pipelineResult.success || !pipelineResult.assembledPrompt) {
      throw new Error(`Pipeline failed: ${pipelineResult.error}`)
    }

    const assembled = pipelineResult.assembledPrompt
    const enhancedPrompt = assembled.finalPrompt

    console.log(`[Generation] Pipeline complete:`)
    console.log(`  - Final prompt (${assembled.promptMetadata.tokenEstimate} tokens): ${enhancedPrompt.substring(0, 100)}...`)
    console.log(`  - Idea type: ${assembled.promptMetadata.ideaType}`)
    console.log(`  - Brand lens applied: ${assembled.promptMetadata.brandLensApplied}`)
    console.log(`  - Selected ${assembled.selectedReferences.length} reference assets`)
    console.log(`  - Constraints applied: ${assembled.promptMetadata.constraintsApplied.join(', ')}`)

    // Get DALL-E parameters
    const size = getDallESize(parameters.aspectRatio)
    const variants = parameters.variants || 1

    // Generate images using DALL-E 3
    const generatedAssets = []
    
    for (let i = 0; i < variants; i++) {
      console.log(`[Generation] Generating variant ${i + 1}/${variants}`)
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: parameters.quality === 'hd' ? 'hd' : 'standard',
        response_format: 'url',
      })

      if (!response.data || !response.data[0]?.url) {
        throw new Error('No image URL returned from DALL-E')
      }

      // Download the generated image
      const imageResponse = await fetch(response.data[0].url)
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

      // Upload to S3
      const storageKey = `studios/${studioId}/generations/${generationId}/asset-${i + 1}-${Date.now()}.png`
      const assetUrl = await uploadToS3(imageBuffer, storageKey)

      // Create asset record with new pipeline metadata
      const asset = await prisma.asset.create({
        data: {
          studioId,
          generationId,
          type: 'generated',
          storageKey,
          url: assetUrl,
          prompt: enhancedPrompt,
          parameters: parameters as any,
          metadata: {
            model: 'dall-e-3',
            size: size,
            quality: parameters.quality || 'standard',
            revisedPrompt: response.data[0]?.revised_prompt || enhancedPrompt,
            // NEW: 4-stage pipeline metadata
            pipeline: {
              ideaType: assembled.promptMetadata.ideaType,
              subject: assembled.promptMetadata.subject,
              brandLensApplied: assembled.promptMetadata.brandLensApplied,
              artStyleApplied: assembled.promptMetadata.artStyleApplied,
              tokenEstimate: assembled.promptMetadata.tokenEstimate,
            },
            selectedReferences: assembled.selectedReferences.map(r => ({
              assetId: r.assetId,
              assetType: r.assetType,
              relevanceScore: r.relevanceScore,
              reason: r.reason,
            })),
            constraintsApplied: assembled.promptMetadata.constraintsApplied,
          },
        },
      })

      generatedAssets.push(asset)
      console.log(`[Generation] Created asset ${asset.id}`)
    }

    // Update generation as completed
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'completed',
        updatedAt: new Date(),
      },
    })

    console.log(`[Generation] Complete for generation ${generationId}, created ${generatedAssets.length} assets`)

    return { success: true, assets: generatedAssets }
  } catch (error) {
    console.error(`[Generation] Error for generation ${generationId}:`, error)

    // Update generation as failed
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'failed',
        updatedAt: new Date(),
      },
    })

    throw error
  }
}

// Create worker
export const generationWorker = new Worker<GenerationJobData>(
  'generation',
  processGenerationJob,
  {
    connection,
    concurrency: 5, // Increased for production scale - handles 5 simultaneous DALL-E generations
  }
)

generationWorker.on('completed', (job) => {
  console.log(`[Generation Worker] Job ${job.id} completed`)
})

generationWorker.on('failed', (job, err) => {
  console.error(`[Generation Worker] Job ${job?.id} failed:`, err)
})

console.log('[Generation Worker] Started')
