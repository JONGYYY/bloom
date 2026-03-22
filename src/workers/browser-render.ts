import { Worker, Job } from 'bullmq'
import puppeteer, { Browser, Page } from 'puppeteer'
import { connection, extractionQueue } from './queue'
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

interface BrowserRenderJobData {
  brandId: string
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
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME || 'brand-assets',
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    },
  })

  await upload.done()
  
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

async function processBrowserRenderJob(job: Job<BrowserRenderJobData>) {
  const { brandId, url, jobId } = job.data

  try {
    console.log(`[Browser Render] Starting for brand ${brandId}`)

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

    // Extract DOM structure and computed styles
    const domData = await page.evaluate(function() {
      function getComputedStylesForElement(element) {
        var styles = window.getComputedStyle(element)
        return {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        }
      }

      // Get header/nav elements
      var header = document.querySelector('header') || document.querySelector('nav')
      var headerStyles = header ? getComputedStylesForElement(header) : null

      // Get all images (potential logos)
      var images = Array.from(document.querySelectorAll('img')).map(function(img) {
        return {
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
        }
      })

      // Get body styles
      var bodyStyles = getComputedStylesForElement(document.body)

      // Get heading styles
      var h1 = document.querySelector('h1')
      var headingStyles = h1 ? getComputedStylesForElement(h1) : null

      return {
        headerStyles: headerStyles,
        bodyStyles: bodyStyles,
        headingStyles: headingStyles,
        images: images.slice(0, 10), // Limit to first 10 images
        title: document.title,
      }
    })

    await page.close()

    // Upload screenshots to S3
    console.log(`[Browser Render] Uploading screenshots to S3`)
    const desktopKey = `brands/${brandId}/screenshots/desktop-${Date.now()}.png`
    const mobileKey = `brands/${brandId}/screenshots/mobile-${Date.now()}.png`

    const [desktopUrl, mobileUrl] = await Promise.all([
      uploadToS3(desktopScreenshot, desktopKey),
      uploadToS3(mobileScreenshot, mobileKey),
    ])

    // Save assets to database
    await prisma.brandAsset.createMany({
      data: [
        {
          brandId,
          type: 'screenshot_desktop',
          storageKey: desktopKey,
          sourceUrl: url,
          metadata: { width: 1920, height: 1080 },
        },
        {
          brandId,
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
      brandId,
      url,
      jobId,
      desktopScreenshotUrl: desktopUrl,
      mobileScreenshotUrl: mobileUrl,
      domData,
    })

    console.log(`[Browser Render] Complete for brand ${brandId}, enqueued extraction`)

    return { success: true }
  } catch (error) {
    console.error(`[Browser Render] Error for brand ${brandId}:`, error)

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
