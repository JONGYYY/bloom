/**
 * Deterministic color selection algorithm
 * Selects brand colors based purely on frequency and similarity grouping
 */

interface ColorFrequency {
  color: string
  count: number
}

interface ColorGroup {
  representative: string
  colors: ColorFrequency[]
  totalCount: number
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate color similarity (0-100, where 0 is identical)
 * Uses Euclidean distance in RGB space
 */
function colorSimilarity(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  if (!rgb1 || !rgb2) return 100

  const rDiff = rgb1.r - rgb2.r
  const gDiff = rgb1.g - rgb2.g
  const bDiff = rgb1.b - rgb2.b

  // Euclidean distance normalized to 0-100 scale
  const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
  return (distance / 441.67) * 100 // 441.67 is max distance (sqrt(255^2 * 3))
}

/**
 * Group similar colors together
 * Similarity threshold: colors within 8% similarity are grouped
 */
function groupSimilarColors(colors: ColorFrequency[], threshold: number = 8): ColorGroup[] {
  const groups: ColorGroup[] = []

  for (const color of colors) {
    // Find existing group this color belongs to
    let foundGroup = false

    for (const group of groups) {
      const similarity = colorSimilarity(color.color, group.representative)
      if (similarity < threshold) {
        group.colors.push(color)
        group.totalCount += color.count
        foundGroup = true
        break
      }
    }

    // Create new group if no match found
    if (!foundGroup) {
      groups.push({
        representative: color.color,
        colors: [color],
        totalCount: color.count,
      })
    }
  }

  // Sort groups by total frequency
  groups.sort((a, b) => b.totalCount - a.totalCount)

  return groups
}

/**
 * Determine if a color is a neutral (black, white, gray)
 */
function isNeutral(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false

  // Check if it's grayscale (R, G, B are very close)
  const maxDiff = Math.max(
    Math.abs(rgb.r - rgb.g),
    Math.abs(rgb.g - rgb.b),
    Math.abs(rgb.r - rgb.b)
  )

  return maxDiff < 15 // If RGB values are within 15 of each other, it's a neutral
}

/**
 * Categorize colors into primary, secondary, accent based on frequency
 */
function categorizeColors(groups: ColorGroup[]): {
  primary: string[]
  secondary: string[]
  accent: string[]
} {
  const primary: string[] = []
  const secondary: string[] = []
  const accent: string[] = []

  // Separate neutrals and colors
  const neutralGroups = groups.filter(g => isNeutral(g.representative))
  const colorGroups = groups.filter(g => !isNeutral(g.representative))

  // PRIMARY: Top 3-5 most frequent non-neutral colors (brand colors take priority)
  for (let i = 0; i < Math.min(5, colorGroups.length); i++) {
    primary.push(colorGroups[i].representative)
  }

  // SECONDARY: Top 1-2 neutrals (black, white, gray) if they're frequent
  for (let i = 0; i < Math.min(2, neutralGroups.length); i++) {
    secondary.push(neutralGroups[i].representative)
  }

  // ACCENT: Next 1-2 non-neutral colors (less frequent brand colors)
  for (let i = 5; i < Math.min(7, colorGroups.length); i++) {
    accent.push(colorGroups[i].representative)
  }

  return { primary, secondary, accent }
}

/**
 * Main function: Select brand colors deterministically
 */
export function selectBrandColors(
  extractedColors: ColorFrequency[],
  options: {
    minFrequency?: number // Minimum count to be considered
    maxColors?: number // Maximum total colors to return
    similarityThreshold?: number // Similarity threshold for grouping (0-100)
  } = {}
): {
  primary: string[]
  secondary: string[]
  accent: string[]
  confidence: 'high' | 'medium' | 'low'
  metadata: {
    totalColorsAnalyzed: number
    groupsFormed: number
    neutralsFound: number
    colorsExcluded: number
  }
} {
  const {
    minFrequency = 10,
    maxColors = 10,
    similarityThreshold = 8,
  } = options

  console.log(`[Color Selector] Analyzing ${extractedColors.length} colors`)

  // Filter by minimum frequency
  const frequentColors = extractedColors.filter(c => c.count >= minFrequency)
  console.log(`[Color Selector] ${frequentColors.length} colors meet minimum frequency (${minFrequency})`)

  if (frequentColors.length === 0) {
    return {
      primary: [],
      secondary: [],
      accent: [],
      confidence: 'low',
      metadata: {
        totalColorsAnalyzed: extractedColors.length,
        groupsFormed: 0,
        neutralsFound: 0,
        colorsExcluded: extractedColors.length,
      },
    }
  }

  // Group similar colors
  const groups = groupSimilarColors(frequentColors, similarityThreshold)
  console.log(`[Color Selector] Formed ${groups.length} color groups`)

  // Log top groups
  groups.slice(0, 10).forEach((g, i) => {
    console.log(`[Color Selector]   Group ${i + 1}: ${g.representative} (count: ${g.totalCount}, neutral: ${isNeutral(g.representative)})`)
  })

  // Categorize colors
  const categorized = categorizeColors(groups)

  // Determine confidence based on data quality
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  if (frequentColors.length >= 20 && groups.length >= 8) {
    confidence = 'high'
  } else if (frequentColors.length < 10 || groups.length < 5) {
    confidence = 'low'
  }

  const neutralsFound = groups.filter(g => isNeutral(g.representative)).length

  console.log(`[Color Selector] Selected: ${categorized.primary.length} primary, ${categorized.secondary.length} secondary, ${categorized.accent.length} accent`)

  return {
    ...categorized,
    confidence,
    metadata: {
      totalColorsAnalyzed: extractedColors.length,
      groupsFormed: groups.length,
      neutralsFound,
      colorsExcluded: extractedColors.length - frequentColors.length,
    },
  }
}

/**
 * Format color selection result for Prisma storage
 */
export function formatColorsForStorage(result: ReturnType<typeof selectBrandColors>) {
  return {
    primary: result.primary,
    secondary: result.secondary,
    accent: result.accent,
    confidence: result.confidence,
  }
}
