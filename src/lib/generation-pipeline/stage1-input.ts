/**
 * Stage 1: Input Processing
 * 
 * Accepts either:
 * - Raw user prompt
 * - Idea selection (generates starter prompt from template)
 */

import { getIdeaTemplate } from '../prompt/idea-templates'
import type {
  GenerationInput,
  RawPromptInput,
  IdeaSelectionInput,
  GenerationParameters,
} from './types'

export interface ProcessedInput {
  userPrompt: string
  ideaTemplateId?: string
  parameters: GenerationParameters
}

/**
 * Process input and normalize it for the planning stage
 */
export function processInput(input: GenerationInput): ProcessedInput {
  const defaultParameters: GenerationParameters = {
    aspectRatio: '1:1',
    quality: 'draft',
    variants: 2,
    textPresence: 'minimal',
    brandStrength: 'balanced',
  }

  if (input.type === 'raw_prompt') {
    return processRawPrompt(input, defaultParameters)
  } else {
    return processIdeaSelection(input, defaultParameters)
  }
}

/**
 * Process raw user prompt
 */
function processRawPrompt(
  input: RawPromptInput,
  defaults: GenerationParameters
): ProcessedInput {
  return {
    userPrompt: input.prompt.trim(),
    parameters: {
      ...defaults,
      ...input.parameters,
    },
  }
}

/**
 * Process idea selection and generate starter prompt
 */
function processIdeaSelection(
  input: IdeaSelectionInput,
  defaults: GenerationParameters
): ProcessedInput {
  const template = getIdeaTemplate(input.ideaTemplateId)
  
  if (!template) {
    throw new Error(`Unknown idea template: ${input.ideaTemplateId}`)
  }

  // Generate starter prompt from template
  const starterPrompt = generateStarterPrompt(template, input.subject)

  // Use template defaults for parameters
  // Map template's textPresenceDefault to our type
  let textPresence = input.parameters?.textPresence || defaults.textPresence
  if (template.textPresenceDefault && template.textPresenceDefault !== 'headline' && template.textPresenceDefault !== 'text-heavy') {
    textPresence = template.textPresenceDefault as 'none' | 'minimal' | 'prominent' | 'heavy'
  }
  
  const parameters: GenerationParameters = {
    ...defaults,
    ...input.parameters,
    textPresence,
    brandStrength: input.parameters?.brandStrength || template.brandStrengthDefault,
  }

  return {
    userPrompt: starterPrompt,
    ideaTemplateId: input.ideaTemplateId,
    parameters,
  }
}

/**
 * Generate a starter prompt from an idea template
 */
function generateStarterPrompt(
  template: any,
  subject?: string
): string {
  // Use template's prompt skeleton as base
  let prompt = template.promptSkeleton || template.description

  // Replace {product} or {subject} placeholders
  if (subject) {
    prompt = prompt.replace(/\{product\}/gi, subject)
    prompt = prompt.replace(/\{subject\}/gi, subject)
  } else {
    // Remove placeholder text if no subject provided
    prompt = prompt.replace(/\{product\}/gi, 'the product')
    prompt = prompt.replace(/\{subject\}/gi, 'the subject')
  }

  // Remove other placeholders for now (will be filled in assembly stage)
  prompt = prompt.replace(/\{[^}]+\}/g, '')

  // Clean up extra spaces
  prompt = prompt.replace(/\s+/g, ' ').trim()

  return prompt
}

/**
 * Validate input before processing
 */
export function validateInput(input: GenerationInput): { valid: boolean; error?: string } {
  if (input.type === 'raw_prompt') {
    if (!input.prompt || input.prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt cannot be empty' }
    }
    if (input.prompt.trim().length > 2000) {
      return { valid: false, error: 'Prompt is too long (max 2000 characters)' }
    }
  } else if (input.type === 'idea_selection') {
    if (!input.ideaTemplateId) {
      return { valid: false, error: 'Idea template ID is required' }
    }
    const template = getIdeaTemplate(input.ideaTemplateId)
    if (!template) {
      return { valid: false, error: `Unknown idea template: ${input.ideaTemplateId}` }
    }
  }

  return { valid: true }
}
