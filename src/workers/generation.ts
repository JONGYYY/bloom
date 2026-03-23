import { Worker, Job } from 'bullmq'
import { connection } from './queue'
import { prisma } from '@/lib/db'
import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import FormData from 'form-data'

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

function getIdeogramAspectRatio(aspectRatio?: string): string {
  const ratios: Record<string, string> = {
    square: 'ASPECT_1_1',
    portrait: 'ASPECT_9_16',
    landscape: 'ASPECT_16_9',
    wide: 'ASPECT_16_9',
    story: 'ASPECT_9_16',
  }
  
  return ratios[aspectRatio || 'square'] || 'ASPECT_1_1'
}

function getIdeogramStyleType(aesthetic?: string): string {
  const styleMap: Record<string, string> = {
    minimal: 'GENERAL',
    luxury: 'REALISTIC',
    bold: 'DESIGN',
    playful: 'ANIME',
    professional: 'GENERAL',
    modern: 'DESIGN',
    organic: 'REALISTIC',
    tech: 'DESIGN',
  }
  
  return styleMap[aesthetic || ''] || 'GENERAL'
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

    // Get Ideogram parameters
    const aspectRatio = getIdeogramAspectRatio(parameters.aspectRatio)
    const styleType = getIdeogramStyleType(parameters.aesthetic)
    const variants = parameters.variants || 1

    // Generate images using Ideogram API
    const generatedAssets = []
    
    for (let i = 0; i < variants; i++) {
      console.log(`[Generation] Generating variant ${i + 1}/${variants}`)
      
      // Create form data for Ideogram API
      const formData = new FormData()
      formData.append('prompt', enhancedPrompt)
      formData.append('aspect_ratio', aspectRatio)
      formData.append('style_type', styleType)
      formData.append('num_images', '1')
      
      // Add magic prompt for better results
      formData.append('magic_prompt', 'AUTO')
      
      // Add color palette if brand colors are available
      if (studio.profile?.colors?.primary && studio.profile.colors.primary.length > 0) {
        const brandColors = studio.profile.colors.primary.slice(0, 5)
        formData.append('color_palette', JSON.stringify({
          members: brandColors.map((color: string) => ({ color_hex: color }))
        }))
      }

      // Call Ideogram API
      const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
        method: 'POST',
        headers: {
          'Api-Key': process.env.IDEOGRAM_API_KEY || '',
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ideogram API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.data || result.data.length === 0 || !result.data[0].url) {
        throw new Error('No image URL returned from Ideogram')
      }

      // Download the generated image
      const imageResponse = await fetch(result.data[0].url)
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
            model: 'ideogram-v3',
            aspectRatio: aspectRatio,
            styleType: styleType,
            quality: parameters.quality || 'standard',
            ideogramPrompt: result.data[0].prompt,
            seed: result.data[0].seed,
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
