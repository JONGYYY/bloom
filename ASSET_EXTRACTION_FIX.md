# Asset Extraction & Display Fix

## Issues Addressed

### 1. Visual Assets Not Displaying
**Root Cause**: Images weren't showing because:
- Asset URLs were being constructed client-side with missing env vars
- No error handling or loading states for failed images

**Fix**:
- API endpoint now constructs full S3 URLs server-side
- Added proper error handling with fallback UI
- Added loading states with spinner
- Enhanced thumbnail display with better styling

### 2. "No Logo Extracted" Issue
**Root Cause**: 
- Processing page was looking for logo in `profile.logos.candidates[0].url`
- But logo candidates might have `svgIndex` instead of `url` for SVG logos
- Downloaded logo assets were stored in `BrandAsset` table, not referenced in profile

**Fix**:
- Processing page now fetches logo from `BrandAsset` table where `type='logo'`
- Uses the first logo asset's S3 URL directly
- Parallel fetch of profile and assets for better performance

### 3. Mobile Screenshot Removal
**Fix**:
- Removed mobile screenshot capture from browser-render worker
- Only captures desktop screenshot (1920x1080)
- Updated database to only store one screenshot
- Removed `mobileScreenshotUrl` from extraction job payload

### 4. Insufficient Asset Extraction
**Root Cause**: AI prompt was too conservative, only extracting 1-2 assets

**Fix**: Completely rewrote extraction prompt with:

**New Mandatory Categories**:
- A. LOGOS: Main logo, footer logo, favicon, variations (ALL instances)
- B. ICONS: Navigation, feature, social, UI icons (target: 10-15+)
- C. ILLUSTRATIONS: Spot illustrations, characters, decorative graphics (ALL found)
- D. HERO/BANNER IMAGES: Main visuals, backgrounds (2-5 key images)
- E. PRODUCT PHOTOS: Product shots, packaging, screenshots (ALL if applicable)
- F. GRAPHIC ELEMENTS: Badges, stamps, patterns (medium-low priority)

**New Extraction Strategy**:
1. Review EVERY image in the list
2. Target: 15-40 total assets (more is better)
3. Include ALL icons and illustrations
4. When in doubt, include it
5. Quality check: If fewer than 10 assets, look again

**Improved Image List Format**:
- SVGs: `[SVG-0] Inline SVG | Size: 24x24 | Location: header | Context: nav | Class: "icon-menu"`
- Images: `[IMG-0] https://... | Alt: "logo" | Size: 120x40 | Location: header | Context: nav`
- Meta: `[META-0] https://... | Type: favicon`

**Better SVG Handling**:
- Fixed SVG index lookup (was using wrong index logic)
- Now uses direct array access: `allImages[svgIndex]`
- Preserves AI's type classification (logo, icon, etc.) instead of defaulting to 'svg'
- Added logging for SVG extraction success/failure

**Enhanced Logging**:
- Logs total available images and SVG count
- Logs AI's identified asset count
- Logs each asset being added with type
- Warns if download count doesn't match request count
- Warns if no assets identified by AI

## Files Modified

1. **`src/workers/extraction.ts`**
   - Enhanced "Brand Assets to Download" prompt section
   - Improved image list formatting
   - Fixed SVG index lookup logic
   - Added comprehensive logging
   - Added asset type preservation

2. **`src/workers/browser-render.ts`**
   - Removed mobile screenshot capture
   - Removed mobile screenshot upload
   - Removed mobile screenshot from database
   - Updated extraction job payload

3. **`src/app/(app)/studios/[studioId]/processing/page.tsx`**
   - Changed logo fetching to use BrandAsset table
   - Added parallel fetch of profile and assets
   - Uses first logo asset's S3 URL
   - Removed dependency on profile.logos.candidates

4. **`src/app/api/studios/[studioId]/assets/route.ts`**
   - Already fixed in previous commit (constructs S3 URLs)

5. **`src/components/brand-kit/assets-gallery.tsx`**
   - Already fixed in previous commit (uses URL from API)
   - Enhanced with loading/error states
   - Better thumbnail styling

6. **`src/app/globals.css`**
   - Added spin animation for loading spinners

## Expected Results

After this fix:
1. **More assets extracted**: 15-40 assets instead of 1-2
2. **Logo displays correctly**: Fetched from BrandAsset table with proper S3 URL
3. **Images show properly**: Full S3 URLs, error handling, loading states
4. **No mobile screenshot**: Only desktop screenshot stored
5. **Better logging**: Can debug extraction issues from worker logs

## Testing Checklist

- [ ] Run brand analysis on a new website
- [ ] Verify 10+ assets are extracted (check worker logs)
- [ ] Confirm logo displays during extraction process
- [ ] Verify all asset images display in brand kit
- [ ] Check that only desktop screenshot appears
- [ ] Verify icons and illustrations are properly categorized
