import puppeteer from 'puppeteer'

/**
 * Convert SVG content to PNG using Puppeteer
 * This is the most reliable method as it uses a real browser engine
 */
export async function convertSvgToPng(svgContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    
    // Set viewport for high-quality rendering
    await page.setViewport({
      width: 1024,
      height: 1024,
      deviceScaleFactor: 2, // 2x for retina quality
    })

    // Create HTML with embedded SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: transparent;
            }
            svg {
              max-width: 100%;
              max-height: 100vh;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `

    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Get SVG dimensions
    const svgElement = await page.$('svg')
    if (!svgElement) {
      throw new Error('No SVG element found in content')
    }

    const boundingBox = await svgElement.boundingBox()
    if (!boundingBox) {
      throw new Error('Could not get SVG bounding box')
    }

    // Take screenshot of just the SVG element
    const screenshot = await svgElement.screenshot({
      type: 'png',
      omitBackground: true, // Transparent background
    })

    return screenshot as Buffer
  } finally {
    await browser.close()
  }
}
