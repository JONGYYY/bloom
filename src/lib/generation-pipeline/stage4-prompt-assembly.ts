/**
 * Stage 4: Final Prompt Assembly
 * 
 * Build one concise final visual prompt
 * Does NOT dump the full raw brand kit
 */

import type {
  GenerationSpec,
  ReferenceSelectionResult,
  AssembledPrompt,
} from './types'

/**
 * Assemble the final prompt from spec and selected references
 */
export function assemblePrompt(
  spec: GenerationSpec,
  referenceSelection: ReferenceSelectionResult
): AssembledPrompt {
  const promptParts: string[] = []
  const buildSteps: string[] = []
  
  // 1. Core subject (what to create)
  promptParts.push(spec.subject)
  buildSteps.push(`Added subject: "${spec.subject}"`)
  
  // 2. Brand lens (compressed brand identity)
  if (spec.brandStrength !== 'loose') {
    const brandContext = buildBrandContext(spec)
    if (brandContext) {
      promptParts.push(brandContext)
      buildSteps.push(`Added brand context: "${brandContext}"`)
    }
  }
  
  // 3. Art style (if specified)
  if (spec.artStyle) {
    promptParts.push(`in ${spec.artStyle} style`)
    buildSteps.push(`Added art style: "${spec.artStyle}"`)
  }
  
  // 4. Mood (if specified)
  if (spec.mood) {
    promptParts.push(`with ${spec.mood} mood`)
    buildSteps.push(`Added mood: "${spec.mood}"`)
  }
  
  // 5. Composition guidance
  if (spec.composition) {
    promptParts.push(spec.composition)
    buildSteps.push(`Added composition: "${spec.composition}"`)
  }
  
  // 6. Visual constraints (brand-specific)
  if (spec.visualConstraints.length > 0 && spec.brandStrength !== 'loose') {
    const constraints = spec.visualConstraints.slice(0, 2).join(', ')
    promptParts.push(constraints)
    buildSteps.push(`Added visual constraints: "${constraints}"`)
  }
  
  // 7. Quality modifiers
  const qualityModifiers = getQualityModifiers(spec)
  if (qualityModifiers) {
    promptParts.push(qualityModifiers)
    buildSteps.push(`Added quality modifiers: "${qualityModifiers}"`)
  }
  
  // Build final prompt
  const finalPrompt = promptParts.join(', ')
  
  // Estimate tokens
  const tokenEstimate = estimateTokens(finalPrompt)
  
  // Build metadata
  const promptMetadata = {
    ideaType: spec.ideaType,
    subject: spec.subject,
    brandLensApplied: spec.brandStrength !== 'loose',
    artStyleApplied: !!spec.artStyle,
    constraintsApplied: spec.visualConstraints.slice(0, 2),
    referenceCount: referenceSelection.selectedReferences.length,
    tokenEstimate,
  }
  
  return {
    finalPrompt,
    promptMetadata,
    selectedReferences: referenceSelection.selectedReferences,
    parameters: spec.parameters,
    debug: {
      generationSpec: spec,
      referenceSelection,
      promptBuildSteps: buildSteps,
    },
  }
}

/**
 * Build brand context string (compressed)
 */
function buildBrandContext(spec: GenerationSpec): string {
  const parts: string[] = []
  
  // Use brand lens if available
  if (spec.brandLens && spec.brandLens !== 'Clean, professional style') {
    // Take only the most essential part (first clause)
    const essentialLens = spec.brandLens.split(',')[0].trim()
    parts.push(essentialLens)
  }
  
  // Brand strength modifiers
  if (spec.brandStrength === 'strict') {
    parts.push('maintaining exact brand identity')
  } else if (spec.brandStrength === 'strong') {
    parts.push('following brand guidelines')
  }
  
  return parts.join(', ')
}

/**
 * Get quality modifiers based on parameters
 */
function getQualityModifiers(spec: GenerationSpec): string {
  const modifiers: string[] = []
  
  if (spec.parameters.quality === 'final') {
    modifiers.push('high quality')
    modifiers.push('professional')
  }
  
  // Text presence modifiers
  if (spec.textPresence === 'none') {
    modifiers.push('no text')
  } else if (spec.textPresence === 'minimal') {
    modifiers.push('minimal text')
  } else if (spec.textPresence === 'prominent') {
    modifiers.push('with prominent text')
  }
  
  // Composition modifiers based on aspect ratio
  const aspectRatio = spec.parameters.aspectRatio
  if (aspectRatio === '16:9') {
    modifiers.push('wide composition')
  } else if (aspectRatio === '9:16') {
    modifiers.push('vertical composition')
  } else if (aspectRatio === '1:1') {
    modifiers.push('square composition')
  }
  
  return modifiers.join(', ')
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Build negative prompt from constraints
 */
export function buildNegativePrompt(spec: GenerationSpec): string {
  if (spec.negativeConstraints.length === 0) {
    return ''
  }
  
  // Take top constraints
  const topConstraints = spec.negativeConstraints.slice(0, 5)
  return topConstraints.join(', ')
}

/**
 * Validate assembled prompt
 */
export function validateAssembledPrompt(
  assembled: AssembledPrompt
): { valid: boolean; error?: string; warnings?: string[] } {
  const warnings: string[] = []
  
  // Check prompt length
  if (assembled.finalPrompt.length === 0) {
    return { valid: false, error: 'Final prompt is empty' }
  }
  
  if (assembled.finalPrompt.length > 1000) {
    warnings.push('Prompt is very long (>1000 chars), may be truncated')
  }
  
  // Check token estimate
  if (assembled.promptMetadata.tokenEstimate > 400) {
    warnings.push('Token estimate is high (>400), consider simplifying')
  }
  
  // Check if subject is present
  if (!assembled.finalPrompt.includes(assembled.promptMetadata.subject.substring(0, 20))) {
    warnings.push('Subject may not be clearly present in final prompt')
  }
  
  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined }
}

/**
 * Preview prompt assembly without full execution
 */
export function previewPromptAssembly(spec: GenerationSpec): {
  estimatedLength: number
  estimatedTokens: number
  components: string[]
} {
  const components: string[] = []
  
  components.push(`Subject: "${spec.subject}"`)
  
  if (spec.brandLens && spec.brandStrength !== 'loose') {
    components.push(`Brand: "${spec.brandLens.substring(0, 50)}..."`)
  }
  
  if (spec.artStyle) {
    components.push(`Style: "${spec.artStyle}"`)
  }
  
  if (spec.mood) {
    components.push(`Mood: "${spec.mood}"`)
  }
  
  if (spec.composition) {
    components.push(`Composition: "${spec.composition}"`)
  }
  
  const estimatedPrompt = components.map(c => c.split(':')[1].trim()).join(', ')
  
  return {
    estimatedLength: estimatedPrompt.length,
    estimatedTokens: estimateTokens(estimatedPrompt),
    components,
  }
}

/**
 * Format prompt for DALL-E 3 (specific optimizations)
 */
export function formatForDallE3(assembled: AssembledPrompt): string {
  let prompt = assembled.finalPrompt
  
  // DALL-E 3 specific optimizations
  // 1. Ensure it's descriptive and detailed
  // 2. Avoid command-style language
  // 3. Focus on visual description
  
  // Remove command words if present
  prompt = prompt.replace(/^(create|make|design|generate)\s+/i, '')
  
  // Ensure it starts with a noun or description
  if (!prompt.match(/^(a|an|the)\s+/i)) {
    prompt = 'A ' + prompt
  }
  
  return prompt
}
