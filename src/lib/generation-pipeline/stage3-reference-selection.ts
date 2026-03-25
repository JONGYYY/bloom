/**
 * Stage 3: Reference Selection
 * 
 * Automatically choose the best brand reference images
 * Kept separate from prompt writing
 */

import type {
  GenerationSpec,
  PipelineContext,
  SelectedReference,
  ReferenceSelectionResult,
  BrandAssetWithMetadata,
} from './types'

/**
 * Select best references based on generation spec
 */
export function selectReferences(
  spec: GenerationSpec,
  context: PipelineContext
): ReferenceSelectionResult {
  const { availableAssets } = context
  
  if (availableAssets.length === 0) {
    return {
      selectedReferences: [],
      totalAvailable: 0,
      selectionStrategy: 'none_available',
      diversityScore: 0,
    }
  }
  
  // Score all assets
  const scoredAssets = availableAssets.map(asset => ({
    asset,
    score: scoreAsset(asset, spec),
  }))
  
  // Filter by policy
  const filteredAssets = applyReferencePolicy(scoredAssets, spec.referencePolicy)
  
  // Sort by score
  filteredAssets.sort((a, b) => b.score - a.score)
  
  // Apply diversity
  const diverseAssets = ensureDiversity(filteredAssets, spec.referencePolicy.maxReferences)
  
  // Convert to SelectedReference format
  const selectedReferences: SelectedReference[] = diverseAssets.map(({ asset, score }) => ({
    assetId: asset.id,
    assetType: asset.type,
    url: asset.url,
    relevanceScore: score,
    reason: explainSelection(asset, spec),
    metadata: {
      width: asset.metadata?.width,
      height: asset.metadata?.height,
      location: asset.metadata?.location,
      colors: asset.metadata?.colors,
    },
  }))
  
  // Calculate diversity score
  const diversityScore = calculateDiversityScore(selectedReferences)
  
  return {
    selectedReferences,
    totalAvailable: availableAssets.length,
    selectionStrategy: determineStrategy(spec, selectedReferences),
    diversityScore,
  }
}

/**
 * Score an asset for relevance to the generation spec
 */
function scoreAsset(asset: BrandAssetWithMetadata, spec: GenerationSpec): number {
  let score = 0
  
  // Base score from metadata
  if (asset.metadata?.brandRelevanceScore) {
    score += asset.metadata.brandRelevanceScore * 0.3
  }
  
  if (asset.metadata?.qualityScore) {
    score += asset.metadata.qualityScore * 0.2
  }
  
  // Idea compatibility
  if (asset.metadata?.ideaCompatibility?.[spec.ideaType]) {
    score += asset.metadata.ideaCompatibility[spec.ideaType] * 0.3
  }
  
  // Type preference (from reference policy)
  const assetType = asset.metadata?.assetType || asset.type
  if (spec.referencePolicy.preferredTypes.includes(assetType)) {
    score += 30
  } else if (spec.referencePolicy.optionalTypes.includes(assetType)) {
    score += 15
  }
  
  // Brand role
  if (asset.metadata?.brandRole === 'primary') {
    score += 20
  } else if (asset.metadata?.brandRole === 'secondary') {
    score += 10
  }
  
  // Text presence alignment
  if (spec.textPresence === 'none' && asset.metadata?.textPresence === 'none') {
    score += 10
  } else if (spec.textPresence === 'prominent' && asset.metadata?.textPresence === 'prominent') {
    score += 10
  }
  
  // Location bonus (header assets often more important)
  if (asset.metadata?.location === 'header') {
    score += 5
  } else if (asset.metadata?.location === 'hero') {
    score += 8
  }
  
  return Math.min(score, 100) // Cap at 100
}

/**
 * Apply reference policy filters
 */
function applyReferencePolicy(
  scoredAssets: Array<{ asset: BrandAssetWithMetadata; score: number }>,
  policy: GenerationSpec['referencePolicy']
): Array<{ asset: BrandAssetWithMetadata; score: number }> {
  return scoredAssets.filter(({ asset }) => {
    const assetType = asset.metadata?.assetType || asset.type
    
    // Exclude if in excluded list
    if (policy.excludedTypes.includes(assetType)) {
      return false
    }
    
    // Include if in preferred or optional list
    if (policy.preferredTypes.includes(assetType) || policy.optionalTypes.includes(assetType)) {
      return true
    }
    
    // Include if no specific policy (allow all)
    if (policy.preferredTypes.length === 0 && policy.optionalTypes.length === 0) {
      return true
    }
    
    return false
  })
}

/**
 * Ensure diversity in selected references
 */
function ensureDiversity(
  scoredAssets: Array<{ asset: BrandAssetWithMetadata; score: number }>,
  maxReferences: number
): Array<{ asset: BrandAssetWithMetadata; score: number }> {
  const selected: Array<{ asset: BrandAssetWithMetadata; score: number }> = []
  const typesSeen = new Set<string>()
  
  // First pass: select top assets ensuring type diversity
  for (const item of scoredAssets) {
    if (selected.length >= maxReferences) break
    
    const assetType = item.asset.metadata?.assetType || item.asset.type
    
    // Prefer diverse types
    if (!typesSeen.has(assetType)) {
      selected.push(item)
      typesSeen.add(assetType)
    }
  }
  
  // Second pass: fill remaining slots with highest scores
  for (const item of scoredAssets) {
    if (selected.length >= maxReferences) break
    
    if (!selected.includes(item)) {
      selected.push(item)
    }
  }
  
  return selected
}

/**
 * Explain why an asset was selected
 */
function explainSelection(asset: BrandAssetWithMetadata, spec: GenerationSpec): string {
  const reasons: string[] = []
  
  const assetType = asset.metadata?.assetType || asset.type
  
  if (spec.referencePolicy.preferredTypes.includes(assetType)) {
    reasons.push(`Preferred ${assetType.replace(/_/g, ' ')} for ${spec.ideaType}`)
  }
  
  if (asset.metadata?.brandRole === 'primary') {
    reasons.push('Primary brand asset')
  }
  
  if (asset.metadata?.location === 'header' || asset.metadata?.location === 'hero') {
    reasons.push(`Prominent ${asset.metadata.location} placement`)
  }
  
  if (asset.metadata?.brandRelevanceScore && asset.metadata.brandRelevanceScore > 80) {
    reasons.push('High brand relevance')
  }
  
  if (reasons.length === 0) {
    return 'Selected for visual reference'
  }
  
  return reasons.join('; ')
}

/**
 * Calculate diversity score (0-100)
 */
function calculateDiversityScore(references: SelectedReference[]): number {
  if (references.length === 0) return 0
  if (references.length === 1) return 100
  
  const uniqueTypes = new Set(references.map(r => r.assetType))
  const diversityRatio = uniqueTypes.size / references.length
  
  return Math.round(diversityRatio * 100)
}

/**
 * Determine selection strategy used
 */
function determineStrategy(spec: GenerationSpec, selected: SelectedReference[]): string {
  if (selected.length === 0) {
    return 'none_selected'
  }
  
  if (spec.referencePolicy.preferredTypes.length > 0) {
    return 'template_guided'
  }
  
  if (spec.brandStrength === 'strict') {
    return 'brand_strict'
  }
  
  return 'balanced_selection'
}

/**
 * Get selection statistics for debugging
 */
export function getSelectionStats(result: ReferenceSelectionResult): {
  selectedCount: number
  availableCount: number
  selectionRate: number
  diversityScore: number
  typeBreakdown: Record<string, number>
} {
  const typeBreakdown: Record<string, number> = {}
  
  result.selectedReferences.forEach(ref => {
    typeBreakdown[ref.assetType] = (typeBreakdown[ref.assetType] || 0) + 1
  })
  
  return {
    selectedCount: result.selectedReferences.length,
    availableCount: result.totalAvailable,
    selectionRate: result.totalAvailable > 0 
      ? result.selectedReferences.length / result.totalAvailable 
      : 0,
    diversityScore: result.diversityScore,
    typeBreakdown,
  }
}
