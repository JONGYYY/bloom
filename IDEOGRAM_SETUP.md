# Ideogram Integration Setup

## What Changed

The generation worker has been updated to use **Ideogram v3 API** instead of DALL-E 3 for image generation.

## Why Ideogram?

- **Better text-in-image generation**: Ideogram excels at generating text within images
- **Native color palette support**: Can directly use brand colors in generation
- **More style options**: GENERAL, REALISTIC, DESIGN, ANIME style types
- **Cost-effective**: More affordable than DALL-E 3
- **Magic prompt**: Automatic prompt enhancement for better results

## Setup Instructions

### 1. Get Ideogram API Key

1. Go to [https://ideogram.ai/](https://ideogram.ai/)
2. Sign up or log in
3. Navigate to API settings
4. Generate an API key

### 2. Update Environment Variables

**Railway (Production):**
1. Go to your Railway project
2. Navigate to the Worker service
3. Add/update environment variable:
   ```
   IDEOGRAM_API_KEY=your-ideogram-api-key-here
   ```
4. Redeploy the worker service

**Local Development:**
1. Update your `.env` file:
   ```env
   IDEOGRAM_API_KEY="your-ideogram-api-key-here"
   ```

### 3. Remove Old Environment Variable (Optional)

You can remove `OPENAI_API_KEY` if you're not using it for anything else:
- Remove from Railway environment variables
- Remove from local `.env` file

## API Details

### Endpoint
```
POST https://api.ideogram.ai/v1/ideogram-v3/generate
```

### Parameters Used

- **prompt**: Enhanced user prompt with brand context
- **aspect_ratio**: Mapped from our aspect ratio selector
  - `square` → `ASPECT_1_1`
  - `portrait` → `ASPECT_9_16`
  - `landscape` → `ASPECT_16_9`
  - `story` → `ASPECT_9_16`
- **style_type**: Mapped from our aesthetic selector
  - `minimal`, `professional` → `GENERAL`
  - `luxury`, `organic` → `REALISTIC`
  - `bold`, `modern`, `tech` → `DESIGN`
  - `playful` → `ANIME`
- **color_palette**: Brand colors from studio profile (up to 5 colors)
- **magic_prompt**: Set to `AUTO` for automatic prompt enhancement
- **num_images**: Based on variants parameter (1-4)

### Response Format

```json
{
  "data": [
    {
      "url": "https://...",
      "prompt": "Enhanced prompt used",
      "seed": 12345,
      "resolution": "1024x1024"
    }
  ]
}
```

## Code Changes

### Files Modified

1. **`src/workers/generation.ts`**
   - Removed OpenAI SDK import
   - Added form-data for multipart requests
   - Implemented Ideogram API call
   - Added color palette integration
   - Updated metadata structure

2. **`package.json`**
   - Added `form-data` dependency

### New Functions

- `getIdeogramAspectRatio()`: Maps our aspect ratios to Ideogram format
- `getIdeogramStyleType()`: Maps our aesthetics to Ideogram style types

## Testing

1. **Create a studio** with a brand URL
2. **Navigate to workspace**: `/studios/[studioId]/workspace`
3. **Enter a prompt** like: "Create a social media post announcing a new product"
4. **Adjust parameters**:
   - Select an aesthetic (e.g., "Modern")
   - Choose aspect ratio (e.g., "Square")
   - Set variants (1-4)
5. **Click Generate**
6. **Monitor worker logs** for generation progress
7. **Check generated assets** in the asset history

## Troubleshooting

### Error: "Ideogram API error: 401"
- Check that `IDEOGRAM_API_KEY` is set correctly
- Verify the API key is valid and active

### Error: "Ideogram API error: 422"
- Prompt failed safety check
- Try modifying the prompt to be less explicit

### Error: "No image URL returned from Ideogram"
- Check Ideogram API status
- Verify your account has available credits

### Images not appearing
- Check S3 bucket permissions
- Verify AWS credentials are correct
- Check that pre-signed URLs are being generated

## Migration Notes

### Metadata Changes

**Old (DALL-E 3):**
```json
{
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "hd",
  "revisedPrompt": "..."
}
```

**New (Ideogram):**
```json
{
  "model": "ideogram-v3",
  "aspectRatio": "ASPECT_1_1",
  "styleType": "DESIGN",
  "quality": "standard",
  "ideogramPrompt": "...",
  "seed": 12345
}
```

### No Breaking Changes

- All existing API endpoints remain the same
- Frontend components don't need updates
- Database schema unchanged
- Only the generation worker implementation changed

## Benefits Summary

✅ Better text rendering in images
✅ Direct brand color integration
✅ More style variety
✅ Lower cost per generation
✅ Automatic prompt enhancement
✅ Reproducible results with seed values

## Next Steps

1. Set up Ideogram API key in Railway
2. Test generation with a few prompts
3. Compare results with previous DALL-E 3 generations
4. Adjust aesthetic mappings if needed
5. Monitor generation costs and quality

---

**Status**: ✅ Implemented and pushed to GitHub
**Commit**: 967a523
**Branch**: main
