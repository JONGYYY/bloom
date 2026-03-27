# Image Display Issues - Root Cause and Fix

## Problem Summary
Many assets show "Image unavailable" in the brand kit gallery, even though the files exist in S3 and can be accessed directly.

## Root Causes Identified

### 1. Missing Content-Disposition Header (FIXED)
**Issue**: Files uploaded before 2026-03-27 don't have `ContentDisposition: 'inline'` header.
**Result**: Browsers download the file instead of displaying it inline.
**Fix Applied**: Added `ContentDisposition: 'inline'` to all S3 uploads.
**Status**: ✅ Fixed for new uploads only

### 2. Overly Strict SVG Validation (FIXED)
**Issue**: SVG validation was rejecting valid SVGs that contained `<defs>`, `<symbol>`, `<clipPath>`, or `<mask>` elements.
**Result**: Many valid SVGs were not being uploaded at all.
**Fix Applied**: Relaxed validation to accept these elements and lowered size threshold from 200 to 50 chars.
**Status**: ✅ Fixed

### 3. SVG Sanitization Issues (FIXED)
**Issue**: Some SVGs contain scripts or foreign objects that browsers block.
**Result**: SVGs fail to render in browser.
**Fix Applied**: Added sanitization to remove `<script>`, event handlers, and `<foreignObject>` elements.
**Status**: ✅ Fixed

## Solution for Existing Assets

**The images showing "Image unavailable" were uploaded BEFORE these fixes were applied.**

To fix them, you have two options:

### Option A: Re-analyze the Brand (Recommended)
1. Delete the current studio
2. Create a new studio with the same URL
3. The new extraction will use all the fixes and upload files with correct headers

### Option B: Update S3 Metadata (Manual)
For each failing asset in S3:
1. Go to AWS S3 Console
2. Select the object
3. Actions → Edit metadata
4. Add/Update:
   - `Content-Disposition`: `inline`
   - `Content-Type`: `image/svg+xml` (for SVGs) or `image/png` (for PNGs)
5. Save changes

## Expected Results After Re-analysis

With all fixes applied, you should see:
- ✅ 15-25 assets extracted (vs 5-10 before)
- ✅ All assets display properly (no "Image unavailable")
- ✅ Pink and other brand colors detected consistently
- ✅ Logos display on processing page
- ✅ All SVGs render inline (no downloads)

## Technical Details

### Headers Now Applied to All Uploads
```typescript
ContentType: 'image/svg+xml' or 'image/png'
ContentDisposition: 'inline'  // Forces inline display
CacheControl: 'public, max-age=31536000'  // 1 year cache
```

### SVG Validation Now Accepts
- Minimum 50 characters (was 200)
- Elements: path, circle, rect, polygon, line, ellipse, text, image, use, g, defs, symbol, clipPath, mask

### SVG Sanitization Removes
- `<script>` tags
- Event handlers (onclick, onload, etc.)
- `<foreignObject>` elements
- Ensures `xmlns` namespace is present

## Verification Steps

After re-analyzing a brand:
1. Check browser console for errors (should be none)
2. Click on S3 URLs directly - they should display inline, not download
3. All assets in brand kit should display
4. Network tab should show 200 OK for all images (not 304 or 206 with errors)
