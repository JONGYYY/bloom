import { BrandAsset, Asset } from '@prisma/client'
import { BrandPromptProfile, getBrandField } from './brand-profile'
import { IdeaTemplate, getIdeaTemplate, BrandField } from './idea-templates'
import { selectReferences, SelectedReference, getSelectionStats } from './reference-selector'
import { isAssetMetadata } from './asset-metadata'

export interface PromptAssemblyInput {
  userPrompt: string
  ideaTemplateId: string
  brandProfile: BrandPromptProfile | null
  brandAssets: (BrandAsset & { metadata: any })[]
  generatedAssets?: (Asset & { metadata: any })[]
  parameters: {
    artStyle?: string
    mood?: string
    composition?: string
    textPresence?: string
    brandStrength?: string
    userReferences?: string[]
  }
}

export interface AssembledPrompt {
  finalPrompt: string
  selectedReferenceAssets: SelectedReference[]
  appliedBrandFields: string[]
  appliedTemplateId: string
  promptMetadata: {
    tokenCount: number
    brandLensUsed: boolean
    artStyleApplied: boolean
    moodApplied: boolean
    compositionApplied: boolean
  }
  debug: {
    brandLensUsed: string
    excludedBrandFields: string[]
    excludedReferenceAssets: string[]
    selectionReasons: Record<string, string>
    templateUsed: string
    brandStrengthLevel: string
  }
}

/**
 * Estimate token count for a string (rough approximation)
 */
function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

/**
 * Build brand context string from selected fields
 */
function buildBrandContext(
  brandProfile: BrandPromptProfile,
  requiredFields: BrandField[],
  brandStrength: string
): { context: string; appliedFields: string[]; excludedFields: string[] } {
  const appliedFields: string[] = []
  const excludedFields: string[] = []
  const contextParts: string[] = []

  // Adjust which fields to include based on brand strength
  let fieldsToInclude = [...requiredFields]

  if (brandStrength === 'strict') {
    // Include all available fields
    fieldsToInclude = [
      'brandName',
      'paletteSummary',
      'toneSummary',
      'aestheticSummary',
      'typographySummary',
      'visualConstraints',
    ] as BrandField[]
  } else if (brandStrength === 'strong') {
    // Include required + some extras
    if (!fieldsToInclude.includes('paletteSummary')) {
      fieldsToInclude.push('paletteSummary')
    }
    if (!fieldsToInclude.includes('toneSummary')) {
      fieldsToInclude.push('toneSummary')
    }
  } else if (brandStrength === 'loose') {
    // Only include minimal fields
    fieldsToInclude = fieldsToInclude.filter(f => 
      f === 'paletteSummary' || f === 'aestheticSummary'
    )
  }

  // Build context from selected fields
  for (const field of fieldsToInclude) {
    const value = getBrandField(brandProfile, field)
    if (value && value.trim()) {
      appliedFields.push(field)

      switch (field) {
        case 'brandName':
          contextParts.push(`for ${value}`)
          break
        case 'paletteSummary':
          contextParts.push(`using ${value} colors`)
          break
        case 'toneSummary':
          contextParts.push(`with ${value} tone`)
          break
        case 'aestheticSummary':
          contextParts.push(`${value} aesthetic`)
          break
        case 'typographySummary':
          contextParts.push(`${value} typography`)
          break
        // compositionSummary is optional and not in BrandField type
        // case 'compositionSummary':
        //   if (value) contextParts.push(`${value} composition`)
        //   break
        case 'visualConstraints':
          if (brandProfile.visualConstraints.length > 0) {
            contextParts.push(brandProfile.visualConstraints[0])
          }
          break
      }
    }
  }

  // Track excluded fields
  const allFields: BrandField[] = [
    'brandName',
    'toneSummary',
    'paletteSummary',
    'aestheticSummary',
    'typographySummary',
    'visualConstraints',
  ]
  for (const field of allFields) {
    if (!appliedFields.includes(field)) {
      excludedFields.push(field)
    }
  }

  return {
    context: contextParts.join(', '),
    appliedFields,
    excludedFields,
  }
}

/**
 * Assemble final prompt from all components
 */
export async function assemblePrompt(
  input: PromptAssemblyInput
): Promise<AssembledPrompt> {
  const {
    userPrompt,
    ideaTemplateId,
    brandProfile,
    brandAssets,
    generatedAssets = [],
    parameters,
  } = input

  // 1. Load idea template
  const template = getIdeaTemplate(ideaTemplateId)
  if (!template) {
    throw new Error(`Template ${ideaTemplateId} not found`)
  }

  // 2. Determine brand strength level
  const brandStrength = parameters.brandStrength || template.brandStrengthDefault

  // 3. Select brand fields based on template and brand strength
  let brandContext = ''
  let appliedBrandFields: string[] = []
  let excludedBrandFields: string[] = []
  let brandLensUsed = ''

  if (brandProfile) {
    const brandContextResult = buildBrandContext(
      brandProfile,
      template.requiredBrandFields,
      brandStrength
    )
    brandContext = brandContextResult.context
    appliedBrandFields = brandContextResult.appliedFields
    excludedBrandFields = brandContextResult.excludedFields
    brandLensUsed = brandProfile.shortBrandLens
  }

  // 4. Select reference assets
  const selectedReferences = selectReferences({
    ideaTemplate: template,
    brandAssets: brandAssets.filter(a => a.metadata && isAssetMetadata(a.metadata)),
    generatedAssets: generatedAssets.filter(a => a.metadata && isAssetMetadata(a.metadata)),
    userUploadedReferences: parameters.userReferences,
    maxReferences: 4,
    diversityWeight: 0.5,
  })

  // 5. Build prompt structure
  const promptParts: string[] = []

  // Start with user request
  promptParts.push(userPrompt)

  // Add template guidance if available
  if (template.compositionGuidance) {
    promptParts.push(template.compositionGuidance)
  }

  // Add brand context
  if (brandContext) {
    promptParts.push(brandContext)
  }

  // Add art style if template supports it and user provided it
  let artStyleApplied = false
  if (template.artStyleWeight !== 'none' && parameters.artStyle) {
    const styleWeight = {
      low: 'subtle',
      medium: '',
      high: 'strong',
    }[template.artStyleWeight]

    if (styleWeight) {
      promptParts.push(`${styleWeight} ${parameters.artStyle} style`)
    } else {
      promptParts.push(`${parameters.artStyle} style`)
    }
    artStyleApplied = true
  }

  // Add mood if provided
  let moodApplied = false
  if (parameters.mood) {
    promptParts.push(`${parameters.mood} mood`)
    moodApplied = true
  }

  // Add composition if provided and not already in template
  let compositionApplied = false
  if (parameters.composition && !template.compositionGuidance) {
    promptParts.push(`${parameters.composition} composition`)
    compositionApplied = true
  }

  // Add visual constraints (negative prompts)
  if (brandProfile && brandProfile.visualConstraints.length > 0) {
    const constraints = brandProfile.visualConstraints.slice(0, 2)
    promptParts.push(...constraints)
  }

  // Add quality suffix
  promptParts.push('high quality, professional design')

  // 6. Combine into final prompt
  let finalPrompt = promptParts
    .filter(p => p && p.trim())
    .join('. ')
    .replace(/\.\./g, '.')
    .replace(/\s+/g, ' ')
    .trim()

  // Ensure it ends with a period
  if (!finalPrompt.endsWith('.')) {
    finalPrompt += '.'
  }

  // 7. Trim if too long (target: under 400 tokens)
  const tokenCount = estimateTokenCount(finalPrompt)
  if (tokenCount > 400) {
    // Remove less critical parts to reduce token count
    // Priority: keep user prompt, brand context, quality suffix
    // Remove: mood, composition, some constraints
    console.warn(`[Prompt Assembler] Prompt too long (${tokenCount} tokens), trimming...`)
    
    // Rebuild with essentials only
    const essentialParts = [
      userPrompt,
      brandContext,
      'high quality, professional design',
    ].filter(p => p && p.trim())
    
    finalPrompt = essentialParts.join('. ').trim()
    if (!finalPrompt.endsWith('.')) {
      finalPrompt += '.'
    }
  }

  // 8. Build debug information
  const selectionStats = getSelectionStats({
    ideaTemplate: template,
    brandAssets,
    generatedAssets,
  })

  const selectionReasons: Record<string, string> = {}
  for (const ref of selectedReferences) {
    selectionReasons[ref.assetId] = ref.selectionReason
  }

  const excludedReferenceAssets = brandAssets
    .filter(a => !selectedReferences.some(r => r.assetId === a.id))
    .map(a => `${a.id} (${a.type})`)
    .slice(0, 5) // Limit to first 5 for brevity

  // 9. Return assembled prompt
  return {
    finalPrompt,
    selectedReferenceAssets: selectedReferences,
    appliedBrandFields,
    appliedTemplateId: template.templateId,
    promptMetadata: {
      tokenCount: estimateTokenCount(finalPrompt),
      brandLensUsed: !!brandProfile,
      artStyleApplied,
      moodApplied,
      compositionApplied,
    },
    debug: {
      brandLensUsed,
      excludedBrandFields,
      excludedReferenceAssets,
      selectionReasons,
      templateUsed: template.name,
      brandStrengthLevel: brandStrength,
    },
  }
}

/**
 * Validate prompt assembly input
 */
export function validatePromptInput(input: PromptAssemblyInput): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!input.userPrompt || input.userPrompt.trim().length === 0) {
    errors.push('User prompt is required')
  }

  if (!input.ideaTemplateId) {
    errors.push('Idea template ID is required')
  }

  const template = getIdeaTemplate(input.ideaTemplateId)
  if (!template) {
    errors.push(`Template ${input.ideaTemplateId} not found`)
  }

  if (input.brandProfile && template) {
    // Check if required brand fields are available
    for (const field of template.requiredBrandFields) {
      const value = getBrandField(input.brandProfile, field)
      if (!value || value.trim().length === 0) {
        console.warn(`[Prompt Assembler] Required brand field "${field}" is missing or empty`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Preview what the assembled prompt would look like without actually assembling it
 */
export async function previewPrompt(
  input: PromptAssemblyInput
): Promise<{
  estimatedTokenCount: number
  willIncludeBrand: boolean
  willIncludeReferences: number
  brandFieldsToUse: string[]
}> {
  const template = getIdeaTemplate(input.ideaTemplateId)
  if (!template) {
    throw new Error(`Template ${input.ideaTemplateId} not found`)
  }

  const brandStrength = input.parameters.brandStrength || template.brandStrengthDefault
  
  let brandFieldsToUse: string[] = []
  if (input.brandProfile) {
    const { appliedFields } = buildBrandContext(
      input.brandProfile,
      template.requiredBrandFields,
      brandStrength
    )
    brandFieldsToUse = appliedFields
  }

  const selectedReferences = selectReferences({
    ideaTemplate: template,
    brandAssets: input.brandAssets.filter(a => a.metadata && isAssetMetadata(a.metadata)),
    generatedAssets: input.generatedAssets?.filter(a => a.metadata && isAssetMetadata(a.metadata)) || [],
    userUploadedReferences: input.parameters.userReferences,
    maxReferences: 4,
  })

  // Rough estimate of final prompt
  const estimatedPrompt = [
    input.userPrompt,
    template.compositionGuidance,
    'brand context placeholder',
    input.parameters.artStyle,
    input.parameters.mood,
    'high quality',
  ].filter(Boolean).join('. ')

  return {
    estimatedTokenCount: estimateTokenCount(estimatedPrompt),
    willIncludeBrand: !!input.brandProfile,
    willIncludeReferences: selectedReferences.length,
    brandFieldsToUse,
  }
}
