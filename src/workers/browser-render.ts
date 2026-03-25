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
  const bucketName = process.env.AWS_S3_BUCKET || 'bloom-assets'
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read', // Make screenshots publicly accessible
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

      // Determine element location on page
      const getElementLocation = (el: Element): string => {
        const rect = el.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        
        // Check if in header/nav
        if (el.closest('header, nav')) return 'header'
        if (el.closest('footer')) return 'footer'
        
        if (rect.top < 100) return 'header'
        if (rect.top < viewportHeight) return 'hero'
        if (rect.top < viewportHeight * 2) return 'content'
        return 'footer'
      }

      // Get parent context
      const getParentContext = (el: Element): string => {
        const parent = el.closest('header, nav, main, footer, aside, section')
        return parent?.tagName.toLowerCase() || 'unknown'
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
          .slice(0, 30) // Top 30 most frequent colors
      }

      // Extract ALL images with full context
      const extractAllImages = () => {
        const images: any[] = []
        
        // 1. Standard img tags
        document.querySelectorAll('img').forEach(img => {
          images.push({
            type: 'img',
            src: img.src,
            srcset: img.srcset || '',
            alt: img.alt || '',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            className: img.className || '',
            id: img.id || '',
            location: getElementLocation(img),
            parentContext: getParentContext(img),
            isLazyLoaded: img.loading === 'lazy',
          })
        })
        
        // 2. CSS background images
        document.querySelectorAll('*').forEach(el => {
          const bg = window.getComputedStyle(el).backgroundImage
          if (bg && bg !== 'none' && bg.includes('url(')) {
            const urlMatch = bg.match(/url\(['"]?([^'"]+)['"]?\)/)
            if (urlMatch && urlMatch[1]) {
              images.push({
                type: 'background',
                src: urlMatch[1],
                width: el.clientWidth,
                height: el.clientHeight,
                location: getElementLocation(el),
                parentContext: getParentContext(el),
                className: el.className || '',
              })
            }
          }
        })
        
        // 3. SVG elements (inline)
        document.querySelectorAll('svg').forEach(svg => {
          const bbox = svg.getBBox ? svg.getBBox() : { width: 0, height: 0 }
          images.push({
            type: 'svg',
            content: svg.outerHTML,
            width: bbox.width || svg.clientWidth,
            height: bbox.height || svg.clientHeight,
            location: getElementLocation(svg),
            parentContext: getParentContext(svg),
            className: svg.className.baseVal || '',
            id: svg.id || '',
          })
        })
        
        return images
      }

      // Extract favicons and meta images
      const extractMetaAssets = () => {
        const metaAssets: any[] = []
        
        // Favicons
        const faviconLinks = document.querySelectorAll('link[rel*="icon"]')
        faviconLinks.forEach(link => {
          const href = (link as HTMLLinkElement).href
          if (href) {
            metaAssets.push({
              type: 'favicon',
              src: href,
              rel: link.getAttribute('rel'),
              sizes: link.getAttribute('sizes') || '',
            })
          }
        })
        
        // Open Graph images
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
          metaAssets.push({
            type: 'og-image',
            src: ogImage.getAttribute('content') || '',
          })
        }
        
        // Twitter Card images
        const twitterImage = document.querySelector('meta[name="twitter:image"]')
        if (twitterImage) {
          metaAssets.push({
            type: 'twitter-image',
            src: twitterImage.getAttribute('content') || '',
          })
        }
        
        return metaAssets
      }

      // Get header/nav elements
      const header = document.querySelector('header') || document.querySelector('nav')
      const headerStyles = header ? getComputedStylesForElement(header) : null

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
        allImages: extractAllImages(),
        metaAssets: extractMetaAssets(),
        title: document.title,
        url: window.location.href,
      }
    })

    await page.close()

    // Upload screenshot to S3
    console.log(`[Browser Render] Uploading screenshot to S3`)
    const desktopKey = `studios/${studioId}/screenshots/desktop-${Date.now()}.png`
    const desktopUrl = await uploadToS3(desktopScreenshot, desktopKey)

    // Save screenshot to database
    await prisma.brandAsset.create({
      data: {
        studioId,
        type: 'screenshot_desktop',
        storageKey: desktopKey,
        sourceUrl: url,
        metadata: { width: 1920, height: 1080 },
      },
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
    concurrency: 5, // Increased for production scale - handles 5 simultaneous browser renders
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
