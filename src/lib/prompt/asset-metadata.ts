/**
 * Asset type classification for brand reference images
 */
export type AssetType =
  | 'product_photo'
  | 'apparel_photo'
  | 'logo_mark'
  | 'logo_wordmark'
  | 'icon_set'
  | 'illustration_style_sample'
  | 'hero_image'
  | 'campaign_visual'
  | 'packaging_image'
  | 'label_tag_detail'
  | 'motif_crop'
  | 'texture_reference'
  | 'user_uploaded_reference'
  | 'previous_generated_asset'

/**
 * Brand role classification
 */
export type BrandRole = 'primary' | 'secondary' | 'reference' | 'inspiration'

/**
 * Text presence levels in assets
 */
export type TextPresence = 'none' | 'minimal' | 'prominent' | 'heavy'

/**
 * Comprehensive metadata structure for brand assets
 */
export interface AssetMetadata {
  assetType: AssetType
  subtype?: string
  contentSubject?: string[]
  brandRole: BrandRole
  visualTraits?: string[]
  compositionTags?: string[]
  paletteTags?: string[]
  textPresence?: TextPresence
  brandRelevanceScore: number // 0-100
  qualityScore: number // 0-100
  ideaCompatibility?: Record<string, number> // ideaId -> score (0-100)
}

/**
 * Asset type display names
 */
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  product_photo: 'Product Photo',
  apparel_photo: 'Apparel Photo',
  logo_mark: 'Logo Mark',
  logo_wordmark: 'Logo Wordmark',
  icon_set: 'Icon Set',
  illustration_style_sample: 'Illustration Sample',
  hero_image: 'Hero Image',
  campaign_visual: 'Campaign Visual',
  packaging_image: 'Packaging Image',
  label_tag_detail: 'Label/Tag Detail',
  motif_crop: 'Motif Crop',
  texture_reference: 'Texture Reference',
  user_uploaded_reference: 'User Upload',
  previous_generated_asset: 'Generated Asset',
}

/**
 * Asset type categories for grouping
 */
export const ASSET_TYPE_CATEGORIES: Record<string, AssetType[]> = {
  'Brand Identity': ['logo_mark', 'logo_wordmark', 'icon_set'],
  'Product': ['product_photo', 'apparel_photo', 'packaging_image', 'label_tag_detail'],
  'Marketing': ['hero_image', 'campaign_visual'],
  'Design Elements': ['illustration_style_sample', 'motif_crop', 'texture_reference'],
  'User Content': ['user_uploaded_reference', 'previous_generated_asset'],
}

/**
 * Default idea compatibility scores for each asset type
 * These are baseline scores that can be adjusted based on specific asset analysis
 */
export const DEFAULT_IDEA_COMPATIBILITY: Record<AssetType, Record<string, number>> = {
  product_photo: {
    'product-shot': 95,
    'product-launch': 90,
    'lifestyle-product': 85,
    'product-comparison': 80,
    'ecommerce-banner': 85,
    'social-media-ad': 70,
    'website-hero': 75,
  },
  apparel_photo: {
    'product-shot': 90,
    't-shirt-design': 85,
    'hoodie-design': 85,
    'lifestyle-product': 90,
    'social-media-ad': 75,
  },
  logo_mark: {
    't-shirt-design': 95,
    'hoodie-design': 95,
    'tote-bag': 90,
    'sticker-design': 95,
    'mug-design': 85,
    'packaging-design': 80,
    'logo-concept': 90,
    'brand-pattern': 85,
  },
  logo_wordmark: {
    'quote-card': 85,
    'profile-banner': 90,
    'blog-header': 80,
    'newsletter-header': 85,
    't-shirt-design': 80,
    'hoodie-design': 80,
  },
  icon_set: {
    't-shirt-design': 75,
    'hoodie-design': 75,
    'infographic': 90,
    'brand-pattern': 80,
  },
  illustration_style_sample: {
    't-shirt-design': 90,
    'hoodie-design': 90,
    'sticker-design': 95,
    'brand-pattern': 85,
    'campaign-visual': 80,
  },
  hero_image: {
    'website-hero': 95,
    'blog-header': 90,
    'newsletter-header': 85,
    'profile-banner': 85,
    'social-media-ad': 80,
  },
  campaign_visual: {
    'social-media-ad': 95,
    'display-ad': 90,
    'promo-banner': 90,
    'website-hero': 85,
    'event-invite': 80,
  },
  packaging_image: {
    'product-shot': 85,
    'packaging-design': 95,
    'product-launch': 80,
  },
  label_tag_detail: {
    'product-shot': 75,
    'packaging-design': 85,
    'label-design': 95,
  },
  motif_crop: {
    'quote-card': 80,
    'brand-pattern': 90,
    't-shirt-design': 85,
    'hoodie-design': 85,
    'texture-reference': 85,
  },
  texture_reference: {
    'quote-card': 75,
    'brand-pattern': 85,
    'background': 90,
  },
  user_uploaded_reference: {
    // User uploads get high compatibility for all types by default
    // Actual compatibility should be determined by AI analysis
  },
  previous_generated_asset: {
    // Generated assets can be reused for similar types
    // Compatibility determined by original generation parameters
  },
}

/**
 * Helper to get default compatibility score for asset type and idea
 */
export function getDefaultCompatibility(
  assetType: AssetType,
  ideaId: string
): number {
  const compatibilityMap = DEFAULT_IDEA_COMPATIBILITY[assetType]
  if (!compatibilityMap) return 50 // Default neutral score
  return compatibilityMap[ideaId] || 50
}

/**
 * Helper to validate asset metadata
 */
export function validateAssetMetadata(metadata: Partial<AssetMetadata>): boolean {
  if (!metadata.assetType) return false
  if (!metadata.brandRole) return false
  if (metadata.brandRelevanceScore !== undefined && 
      (metadata.brandRelevanceScore < 0 || metadata.brandRelevanceScore > 100)) {
    return false
  }
  if (metadata.qualityScore !== undefined && 
      (metadata.qualityScore < 0 || metadata.qualityScore > 100)) {
    return false
  }
  return true
}

/**
 * Helper to create default metadata for an asset type
 */
export function createDefaultMetadata(assetType: AssetType): AssetMetadata {
  return {
    assetType,
    brandRole: 'secondary',
    brandRelevanceScore: 50,
    qualityScore: 70,
    textPresence: 'none',
    visualTraits: [],
    compositionTags: [],
    paletteTags: [],
    contentSubject: [],
  }
}

/**
 * Type guard to check if object is AssetMetadata
 */
export function isAssetMetadata(obj: any): obj is AssetMetadata {
  return (
    obj &&
    typeof obj === 'object' &&
    'assetType' in obj &&
    'brandRole' in obj &&
    'brandRelevanceScore' in obj &&
    'qualityScore' in obj
  )
}
