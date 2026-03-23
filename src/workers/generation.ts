import { Worker, Job } from 'bullmq'
import OpenAI from 'openai'
import { connection } from './queue'
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

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
  const bucketName = process.env.S3_BUCKET_NAME || 'brand-assets'
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
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

function buildEnhancedPrompt(
  userPrompt: string,
  studioProfile: any,
  parameters: GenerationJobData['parameters']
): string {
  let enhancedPrompt = userPrompt

  // Add aesthetic/style modifiers
  if (parameters.aesthetic) {
    enhancedPrompt += `, ${parameters.aesthetic} aesthetic`
  }

  if (parameters.mood) {
    enhancedPrompt += `, ${parameters.mood} mood`
  }

  if (parameters.composition) {
    enhancedPrompt += `, ${parameters.composition} composition`
  }

  if (parameters.artMovement && parameters.artMovement.length > 0) {
    enhancedPrompt += `, inspired by ${parameters.artMovement.join(', ')}`
  }

  // Add brand context based on brand strength
  const brandStrength = parameters.brandStrength || 'balanced'
  
  if (studioProfile && brandStrength !== 'loose') {
    const colors = studioProfile.colors
    const fonts = studioProfile.fonts
    
    if (brandStrength === 'strict' || brandStrength === 'strong') {
      // Strong brand adherence
      if (colors?.primary && colors.primary.length > 0) {
        enhancedPrompt += `, using brand colors: ${colors.primary.slice(0, 3).join(', ')}`
      }
      if (fonts?.heading?.family) {
        enhancedPrompt += `, ${fonts.heading.family} typography style`
      }
      if (studioProfile.styleTraits && studioProfile.styleTraits.length > 0) {
        enhancedPrompt += `, ${studioProfile.styleTraits.slice(0, 2).join(' and ')} style`
      }
    } else if (brandStrength === 'balanced') {
      // Balanced brand influence
      if (studioProfile.styleTraits && studioProfile.styleTraits.length > 0) {
        enhancedPrompt += `, ${studioProfile.styleTraits[0]} style`
      }
    }
  }

  // Add text presence guidance
  if (parameters.textPresence) {
    const textGuidance = {
      none: 'no text, purely visual',
      minimal: 'minimal text overlay',
      headline: 'prominent headline text',
      'text-heavy': 'text-focused design with multiple text elements'
    }
    enhancedPrompt += `, ${textGuidance[parameters.textPresence as keyof typeof textGuidance] || ''}`
  }

  // Add quality/style suffix
  enhancedPrompt += ', high quality, professional design'

  return enhancedPrompt
}

function getAspectRatioSize(aspectRatio?: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    square: { width: 1024, height: 1024 },
    portrait: { width: 1024, height: 1792 },
    landscape: { width: 1792, height: 1024 },
    wide: { width: 1792, height: 1024 },
    story: { width: 1024, height: 1792 },
  }
  
  return ratios[aspectRatio || 'square'] || ratios.square
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

    // Fetch studio profile
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { profile: true },
    })

    if (!studio) {
      throw new Error('Studio not found')
    }

    // Build enhanced prompt
    const enhancedPrompt = buildEnhancedPrompt(prompt, studio.profile, parameters)
    console.log(`[Generation] Enhanced prompt: ${enhancedPrompt}`)

    // Get aspect ratio size
    const size = getAspectRatioSize(parameters.aspectRatio)
    const variants = parameters.variants || 1

    // Generate images using DALL-E 3
    const generatedAssets = []
    
    for (let i = 0; i < variants; i++) {
      console.log(`[Generation] Generating variant ${i + 1}/${variants}`)
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size.width === 1024 && size.height === 1024 ? '1024x1024' : 
              size.width === 1792 ? '1792x1024' : '1024x1792',
        quality: parameters.quality === 'hd' ? 'hd' : 'standard',
        response_format: 'url',
      })

      if (!response.data[0]?.url) {
        throw new Error('No image URL returned from DALL-E')
      }

      // Download the generated image
      const imageResponse = await fetch(response.data[0].url)
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

      // Upload to S3
      const storageKey = `studios/${studioId}/generations/${generationId}/asset-${i + 1}-${Date.now()}.png`
      const assetUrl = await uploadToS3(imageBuffer, storageKey)

      // Create asset record
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
            size: `${size.width}x${size.height}`,
            quality: parameters.quality || 'standard',
            revisedPrompt: response.data[0].revised_prompt,
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
    concurrency: 2, // Limit concurrent DALL-E calls
  }
)

generationWorker.on('completed', (job) => {
  console.log(`[Generation Worker] Job ${job.id} completed`)
})

generationWorker.on('failed', (job, err) => {
  console.error(`[Generation Worker] Job ${job?.id} failed:`, err)
})

console.log('[Generation Worker] Started')
