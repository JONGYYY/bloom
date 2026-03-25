/**
 * Stage 2: Planning
 * 
 * Converts processed input into a structured GenerationSpec
 * Does NOT create the final prompt yet - just plans what to generate
 */

import { getIdeaTemplate } from '../prompt/idea-templates'
import type { ProcessedInput } from './stage1-input'
import type {
  GenerationSpec,
  PipelineContext,
  CompressedBrandProfile,
} from './types'

/**
 * Create a generation spec from processed input
 */
export function createGenerationSpec(
  input: ProcessedInput,
  context: PipelineContext
): GenerationSpec {
  // Determine idea type
  const ideaType = determineIdeaType(input)
  
  // Get template if available
  const template = input.ideaTemplateId ? getIdeaTemplate(input.ideaTemplateId) : null
  
  // Extract subject from prompt
  const subject = extractSubject(input.userPrompt, template)
  
  // Compress brand lens
  const brandLens = compressBrandLens(context.brandProfile)
  
  // Determine brand strength
  const brandStrength = input.parameters.brandStrength || 
    (template?.brandStrengthDefault) || 
    'balanced'
  
  // Build reference policy from template
  const referencePolicy = buildReferencePolicy(template, ideaType)
  
  // Extract constraints
  const { negativeConstraints, visualConstraints } = extractConstraints(
    context.brandProfile,
    template
  )
  
  // Build the spec
  const spec: GenerationSpec = {
    ideaType,
    subject,
    brandLens,
    brandStrength,
    artStyle: input.parameters.artStyle,
    mood: input.parameters.mood,
    composition: input.parameters.composition || template?.compositionGuidance,
    textPresence: input.parameters.textPresence || 'minimal',
    negativeConstraints,
    visualConstraints,
    referencePolicy,
    parameters: input.parameters,
  }
  
  return spec
}

/**
 * Determine idea type from input
 */
function determineIdeaType(input: ProcessedInput): string {
  if (input.ideaTemplateId) {
    return input.ideaTemplateId
  }
  
  // Infer from prompt keywords
  const prompt = input.userPrompt.toLowerCase()
  
  if (prompt.includes('social media') || prompt.includes('instagram') || prompt.includes('facebook')) {
    return 'social-media-ad'
  }
  if (prompt.includes('product') && (prompt.includes('shot') || prompt.includes('photo'))) {
    return 'product-shot'
  }
  if (prompt.includes('quote') || prompt.includes('inspirational')) {
    return 'quote-card'
  }
  if (prompt.includes('hero') || prompt.includes('banner')) {
    return 'website-hero'
  }
  if (prompt.includes('launch') || prompt.includes('announcement')) {
    return 'product-launch'
  }
  
  // Default to general creative
  return 'general-creative'
}

/**
 * Extract subject from prompt
 */
function extractSubject(prompt: string, template: any): string {
  // For now, use the full prompt as subject
  // In future, could use NLP to extract the main subject
  
  // Clean up the prompt
  let subject = prompt.trim()
  
  // Remove common prefixes
  subject = subject.replace(/^(create|make|design|generate)\s+/i, '')
  subject = subject.replace(/^(a|an|the)\s+/i, '')
  
  // Limit length
  if (subject.length > 200) {
    subject = subject.substring(0, 200).trim() + '...'
  }
  
  return subject
}

/**
 * Compress brand lens into one concise string
 */
function compressBrandLens(brandProfile: CompressedBrandProfile | null): string {
  if (!brandProfile) {
    return 'Clean, professional style'
  }
  
  // Use the pre-compressed shortBrandLens if available
  if (brandProfile.shortBrandLens) {
    return brandProfile.shortBrandLens
  }
  
  // Otherwise, build a concise lens from components
  const parts: string[] = []
  
  if (brandProfile.toneSummary) {
    parts.push(brandProfile.toneSummary)
  }
  
  if (brandProfile.aestheticSummary) {
    // Take first sentence only
    const firstSentence = brandProfile.aestheticSummary.split('.')[0]
    parts.push(firstSentence)
  }
  
  if (brandProfile.paletteSummary) {
    parts.push(brandProfile.paletteSummary)
  }
  
  return parts.join(', ').substring(0, 300)
}

/**
 * Build reference policy from template
 */
function buildReferencePolicy(template: any, ideaType: string): GenerationSpec['referencePolicy'] {
  if (template) {
    return {
      preferredTypes: template.preferredReferenceTypes || [],
      optionalTypes: template.optionalReferenceTypes || [],
      excludedTypes: template.excludedReferenceTypes || [],
      maxReferences: 5,
    }
  }
  
  // Default policy based on idea type
  const defaultPolicies: Record<string, Partial<GenerationSpec['referencePolicy']>> = {
    'product-shot': {
      preferredTypes: ['product_photo', 'apparel_photo', 'packaging_image'],
      excludedTypes: ['icon_set', 'illustration_style_sample'],
    },
    'social-media-ad': {
      preferredTypes: ['campaign_visual', 'hero_image', 'product_photo'],
      optionalTypes: ['logo_mark'],
    },
    'quote-card': {
      preferredTypes: ['logo_wordmark', 'campaign_visual', 'motif_crop'],
      excludedTypes: ['product_photo'],
    },
    'website-hero': {
      preferredTypes: ['hero_image', 'campaign_visual', 'product_photo'],
      optionalTypes: ['logo_mark'],
    },
  }
  
  const policy = defaultPolicies[ideaType] || {}
  
  return {
    preferredTypes: policy.preferredTypes || [],
    optionalTypes: policy.optionalTypes || [],
    excludedTypes: policy.excludedTypes || [],
    maxReferences: 5,
  }
}

/**
 * Extract constraints from brand profile and template
 */
function extractConstraints(
  brandProfile: CompressedBrandProfile | null,
  template: any
): { negativeConstraints: string[]; visualConstraints: string[] } {
  const negativeConstraints: string[] = []
  const visualConstraints: string[] = []
  
  // Brand visual constraints
  if (brandProfile?.visualConstraints) {
    visualConstraints.push(...brandProfile.visualConstraints)
    
    // Convert positive constraints to negative ones
    brandProfile.visualConstraints.forEach(constraint => {
      if (constraint.toLowerCase().includes('avoid')) {
        negativeConstraints.push(constraint.replace(/avoid\s+/i, ''))
      }
    })
  }
  
  // Template-specific constraints
  if (template?.compositionGuidance) {
    visualConstraints.push(template.compositionGuidance)
  }
  
  // Common negative constraints
  const commonNegatives = [
    'blurry',
    'low quality',
    'distorted',
    'text artifacts',
    'watermarks',
  ]
  negativeConstraints.push(...commonNegatives)
  
  return {
    negativeConstraints: [...new Set(negativeConstraints)], // Deduplicate
    visualConstraints: [...new Set(visualConstraints)],
  }
}

/**
 * Validate generation spec
 */
export function validateGenerationSpec(spec: GenerationSpec): { valid: boolean; error?: string } {
  if (!spec.ideaType) {
    return { valid: false, error: 'Idea type is required' }
  }
  
  if (!spec.subject || spec.subject.trim().length === 0) {
    return { valid: false, error: 'Subject is required' }
  }
  
  if (!spec.brandLens) {
    return { valid: false, error: 'Brand lens is required' }
  }
  
  return { valid: true }
}
