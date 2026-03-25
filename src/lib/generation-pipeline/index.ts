/**
 * 4-Stage Prompt Generation Pipeline
 * 
 * Main orchestrator that runs all 4 stages:
 * 1. Input Processing
 * 2. Planning (Generate Spec)
 * 3. Reference Selection
 * 4. Final Prompt Assembly
 */

import { processInput, validateInput } from './stage1-input'
import { createGenerationSpec, validateGenerationSpec } from './stage2-planning'
import { selectReferences } from './stage3-reference-selection'
import { assemblePrompt, validateAssembledPrompt, formatForDallE3 } from './stage4-prompt-assembly'

import type {
  GenerationInput,
  PipelineContext,
  PipelineResult,
  AssembledPrompt,
} from './types'

/**
 * Run the complete 4-stage pipeline
 */
export async function runGenerationPipeline(
  input: GenerationInput,
  context: PipelineContext
): Promise<PipelineResult> {
  try {
    // ========================================================================
    // STAGE 1: INPUT PROCESSING
    // ========================================================================
    console.log('[Pipeline] Stage 1: Input Processing')
    
    const inputValidation = validateInput(input)
    if (!inputValidation.valid) {
      return {
        success: false,
        error: inputValidation.error,
        stage: 'input',
      }
    }
    
    const processedInput = processInput(input)
    console.log('[Pipeline] Processed input:', {
      prompt: processedInput.userPrompt.substring(0, 100),
      ideaTemplateId: processedInput.ideaTemplateId,
      parameters: processedInput.parameters,
    })
    
    // ========================================================================
    // STAGE 2: PLANNING
    // ========================================================================
    console.log('[Pipeline] Stage 2: Planning')
    
    const generationSpec = createGenerationSpec(processedInput, context)
    
    const specValidation = validateGenerationSpec(generationSpec)
    if (!specValidation.valid) {
      return {
        success: false,
        error: specValidation.error,
        stage: 'planning',
      }
    }
    
    console.log('[Pipeline] Generation spec created:', {
      ideaType: generationSpec.ideaType,
      subject: generationSpec.subject.substring(0, 50),
      brandStrength: generationSpec.brandStrength,
      referencePolicy: generationSpec.referencePolicy,
    })
    
    // ========================================================================
    // STAGE 3: REFERENCE SELECTION
    // ========================================================================
    console.log('[Pipeline] Stage 3: Reference Selection')
    
    const referenceSelection = selectReferences(generationSpec, context)
    
    console.log('[Pipeline] References selected:', {
      count: referenceSelection.selectedReferences.length,
      totalAvailable: referenceSelection.totalAvailable,
      strategy: referenceSelection.selectionStrategy,
      diversityScore: referenceSelection.diversityScore,
    })
    
    // ========================================================================
    // STAGE 4: FINAL PROMPT ASSEMBLY
    // ========================================================================
    console.log('[Pipeline] Stage 4: Final Prompt Assembly')
    
    const assembledPrompt = assemblePrompt(generationSpec, referenceSelection)
    
    const promptValidation = validateAssembledPrompt(assembledPrompt)
    if (!promptValidation.valid) {
      return {
        success: false,
        error: promptValidation.error,
        stage: 'prompt_assembly',
      }
    }
    
    if (promptValidation.warnings) {
      console.warn('[Pipeline] Prompt warnings:', promptValidation.warnings)
    }
    
    // Format for DALL-E 3
    assembledPrompt.finalPrompt = formatForDallE3(assembledPrompt)
    
    console.log('[Pipeline] Final prompt assembled:', {
      prompt: assembledPrompt.finalPrompt.substring(0, 100) + '...',
      tokenEstimate: assembledPrompt.promptMetadata.tokenEstimate,
      referenceCount: assembledPrompt.selectedReferences.length,
    })
    
    // ========================================================================
    // SUCCESS
    // ========================================================================
    return {
      success: true,
      assembledPrompt,
    }
    
  } catch (error) {
    console.error('[Pipeline] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown pipeline error',
      stage: 'prompt_assembly',
    }
  }
}

/**
 * Run pipeline with simplified input (convenience function)
 */
export async function generatePrompt(
  prompt: string,
  context: PipelineContext,
  parameters?: Partial<GenerationInput['parameters']>
): Promise<PipelineResult> {
  const input: GenerationInput = {
    type: 'raw_prompt',
    prompt,
    parameters,
  }
  
  return runGenerationPipeline(input, context)
}

/**
 * Run pipeline with idea template (convenience function)
 */
export async function generateFromTemplate(
  ideaTemplateId: string,
  subject: string | undefined,
  context: PipelineContext,
  parameters?: Partial<GenerationInput['parameters']>
): Promise<PipelineResult> {
  const input: GenerationInput = {
    type: 'idea_selection',
    ideaTemplateId,
    subject,
    parameters,
  }
  
  return runGenerationPipeline(input, context)
}

// Re-export types
export * from './types'
export { processInput, validateInput } from './stage1-input'
export { createGenerationSpec, validateGenerationSpec } from './stage2-planning'
export { selectReferences, getSelectionStats } from './stage3-reference-selection'
export { 
  assemblePrompt, 
  validateAssembledPrompt, 
  buildNegativePrompt,
  previewPromptAssembly,
  formatForDallE3 
} from './stage4-prompt-assembly'
