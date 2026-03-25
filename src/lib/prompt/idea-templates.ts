import { AssetType } from './asset-metadata'

export type BrandField =
  | 'brandName'
  | 'toneSummary'
  | 'paletteSummary'
  | 'aestheticSummary'
  | 'typographySummary'
  | 'shortBrandLens'
  | 'visualConstraints'

export type ArtStyleWeight = 'none' | 'low' | 'medium' | 'high'
export type TypographyRelevance = 'none' | 'low' | 'medium' | 'high'
export type BrandStrengthLevel = 'loose' | 'balanced' | 'strong' | 'strict'
export type TextPresenceLevel = 'none' | 'minimal' | 'headline' | 'text-heavy'

export interface IdeaTemplate {
  templateId: string
  name: string
  category: string
  description: string
  promptSkeleton: string
  requiredBrandFields: BrandField[]
  preferredReferenceTypes: AssetType[]
  optionalReferenceTypes: AssetType[]
  excludedReferenceTypes: AssetType[]
  artStyleWeight: ArtStyleWeight
  typographyRelevance: TypographyRelevance
  brandStrengthDefault: BrandStrengthLevel
  textPresenceDefault: TextPresenceLevel
  compositionGuidance?: string
}

/**
 * Comprehensive idea template library
 * Maps to concept templates from concept-selector.tsx
 */
export const IDEA_TEMPLATES: IdeaTemplate[] = [
  // Product Category
  {
    templateId: 'product-shot',
    name: 'Product Shot',
    category: 'Product',
    description: 'Clean product photography with studio lighting',
    promptSkeleton: 'Create a professional product shot of {product}. {aesthetic} with {lighting}.',
    requiredBrandFields: ['paletteSummary', 'aestheticSummary'],
    preferredReferenceTypes: ['product_photo', 'apparel_photo', 'packaging_image'],
    optionalReferenceTypes: ['label_tag_detail'],
    excludedReferenceTypes: ['icon_set', 'illustration_style_sample'],
    artStyleWeight: 'medium',
    typographyRelevance: 'none',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'none',
    compositionGuidance: 'centered, clean background',
  },
  {
    templateId: 'product-launch',
    name: 'Product Launch',
    category: 'Announcement',
    description: 'Exciting product launch announcement',
    promptSkeleton: 'Design an exciting product launch announcement for {product}. {mood} with dynamic presentation.',
    requiredBrandFields: ['shortBrandLens', 'paletteSummary', 'toneSummary'],
    preferredReferenceTypes: ['product_photo', 'hero_image', 'campaign_visual'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: [],
    artStyleWeight: 'high',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'headline',
    compositionGuidance: 'dynamic, hero-focused',
  },
  {
    templateId: 'lifestyle-product',
    name: 'Lifestyle Product',
    category: 'Product',
    description: 'Product in lifestyle context',
    promptSkeleton: 'Show {product} in a natural lifestyle setting. {aesthetic} with authentic context.',
    requiredBrandFields: ['aestheticSummary', 'toneSummary'],
    preferredReferenceTypes: ['product_photo', 'apparel_photo', 'hero_image'],
    optionalReferenceTypes: ['campaign_visual'],
    excludedReferenceTypes: ['logo_mark', 'icon_set'],
    artStyleWeight: 'medium',
    typographyRelevance: 'low',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'natural, contextual',
  },
  {
    templateId: 'product-comparison',
    name: 'Product Comparison',
    category: 'Product',
    description: 'Side-by-side product comparison',
    promptSkeleton: 'Create a side-by-side comparison showing {feature}. Clear visual contrast.',
    requiredBrandFields: ['aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['product_photo', 'packaging_image'],
    optionalReferenceTypes: ['label_tag_detail'],
    excludedReferenceTypes: ['motif_crop', 'texture_reference'],
    artStyleWeight: 'low',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'split-screen, balanced',
  },
  {
    templateId: 'packaging-design',
    name: 'Packaging Design',
    category: 'Product',
    description: 'Product packaging mockup',
    promptSkeleton: 'Design product packaging for {product}. {aesthetic} with clear brand identity.',
    requiredBrandFields: ['brandName', 'paletteSummary', 'aestheticSummary'],
    preferredReferenceTypes: ['packaging_image', 'logo_mark', 'label_tag_detail'],
    optionalReferenceTypes: ['product_photo', 'motif_crop'],
    excludedReferenceTypes: [],
    artStyleWeight: 'medium',
    typographyRelevance: 'high',
    brandStrengthDefault: 'strict',
    textPresenceDefault: 'text-heavy',
    compositionGuidance: '3D mockup, detailed',
  },

  // Social Media Category
  {
    templateId: 'linkedin-post',
    name: 'LinkedIn Post',
    category: 'Social Media',
    description: 'Professional LinkedIn post image',
    promptSkeleton: 'Create a professional LinkedIn post about {topic}. {toneSummary} with clean design.',
    requiredBrandFields: ['toneSummary', 'aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['campaign_visual', 'hero_image'],
    optionalReferenceTypes: ['logo_wordmark'],
    excludedReferenceTypes: ['product_photo'],
    artStyleWeight: 'medium',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'headline',
    compositionGuidance: 'professional, structured',
  },
  {
    templateId: 'instagram-story',
    name: 'Instagram Story',
    category: 'Social Media',
    description: 'Vertical Instagram story',
    promptSkeleton: 'Design an eye-catching Instagram story about {topic}. {mood} with bold visuals.',
    requiredBrandFields: ['paletteSummary', 'toneSummary'],
    preferredReferenceTypes: ['campaign_visual', 'hero_image', 'product_photo'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: [],
    artStyleWeight: 'high',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'headline',
    compositionGuidance: 'vertical, attention-grabbing',
  },
  {
    templateId: 'social-media-ad',
    name: 'Social Media Ad',
    category: 'Advertising',
    description: 'Social media advertisement',
    promptSkeleton: 'Create a social media ad for {product/service}. {shortBrandLens} with clear call-to-action.',
    requiredBrandFields: ['shortBrandLens', 'paletteSummary', 'toneSummary'],
    preferredReferenceTypes: ['campaign_visual', 'hero_image', 'product_photo'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: [],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'headline',
    compositionGuidance: 'attention-grabbing, clear CTA',
  },
  {
    templateId: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'Social Media',
    description: 'Attention-grabbing video thumbnail',
    promptSkeleton: 'Design a YouTube thumbnail for {video topic}. Bold, high-contrast, attention-grabbing.',
    requiredBrandFields: ['paletteSummary'],
    preferredReferenceTypes: ['campaign_visual', 'hero_image'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: ['texture_reference', 'motif_crop'],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'headline',
    compositionGuidance: 'bold, high-contrast',
  },

  // Advertising Category
  {
    templateId: 'display-ad',
    name: 'Display Ad',
    category: 'Advertising',
    description: 'Professional display advertisement',
    promptSkeleton: 'Create a display ad for {product/service}. {shortBrandLens} with clear messaging.',
    requiredBrandFields: ['shortBrandLens', 'paletteSummary'],
    preferredReferenceTypes: ['campaign_visual', 'product_photo', 'hero_image'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: [],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'headline',
    compositionGuidance: 'clear hierarchy, CTA-focused',
  },
  {
    templateId: 'promo-banner',
    name: 'Promo Banner',
    category: 'Advertising',
    description: 'Promotional banner with special offer',
    promptSkeleton: 'Design a promotional banner for {offer}. {paletteSummary} with urgency and excitement.',
    requiredBrandFields: ['paletteSummary', 'toneSummary'],
    preferredReferenceTypes: ['campaign_visual', 'hero_image'],
    optionalReferenceTypes: ['product_photo', 'logo_mark'],
    excludedReferenceTypes: [],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'text-heavy',
    compositionGuidance: 'bold, promotional',
  },
  {
    templateId: 'sale-event',
    name: 'Sale Event',
    category: 'Advertising',
    description: 'Sale event promotional image',
    promptSkeleton: 'Create a sale event graphic for {event}. Bold, urgent, {paletteSummary}.',
    requiredBrandFields: ['paletteSummary', 'brandName'],
    preferredReferenceTypes: ['campaign_visual', 'product_photo'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: ['texture_reference', 'motif_crop'],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'text-heavy',
    compositionGuidance: 'bold, urgent',
  },

  // Announcement Category
  {
    templateId: 'event-invite',
    name: 'Event Invite',
    category: 'Announcement',
    description: 'Elegant event invitation',
    promptSkeleton: 'Design an elegant invitation for {event}. {aestheticSummary} with sophisticated layout.',
    requiredBrandFields: ['aestheticSummary', 'paletteSummary', 'typographySummary'],
    preferredReferenceTypes: ['campaign_visual', 'logo_wordmark'],
    optionalReferenceTypes: ['motif_crop', 'texture_reference'],
    excludedReferenceTypes: ['product_photo'],
    artStyleWeight: 'medium',
    typographyRelevance: 'high',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'text-heavy',
    compositionGuidance: 'elegant, structured',
  },
  {
    templateId: 'milestone',
    name: 'Milestone',
    category: 'Announcement',
    description: 'Celebratory milestone announcement',
    promptSkeleton: 'Create a celebratory graphic for {milestone}. {toneSummary} with excitement.',
    requiredBrandFields: ['toneSummary', 'paletteSummary'],
    preferredReferenceTypes: ['campaign_visual', 'logo_mark'],
    optionalReferenceTypes: ['hero_image'],
    excludedReferenceTypes: ['product_photo'],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'headline',
    compositionGuidance: 'celebratory, bold',
  },
  {
    templateId: 'coming-soon',
    name: 'Coming Soon',
    category: 'Announcement',
    description: 'Teaser for upcoming launch',
    promptSkeleton: 'Design a coming soon teaser for {product/event}. {mood} with anticipation.',
    requiredBrandFields: ['paletteSummary', 'aestheticSummary'],
    preferredReferenceTypes: ['campaign_visual', 'hero_image'],
    optionalReferenceTypes: ['logo_mark', 'product_photo'],
    excludedReferenceTypes: [],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'headline',
    compositionGuidance: 'mysterious, anticipatory',
  },

  // Blog & Content Category
  {
    templateId: 'blog-header',
    name: 'Blog Header',
    category: 'Blog & Content',
    description: 'Professional blog post header',
    promptSkeleton: 'Create a blog header image for {topic}. {aestheticSummary} with editorial quality.',
    requiredBrandFields: ['aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['hero_image', 'campaign_visual'],
    optionalReferenceTypes: ['texture_reference', 'motif_crop'],
    excludedReferenceTypes: ['product_photo', 'logo_mark'],
    artStyleWeight: 'medium',
    typographyRelevance: 'low',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'editorial, wide',
  },
  {
    templateId: 'quote-card',
    name: 'Quote Card',
    category: 'Blog & Content',
    description: 'Inspirational quote card',
    promptSkeleton: 'Design a quote card with {quote}. {typographySummary} with {aestheticSummary}.',
    requiredBrandFields: ['typographySummary', 'aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['logo_wordmark', 'motif_crop', 'texture_reference'],
    optionalReferenceTypes: ['campaign_visual'],
    excludedReferenceTypes: ['product_photo', 'apparel_photo'],
    artStyleWeight: 'low',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'text-heavy',
    compositionGuidance: 'typography-focused, minimal',
  },
  {
    templateId: 'infographic',
    name: 'Infographic',
    category: 'Blog & Content',
    description: 'Data visualization infographic',
    promptSkeleton: 'Create an infographic about {topic}. {aestheticSummary} with clear hierarchy.',
    requiredBrandFields: ['aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['icon_set', 'campaign_visual'],
    optionalReferenceTypes: ['logo_mark'],
    excludedReferenceTypes: ['product_photo', 'apparel_photo'],
    artStyleWeight: 'medium',
    typographyRelevance: 'high',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'text-heavy',
    compositionGuidance: 'structured, hierarchical',
  },
  {
    templateId: 'newsletter-header',
    name: 'Newsletter Header',
    category: 'Blog & Content',
    description: 'Email newsletter header',
    promptSkeleton: 'Design a newsletter header for {topic}. {aestheticSummary} with professional layout.',
    requiredBrandFields: ['aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['hero_image', 'campaign_visual', 'logo_wordmark'],
    optionalReferenceTypes: ['motif_crop'],
    excludedReferenceTypes: ['product_photo'],
    artStyleWeight: 'medium',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'headline',
    compositionGuidance: 'wide, professional',
  },

  // Merchandise Category
  {
    templateId: 't-shirt-design',
    name: 'T-Shirt Design',
    category: 'Merchandise',
    description: 'Creative t-shirt graphic',
    promptSkeleton: 'Design a t-shirt graphic for {concept}. {aestheticSummary} with bold artwork.',
    requiredBrandFields: ['brandName', 'paletteSummary', 'aestheticSummary'],
    preferredReferenceTypes: ['logo_mark', 'logo_wordmark', 'icon_set', 'illustration_style_sample'],
    optionalReferenceTypes: ['motif_crop'],
    excludedReferenceTypes: ['product_photo', 'hero_image'],
    artStyleWeight: 'high',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'centered, bold',
  },
  {
    templateId: 'hoodie-design',
    name: 'Hoodie Design',
    category: 'Merchandise',
    description: 'Hoodie graphic design',
    promptSkeleton: 'Create a hoodie design for {concept}. {paletteSummary} with impactful graphics.',
    requiredBrandFields: ['brandName', 'paletteSummary'],
    preferredReferenceTypes: ['logo_mark', 'logo_wordmark', 'icon_set', 'illustration_style_sample'],
    optionalReferenceTypes: ['motif_crop', 'apparel_photo'],
    excludedReferenceTypes: ['hero_image'],
    artStyleWeight: 'high',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'centered or chest placement',
  },
  {
    templateId: 'tote-bag',
    name: 'Tote Bag',
    category: 'Merchandise',
    description: 'Tote bag design',
    promptSkeleton: 'Design a tote bag graphic for {concept}. {aestheticSummary} with brand identity.',
    requiredBrandFields: ['brandName', 'aestheticSummary'],
    preferredReferenceTypes: ['logo_mark', 'logo_wordmark', 'illustration_style_sample'],
    optionalReferenceTypes: ['motif_crop'],
    excludedReferenceTypes: ['product_photo', 'hero_image'],
    artStyleWeight: 'high',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'centered, versatile',
  },
  {
    templateId: 'sticker-design',
    name: 'Sticker Design',
    category: 'Merchandise',
    description: 'Die-cut sticker design',
    promptSkeleton: 'Create a die-cut sticker design for {concept}. Vibrant, {paletteSummary}.',
    requiredBrandFields: ['paletteSummary'],
    preferredReferenceTypes: ['logo_mark', 'icon_set', 'illustration_style_sample'],
    optionalReferenceTypes: ['motif_crop'],
    excludedReferenceTypes: ['product_photo', 'hero_image', 'campaign_visual'],
    artStyleWeight: 'high',
    typographyRelevance: 'low',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'none',
    compositionGuidance: 'compact, bold',
  },
  {
    templateId: 'mug-design',
    name: 'Mug Design',
    category: 'Merchandise',
    description: 'Coffee mug wrap-around design',
    promptSkeleton: 'Design a mug graphic for {concept}. {aestheticSummary} with wrap-around layout.',
    requiredBrandFields: ['aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['logo_mark', 'logo_wordmark', 'motif_crop'],
    optionalReferenceTypes: ['illustration_style_sample'],
    excludedReferenceTypes: ['product_photo', 'hero_image'],
    artStyleWeight: 'medium',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'balanced',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'horizontal wrap, repeatable',
  },

  // Profile & Branding Category
  {
    templateId: 'profile-banner',
    name: 'Profile Banner',
    category: 'Profile & Branding',
    description: 'Social media profile banner',
    promptSkeleton: 'Create a profile banner for {platform}. {shortBrandLens} with strong identity.',
    requiredBrandFields: ['shortBrandLens', 'paletteSummary'],
    preferredReferenceTypes: ['hero_image', 'campaign_visual', 'logo_wordmark'],
    optionalReferenceTypes: ['motif_crop', 'texture_reference'],
    excludedReferenceTypes: ['product_photo'],
    artStyleWeight: 'high',
    typographyRelevance: 'medium',
    brandStrengthDefault: 'strict',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'wide, brand-focused',
  },
  {
    templateId: 'logo-concept',
    name: 'Logo Concept',
    category: 'Profile & Branding',
    description: 'Logo design concept',
    promptSkeleton: 'Design a logo concept for {brandName}. {aestheticSummary} with modern aesthetic.',
    requiredBrandFields: ['brandName', 'aestheticSummary', 'paletteSummary'],
    preferredReferenceTypes: ['logo_mark', 'icon_set'],
    optionalReferenceTypes: ['illustration_style_sample'],
    excludedReferenceTypes: ['product_photo', 'hero_image', 'campaign_visual'],
    artStyleWeight: 'high',
    typographyRelevance: 'high',
    brandStrengthDefault: 'strict',
    textPresenceDefault: 'minimal',
    compositionGuidance: 'iconic, simple',
  },
  {
    templateId: 'brand-pattern',
    name: 'Brand Pattern',
    category: 'Profile & Branding',
    description: 'Seamless brand pattern',
    promptSkeleton: 'Create a seamless pattern for {brandName}. {paletteSummary} with repeating motifs.',
    requiredBrandFields: ['paletteSummary', 'aestheticSummary'],
    preferredReferenceTypes: ['motif_crop', 'icon_set', 'illustration_style_sample'],
    optionalReferenceTypes: ['logo_mark', 'texture_reference'],
    excludedReferenceTypes: ['product_photo', 'hero_image', 'campaign_visual'],
    artStyleWeight: 'high',
    typographyRelevance: 'none',
    brandStrengthDefault: 'strong',
    textPresenceDefault: 'none',
    compositionGuidance: 'repeating, seamless',
  },
]

/**
 * Get idea template by ID
 */
export function getIdeaTemplate(templateId: string): IdeaTemplate | undefined {
  return IDEA_TEMPLATES.find(t => t.templateId === templateId)
}

/**
 * Get all idea templates
 */
export function getAllIdeaTemplates(): IdeaTemplate[] {
  return IDEA_TEMPLATES
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): IdeaTemplate[] {
  return IDEA_TEMPLATES.filter(t => t.category === category)
}

/**
 * Get all unique categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set(IDEA_TEMPLATES.map(t => t.category))
  return Array.from(categories)
}

/**
 * Find best matching template for a concept ID from concept-selector
 */
export function findTemplateForConcept(conceptId: string): IdeaTemplate | undefined {
  // Map concept IDs to template IDs
  const conceptToTemplateMap: Record<string, string> = {
    'linkedin-post': 'linkedin-post',
    'instagram-story': 'instagram-story',
    'twitter-post': 'social-media-ad',
    'youtube-thumbnail': 'youtube-thumbnail',
    'facebook-post': 'social-media-ad',
    'display-ad': 'display-ad',
    'social-media-ad': 'social-media-ad',
    'promo-banner': 'promo-banner',
    'sale-event': 'sale-event',
    'product-launch': 'product-launch',
    'event-invite': 'event-invite',
    'milestone': 'milestone',
    'coming-soon': 'coming-soon',
    'blog-header': 'blog-header',
    'quote-card': 'quote-card',
    'infographic': 'infographic',
    'newsletter-header': 'newsletter-header',
    'product-shot': 'product-shot',
    'lifestyle-product': 'lifestyle-product',
    'product-comparison': 'product-comparison',
    'packaging-design': 'packaging-design',
    't-shirt-design': 't-shirt-design',
    'hoodie-design': 'hoodie-design',
    'tote-bag': 'tote-bag',
    'mug-design': 'mug-design',
    'sticker-design': 'sticker-design',
    'profile-banner': 'profile-banner',
    'logo-concept': 'logo-concept',
    'brand-pattern': 'brand-pattern',
  }

  const templateId = conceptToTemplateMap[conceptId]
  return templateId ? getIdeaTemplate(templateId) : undefined
}
