import { Worker, Job } from 'bullmq'
import puppeteer, { Browser, Page } from 'puppeteer'
import { connection, extractionQueue } from './queue'
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

interface BrowserRenderJobData {
  studioId: string
  url: string
  jobId: string
}

// S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return browserInstance
}

async function capturePage(page: Page, url: string, viewport: { width: number; height: number }) {
  await page.setViewport(viewport)
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  })

  // Wait a bit for any animations
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Take screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: false,
  })

  return screenshot
}

async function uploadToS3(buffer: Buffer | Uint8Array, key: string): Promise<string> {
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
  
  // Generate a pre-signed URL that expires in 1 hour
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  
  return signedUrl
}

async function processBrowserRenderJob(job: Job<BrowserRenderJobData>) {
  const { studioId, url, jobId } = job.data

  try {
    console.log(`[Browser Render] Starting for studio ${studioId}`)

    // Update job stage
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        stage: 'rendering',
        progress: 30,
      },
    })

    const browser = await getBrowser()
    const page = await browser.newPage()

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // Capture desktop screenshot
    console.log(`[Browser Render] Capturing desktop screenshot for ${url}`)
    const desktopScreenshot = await capturePage(page, url, {
      width: 1920,
      height: 1080,
    })

    // Capture mobile screenshot
    console.log(`[Browser Render] Capturing mobile screenshot for ${url}`)
    const mobileScreenshot = await capturePage(page, url, {
      width: 390,
      height: 844,
    })

    // Define __name helper in page context to avoid esbuild/tsx transpilation issues
    // Using string literal to avoid tsx transpiling this code
    await page.evaluate('window.__name = function(fn, name) { return fn; }')

    // Extract DOM structure and computed styles
    const domData = await page.evaluate(() => {
      const rgbToHex = (rgb: string): string => {
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/)
        if (!match) return rgb
        
        const r = parseInt(match[1])
        const g = parseInt(match[2])
        const b = parseInt(match[3])
        
        return '#' + [r, g, b].map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }).join('').toUpperCase()
      }

      const getComputedStylesForElement = (element: Element) => {
        const styles = window.getComputedStyle(element)
        return {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        }
      }

      // Extract all colors from the page
      const extractColors = () => {
        const colorMap = new Map<string, number>()
        const elements = document.querySelectorAll('*')
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el)
          
          // Get background color
          const bgColor = styles.backgroundColor
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            const hex = rgbToHex(bgColor)
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
          }
          
          // Get text color
          const textColor = styles.color
          if (textColor) {
            const hex = rgbToHex(textColor)
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
          }
          
          // Get border colors
          const borderColor = styles.borderColor
          if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
            const hex = rgbToHex(borderColor)
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
          }
        })
        
        // Convert to array and sort by frequency
        return Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([color, count]) => ({ color, count }))
          .slice(0, 20) // Top 20 most frequent colors
      }

      // Get header/nav elements
      const header = document.querySelector('header') || document.querySelector('nav')
      const headerStyles = header ? getComputedStylesForElement(header) : null

      // Get all images (potential logos)
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
      }))

      // Get body styles
      const bodyStyles = getComputedStylesForElement(document.body)

      // Get heading styles
      const h1 = document.querySelector('h1')
      const headingStyles = h1 ? getComputedStylesForElement(h1) : null

      // Get button styles (often contain accent colors)
      const buttons = Array.from(document.querySelectorAll('button, a[class*="button"], a[class*="btn"]'))
        .slice(0, 5)
        .map(btn => getComputedStylesForElement(btn))

      return {
        headerStyles,
        bodyStyles,
        headingStyles,
        buttonStyles: buttons,
        extractedColors: extractColors(),
        images: images.slice(0, 10), // Limit to first 10 images
        title: document.title,
      }
    })

    await page.close()

    // Upload screenshots to S3
    console.log(`[Browser Render] Uploading screenshots to S3`)
    const desktopKey = `studios/${studioId}/screenshots/desktop-${Date.now()}.png`
    const mobileKey = `studios/${studioId}/screenshots/mobile-${Date.now()}.png`

    const [desktopUrl, mobileUrl] = await Promise.all([
      uploadToS3(desktopScreenshot, desktopKey),
      uploadToS3(mobileScreenshot, mobileKey),
    ])

    // Save assets to database
    await prisma.brandAsset.createMany({
      data: [
        {
          studioId,
          type: 'screenshot_desktop',
          storageKey: desktopKey,
          sourceUrl: url,
          metadata: { width: 1920, height: 1080 },
        },
        {
          studioId,
          type: 'screenshot_mobile',
          storageKey: mobileKey,
          sourceUrl: url,
          metadata: { width: 390, height: 844 },
        },
      ],
    })

    // Update job stage
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        stage: 'rendering_complete',
        progress: 50,
      },
    })

    // Enqueue extraction job
    await extractionQueue.add('extract', {
      studioId,
      url,
      jobId,
      desktopScreenshotUrl: desktopUrl,
      mobileScreenshotUrl: mobileUrl,
      domData,
    })

    console.log(`[Browser Render] Complete for studio ${studioId}, enqueued extraction`)

    return { success: true }
  } catch (error) {
    console.error(`[Browser Render] Error for studio ${studioId}:`, error)

    // Update job as failed
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Browser rendering failed',
      },
    })

    throw error
  }
}

// Create worker
export const browserRenderWorker = new Worker<BrowserRenderJobData>(
  'browser-render',
  processBrowserRenderJob,
  {
    connection,
    concurrency: 2, // Limit concurrency for browser operations
  }
)

browserRenderWorker.on('completed', (job) => {
  console.log(`[Browser Render Worker] Job ${job.id} completed`)
})

browserRenderWorker.on('failed', (job, err) => {
  console.error(`[Browser Render Worker] Job ${job?.id} failed:`, err)
})

// Cleanup on exit
process.on('SIGTERM', async () => {
  if (browserInstance) {
    await browserInstance.close()
  }
  await browserRenderWorker.close()
})

console.log('[Browser Render Worker] Started')
