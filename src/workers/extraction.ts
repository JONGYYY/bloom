import { Worker, Job } from 'bullmq'
import { connection } from './queue'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

interface ExtractionJobData {
  studioId: string
  url: string
  jobId: string
  desktopScreenshotUrl: string
  mobileScreenshotUrl: string
  domData: any
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function processExtractionJob(job: Job<ExtractionJobData>) {
  const { studioId, url, jobId, desktopScreenshotUrl, domData } = job.data

  try {
    console.log(`[Extraction] Starting for studio ${studioId}`)

    // Update job stage
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        stage: 'extracting',
        progress: 60,
      },
    })

    // Prepare prompt for GPT-4 Vision
    const imageList = domData.images?.map((img: any, idx: number) => 
      `${idx + 1}. ${img.src} (alt: "${img.alt}", ${img.width}x${img.height})`
    ).join('\n') || 'No images found'

    const prompt = `Analyze this brand website screenshot and extract the following brand elements:

1. Color Palette:
   - Identify 2-3 primary colors (most dominant brand colors)
   - Identify 2-3 secondary colors (supporting colors)
   - Identify 1-2 accent colors (call-to-action, highlights)
   - Provide confidence level (high/medium/low) for each color group
   - Return colors as hex codes (e.g., "#FF5733")

2. Typography:
   - Identify the heading font family and weight
   - Identify the body text font family and weight
   - Provide confidence level for each

3. Logo Candidates:
   - From the images list below, identify which ones are likely brand logos
   - Return the exact URL from the list
   - Rank by confidence (high/medium/low)
   - Typically logos are in the header/nav area and are relatively small

Images found on page:
${imageList}

4. Style Traits:
   - Select applicable traits from: minimal, premium, playful, bold, editorial, soft, sporty, luxe
   - Explain reasoning for each trait

5. Provenance:
   - Explain how each value was derived

Additional context from DOM:
- Title: ${domData.title}
- Header styles: ${JSON.stringify(domData.headerStyles)}
- Body styles: ${JSON.stringify(domData.bodyStyles)}
- Heading styles: ${JSON.stringify(domData.headingStyles)}

Return a JSON object with this structure:
{
  "colors": {
    "primary": ["#hex1", "#hex2"],
    "secondary": ["#hex3", "#hex4"],
    "accent": ["#hex5"],
    "confidence": "high" | "medium" | "low"
  },
  "fonts": {
    "heading": {
      "family": "Font Name",
      "weight": "600",
      "confidence": "high" | "medium" | "low"
    },
    "body": {
      "family": "Font Name",
      "weight": "400",
      "confidence": "high" | "medium" | "low"
    }
  },
  "logos": {
    "candidates": [
      { "url": "exact-url-from-images-list", "confidence": "high" | "medium" | "low" }
    ],
    "selected": null
  },
  "styleTraits": ["minimal", "premium"],
  "provenance": {
    "colors": "Detected from header, buttons, and prominent UI elements",
    "fonts": "Extracted from computed styles of headings and body text",
    "logos": "Identified from header/nav images",
    "styleTraits": "Based on layout, spacing, and visual aesthetic"
  }
}`

    console.log(`[Extraction] Calling OpenAI GPT-4 Vision API`)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: desktopScreenshotUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const extractedData = JSON.parse(response.choices[0].message.content || '{}')

    console.log(`[Extraction] Received data from OpenAI:`, extractedData)

    // Update job stage
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        stage: 'building',
        progress: 80,
      },
    })

    // Create studio profile
    await prisma.studioProfile.create({
      data: {
        studioId,
        colors: extractedData.colors || {},
        fonts: extractedData.fonts || {},
        logos: extractedData.logos || { candidates: [], selected: null },
        styleTraits: extractedData.styleTraits || [],
        provenance: extractedData.provenance || {},
        isConfirmed: false,
      },
    })

    // Update studio status
    await prisma.studio.update({
      where: { id: studioId },
      data: {
        status: 'ready',
      },
    })

    // Update job as completed
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        stage: 'complete',
        progress: 100,
      },
    })

    console.log(`[Extraction] Complete for studio ${studioId}`)

    return { success: true }
  } catch (error) {
    console.error(`[Extraction] Error for studio ${studioId}:`, error)

    // Update job as failed
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Extraction failed',
      },
    })

    throw error
  }
}

// Create worker
export const extractionWorker = new Worker<ExtractionJobData>(
  'extraction',
  processExtractionJob,
  {
    connection,
    concurrency: 3,
  }
)

extractionWorker.on('completed', (job) => {
  console.log(`[Extraction Worker] Job ${job.id} completed`)
})

extractionWorker.on('failed', (job, err) => {
  console.error(`[Extraction Worker] Job ${job?.id} failed:`, err)
})

console.log('[Extraction Worker] Started')
