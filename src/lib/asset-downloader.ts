import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'
import sharp from 'sharp'
import { Vibrant } from 'node-vibrant/node'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface DownloadedAsset {
  storageKey: string
  url: string
  originalUrl: string
  width: number
  height: number
  format: string
  size: number
  hash: string
  dominantColors?: string[] // Hex colors extracted from image pixels
}

export interface AssetToDownload {
  source: string
  type: 'logo' | 'icon' | 'illustration' | 'hero_image' | 'product_photo' | 'svg'
  priority: 'high' | 'medium' | 'low'
  reason?: string
  metadata?: {
    location?: string
    width?: number
    height?: number
    svgContent?: string
  }
}

/**
 * Download an image from a URL and upload to S3
 */
export async function downloadAndUploadAsset(
  asset: AssetToDownload,
  studioId: string,
  retries: number = 2
): Promise<DownloadedAsset | null> {
  try {
    // Handle inline SVG content (identified by svgContent in metadata)
    if (asset.metadata?.svgContent) {
      console.log(`[Downloader] Uploading inline SVG: ${asset.source} (${asset.type})`)
      return await uploadSvgToS3(asset.metadata.svgContent, studioId, asset)
    }

    console.log(`[Downloader] Downloading ${asset.type}: ${asset.source.substring(0, 100)}...`)

    // Download the image with timeout (increased to 30 seconds)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(asset.source, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*',
        'Referer': new URL(asset.source).origin,
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error(`[Downloader] Failed to download (${response.status}): ${asset.source}`)
      
      // Retry on 5xx errors
      if (response.status >= 500 && retries > 0) {
        console.log(`[Downloader] Retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return downloadAndUploadAsset(asset, studioId, retries - 1)
      }
      
      return null
    }

    // Validate content type
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.startsWith('image/') && !contentType.includes('svg')) {
      console.error(`[Downloader] Invalid content type: ${contentType} for ${asset.source}`)
      return null
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Validate buffer size
    if (buffer.length === 0) {
      console.error(`[Downloader] Empty buffer received for ${asset.source}`)
      return null
    }

    if (buffer.length < 100) {
      console.error(`[Downloader] Suspiciously small file (${buffer.length} bytes) for ${asset.source}`)
      return null
    }

    // Process image with sharp and validate
    let image
    let metadata
    try {
      image = sharp(buffer)
      metadata = await image.metadata()
      
      // Validate metadata
      if (!metadata.format) {
        console.error(`[Downloader] Could not determine image format for ${asset.source}`)
        return null
      }
      
      if (!metadata.width || !metadata.height) {
        console.error(`[Downloader] Invalid image dimensions for ${asset.source}`)
        return null
      }
    } catch (error) {
      console.error(`[Downloader] Failed to process image with Sharp: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }

    // Generate hash for deduplication
    const hash = createHash('md5').update(buffer).digest('hex')

    // Determine format and convert if needed
    let processedBuffer = buffer
    let format = metadata.format || 'png'

    // Convert to PNG if it's a problematic format
    if (!['png', 'jpeg', 'jpg', 'webp', 'svg'].includes(format)) {
      try {
        const pngBuffer = await image.png().toBuffer()
        processedBuffer = Buffer.from(pngBuffer)
        format = 'png'
      } catch (error) {
        console.error(`[Downloader] Failed to convert image to PNG: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return null
      }
    }

    // Generate storage key
    const timestamp = Date.now()
    const storageKey = `studios/${studioId}/brand-assets/${asset.type}-${timestamp}-${hash.substring(0, 8)}.${format}`

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: storageKey,
        Body: processedBuffer,
        ContentType: `image/${format}`,
        ContentDisposition: 'inline', // Force browser to display, not download
        CacheControl: 'public, max-age=31536000', // Cache for 1 year
      })
    )

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${storageKey}`

    // Extract dominant colors from the image pixels (not just CSS)
    let dominantColors: string[] = []
    try {
      if (format !== 'svg') { // Skip SVG as Vibrant doesn't handle them well
        const palette = await Vibrant.from(processedBuffer).getPalette()
        dominantColors = [
          palette.Vibrant?.hex,
          palette.LightVibrant?.hex,
          palette.DarkVibrant?.hex,
          palette.Muted?.hex,
          palette.LightMuted?.hex,
          palette.DarkMuted?.hex,
        ].filter((c): c is string => c !== undefined && c !== null)
        
        if (dominantColors.length > 0) {
          console.log(`[Downloader] Extracted ${dominantColors.length} colors from image: ${dominantColors.join(', ')}`)
        }
      }
    } catch (error) {
      console.log(`[Downloader] Could not extract colors from image (non-critical): ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log(`[Downloader] ✓ Successfully uploaded ${asset.type} to S3`)
    console.log(`[Downloader]   Storage Key: ${storageKey}`)
    console.log(`[Downloader]   Public URL: ${url}`)
    console.log(`[Downloader]   Bucket: ${process.env.AWS_S3_BUCKET}, Region: ${process.env.AWS_REGION || 'us-east-1'}`)

    return {
      storageKey,
      url,
      originalUrl: asset.source,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format,
      size: processedBuffer.length,
      hash,
      dominantColors: dominantColors.length > 0 ? dominantColors : undefined,
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[Downloader] Timeout downloading: ${asset.source}`)
    } else {
      console.error(`[Downloader] Error downloading ${asset.source}:`, error.message || error)
    }
    
    // Retry on network errors
    if (retries > 0 && (error.name === 'AbortError' || error.code === 'ECONNRESET')) {
      console.log(`[Downloader] Retrying... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return downloadAndUploadAsset(asset, studioId, retries - 1)
    }
    
    return null
  }
}

/**
 * Upload SVG content directly to S3
 */
async function uploadSvgToS3(
  svgContent: string,
  studioId: string,
  asset: AssetToDownload
): Promise<DownloadedAsset | null> {
  try {
    console.log(`[Downloader] Processing inline SVG (${asset.type})...`)
    
    // Validate SVG content - be lenient to maximize asset extraction
    if (!svgContent || svgContent.length < 30) {
      console.error(`[Downloader] SVG content too short (${svgContent.length} chars)`)
      return null
    }

    if (!svgContent.includes('<svg')) {
      console.error(`[Downloader] Invalid SVG content - missing <svg tag`)
      return null
    }
    
    // Very lenient content check - just make sure it's not completely empty
    // Accept if it has ANY of these common SVG elements
    const hasContent = 
      svgContent.includes('<path') ||
      svgContent.includes('<circle') ||
      svgContent.includes('<rect') ||
      svgContent.includes('<polygon') ||
      svgContent.includes('<polyline') ||
      svgContent.includes('<line') ||
      svgContent.includes('<ellipse') ||
      svgContent.includes('<text') ||
      svgContent.includes('<image') ||
      svgContent.includes('<use') ||
      svgContent.includes('<g') ||
      svgContent.includes('<defs') ||
      svgContent.includes('<symbol') ||
      svgContent.includes('<clipPath') ||
      svgContent.includes('<mask') ||
      svgContent.includes('viewBox') || // SVGs with viewBox are usually valid
      svgContent.length > 100 // If it's substantial, probably has content
    
    if (!hasContent) {
      console.error(`[Downloader] SVG appears to be empty wrapper - rejecting`)
      return null
    }
    
    console.log(`[Downloader] SVG validation passed (${svgContent.length} chars)`)
    
    // Sanitize SVG content to ensure browser compatibility
    // Remove potentially problematic elements that might cause rendering issues
    let sanitizedSvg = svgContent
      // Remove script tags (security risk)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // Remove event handlers (onclick, onload, etc.)
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove foreign objects (can cause issues)
      .replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '')
      // Ensure xmlns is present for standalone rendering
    
    if (!sanitizedSvg.includes('xmlns=')) {
      sanitizedSvg = sanitizedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    
    console.log(`[Downloader] Converting SVG to PNG for maximum compatibility...`)
    
    // Convert SVG to PNG using Sharp for guaranteed browser compatibility
    let finalBuffer: Buffer
    let finalFormat: string
    let finalContentType: string
    
    try {
      const svgBuffer = Buffer.from(sanitizedSvg, 'utf-8')
      
      console.log(`[Downloader] Attempting Sharp SVG->PNG conversion (input: ${svgBuffer.length} bytes)...`)
      
      // Convert SVG to PNG with Sharp
      // Sharp automatically converts SVG to PNG when calling .png()
      const pngBuffer = await sharp(svgBuffer, {
        density: 300, // High DPI for quality
      })
        .resize(1024, 1024, {
          fit: 'inside', // Maintain aspect ratio
          withoutEnlargement: true, // Don't upscale small images
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
        })
        .png({
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true,
        })
        .toBuffer()
      
      finalBuffer = pngBuffer
      finalFormat = 'png'
      finalContentType = 'image/png'
      
      console.log(`[Downloader] ✓ Successfully converted SVG to PNG (${finalBuffer.length} bytes)`)
    } catch (conversionError: any) {
      // If conversion fails, fall back to original SVG
      console.error(`[Downloader] ✗ SVG to PNG conversion failed:`, {
        error: conversionError.message || conversionError,
        stack: conversionError.stack,
        svgLength: sanitizedSvg.length,
        svgStart: sanitizedSvg.substring(0, 200)
      })
      console.log(`[Downloader] Falling back to original SVG format`)
      finalBuffer = Buffer.from(sanitizedSvg, 'utf-8')
      finalFormat = 'svg'
      finalContentType = 'image/svg+xml'
    }
    
    const hash = createHash('md5').update(finalBuffer).digest('hex')
    const timestamp = Date.now()
    const storageKey = `studios/${studioId}/brand-assets/${asset.type}-${timestamp}-${hash.substring(0, 8)}.${finalFormat}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: storageKey,
        Body: finalBuffer,
        ContentType: finalContentType,
        ContentDisposition: 'inline', // Force browser to display, not download
        CacheControl: 'public, max-age=31536000', // Cache for 1 year
      })
    )

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${storageKey}`

    // Try to extract dimensions from SVG
    const widthMatch = svgContent.match(/width="(\d+)"/)
    const heightMatch = svgContent.match(/height="(\d+)"/)
    const width = widthMatch ? parseInt(widthMatch[1]) : asset.metadata?.width || 0
    const height = heightMatch ? parseInt(heightMatch[1]) : asset.metadata?.height || 0

    // Extract colors from SVG content (fill and stroke attributes)
    const dominantColors: string[] = []
    const fillMatches = svgContent.match(/fill="(#[0-9a-fA-F]{6})"/g)
    const strokeMatches = svgContent.match(/stroke="(#[0-9a-fA-F]{6})"/g)
    
    if (fillMatches) {
      fillMatches.forEach(match => {
        const color = match.match(/#[0-9a-fA-F]{6}/)
        if (color && !dominantColors.includes(color[0].toUpperCase())) {
          dominantColors.push(color[0].toUpperCase())
        }
      })
    }
    
    if (strokeMatches) {
      strokeMatches.forEach(match => {
        const color = match.match(/#[0-9a-fA-F]{6}/)
        if (color && !dominantColors.includes(color[0].toUpperCase())) {
          dominantColors.push(color[0].toUpperCase())
        }
      })
    }
    
    if (dominantColors.length > 0) {
      console.log(`[Downloader] Extracted ${dominantColors.length} colors from SVG: ${dominantColors.join(', ')}`)
    }

    console.log(`[Downloader] ✓ Successfully uploaded ${finalFormat.toUpperCase()} to S3: ${storageKey}`)

    return {
      storageKey,
      url,
      originalUrl: 'inline-svg',
      width,
      height,
      format: finalFormat,
      size: finalBuffer.length,
      hash,
      dominantColors: dominantColors.length > 0 ? dominantColors : undefined,
    }
  } catch (error: any) {
    console.error(`[Downloader] Error uploading SVG:`, error.message || error)
    return null
  }
}

/**
 * Download multiple assets in parallel with rate limiting
 */
export async function downloadAssetsBatch(
  assets: AssetToDownload[],
  studioId: string,
  concurrency: number = 3
): Promise<DownloadedAsset[]> {
  const results: DownloadedAsset[] = []
  const seenHashes = new Set<string>()
  let successCount = 0
  let failCount = 0

  console.log(`[Batch Downloader] Starting batch download of ${assets.length} assets with concurrency ${concurrency}`)

  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < assets.length; i += concurrency) {
    const batch = assets.slice(i, i + concurrency)
    console.log(`[Batch Downloader] Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(assets.length / concurrency)} (${batch.length} assets)`)
    
    const batchResults = await Promise.all(
      batch.map(asset => downloadAndUploadAsset(asset, studioId))
    )

    // Filter out nulls and duplicates
    for (const result of batchResults) {
      if (result) {
        if (!seenHashes.has(result.hash)) {
          results.push(result)
          seenHashes.add(result.hash)
          successCount++
        } else {
          console.log(`[Batch Downloader] ⚠️  Skipped DUPLICATE asset (hash: ${result.hash.substring(0, 8)})`)
        }
      } else {
        failCount++
      }
    }

    // Small delay between batches
    if (i + concurrency < assets.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`[Batch Downloader] Completed: ${successCount} successful, ${failCount} failed, ${results.length} unique assets`)

  return results
}

/**
 * Classify asset type based on dimensions and context
 */
export function classifyAssetType(
  width: number,
  height: number,
  location: string,
  context: string
): 'logo' | 'icon' | 'illustration' | 'hero_image' | 'product_photo' {
  const aspectRatio = width / height
  const area = width * height

  // Logo: typically in header, small to medium, various aspect ratios
  if (location === 'header' && area < 100000) {
    return 'logo'
  }

  // Icon: very small, usually square or close to square
  if (area < 10000 && Math.abs(aspectRatio - 1) < 0.3) {
    return 'icon'
  }

  // Hero image: large, wide aspect ratio, in hero section
  if (location === 'hero' && width > 800 && aspectRatio > 1.5) {
    return 'hero_image'
  }

  // Product photo: medium size, in content area
  if (location === 'content' && area > 50000 && area < 500000) {
    return 'product_photo'
  }

  // Default to illustration
  return 'illustration'
}

/**
 * Deduplicate assets by hash
 */
export function deduplicateAssets(assets: DownloadedAsset[]): DownloadedAsset[] {
  const seen = new Map<string, DownloadedAsset>()
  
  for (const asset of assets) {
    if (!seen.has(asset.hash)) {
      seen.set(asset.hash, asset)
    }
  }
  
  return Array.from(seen.values())
}
