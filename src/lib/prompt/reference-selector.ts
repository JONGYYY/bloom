import { BrandAsset, Asset } from '@prisma/client'
import { AssetMetadata, AssetType, isAssetMetadata } from './asset-metadata'
import { IdeaTemplate } from './idea-templates'

export interface ReferenceSelectionOptions {
  ideaTemplate: IdeaTemplate
  brandAssets: (BrandAsset & { metadata: any })[]
  generatedAssets?: (Asset & { metadata: any })[]
  userUploadedReferences?: string[]
  maxReferences?: number // Default: 3-5
  diversityWeight?: number // 0-1, how much to prioritize asset type diversity
}

export interface SelectedReference {
  assetId: string
  assetUrl: string
  assetType: AssetType
  selectionReason: string
  relevanceScore: number
  metadata?: AssetMetadata
}

interface ScoredAsset {
  asset: BrandAsset | Asset
  metadata: AssetMetadata
  score: number
  reasons: string[]
}

/**
 * Calculate relevance score for an asset based on template requirements
 */
function calculateAssetScore(
  asset: BrandAsset | Asset,
  metadata: AssetMetadata,
  template: IdeaTemplate
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // 1. Check if asset type is preferred (50% weight)
  if (template.preferredReferenceTypes.includes(metadata.assetType)) {
    const preferenceBonus = 50
    score += preferenceBonus
    reasons.push(`Preferred asset type for ${template.name}`)
  } else if (template.optionalReferenceTypes.includes(metadata.assetType)) {
    const optionalBonus = 25
    score += optionalBonus
    reasons.push(`Optional asset type for ${template.name}`)
  } else if (template.excludedReferenceTypes.includes(metadata.assetType)) {
    // Excluded types get heavily penalized
    score -= 50
    reasons.push(`Excluded asset type`)
    return { score: Math.max(0, score), reasons }
  }

  // 2. Idea compatibility score (30% weight)
  if (metadata.ideaCompatibility && metadata.ideaCompatibility[template.templateId]) {
    const compatibilityScore = metadata.ideaCompatibility[template.templateId]
    const compatibilityBonus = (compatibilityScore / 100) * 30
    score += compatibilityBonus
    reasons.push(`High idea compatibility (${compatibilityScore}/100)`)
  }

  // 3. Brand relevance score (20% weight)
  const relevanceBonus = (metadata.brandRelevanceScore / 100) * 20
  score += relevanceBonus
  if (metadata.brandRelevanceScore >= 80) {
    reasons.push(`High brand relevance (${metadata.brandRelevanceScore}/100)`)
  }

  // 4. Quality score (10% weight)
  const qualityBonus = (metadata.qualityScore / 100) * 10
  score += qualityBonus

  // 5. Bonus for primary brand role
  if (metadata.brandRole === 'primary') {
    score += 10
    reasons.push(`Primary brand asset`)
  }

  // 6. Typography relevance bonus
  if (template.typographyRelevance === 'high' && metadata.assetType === 'logo_wordmark') {
    score += 15
    reasons.push(`Typography-focused template`)
  }

  // 7. Text presence alignment
  if (template.textPresenceDefault === 'none' && metadata.textPresence === 'none') {
    score += 5
  } else if (template.textPresenceDefault === 'text-heavy' && metadata.textPresence === 'prominent') {
    score += 5
  }

  return { score: Math.max(0, score), reasons }
}

/**
 * Ensure diversity in selected references
 */
function ensureDiversity(
  scoredAssets: ScoredAsset[],
  maxReferences: number,
  diversityWeight: number
): ScoredAsset[] {
  if (diversityWeight === 0 || scoredAssets.length <= maxReferences) {
    return scoredAssets.slice(0, maxReferences)
  }

  const selected: ScoredAsset[] = []
  const typeCount: Record<AssetType, number> = {} as Record<AssetType, number>

  // Sort by score initially
  const sorted = [...scoredAssets].sort((a, b) => b.score - a.score)

  for (const asset of sorted) {
    if (selected.length >= maxReferences) break

    const assetType = asset.metadata.assetType
    const currentCount = typeCount[assetType] || 0

    // Apply diversity penalty if we already have this type
    let adjustedScore = asset.score
    if (currentCount > 0) {
      adjustedScore -= (currentCount * 20 * diversityWeight)
    }

    // Check if this asset should still be selected
    const shouldSelect = selected.length === 0 || // Always select first
      adjustedScore > 0 || // Positive score after diversity penalty
      selected.length < Math.floor(maxReferences * 0.6) // Fill at least 60% regardless

    if (shouldSelect) {
      selected.push(asset)
      typeCount[assetType] = currentCount + 1
    }
  }

  return selected
}

/**
 * Select the best reference images for a given idea template
 */
export function selectReferences(
  options: ReferenceSelectionOptions
): SelectedReference[] {
  const {
    ideaTemplate,
    brandAssets,
    generatedAssets = [],
    userUploadedReferences = [],
    maxReferences = 4,
    diversityWeight = 0.5,
  } = options

  const selectedReferences: SelectedReference[] = []

  // 1. Always include user-uploaded references first (highest priority)
  for (const refUrl of userUploadedReferences) {
    if (selectedReferences.length >= maxReferences) break

    selectedReferences.push({
      assetId: 'user-upload',
      assetUrl: refUrl,
      assetType: 'user_uploaded_reference',
      selectionReason: 'User-provided reference (highest priority)',
      relevanceScore: 100,
    })
  }

  // 2. Score and filter brand assets
  const scoredBrandAssets: ScoredAsset[] = []

  for (const asset of brandAssets) {
    // Validate metadata
    if (!asset.metadata || !isAssetMetadata(asset.metadata)) {
      console.warn(`[Reference Selector] Asset ${asset.id} has invalid metadata, skipping`)
      continue
    }

    const metadata = asset.metadata as AssetMetadata

    // Calculate score
    const { score, reasons } = calculateAssetScore(asset, metadata, ideaTemplate)

    // Only include assets with positive scores
    if (score > 0) {
      scoredBrandAssets.push({
        asset,
        metadata,
        score,
        reasons,
      })
    }
  }

  // 3. Score generated assets (if any)
  const scoredGeneratedAssets: ScoredAsset[] = []

  for (const asset of generatedAssets) {
    if (!asset.metadata || !isAssetMetadata(asset.metadata)) continue

    const metadata = asset.metadata as AssetMetadata
    const { score, reasons } = calculateAssetScore(asset, metadata, ideaTemplate)

    // Generated assets get a slight penalty to prefer original brand assets
    const adjustedScore = score * 0.9

    if (adjustedScore > 0) {
      scoredGeneratedAssets.push({
        asset,
        metadata,
        score: adjustedScore,
        reasons,
      })
    }
  }

  // 4. Combine and sort all scored assets
  const allScoredAssets = [...scoredBrandAssets, ...scoredGeneratedAssets]
    .sort((a, b) => b.score - a.score)

  // 5. Apply diversity filtering
  const remainingSlots = maxReferences - selectedReferences.length
  const diverseSelection = ensureDiversity(allScoredAssets, remainingSlots, diversityWeight)

  // 6. Convert to SelectedReference format
  for (const { asset, metadata, score, reasons } of diverseSelection) {
    // Handle different asset types (BrandAsset vs Asset)
    const assetUrl = ('url' in asset && asset.url) ? asset.url : asset.storageKey || ''
    
    selectedReferences.push({
      assetId: asset.id,
      assetUrl,
      assetType: metadata.assetType,
      selectionReason: reasons.join(', '),
      relevanceScore: Math.round(score),
      metadata,
    })
  }

  return selectedReferences
}

/**
 * Get selection statistics for debugging
 */
export function getSelectionStats(
  options: ReferenceSelectionOptions
): {
  totalAssets: number
  eligibleAssets: number
  excludedAssets: number
  averageScore: number
  topAssetTypes: string[]
} {
  const { ideaTemplate, brandAssets, generatedAssets = [] } = options

  const allAssets = [...brandAssets, ...generatedAssets]
  let eligibleCount = 0
  let excludedCount = 0
  let totalScore = 0
  const typeCount: Record<string, number> = {}

  for (const asset of allAssets) {
    if (!asset.metadata || !isAssetMetadata(asset.metadata)) {
      excludedCount++
      continue
    }

    const metadata = asset.metadata as AssetMetadata
    const { score } = calculateAssetScore(asset, metadata, ideaTemplate)

    if (score > 0) {
      eligibleCount++
      totalScore += score
      typeCount[metadata.assetType] = (typeCount[metadata.assetType] || 0) + 1
    } else {
      excludedCount++
    }
  }

  const topAssetTypes = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type)

  return {
    totalAssets: allAssets.length,
    eligibleAssets: eligibleCount,
    excludedAssets: excludedCount,
    averageScore: eligibleCount > 0 ? totalScore / eligibleCount : 0,
    topAssetTypes,
  }
}

/**
 * Explain why an asset was or wasn't selected
 */
export function explainAssetSelection(
  asset: BrandAsset | Asset,
  metadata: AssetMetadata,
  template: IdeaTemplate
): {
  wouldBeSelected: boolean
  score: number
  reasons: string[]
  issues: string[]
} {
  const { score, reasons } = calculateAssetScore(asset, metadata, template)
  const issues: string[] = []

  if (template.excludedReferenceTypes.includes(metadata.assetType)) {
    issues.push(`Asset type "${metadata.assetType}" is excluded for this template`)
  }

  if (!template.preferredReferenceTypes.includes(metadata.assetType) &&
      !template.optionalReferenceTypes.includes(metadata.assetType)) {
    issues.push(`Asset type "${metadata.assetType}" is not preferred or optional for this template`)
  }

  if (metadata.brandRelevanceScore < 50) {
    issues.push(`Low brand relevance score (${metadata.brandRelevanceScore}/100)`)
  }

  if (metadata.qualityScore < 50) {
    issues.push(`Low quality score (${metadata.qualityScore}/100)`)
  }

  return {
    wouldBeSelected: score > 0 && issues.length === 0,
    score: Math.round(score),
    reasons,
    issues,
  }
}
