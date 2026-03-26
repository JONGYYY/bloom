import { Worker, Job } from 'bullmq'
import { connection } from './queue'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'
import { downloadAssetsBatch, AssetToDownload, DownloadedAsset } from '@/lib/asset-downloader'
import { selectBrandColors, formatColorsForStorage } from '@/lib/color-selector'

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

1. Typography:
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

Additional context from DOM:
- Title: ${domData.title}
- URL: ${domData.url || url}
- Header styles: ${JSON.stringify(domData.headerStyles)}
- Body styles: ${JSON.stringify(domData.bodyStyles)}
- Heading styles: ${JSON.stringify(domData.headingStyles)}
- Button styles: ${JSON.stringify(domData.buttonStyles)}

8. Brand Assets to Download:
   
   CRITICAL INSTRUCTION: You have ${allImages.length} images available in the list below.
   You MUST review EVERY SINGLE ONE and extract AT LEAST 20 assets.
   
   DO NOT just look at the screenshot - READ THE ENTIRE IMAGE LIST BELOW.
   The screenshot shows a limited view, but the image list contains ALL assets on the page.
   
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
   
   ⚠️  EXTRACTION REQUIREMENTS - READ CAREFULLY:
   
   STEP 1: COUNT THE ASSETS IN THE IMAGE LIST ABOVE
   - You have ${allImages.length} images + ${metaAssets.length} meta assets = ${allImages.length + metaAssets.length} total
   
   STEP 2: EXTRACT AT LEAST 20 ASSETS (MINIMUM)
   - Go through the image list line by line
   - Extract EVERY SVG (marked as [SVG-N])
   - Extract EVERY icon (small images, typically < 100x100)
   - Extract EVERY illustration (decorative graphics)
   - Extract ALL logos and favicons
   - Extract key hero images
   
   STEP 3: VERIFY YOUR EXTRACTION
   - Count your assetsToDownload array
   - If count < 20, you FAILED - go back and extract more
   - Target: 20-35 assets
   
   WHAT TO EXTRACT (BE SYSTEMATIC):
   1. ALL 17 SVGs in the list (every [SVG-N] entry)
   2. ALL images with "icon" or "logo" in the URL
   3. ALL images in header/nav area
   4. ALL illustrations (decorative graphics)
   5. ALL meta assets (favicons, og:image)
   6. Key hero/banner images
   
   EXTRACTION RULE: When in doubt, INCLUDE IT
   - Better to extract 35 assets than miss important ones
   - Don't filter by "importance" - extract everything brand-related
   - The user wants comprehensive brand kits, not minimal ones

Return a JSON object with this EXACT structure:
{
  "brandIdentity": {
    "name": "Brand Name",
    "tagline": "Brand tagline or null",
    "description": "Brief 1-2 sentence description"
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
      max_tokens: 4000, // Increased to accommodate 20-35 assets
      response_format: { type: 'json_object' },
    })

    let extractedData
    try {
      extractedData = JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      console.error('[Extraction] Failed to parse OpenAI response:', error)
      console.error('[Extraction] Raw response:', response.choices[0].message.content?.substring(0, 500))
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

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
        console.log(`[Extraction] ⚠️  WARNING: Only ${downloadedAssets.length}/${assetsToDownload.length} assets downloaded successfully`)
      }
      if (downloadedAssets.length < 10) {
        console.log(`[Extraction] ⚠️  CRITICAL: Only ${downloadedAssets.length} assets downloaded - expected 15-30 minimum`)
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

    // Select colors deterministically using frequency-based algorithm
    console.log(`[Extraction] Selecting colors deterministically from ${domData.extractedColors?.length || 0} extracted colors`)
    const colorSelection = selectBrandColors(domData.extractedColors || [], {
      minFrequency: 6, // Only include colors used 6+ times
      maxColors: 10,
      similarityThreshold: 8,
    })
    const colors = formatColorsForStorage(colorSelection)
    console.log(`[Extraction] Selected colors:`, colors)

    // Create studio profile with enhanced brand identity
    await prisma.studioProfile.create({
      data: {
        studioId,
        colors: colors,
        fonts: extractedData.fonts || {},
        logos: extractedData.logos || { candidates: [], selected: null },
        styleTraits: extractedData.styleTraits || [],
        provenance: {
          ...extractedData.provenance || {},
          colorSelection: {
            algorithm: 'frequency-based',
            totalAnalyzed: colorSelection.metadata.totalColorsAnalyzed,
            groupsFormed: colorSelection.metadata.groupsFormed,
            excluded: colorSelection.metadata.colorsExcluded,
          }
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
    concurrency: 10, // Increased for production scale - AI API calls are lightweight
  }
)

extractionWorker.on('completed', (job) => {
  console.log(`[Extraction Worker] Job ${job.id} completed`)
})

extractionWorker.on('failed', (job, err) => {
  console.error(`[Extraction Worker] Job ${job?.id} failed:`, err)
})

console.log('[Extraction Worker] Started')
