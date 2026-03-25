import { Worker, Job } from 'bullmq'
import { connection } from './queue'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'
import { downloadAssetsBatch, AssetToDownload, DownloadedAsset } from '@/lib/asset-downloader'

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
    const allImages = domData.allImages || []
    const metaAssets = domData.metaAssets || []
    
    const imageList = allImages.map((img: any, idx: number) => {
      if (img.type === 'svg') {
        return `${idx + 1}. [SVG] ${img.width}x${img.height} in ${img.location} (class: "${img.className}")`
      }
      return `${idx + 1}. ${img.src} (alt: "${img.alt}", ${img.width}x${img.height}, location: ${img.location}, context: ${img.parentContext})`
    }).join('\n') || 'No images found'
    
    const metaAssetList = metaAssets.map((asset: any, idx: number) => 
      `${idx + 1}. [${asset.type}] ${asset.src}`
    ).join('\n') || 'No meta assets found'

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
   - Return the exact URL from the list (or indicate if it's an SVG with its index)
   - Rank by confidence (high/medium/low)
   - Logos are typically in the header/nav area, relatively small (under 200px), and contain brand identity
   - Include up to 5 most likely logo candidates (including SVGs)
   - For SVGs, return: { "type": "svg", "index": N, "confidence": "high" }
   - For images, return: { "type": "image", "url": "exact-url", "confidence": "high" }

Images found on page:
${imageList}

Meta assets (favicons, og:image, etc.):
${metaAssetList}

4. Brand Identity:
   - Extract the brand name (from title, logo, or prominent text)
   - Extract the tagline if visible (usually near logo or in hero section)
   - Generate a brief brand description (1-2 sentences about what the brand does)

5. Tone Keywords:
   - Select 5-7 tone keywords that describe the brand's personality
   - Choose from: Playful, Optimistic, Modern, Energetic, Approachable, Professional, Bold, 
     Friendly, Clean, Vibrant, Minimal, Premium, Editorial, Soft, Luxe, Innovative, 
     Trustworthy, Creative, Sophisticated, Casual, Warm, Technical, Artistic
   - Base this on: visual style, color choices, typography, imagery, copy tone

6. Aesthetic Description:
   - Write a rich, detailed aesthetic description (2-4 sentences)
   - Describe the overall visual language, design approach, and brand personality
   - Include: contrast level, color palette feel, typography style, visual elements, mood
   - Example format: "The [Brand] brand aesthetic is characterized by [key visual trait]. 
     It pairs [typography description] with [color description], set against [background description]. 
     [Visual elements description] imbue the brand with [personality traits], creating 
     [overall impression]."

7. Color Provenance:
   - For each selected color, note where it was primarily found
   - Sources: "text", "backgrounds", "illustrations", "buttons", "accents", "header", "footer"
   - Track frequency: "high", "medium", "low"

Additional context from DOM:
- Title: ${domData.title}
- URL: ${domData.url || url}
- Header styles: ${JSON.stringify(domData.headerStyles)}
- Body styles: ${JSON.stringify(domData.bodyStyles)}
- Heading styles: ${JSON.stringify(domData.headingStyles)}
- Button styles: ${JSON.stringify(domData.buttonStyles)}

8. Brand Assets to Download:
   - Identify ALL assets that should be downloaded and stored
   - Categorize each asset by type: logo, icon, illustration, hero_image, product_photo
   - For each asset, provide:
     - Source (URL or SVG index)
     - Asset type classification
     - Priority (high/medium/low)
     - Reason for inclusion

Return a JSON object with this EXACT structure:
{
  "brandIdentity": {
    "name": "Brand Name",
    "tagline": "Brand tagline or null",
    "description": "Brief 1-2 sentence description"
  },
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
      { "type": "image" | "svg", "url": "exact-url" | null, "svgIndex": number | null, "confidence": "high" | "medium" | "low" }
    ],
    "selected": null
  },
  "toneKeywords": ["Playful", "Optimistic", "Modern", "Energetic", "Approachable"],
  "aestheticDescription": "Rich 2-4 sentence description of the brand's visual aesthetic...",
  "colorProvenance": {
    "#HEX1": { "source": "illustrations", "frequency": "high" },
    "#HEX2": { "source": "buttons", "frequency": "medium" }
  },
  "assetsToDownload": [
    {
      "source": "url-or-svg-index",
      "type": "logo" | "icon" | "illustration" | "hero_image" | "product_photo",
      "priority": "high" | "medium" | "low",
      "reason": "explanation",
      "metadata": {
        "location": "header" | "hero" | "content",
        "width": number,
        "height": number
      }
    }
  ],
  "styleTraits": ["trait1", "trait2"],
  "provenance": {
    "colors": "Explain which page areas these colors were found in",
    "fonts": "Explain where these fonts were detected",
    "logos": "Explain why these images were identified as logos",
    "assets": "Explain the asset selection strategy",
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
        progress: 70,
      },
    })

    // Download and store brand assets
    console.log(`[Extraction] Downloading brand assets...`)
    const assetsToDownload: AssetToDownload[] = []
    
    // Process assets from OpenAI response
    if (extractedData.assetsToDownload && Array.isArray(extractedData.assetsToDownload)) {
      for (const asset of extractedData.assetsToDownload) {
        // Handle SVG assets
        if (asset.source.startsWith('svg-')) {
          const svgIndex = parseInt(asset.source.replace('svg-', ''))
          const svgImage = allImages.find((img: any, idx: number) => 
            img.type === 'svg' && idx === svgIndex
          )
          
          if (svgImage && svgImage.content) {
            assetsToDownload.push({
              source: asset.source,
              type: 'svg',
              priority: asset.priority || 'medium',
              reason: asset.reason,
              metadata: {
                svgContent: svgImage.content,
                width: svgImage.width,
                height: svgImage.height,
                location: svgImage.location,
              },
            })
          }
        } else {
          // Handle regular image URLs
          assetsToDownload.push({
            source: asset.source,
            type: asset.type || 'illustration',
            priority: asset.priority || 'medium',
            reason: asset.reason,
            metadata: asset.metadata,
          })
        }
      }
    }

    // Download assets in batches
    let downloadedAssets: DownloadedAsset[] = []
    if (assetsToDownload.length > 0) {
      console.log(`[Extraction] Downloading ${assetsToDownload.length} assets...`)
      downloadedAssets = await downloadAssetsBatch(assetsToDownload, studioId, 3)
      console.log(`[Extraction] Successfully downloaded ${downloadedAssets.length} assets`)
    }

    // Update progress
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        stage: 'building',
        progress: 85,
      },
    })

    // Create studio profile with enhanced brand identity
    await prisma.studioProfile.create({
      data: {
        studioId,
        colors: extractedData.colors || {},
        fonts: extractedData.fonts || {},
        logos: extractedData.logos || { candidates: [], selected: null },
        styleTraits: extractedData.styleTraits || [],
        provenance: {
          ...extractedData.provenance || {},
          colorProvenance: extractedData.colorProvenance || {}
        },
        brandName: extractedData.brandIdentity?.name || null,
        tagline: extractedData.brandIdentity?.tagline || null,
        description: extractedData.brandIdentity?.description || null,
        aestheticDesc: extractedData.aestheticDescription || null,
        toneKeywords: extractedData.toneKeywords || [],
        isConfirmed: false,
      },
    })

    // Create BrandAsset records for downloaded assets
    if (downloadedAssets.length > 0) {
      console.log(`[Extraction] Creating ${downloadedAssets.length} BrandAsset records...`)
      
      for (const asset of downloadedAssets) {
        // Find the original asset request to get type and metadata
        const originalAsset = assetsToDownload.find(a => 
          a.source === asset.originalUrl || 
          (a.metadata?.svgContent && asset.originalUrl === 'inline-svg')
        )

        await prisma.brandAsset.create({
          data: {
            studioId,
            sourceUrl: asset.originalUrl,
            storageKey: asset.storageKey,
            type: originalAsset?.type || 'illustration',
            metadata: {
              width: asset.width,
              height: asset.height,
              format: asset.format,
              size: asset.size,
              hash: asset.hash,
              priority: originalAsset?.priority || 'medium',
              reason: originalAsset?.reason || '',
              location: originalAsset?.metadata?.location || 'unknown',
              extractedFrom: url,
            },
          },
        })
      }
      
      console.log(`[Extraction] Created ${downloadedAssets.length} BrandAsset records`)
    }

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
