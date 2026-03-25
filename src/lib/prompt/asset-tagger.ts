import { prisma } from '@/lib/db'
import {
  AssetMetadata,
  AssetType,
  BrandRole,
  TextPresence,
  createDefaultMetadata,
  getDefaultCompatibility,
  DEFAULT_IDEA_COMPATIBILITY,
} from './asset-metadata'

interface TaggingOptions {
  useAI?: boolean // Future: Use GPT-4 Vision for auto-tagging
  manualTags?: Partial<AssetMetadata>
}

/**
 * Deterministic rules for inferring asset properties based on type
 */
function inferAssetProperties(assetType: AssetType, sourceType?: string): Partial<AssetMetadata> {
  const properties: Partial<AssetMetadata> = {}

  // Infer brand role based on asset type
  switch (assetType) {
    case 'logo_mark':
    case 'logo_wordmark':
      properties.brandRole = 'primary'
      properties.brandRelevanceScore = 95
      properties.textPresence = assetType === 'logo_wordmark' ? 'prominent' : 'none'
      break

    case 'product_photo':
    case 'apparel_photo':
      properties.brandRole = 'primary'
      properties.brandRelevanceScore = 90
      properties.textPresence = 'minimal'
      break

    case 'hero_image':
    case 'campaign_visual':
      properties.brandRole = 'primary'
      properties.brandRelevanceScore = 85
      properties.textPresence = 'minimal'
      break

    case 'packaging_image':
    case 'label_tag_detail':
      properties.brandRole = 'secondary'
      properties.brandRelevanceScore = 80
      properties.textPresence = 'prominent'
      break

    case 'icon_set':
    case 'illustration_style_sample':
      properties.brandRole = 'secondary'
      properties.brandRelevanceScore = 75
      properties.textPresence = 'none'
      break

    case 'motif_crop':
    case 'texture_reference':
      properties.brandRole = 'reference'
      properties.brandRelevanceScore = 70
      properties.textPresence = 'none'
      break

    case 'user_uploaded_reference':
      properties.brandRole = 'reference'
      properties.brandRelevanceScore = 60
      properties.textPresence = 'minimal'
      break

    case 'previous_generated_asset':
      properties.brandRole = 'inspiration'
      properties.brandRelevanceScore = 65
      properties.textPresence = 'minimal'
      break

    default:
      properties.brandRole = 'secondary'
      properties.brandRelevanceScore = 50
      properties.textPresence = 'none'
  }

  // Infer quality score based on asset type and source
  if (sourceType === 'extracted') {
    properties.qualityScore = 80 // Extracted from brand site = high quality
  } else if (sourceType === 'uploaded') {
    properties.qualityScore = 70 // User uploaded = medium quality
  } else if (sourceType === 'generated') {
    properties.qualityScore = 85 // AI generated = high quality
  } else {
    properties.qualityScore = 75 // Default
  }

  return properties
}

/**
 * Calculate idea compatibility scores for an asset
 */
function calculateIdeaCompatibility(
  assetType: AssetType,
  metadata: Partial<AssetMetadata>
): Record<string, number> {
  const baseCompatibility = DEFAULT_IDEA_COMPATIBILITY[assetType] || {}
  const compatibility: Record<string, number> = { ...baseCompatibility }

  // Adjust scores based on metadata
  if (metadata.textPresence === 'heavy') {
    // Text-heavy assets are better for quote cards, less good for product shots
    if (compatibility['quote-card']) compatibility['quote-card'] += 10
    if (compatibility['product-shot']) compatibility['product-shot'] -= 15
  }

  if (metadata.visualTraits?.includes('minimal')) {
    // Minimal assets work well for clean designs
    if (compatibility['product-shot']) compatibility['product-shot'] += 5
    if (compatibility['quote-card']) compatibility['quote-card'] += 5
  }

  if (metadata.visualTraits?.includes('bold')) {
    // Bold assets work well for advertising
    if (compatibility['social-media-ad']) compatibility['social-media-ad'] += 10
    if (compatibility['display-ad']) compatibility['display-ad'] += 10
  }

  // Ensure all scores are within 0-100 range
  Object.keys(compatibility).forEach(key => {
    compatibility[key] = Math.max(0, Math.min(100, compatibility[key]))
  })

  return compatibility
}

/**
 * Infer visual traits from asset type and metadata
 */
function inferVisualTraits(assetType: AssetType, metadata: Partial<AssetMetadata>): string[] {
  const traits: string[] = []

  // Type-based traits
  switch (assetType) {
    case 'logo_mark':
    case 'logo_wordmark':
      traits.push('branded', 'iconic')
      break
    case 'product_photo':
    case 'apparel_photo':
      traits.push('photographic', 'realistic')
      break
    case 'illustration_style_sample':
      traits.push('illustrated', 'artistic')
      break
    case 'hero_image':
    case 'campaign_visual':
      traits.push('promotional', 'polished')
      break
    case 'motif_crop':
    case 'texture_reference':
      traits.push('decorative', 'textural')
      break
  }

  // Add any manual traits
  if (metadata.visualTraits) {
    traits.push(...metadata.visualTraits)
  }

  return Array.from(new Set(traits))
}

/**
 * Infer composition tags from asset type
 */
function inferCompositionTags(assetType: AssetType): string[] {
  const tags: string[] = []

  switch (assetType) {
    case 'product_photo':
    case 'apparel_photo':
      tags.push('centered', 'studio-lit')
      break
    case 'hero_image':
      tags.push('wide', 'layered')
      break
    case 'logo_mark':
    case 'logo_wordmark':
      tags.push('centered', 'isolated')
      break
    case 'campaign_visual':
      tags.push('dynamic', 'layered')
      break
    case 'packaging_image':
      tags.push('product-focused', 'detailed')
      break
  }

  return tags
}

/**
 * Tag a brand asset with metadata
 */
export async function tagBrandAsset(
  assetId: string,
  assetType: AssetType,
  options: TaggingOptions = {}
): Promise<AssetMetadata> {
  // Get the asset
  const asset = await prisma.brandAsset.findUnique({
    where: { id: assetId },
  })

  if (!asset) {
    throw new Error(`Asset ${assetId} not found`)
  }

  // Start with default metadata
  let metadata = createDefaultMetadata(assetType)

  // Apply deterministic rules
  const inferredProperties = inferAssetProperties(assetType, asset.type)
  metadata = { ...metadata, ...inferredProperties }

  // Infer additional properties
  metadata.visualTraits = inferVisualTraits(assetType, options.manualTags || {})
  metadata.compositionTags = inferCompositionTags(assetType)

  // Calculate idea compatibility
  metadata.ideaCompatibility = calculateIdeaCompatibility(assetType, metadata)

  // Apply manual overrides
  if (options.manualTags) {
    metadata = { ...metadata, ...options.manualTags }
  }

  // Future: Use GPT-4 Vision for AI-based tagging
  if (options.useAI) {
    // TODO: Implement GPT-4 Vision analysis
    // This would analyze the actual image and provide more accurate tags
    console.log('[Asset Tagger] AI tagging not yet implemented')
  }

  // Update the asset with metadata
  await prisma.brandAsset.update({
    where: { id: assetId },
    data: {
      metadata: metadata as any,
    },
  })

  return metadata
}

/**
 * Tag a generated asset with metadata
 */
export async function tagGeneratedAsset(
  assetId: string,
  generationParameters: any
): Promise<AssetMetadata> {
  // Get the asset
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
  })

  if (!asset) {
    throw new Error(`Asset ${assetId} not found`)
  }

  // Create metadata for generated asset
  const metadata: AssetMetadata = {
    assetType: 'previous_generated_asset',
    brandRole: 'inspiration',
    brandRelevanceScore: 70,
    qualityScore: 85,
    textPresence: generationParameters.textPresence || 'minimal',
    visualTraits: [],
    compositionTags: [],
    paletteTags: [],
    contentSubject: [],
  }

  // Infer properties from generation parameters
  if (generationParameters.outputType) {
    metadata.contentSubject = [generationParameters.outputType]
  }

  if (generationParameters.aesthetic) {
    metadata.visualTraits = [generationParameters.aesthetic]
  }

  if (generationParameters.composition) {
    metadata.compositionTags = [generationParameters.composition]
  }

  // Calculate idea compatibility based on what it was generated for
  if (generationParameters.outputType) {
    metadata.ideaCompatibility = {
      [generationParameters.outputType]: 90, // High compatibility with same type
    }
  }

  // Update the asset with metadata
  await prisma.asset.update({
    where: { id: assetId },
    data: {
      metadata: metadata as any,
    },
  })

  return metadata
}

/**
 * Bulk tag all assets for a studio
 */
export async function bulkTagAssets(studioId: string): Promise<{
  tagged: number
  skipped: number
  errors: number
}> {
  const results = {
    tagged: 0,
    skipped: 0,
    errors: 0,
  }

  // Get all brand assets for the studio
  const brandAssets = await prisma.brandAsset.findMany({
    where: { studioId },
  })

  console.log(`[Bulk Tag] Found ${brandAssets.length} brand assets for studio ${studioId}`)

  for (const asset of brandAssets) {
    try {
      // Skip if already tagged
      if (asset.metadata && typeof asset.metadata === 'object' && 'assetType' in asset.metadata) {
        console.log(`[Bulk Tag] Skipping ${asset.id} - already tagged`)
        results.skipped++
        continue
      }

      // Infer asset type from the asset.type field
      let assetType: AssetType = 'user_uploaded_reference'
      
      // Map asset.type to AssetType
      if (asset.type.includes('logo')) {
        assetType = asset.type.includes('wordmark') ? 'logo_wordmark' : 'logo_mark'
      } else if (asset.type.includes('product')) {
        assetType = 'product_photo'
      } else if (asset.type.includes('hero')) {
        assetType = 'hero_image'
      } else if (asset.type.includes('icon')) {
        assetType = 'icon_set'
      }

      await tagBrandAsset(asset.id, assetType)
      console.log(`[Bulk Tag] Tagged ${asset.id} as ${assetType}`)
      results.tagged++
    } catch (error) {
      console.error(`[Bulk Tag] Error tagging ${asset.id}:`, error)
      results.errors++
    }
  }

  // Also tag generated assets
  const generatedAssets = await prisma.asset.findMany({
    where: { 
      studioId,
      type: 'generated',
    },
  })

  console.log(`[Bulk Tag] Found ${generatedAssets.length} generated assets for studio ${studioId}`)

  for (const asset of generatedAssets) {
    try {
      // Skip if already tagged
      if (asset.metadata && typeof asset.metadata === 'object' && 'assetType' in asset.metadata) {
        results.skipped++
        continue
      }

      const parameters = (asset.parameters || {}) as any
      await tagGeneratedAsset(asset.id, parameters)
      results.tagged++
    } catch (error) {
      console.error(`[Bulk Tag] Error tagging generated asset ${asset.id}:`, error)
      results.errors++
    }
  }

  console.log(`[Bulk Tag] Complete: ${results.tagged} tagged, ${results.skipped} skipped, ${results.errors} errors`)

  return results
}

/**
 * Get all tagged assets for a studio
 */
export async function getTaggedAssets(studioId: string) {
  const brandAssets = await prisma.brandAsset.findMany({
    where: {
      studioId,
      metadata: {
        not: null as any
      }
    },
  })

  const generatedAssets = await prisma.asset.findMany({
    where: {
      studioId,
      metadata: {
        not: null as any
      }
    },
  })

  return {
    brandAssets,
    generatedAssets,
    total: brandAssets.length + generatedAssets.length,
  }
}
