# Image Generation API - DALL-E 3

## Overview

Bloom uses **OpenAI's DALL-E 3** for image generation, providing high-quality results at a reasonable cost.

## Pricing

- **Standard Quality**: $0.04 per image
- **HD Quality**: $0.12 per image

**Example costs:**
- 100 images (standard): $4.00
- 100 images (HD): $12.00
- 1,000 images (standard): $40.00

## Supported Resolutions

DALL-E 3 supports three resolutions:
- **1024×1024** (Square)
- **1024×1792** (Portrait/Story)
- **1792×1024** (Landscape/Wide)

## Setup

### 1. Get OpenAI API Key

1. Go to [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key

### 2. Add to Environment Variables

**Railway (Production):**
1. Go to your Worker service in Railway
2. Add environment variable:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Redeploy the worker service

**Local Development:**
1. Update your `.env` file:
   ```env
   OPENAI_API_KEY="sk-your-key-here"
   ```

## How It Works

### Brand-Aware Prompt Enhancement

The generation worker enhances your prompt with brand context based on the **Brand Strength** parameter:

**Loose** (minimal brand influence):
- Uses your prompt as-is
- Adds aesthetic/mood/composition modifiers

**Balanced** (moderate brand influence):
- Adds style traits from brand profile
- Includes aesthetic modifiers

**Strong** (strong brand adherence):
- Adds brand colors to prompt
- Includes typography style
- Adds top 2 style traits

**Strict** (maximum brand consistency):
- All of the above
- Maximum brand context in prompt

### Example Prompt Enhancement

**User Input:**
```
Create a social media post announcing a new product launch
```

**Enhanced Prompt (Balanced, Modern aesthetic):**
```
Create a social media post announcing a new product launch, modern aesthetic, 
sophisticated mood, centered composition, minimal style, high quality, professional design
```

**Enhanced Prompt (Strong, with brand colors):**
```
Create a social media post announcing a new product launch, modern aesthetic,
using brand colors: #7A6CFF, #3CCBFF, #14B8A6, Geist Sans typography style,
minimal and premium style, minimal text overlay, high quality, professional design
```

## Quality Settings

- **Standard**: Faster generation, good quality, $0.04/image
- **HD**: Higher quality, slower, $0.12/image

Recommendation: Use **Standard** for most cases, **HD** for final production assets.

## Variants

Generate 1-4 variants per prompt. Each variant:
- Uses the same enhanced prompt
- Costs $0.04 (standard) or $0.12 (HD)
- Is independently generated (different results)
- Is uploaded to S3 with a unique URL

**Example:** 4 variants in HD = $0.48 total

## Limitations

- **Rate Limits**: OpenAI has rate limits based on your tier
- **Content Policy**: DALL-E 3 has content restrictions
- **Sequential Generation**: Variants are generated one at a time (not parallel)
- **No Seed Control**: DALL-E 3 doesn't support seed for reproducibility

## Monitoring Costs

1. Check OpenAI dashboard for usage: [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. Set up billing alerts in OpenAI settings
3. Monitor generation counts in your database:
   ```sql
   SELECT COUNT(*) FROM "Asset" WHERE type = 'generated';
   ```

## Alternative Options (Future)

If costs become an issue, consider:
- **Replicate Flux Schnell**: $0.003/image (13x cheaper, lower quality)
- **Stable Diffusion**: $0.004/image (10x cheaper, requires more prompt engineering)
- **Flux Dev**: $0.025/image (similar quality, slightly cheaper)

For now, DALL-E 3 provides the best balance of quality, ease of use, and cost.

---

**Current Setup**: DALL-E 3 with brand-aware prompt enhancement
**Cost**: $0.04/image (standard) or $0.12/image (HD)
**Quality**: High
**Status**: ✅ Implemented and deployed
