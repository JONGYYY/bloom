# Enhanced Brand Kit Extraction System

## Overview

This implementation enhances the brand kit extraction system to match trybloom.ai's capabilities by extracting **ALL** visual assets from any website, including PNG icons, SVGs, CSS backgrounds, favicons, and meta images.

## Architecture

### 4-Layer Extraction Pipeline

```
1. Browser Render (Puppeteer)
   ↓ Captures ALL assets from DOM
2. DOM Analysis (Client-side JS)
   ↓ Extracts images, SVGs, backgrounds, favicons
3. AI Classification (GPT-4o Vision)
   ↓ Identifies brand assets and categorizes them
4. Asset Download & Storage (S3)
   ↓ Downloads, processes, and stores assets
```

## Key Features

### 1. Comprehensive Asset Extraction

**What gets extracted:**
- ✅ Standard `<img>` tags with full metadata
- ✅ Inline SVG elements with content
- ✅ CSS background images from computed styles
- ✅ Favicons (all sizes and formats)
- ✅ Open Graph images (`og:image`)
- ✅ Twitter Card images (`twitter:image`)
- ✅ Lazy-loaded images
- ✅ Srcset variants

**Context captured for each asset:**
- Location on page (header, hero, content, footer)
- Parent context (nav, main, section, etc.)
- Dimensions (width × height)
- Element classes and IDs
- Alt text and descriptions

### 2. Intelligent Asset Classification

The AI analyzes each asset and determines:
- **Asset Type**: logo, icon, illustration, hero_image, product_photo
- **Priority**: high, medium, low (for download order)
- **Brand Relevance**: why this asset matters for the brand
- **Location Context**: where it appears on the page

### 3. Smart Asset Downloading

**Features:**
- Parallel downloads with rate limiting (3 concurrent by default)
- Automatic format detection and conversion
- Hash-based deduplication (MD5)
- SVG content preservation
- Sharp image processing for optimization
- S3 storage with organized folder structure

**Storage structure:**
```
studios/{studioId}/brand-assets/
  ├── logo-{timestamp}-{hash}.png
  ├── icon-{timestamp}-{hash}.svg
  ├── hero_image-{timestamp}-{hash}.jpg
  └── ...
```

### 4. Database Integration

Each downloaded asset creates a `BrandAsset` record with:
```typescript
{
  studioId: string
  sourceUrl: string          // Original URL or 'inline-svg'
  storageKey: string         // S3 key
  assetType: string          // logo, icon, etc.
  metadata: {
    width: number
    height: number
    format: string           // png, svg, jpg, webp
    size: number             // bytes
    hash: string             // MD5 for deduplication
    priority: string         // high, medium, low
    reason: string           // AI explanation
    location: string         // header, hero, content
    extractedFrom: string    // source website URL
  }
}
```

## Implementation Details

### Modified Files

#### 1. `/src/workers/browser-render.ts`

**Enhanced DOM extraction:**
```typescript
// New functions added:
- getElementLocation(el) → Determines if element is in header/hero/content/footer
- getParentContext(el) → Gets semantic parent (header, nav, main, etc.)
- extractAllImages() → Captures img, background-image, and inline SVGs
- extractMetaAssets() → Gets favicons, og:image, twitter:image

// Returns comprehensive data:
{
  allImages: [
    {
      type: 'img' | 'background' | 'svg',
      src: string,
      width: number,
      height: number,
      location: 'header' | 'hero' | 'content' | 'footer',
      parentContext: string,
      className: string,
      alt: string,
      content?: string  // For SVGs
    }
  ],
  metaAssets: [
    {
      type: 'favicon' | 'og-image' | 'twitter-image',
      src: string,
      sizes?: string
    }
  ],
  extractedColors: [...],
  // ... other data
}
```

#### 2. `/src/workers/extraction.ts`

**Enhanced AI prompt:**
- Now includes full image list with context
- Requests asset classification and download list
- Asks AI to identify ALL brand-relevant assets

**New asset download logic:**
```typescript
// After AI analysis:
1. Parse assetsToDownload from AI response
2. Handle SVG assets (extract inline content)
3. Download assets in batches (3 concurrent)
4. Create BrandAsset records in database
5. Store metadata for future reference
```

#### 3. `/src/lib/asset-downloader.ts` (NEW)

**Core functions:**

```typescript
// Download single asset
downloadAndUploadAsset(asset, studioId): Promise<DownloadedAsset | null>

// Download multiple assets with rate limiting
downloadAssetsBatch(assets, studioId, concurrency): Promise<DownloadedAsset[]>

// Upload SVG content directly
uploadSvgToS3(svgContent, studioId, asset): Promise<DownloadedAsset | null>

// Classify asset type by dimensions and context
classifyAssetType(width, height, location, context): AssetType

// Remove duplicate assets by hash
deduplicateAssets(assets): DownloadedAsset[]
```

**Asset processing:**
- Downloads images via fetch with User-Agent header
- Processes with Sharp (format conversion, metadata extraction)
- Generates MD5 hash for deduplication
- Uploads to S3 with proper content types
- Returns full metadata for database storage

## Usage

### Automatic Extraction

When a user creates a new studio from a website:

```typescript
// 1. Browser renders page and extracts ALL assets
const domData = await page.evaluate(() => {
  return {
    allImages: extractAllImages(),      // img, background, svg
    metaAssets: extractMetaAssets(),    // favicons, og:image
    extractedColors: extractColors(),
    // ...
  }
})

// 2. AI analyzes and classifies assets
const extractedData = await openai.chat.completions.create({
  // Prompt includes all images with context
  // AI returns assetsToDownload list
})

// 3. Download and store assets
const downloadedAssets = await downloadAssetsBatch(
  extractedData.assetsToDownload,
  studioId,
  3  // concurrency
)

// 4. Create BrandAsset records
for (const asset of downloadedAssets) {
  await prisma.brandAsset.create({ ... })
}
```

### Manual Asset Tagging

Assets can be tagged with the existing tagging system:

```typescript
import { tagBrandAsset } from '@/lib/prompt'

await tagBrandAsset(assetId, 'logo_mark', {
  manualTags: {
    brandRole: 'primary',
    visualTraits: ['clean', 'modern'],
  }
})
```

## AI Prompt Strategy

The enhanced prompt asks GPT-4o Vision to:

1. **Analyze all images** with their context (location, dimensions, parent)
2. **Identify brand assets** that should be downloaded
3. **Classify each asset** by type (logo, icon, illustration, etc.)
4. **Prioritize downloads** (high/medium/low)
5. **Explain reasoning** for each selection

**Example AI response:**
```json
{
  "assetsToDownload": [
    {
      "source": "https://example.com/logo.png",
      "type": "logo",
      "priority": "high",
      "reason": "Primary brand logo in header, clean design",
      "metadata": {
        "location": "header",
        "width": 180,
        "height": 60
      }
    },
    {
      "source": "svg-5",
      "type": "icon",
      "priority": "medium",
      "reason": "Social media icon set in footer",
      "metadata": {
        "location": "footer",
        "width": 24,
        "height": 24
      }
    }
  ]
}
```

## Performance Optimizations

### Rate Limiting
- Downloads 3 assets concurrently by default
- 500ms delay between batches
- Prevents overwhelming target servers

### Deduplication
- MD5 hash calculated for each asset
- Duplicate assets skipped during download
- Saves storage space and processing time

### Image Processing
- Sharp library for fast image processing
- Automatic format detection
- Converts problematic formats to PNG
- Preserves SVG content as-is

### Error Handling
- Individual asset failures don't stop the batch
- Failed downloads return null and are filtered out
- Comprehensive error logging for debugging

## Testing

To test the enhanced extraction:

```bash
# 1. Start the workers
npm run dev:workers

# 2. Create a new studio from a website
# Use the web UI or API:
POST /api/studios
{
  "name": "Test Brand",
  "sourceUrl": "https://gumroad.com"
}

# 3. Monitor worker logs
# Check for:
# - "Downloading X assets..."
# - "Successfully downloaded Y assets"
# - "Created Y BrandAsset records"

# 4. Verify in database
# Check BrandAsset table for new records
```

### Test Cases

**Good test websites:**
- ✅ gumroad.com (icons, logos, product images)
- ✅ stripe.com (clean brand assets, icons)
- ✅ figma.com (illustrations, hero images)
- ✅ notion.so (diverse asset types)

**Edge cases to test:**
- SVG-only logos
- CSS background images
- Lazy-loaded images
- Multiple favicon sizes
- Sites with many small icons

## Comparison with trybloom.ai

### What we match:
✅ Extract ALL images from DOM
✅ Capture inline SVGs
✅ Get CSS background images
✅ Download and store assets
✅ Classify asset types
✅ Provide context for each asset

### What we improve:
✨ AI-powered classification (vs. rule-based)
✨ Context-aware asset selection
✨ Hash-based deduplication
✨ Integrated with existing brand kit system
✨ Automatic tagging for prompt pipeline

## Future Enhancements

### Potential improvements:
1. **Video/GIF extraction** - Capture animated assets
2. **Font file downloads** - Store actual font files, not just names
3. **Color palette extraction from images** - Analyze downloaded assets
4. **Asset similarity detection** - Group similar assets
5. **Automatic logo variant detection** - Light/dark versions
6. **Asset quality scoring** - Rank assets by visual quality
7. **OCR for text in images** - Extract text from logos
8. **Asset relationship mapping** - Understand which assets are used together

## Troubleshooting

### Common issues:

**Assets not downloading:**
- Check S3 credentials in `.env`
- Verify AWS_S3_BUCKET is set
- Check worker logs for errors

**SVG extraction failing:**
- Ensure SVG content is captured in browser-render
- Check if SVG has valid dimensions
- Verify SVG content is not empty

**Duplicate assets:**
- Deduplication should handle this automatically
- Check hash generation in asset-downloader
- Verify MD5 calculation is working

**AI not identifying assets:**
- Check if images are visible in screenshot
- Verify image list is being passed to AI
- Review AI prompt for clarity

## API Reference

### Asset Downloader

```typescript
// Download single asset
import { downloadAndUploadAsset } from '@/lib/asset-downloader'

const asset = await downloadAndUploadAsset(
  {
    source: 'https://example.com/logo.png',
    type: 'logo',
    priority: 'high',
    metadata: { width: 200, height: 80 }
  },
  studioId
)

// Download batch
import { downloadAssetsBatch } from '@/lib/asset-downloader'

const assets = await downloadAssetsBatch(
  [
    { source: 'url1', type: 'logo', priority: 'high' },
    { source: 'url2', type: 'icon', priority: 'medium' }
  ],
  studioId,
  3  // concurrency
)

// Deduplicate
import { deduplicateAssets } from '@/lib/asset-downloader'

const unique = deduplicateAssets(downloadedAssets)
```

## Conclusion

This implementation provides a comprehensive, AI-powered brand asset extraction system that captures ALL visual elements from any website, matching and exceeding trybloom.ai's capabilities. The system is modular, extensible, and integrated with the existing brand kit and prompt generation pipeline.
