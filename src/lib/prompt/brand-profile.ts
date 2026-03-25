import { Studio, StudioProfile, BrandAsset } from "@prisma/client"

export interface BrandPromptProfile {
  brandName: string
  brandCategory?: string
  toneSummary: string
  paletteSummary: string
  aestheticSummary: string
  compositionSummary?: string
  typographySummary?: string
  visualConstraints: string[]
  shortBrandLens: string
}

interface ColorData {
  primary?: string[]
  secondary?: string[]
  accent?: string[]
  [key: string]: any
}

interface FontData {
  heading?: {
    family?: string
    weight?: string | number
    [key: string]: any
  }
  body?: {
    family?: string
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Convert hex color to descriptive name
 */
function hexToColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    // Neutrals
    '#000000': 'black',
    '#ffffff': 'white',
    '#808080': 'gray',
    '#f5f5f5': 'off-white',
    '#1a1a1a': 'charcoal',
    '#2d2d2d': 'dark gray',
    
    // Warm colors
    '#ff0000': 'red',
    '#ff6b6b': 'coral red',
    '#d4a574': 'amber',
    '#ffa500': 'orange',
    '#ffd700': 'gold',
    '#ffff00': 'yellow',
    '#f5e6d3': 'cream',
    '#d2b48c': 'tan',
    
    // Cool colors
    '#0000ff': 'blue',
    '#4169e1': 'royal blue',
    '#87ceeb': 'sky blue',
    '#00ffff': 'cyan',
    '#008080': 'teal',
    
    // Greens
    '#00ff00': 'green',
    '#228b22': 'forest green',
    '#90ee90': 'light green',
    '#6b8b7f': 'sage',
    '#4a6559': 'olive',
    '#556b2f': 'dark olive',
    
    // Purples/Pinks
    '#800080': 'purple',
    '#9370db': 'lavender',
    '#ff00ff': 'magenta',
    '#ffc0cb': 'pink',
    
    // Browns
    '#8b4513': 'brown',
    '#a0522d': 'sienna',
  }

  const normalized = hex.toLowerCase()
  if (colorMap[normalized]) {
    return colorMap[normalized]
  }

  // Analyze hex to determine general color family
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2

  // Check if grayscale
  if (max - min < 30) {
    if (lightness < 50) return 'dark gray'
    if (lightness < 100) return 'charcoal'
    if (lightness > 200) return 'light gray'
    return 'gray'
  }

  // Determine dominant color
  if (r > g && r > b) {
    if (g > 100) return 'orange'
    if (b > 100) return 'pink'
    return 'red'
  } else if (g > r && g > b) {
    if (r > 100) return 'olive'
    if (b > 100) return 'teal'
    return 'green'
  } else if (b > r && b > g) {
    if (r > 100) return 'purple'
    if (g > 100) return 'cyan'
    return 'blue'
  }

  // Check for browns
  if (r > 100 && g > 50 && b < 100) {
    return 'brown'
  }

  return 'neutral'
}

/**
 * Extract and compress color palette from profile
 */
function compressColorPalette(colors: ColorData): string {
  const colorNames: string[] = []
  
  // Prioritize primary colors
  if (colors.primary && Array.isArray(colors.primary)) {
    const primaryColors = colors.primary.slice(0, 3).map(hexToColorName)
    colorNames.push(...primaryColors)
  }
  
  // Add accent if available and not too many colors yet
  if (colorNames.length < 3 && colors.accent && Array.isArray(colors.accent)) {
    const accentColor = hexToColorName(colors.accent[0])
    if (!colorNames.includes(accentColor)) {
      colorNames.push(accentColor)
    }
  }

  // Deduplicate and limit to 3 colors
  const uniqueColors = Array.from(new Set(colorNames)).slice(0, 3)
  
  return uniqueColors.length > 0 ? uniqueColors.join(', ') : 'neutral tones'
}

/**
 * Extract and compress typography information
 */
function compressTypography(fonts: FontData): string {
  const fontDescriptions: string[] = []
  
  if (fonts.heading?.family) {
    const family = fonts.heading.family.toLowerCase()
    if (family.includes('sans') || family.includes('helvetica') || family.includes('arial')) {
      fontDescriptions.push('sans-serif')
    } else if (family.includes('serif') || family.includes('times') || family.includes('georgia')) {
      fontDescriptions.push('serif')
    } else if (family.includes('mono') || family.includes('courier')) {
      fontDescriptions.push('monospace')
    } else {
      fontDescriptions.push('custom')
    }
  }
  
  if (fonts.heading?.weight) {
    const weight = typeof fonts.heading.weight === 'number' ? fonts.heading.weight : parseInt(fonts.heading.weight)
    if (weight >= 700) {
      fontDescriptions.push('bold')
    } else if (weight >= 600) {
      fontDescriptions.push('semi-bold')
    } else if (weight <= 300) {
      fontDescriptions.push('light')
    }
  }

  return fontDescriptions.length > 0 ? fontDescriptions.join(', ') : 'standard typography'
}

/**
 * Compress style traits into concise tone summary
 */
function compressTone(styleTraits: string[]): string {
  if (!styleTraits || styleTraits.length === 0) {
    return 'balanced, professional'
  }

  // Map common style traits to concise descriptors
  const traitMap: Record<string, string> = {
    'minimal': 'minimal',
    'minimalist': 'minimal',
    'clean': 'clean',
    'modern': 'modern',
    'contemporary': 'modern',
    'luxury': 'luxurious',
    'premium': 'premium',
    'elegant': 'elegant',
    'sophisticated': 'sophisticated',
    'bold': 'bold',
    'vibrant': 'vibrant',
    'playful': 'playful',
    'fun': 'playful',
    'professional': 'professional',
    'corporate': 'professional',
    'organic': 'organic',
    'natural': 'natural',
    'earthy': 'earthy',
    'tech': 'technical',
    'futuristic': 'futuristic',
    'editorial': 'editorial',
    'youthful': 'youthful',
    'mature': 'mature',
    'classic': 'classic',
    'timeless': 'timeless',
    'edgy': 'edgy',
    'artistic': 'artistic',
  }

  const mappedTraits = styleTraits
    .map(trait => {
      const lower = trait.toLowerCase()
      for (const [key, value] of Object.entries(traitMap)) {
        if (lower.includes(key)) {
          return value
        }
      }
      return null
    })
    .filter((t): t is string => t !== null)

  // Deduplicate and take top 3
  const uniqueTraits = Array.from(new Set(mappedTraits)).slice(0, 3)
  
  return uniqueTraits.length > 0 ? uniqueTraits.join(', ') : 'balanced, professional'
}

/**
 * Generate aesthetic summary from style traits
 */
function generateAestheticSummary(styleTraits: string[]): string {
  const traits = styleTraits.map(t => t.toLowerCase())
  
  // Detect aesthetic patterns
  if (traits.some(t => t.includes('minimal') || t.includes('clean'))) {
    if (traits.some(t => t.includes('space') || t.includes('negative'))) {
      return 'minimal with strong negative space'
    }
    return 'clean and minimal'
  }
  
  if (traits.some(t => t.includes('luxury') || t.includes('premium'))) {
    return 'premium and refined'
  }
  
  if (traits.some(t => t.includes('bold') || t.includes('vibrant'))) {
    return 'bold and impactful'
  }
  
  if (traits.some(t => t.includes('organic') || t.includes('natural'))) {
    return 'organic and natural'
  }
  
  if (traits.some(t => t.includes('editorial'))) {
    return 'editorial and structured'
  }

  return 'balanced and versatile'
}

/**
 * Extract visual constraints (negative prompts)
 */
function extractVisualConstraints(styleTraits: string[]): string[] {
  const constraints: string[] = []
  const traits = styleTraits.map(t => t.toLowerCase())

  // Infer constraints from style
  if (traits.some(t => t.includes('minimal') || t.includes('clean'))) {
    constraints.push('avoid clutter')
    constraints.push('avoid excessive decoration')
  }
  
  if (traits.some(t => t.includes('luxury') || t.includes('premium') || t.includes('sophisticated'))) {
    constraints.push('avoid neon colors')
    constraints.push('avoid cartoonish elements')
  }
  
  if (traits.some(t => t.includes('professional') || t.includes('corporate'))) {
    constraints.push('avoid overly casual elements')
  }
  
  if (traits.some(t => t.includes('organic') || t.includes('natural'))) {
    constraints.push('avoid harsh geometric shapes')
    constraints.push('avoid artificial neon')
  }
  
  if (traits.some(t => t.includes('editorial'))) {
    constraints.push('avoid chaotic layouts')
  }

  return constraints.slice(0, 3) // Limit to 3 constraints
}

/**
 * Generate short brand lens (1-2 sentences)
 */
function generateBrandLens(
  brandName: string,
  brandCategory: string | undefined,
  toneSummary: string,
  paletteSummary: string,
  aestheticSummary: string,
  visualConstraints: string[]
): string {
  const parts: string[] = []
  
  // Start with brand identity
  if (brandCategory) {
    parts.push(`${brandName} is a ${brandCategory} brand`)
  } else {
    parts.push(brandName)
  }
  
  // Add tone
  parts.push(`with a ${toneSummary} tone`)
  
  // Add palette
  parts.push(`${paletteSummary} palette`)
  
  // Add aesthetic
  parts.push(`${aestheticSummary}`)
  
  // Add key constraint if available
  if (visualConstraints.length > 0) {
    parts.push(`. ${visualConstraints[0].charAt(0).toUpperCase() + visualConstraints[0].slice(1)}.`)
  }

  return parts.join(', ').replace(', .', '.')
}

/**
 * Compress raw StudioProfile into prompt-ready BrandPromptProfile
 */
export function compressBrandProfile(
  studio: Studio & { profile: StudioProfile | null },
  brandAssets?: BrandAsset[]
): BrandPromptProfile | null {
  if (!studio.profile) {
    return null
  }

  const profile = studio.profile
  const brandName = studio.displayName || studio.rootDomain || 'Brand'
  
  // Parse JSON fields
  const colors = (profile.colors || {}) as ColorData
  const fonts = (profile.fonts || {}) as FontData
  
  // Extract brand category from domain or other metadata
  const brandCategory = undefined // Could be enhanced with domain analysis
  
  // Compress each component
  const paletteSummary = compressColorPalette(colors)
  const typographySummary = compressTypography(fonts)
  const toneSummary = compressTone(profile.styleTraits)
  const aestheticSummary = generateAestheticSummary(profile.styleTraits)
  const visualConstraints = extractVisualConstraints(profile.styleTraits)
  
  // Generate comprehensive brand lens
  const shortBrandLens = generateBrandLens(
    brandName,
    brandCategory,
    toneSummary,
    paletteSummary,
    aestheticSummary,
    visualConstraints
  )

  return {
    brandName,
    brandCategory,
    toneSummary,
    paletteSummary,
    aestheticSummary,
    compositionSummary: undefined, // Could be enhanced
    typographySummary,
    visualConstraints,
    shortBrandLens,
  }
}

/**
 * Helper to get specific brand fields for prompt assembly
 */
export function getBrandField(
  profile: BrandPromptProfile,
  field: keyof BrandPromptProfile
): string {
  const value = profile[field]
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value || '')
}
