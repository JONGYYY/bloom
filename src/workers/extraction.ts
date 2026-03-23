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

    const colorList = domData.extractedColors?.map((c: any, idx: number) => 
      `${c.color} (used ${c.count} times)`
    ).join('\n') || 'No colors extracted'

    const prompt = `Analyze this brand website screenshot and extract the following brand elements:

1. Color Palette - IMPORTANT INSTRUCTIONS:
   Below is a list of colors extracted from the page's CSS, sorted by frequency.
   Your task is to:
   - Select the most DISTINCTIVE and BRAND-DEFINING colors from this list
   - DEDUPLICATE similar colors: Group colors that are within 10-15% similarity (e.g., #FF90E8 and #FF88E5 are too similar, pick one)
   - Exclude pure black (#000000, #000), pure white (#FFFFFF, #FFF), and neutral grays (#F5F5F5, #CCCCCC, #E5E5E5, etc.) UNLESS they are clearly a key brand color
   - Focus on colors that appear frequently AND are visually distinctive
   - Aim for 4-8 TOTAL unique colors across all categories
   
   Extracted colors from page (sorted by frequency):
${colorList}
   
   Categorize the selected colors as:
   - PRIMARY (2-4 colors): The most dominant, frequently used brand colors that define brand identity
   - SECONDARY (1-3 colors): Supporting colors used for sections, backgrounds, or secondary elements  
   - ACCENT (1-2 colors): High-contrast colors used for CTAs, highlights, or important actions
   
   Return EXACT hex codes from the list above (e.g., "#FF90E8").
   Provide confidence level (high/medium/low) based on frequency and visual prominence in the screenshot.

2. Typography:
   - Identify the heading font family and weight (from the largest, most prominent headings)
   - Identify the body text font family and weight (from paragraph text)
   - Use the font family names from the DOM data provided below
   - Provide confidence level for each

3. Logo Candidates:
   - From the images list below, identify which ones are likely brand logos
   - Return the exact URL from the list
   - Rank by confidence (high/medium/low)
   - Logos are typically in the header/nav area, relatively small (under 200px), and contain brand identity
   - Include up to 3 most likely logo candidates

Images found on page:
${imageList}

4. Style Traits:
   - Select 2-4 applicable traits from: minimal, premium, playful, bold, editorial, soft, sporty, luxe
   - Base this on: layout density, color vibrancy, typography style, spacing, visual complexity

Additional context from DOM:
- Title: ${domData.title}
- Header styles: ${JSON.stringify(domData.headerStyles)}
- Body styles: ${JSON.stringify(domData.bodyStyles)}
- Heading styles: ${JSON.stringify(domData.headingStyles)}
- Button styles: ${JSON.stringify(domData.buttonStyles)}

Return a JSON object with this EXACT structure:
{
  "colors": {
    "primary": ["#HEX1", "#HEX2"],
    "secondary": ["#HEX3"],
    "accent": ["#HEX4"],
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
  "styleTraits": ["trait1", "trait2"],
  "provenance": {
    "colors": "Explain which page areas these colors were found in",
    "fonts": "Explain where these fonts were detected",
    "logos": "Explain why these images were identified as logos",
    "styleTraits": "Explain the reasoning for selected traits"
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
