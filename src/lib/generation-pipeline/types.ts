/**
 * 4-Stage Prompt Generation Pipeline Types
 * 
 * Stage 1: Input Processing
 * Stage 2: Planning (Generate Spec)
 * Stage 3: Reference Selection
 * Stage 4: Final Prompt Assembly
 */

// ============================================================================
// STAGE 1: INPUT TYPES
// ============================================================================

export type GenerationInput = RawPromptInput | IdeaSelectionInput

export interface RawPromptInput {
  type: 'raw_prompt'
  prompt: string
  parameters?: Partial<GenerationParameters>
}

export interface IdeaSelectionInput {
  type: 'idea_selection'
  ideaTemplateId: string
  subject?: string // Optional subject override
  parameters?: Partial<GenerationParameters>
}

export interface GenerationParameters {
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16' | '2:3'
  quality: 'draft' | 'final'
  variants: number
  artStyle?: string
  mood?: string
  composition?: string
  textPresence?: 'none' | 'minimal' | 'prominent' | 'heavy'
  brandStrength?: 'loose' | 'balanced' | 'strong' | 'strict'
}

// ============================================================================
// STAGE 2: GENERATION SPEC (Planning Output)
// ============================================================================

export interface GenerationSpec {
  // Core identification
  ideaType: string // e.g., 'social-media-ad', 'product-shot', 'quote-card'
  subject: string // What to create (extracted or provided)
  
  // Brand integration
  brandLens: string // Compressed brand identity (from brand profile)
  brandStrength: 'loose' | 'balanced' | 'strong' | 'strict'
  
  // Visual direction
  artStyle?: string // Optional art style override
  mood?: string // Emotional tone
  composition?: string // Layout guidance
  textPresence: 'none' | 'minimal' | 'prominent' | 'heavy'
  
  // Constraints
  negativeConstraints: string[] // What to avoid
  visualConstraints: string[] // Brand-specific constraints
  
  // Reference policy
  referencePolicy: {
    preferredTypes: string[] // Asset types to prefer
    optionalTypes: string[] // Asset types that are optional
    excludedTypes: string[] // Asset types to exclude
    maxReferences: number // Max number of references to use
  }
  
  // Generation parameters (separate from prompt)
  parameters: GenerationParameters
}

// ============================================================================
// STAGE 3: REFERENCE SELECTION OUTPUT
// ============================================================================

export interface SelectedReference {
  assetId: string
  assetType: string
  url: string
  relevanceScore: number
  reason: string
  metadata?: {
    width?: number
    height?: number
    location?: string
    colors?: string[]
  }
}

export interface ReferenceSelectionResult {
  selectedReferences: SelectedReference[]
  totalAvailable: number
  selectionStrategy: string
  diversityScore: number
}

// ============================================================================
// STAGE 4: FINAL PROMPT ASSEMBLY OUTPUT
// ============================================================================

export interface AssembledPrompt {
  // The final concise prompt for DALL-E
  finalPrompt: string
  
  // Metadata for tracking
  promptMetadata: {
    ideaType: string
    subject: string
    brandLensApplied: boolean
    artStyleApplied: boolean
    constraintsApplied: string[]
    referenceCount: number
    tokenEstimate: number
  }
  
  // References used
  selectedReferences: SelectedReference[]
  
  // Generation parameters (sent separately to API)
  parameters: GenerationParameters
  
  // Debug info
  debug?: {
    generationSpec: GenerationSpec
    referenceSelection: ReferenceSelectionResult
    promptBuildSteps: string[]
  }
}

// ============================================================================
// PIPELINE CONTEXT (Passed through stages)
// ============================================================================

export interface PipelineContext {
  studioId: string
  brandProfile: CompressedBrandProfile | null
  availableAssets: BrandAssetWithMetadata[]
  userPreferences?: {
    defaultArtStyle?: string
    defaultBrandStrength?: 'loose' | 'balanced' | 'strong' | 'strict'
  }
}

export interface CompressedBrandProfile {
  brandName: string
  brandCategory?: string
  toneSummary: string
  paletteSummary: string
  aestheticSummary: string
  typographySummary?: string
  visualConstraints: string[]
  shortBrandLens: string // One-sentence brand essence
}

export interface BrandAssetWithMetadata {
  id: string
  type: string
  url: string
  storageKey: string
  metadata?: {
    assetType?: string
    brandRole?: string
    visualTraits?: string[]
    compositionTags?: string[]
    paletteTags?: string[]
    textPresence?: string
    brandRelevanceScore?: number
    qualityScore?: number
    ideaCompatibility?: Record<string, number>
    width?: number
    height?: number
    location?: string
    colors?: string[]
  }
}

// ============================================================================
// PIPELINE RESULT (Complete output)
// ============================================================================

export interface PipelineResult {
  success: boolean
  assembledPrompt?: AssembledPrompt
  error?: string
  stage?: 'input' | 'planning' | 'reference_selection' | 'prompt_assembly'
}
