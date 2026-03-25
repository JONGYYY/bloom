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
        return `[SVG-${idx}] Inline SVG | Size: ${img.width}x${img.height} | Location: ${img.location} | Context: ${img.parentContext} | Class: "${img.className || 'none'}" | ID: "${img.id || 'none'}"`
      }
      if (img.type === 'background') {
        return `[IMG-${idx}] ${img.src} | Type: CSS Background | Size: ${img.width}x${img.height} | Location: ${img.location} | Context: ${img.parentContext}`
      }
      return `[IMG-${idx}] ${img.src} | Alt: "${img.alt || 'none'}" | Size: ${img.width}x${img.height} | Location: ${img.location} | Context: ${img.parentContext} | Class: "${img.className || 'none'}"`
    }).join('\n') || 'No images found'
    
    const metaAssetList = metaAssets.map((asset: any, idx: number) => 
      `[META-${idx}] ${asset.src} | Type: ${asset.type}`
    ).join('\n') || 'No meta assets found'

    const colorList = domData.extractedColors?.map((c: any, idx: number) => 
      `${c.color} (used ${c.count} times)`
    ).join('\n') || 'No colors extracted'

    const prompt = `Analyze this brand website screenshot and extract the following brand elements:

1. Color Palette - IMPORTANT INSTRUCTIONS:
   Below is a list of colors extracted from the page's CSS, sorted by frequency (most used first).
   
   Your task is to:
   - Use FREQUENCY as the PRIMARY selection factor
   - Only include colors that appear frequently (have high count values)
   - EXCLUDE colors with very low frequency (count < 10)
   - Group VERY SIMILAR colors together (within 5-10% similarity) and pick the most frequent one
     * Example: #FF90E8 and #FF88E5 are too similar, pick the one with higher count
     * BUT: White (#FFFFFF) and Gray (#CCCCCC) are NOT similar - keep both if frequent
     * AND: Light gray (#F5F5F5) and Dark gray (#333333) are NOT similar - keep both if frequent
   - DO NOT filter out neutrals/grays/black/white - if they're frequent, include them
   - Aim for 4-10 TOTAL colors across all categories based on frequency
   
   Extracted colors from page (sorted by frequency, highest first):
${colorList}
   
   Selection strategy:
   1. Start with the most frequent colors (top 15-20)
   2. Group very similar colors (pick most frequent from each group)
   3. Categorize by usage pattern and frequency:
      - PRIMARY (2-5 colors): Most frequent colors that define the brand
      - SECONDARY (1-3 colors): Moderately frequent supporting colors
      - ACCENT (1-2 colors): Less frequent but distinctive highlight colors
   
   Return EXACT hex codes from the list above.
   Provide confidence level (high/medium/low) based on frequency count.

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
   - Generate a specific, concise brand description (1-2 sentences, ~30-40 words)
     * Focus on WHAT the brand does and WHO it serves
     * Be specific about the product/service category
     * Mention key features or unique value if clear
     * Example format: "[Brand] is a [specific category] that [what it does]. It [key feature/benefit]."
     * Keep it factual and informative, not marketing-speak

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

8. Brand Assets to Download - CRITICAL EXTRACTION REQUIREMENTS:
   
   YOUR PRIMARY GOAL: Extract EVERY visual asset that represents the brand's visual identity.
   
   MANDATORY EXTRACTION CATEGORIES:
   
   A. LOGOS (Priority: HIGH)
      - Main logo in header/navigation
      - Footer logo (if different)
      - Favicon
      - Any logo variations (light/dark, icon-only, full wordmark)
      - Target: Extract ALL logo instances found
   
   B. ICONS (Priority: MEDIUM-HIGH)
      - Navigation icons
      - Feature/benefit icons
      - Social media icons
      - UI icons (checkmarks, arrows, etc.)
      - Service/product icons
      - Target: Extract AT LEAST 10-15 icons if present
   
   C. ILLUSTRATIONS (Priority: MEDIUM-HIGH)
      - Spot illustrations (small decorative graphics)
      - Character illustrations
      - Decorative elements
      - Abstract graphics
      - Pattern elements
      - Target: Extract ALL illustrations found
   
   D. HERO/BANNER IMAGES (Priority: MEDIUM)
      - Main hero/banner images
      - Section background images
      - Featured visuals
      - Target: Extract 2-5 key hero images
   
   E. PRODUCT PHOTOS (Priority: HIGH if applicable)
      - Product shots
      - Packaging images
      - Screenshots of product
      - Target: Extract ALL product visuals
   
   F. GRAPHIC ELEMENTS (Priority: LOW-MEDIUM)
      - Badges
      - Stamps
      - Decorative shapes
      - Brand patterns
   
   EXTRACTION STRATEGY:
   1. Review EVERY entry in the "Images found on page" list above
   2. Review ALL "Meta assets" (favicons, og:image)
   3. For SVG assets marked as [SVG-N], use source format: "svg-N" (e.g., "svg-0", "svg-1", "svg-2")
   4. For image URLs marked as [IMG-N] or [META-N], use the EXACT URL shown
   5. Target: 15-40 total assets (extract everything that's brand-relevant)
   6. Include ALL icons, ALL illustrations, ALL logos
   7. When in doubt about relevance, INCLUDE IT
   
   RESPONSE FORMAT for each asset:
   {
     "source": "exact-url-from-list" OR "svg-0" OR "svg-1" etc.,
     "type": "logo" | "icon" | "illustration" | "hero_image" | "product_photo" | "graphic_element",
     "priority": "high" | "medium" | "low",
     "reason": "Brief explanation",
     "metadata": {
       "location": "header" | "hero" | "content" | "footer",
       "width": number,
       "height": number
     }
   }
   
   QUALITY CHECKS:
   - If you found fewer than 10 assets, you're being too conservative - look again
   - Every SVG in the list should be considered (SVGs are valuable brand assets)
   - Small icons (16x16 to 64x64) are important - include them all
   - Illustrations of any size should be included

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
    console.log(`[Extraction] Available images: ${allImages.length} (${allImages.filter((i: any) => i.type === 'svg').length} SVGs)`)
    console.log(`[Extraction] Available meta assets: ${metaAssets.length}`)
    const assetsToDownload: AssetToDownload[] = []
    
    // Process assets from OpenAI response
    if (extractedData.assetsToDownload && Array.isArray(extractedData.assetsToDownload)) {
      console.log(`[Extraction] AI identified ${extractedData.assetsToDownload.length} assets to download`)
      for (const asset of extractedData.assetsToDownload) {
        // Handle SVG assets
        if (asset.source.startsWith('svg-')) {
          const svgIndex = parseInt(asset.source.replace('svg-', ''))
          // Find SVG by exact index in allImages array
          const svgImage = allImages[svgIndex]
          
          if (svgImage && svgImage.type === 'svg' && svgImage.content) {
            assetsToDownload.push({
              source: asset.source,
              type: asset.type || 'svg', // Use the AI's classification (logo, icon, etc.) or default to 'svg'
              priority: asset.priority || 'medium',
              reason: asset.reason,
              metadata: {
                svgContent: svgImage.content,
                width: svgImage.width,
                height: svgImage.height,
                location: svgImage.location,
              },
            })
            console.log(`[Extraction] Added SVG asset: ${asset.source} (${asset.type})`)
          } else {
            console.log(`[Extraction] WARNING: SVG not found at index ${svgIndex}`)
          }
        } else {
          // Handle regular image URLs
          assetsToDownload.push({
            source: asset.source,
            type: asset.type || 'illustration', // Can be: logo, icon, illustration, hero_image, product_photo, graphic_element
            priority: asset.priority || 'medium',
            reason: asset.reason,
            metadata: asset.metadata,
          })
          console.log(`[Extraction] Added image asset: ${asset.source.substring(0, 80)}... (${asset.type})`)
        }
      }
    }

    // Download assets in batches
    let downloadedAssets: DownloadedAsset[] = []
    if (assetsToDownload.length > 0) {
      console.log(`[Extraction] Downloading ${assetsToDownload.length} assets...`)
      console.log(`[Extraction] Assets to download:`, assetsToDownload.map(a => ({ 
        source: a.source, 
        type: a.type,
        priority: a.priority 
      })))
      downloadedAssets = await downloadAssetsBatch(assetsToDownload, studioId, 3)
      console.log(`[Extraction] Successfully downloaded ${downloadedAssets.length} assets`)
      if (downloadedAssets.length < assetsToDownload.length) {
        console.log(`[Extraction] WARNING: Only ${downloadedAssets.length}/${assetsToDownload.length} assets downloaded successfully`)
      }
    } else {
      console.log(`[Extraction] WARNING: No assets to download from AI response`)
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
