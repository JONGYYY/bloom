import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'
import sharp from 'sharp'

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
  studioId: string
): Promise<DownloadedAsset | null> {
  try {
    // Handle SVG content differently
    if (asset.type === 'svg' && asset.metadata?.svgContent) {
      return await uploadSvgToS3(asset.metadata.svgContent, studioId, asset)
    }

    // Download the image
    const response = await fetch(asset.source, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BloomBot/1.0)',
      },
    })

    if (!response.ok) {
      console.error(`Failed to download asset: ${asset.source} - ${response.status}`)
      return null
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Process image with sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Generate hash for deduplication
    const hash = createHash('md5').update(buffer).digest('hex')

    // Determine format and convert if needed
    let processedBuffer = buffer
    let format = metadata.format || 'png'

    // Convert to PNG if it's a problematic format
    if (!['png', 'jpeg', 'jpg', 'webp', 'svg'].includes(format)) {
      const pngBuffer = await image.png().toBuffer()
      processedBuffer = Buffer.from(pngBuffer)
      format = 'png'
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
      })
    )

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${storageKey}`

    return {
      storageKey,
      url,
      originalUrl: asset.source,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format,
      size: processedBuffer.length,
      hash,
    }
  } catch (error) {
    console.error(`Error downloading asset ${asset.source}:`, error)
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
    const buffer = Buffer.from(svgContent, 'utf-8')
    const hash = createHash('md5').update(buffer).digest('hex')
    const timestamp = Date.now()
    const storageKey = `studios/${studioId}/brand-assets/${asset.type}-${timestamp}-${hash.substring(0, 8)}.svg`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: storageKey,
        Body: buffer,
        ContentType: 'image/svg+xml',
      })
    )

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${storageKey}`

    // Try to extract dimensions from SVG
    const widthMatch = svgContent.match(/width="(\d+)"/)
    const heightMatch = svgContent.match(/height="(\d+)"/)
    const width = widthMatch ? parseInt(widthMatch[1]) : asset.metadata?.width || 0
    const height = heightMatch ? parseInt(heightMatch[1]) : asset.metadata?.height || 0

    return {
      storageKey,
      url,
      originalUrl: 'inline-svg',
      width,
      height,
      format: 'svg',
      size: buffer.length,
      hash,
    }
  } catch (error) {
    console.error('Error uploading SVG:', error)
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

  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < assets.length; i += concurrency) {
    const batch = assets.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(asset => downloadAndUploadAsset(asset, studioId))
    )

    // Filter out nulls and duplicates
    for (const result of batchResults) {
      if (result && !seenHashes.has(result.hash)) {
        results.push(result)
        seenHashes.add(result.hash)
      }
    }

    // Small delay between batches
    if (i + concurrency < assets.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

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
