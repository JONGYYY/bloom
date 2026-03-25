# 4-Stage Prompt Generation Pipeline

## Overview

A structured, modular prompt generation system that separates concerns into 4 distinct stages, providing better control, transparency, and maintainability.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GENERATION PIPELINE                       │
└─────────────────────────────────────────────────────────────┘

Stage 1: INPUT PROCESSING
├─ Accept: Raw prompt OR Idea template selection
├─ Generate starter prompts from templates
└─ Normalize parameters
         ↓
Stage 2: PLANNING (Generate Spec)
├─ Convert to structured GenerationSpec
├─ Determine: idea_type, subject, brand_lens
├─ Build reference policy
└─ Extract constraints
         ↓
Stage 3: REFERENCE SELECTION
├─ Score available assets
├─ Apply reference policy filters
├─ Ensure diversity
└─ Select best references (SEPARATE from prompt)
         ↓
Stage 4: FINAL PROMPT ASSEMBLY
├─ Build concise visual prompt
├─ Use compressed brand lens (not full kit)
├─ Add quality modifiers
└─ Send params separately (aspect ratio, quality, variants)
         ↓
      DALL-E 3
```

---

## Stage 1: Input Processing

**Purpose:** Accept and normalize user input

**File:** `src/lib/generation-pipeline/stage1-input.ts`

### Input Types

**A. Raw Prompt Input**
```typescript
{
  type: 'raw_prompt',
  prompt: 'Create a social media ad for summer collection',
  parameters: {
    aspectRatio: '1:1',
    quality: 'draft',
    variants: 2
  }
}
```

**B. Idea Selection Input**
```typescript
{
  type: 'idea_selection',
  ideaTemplateId: 'social-media-ad',
  subject: 'summer collection',
  parameters: {
    aspectRatio: '1:1',
    quality: 'final',
    variants: 2
  }
}
```

### Output

```typescript
interface ProcessedInput {
  userPrompt: string // Normalized prompt
  ideaTemplateId?: string // If from template
  parameters: GenerationParameters // Normalized params
}
```

### Key Functions

- `processInput()` - Main processing function
- `validateInput()` - Input validation
- `generateStarterPrompt()` - Creates prompt from template

---

## Stage 2: Planning

**Purpose:** Convert input into a structured generation specification

**File:** `src/lib/generation-pipeline/stage2-planning.ts`

### Generation Spec Structure

```typescript
interface GenerationSpec {
  // Core
  ideaType: string // 'social-media-ad', 'product-shot', etc.
  subject: string // What to create
  
  // Brand
  brandLens: string // Compressed brand identity
  brandStrength: 'loose' | 'balanced' | 'strong' | 'strict'
  
  // Visual direction
  artStyle?: string
  mood?: string
  composition?: string
  textPresence: 'none' | 'minimal' | 'prominent' | 'heavy'
  
  // Constraints
  negativeConstraints: string[] // What to avoid
  visualConstraints: string[] // Brand-specific rules
  
  // Reference policy
  referencePolicy: {
    preferredTypes: string[] // Asset types to prefer
    optionalTypes: string[] // Optional asset types
    excludedTypes: string[] // Asset types to exclude
    maxReferences: number // Max references to use
  }
  
  // Parameters (sent separately to API)
  parameters: GenerationParameters
}
```

### Key Functions

- `createGenerationSpec()` - Main spec generation
- `determineIdeaType()` - Infer idea type from prompt
- `compressBrandLens()` - Compress brand profile to concise string
- `buildReferencePolicy()` - Build reference selection rules
- `extractConstraints()` - Extract negative and visual constraints

### Example Output

```typescript
{
  ideaType: 'social-media-ad',
  subject: 'summer collection launch',
  brandLens: 'Premium streetwear, clean editorial tone, muted olive palette',
  brandStrength: 'balanced',
  mood: 'energetic',
  textPresence: 'minimal',
  negativeConstraints: ['blurry', 'low quality', 'neon colors'],
  visualConstraints: ['clean negative space', 'soft studio lighting'],
  referencePolicy: {
    preferredTypes: ['campaign_visual', 'hero_image', 'product_photo'],
    optionalTypes: ['logo_mark'],
    excludedTypes: [],
    maxReferences: 5
  }
}
```

---

## Stage 3: Reference Selection

**Purpose:** Automatically choose best brand reference images (SEPARATE from prompt writing)

**File:** `src/lib/generation-pipeline/stage3-reference-selection.ts`

### Selection Process

1. **Score all available assets**
   - Brand relevance score (30%)
   - Quality score (20%)
   - Idea compatibility (30%)
   - Type preference (20%)
   - Additional bonuses (brand role, location, text presence)

2. **Apply reference policy filters**
   - Exclude excluded types
   - Prefer preferred types
   - Include optional types

3. **Ensure diversity**
   - Prefer different asset types
   - Avoid redundancy

4. **Select top N references**
   - Default: 5 references max
   - Sorted by score

### Output

```typescript
interface ReferenceSelectionResult {
  selectedReferences: SelectedReference[]
  totalAvailable: number
  selectionStrategy: string
  diversityScore: number // 0-100
}

interface SelectedReference {
  assetId: string
  assetType: string
  url: string
  relevanceScore: number // 0-100
  reason: string // Why selected
  metadata: {
    width?: number
    height?: number
    location?: string
    colors?: string[]
  }
}
```

### Example Output

```typescript
{
  selectedReferences: [
    {
      assetId: 'asset-123',
      assetType: 'campaign_visual',
      url: 'https://...',
      relevanceScore: 95,
      reason: 'Preferred campaign_visual for social-media-ad; Primary brand asset',
      metadata: { width: 1200, height: 800, location: 'hero' }
    },
    {
      assetId: 'asset-456',
      assetType: 'product_photo',
      url: 'https://...',
      relevanceScore: 87,
      reason: 'Preferred product_photo for social-media-ad; High brand relevance',
      metadata: { width: 800, height: 600, location: 'content' }
    }
  ],
  totalAvailable: 12,
  selectionStrategy: 'template_guided',
  diversityScore: 100
}
```

---

## Stage 4: Final Prompt Assembly

**Purpose:** Build ONE concise final visual prompt

**File:** `src/lib/generation-pipeline/stage4-prompt-assembly.ts`

### Assembly Process

1. **Core subject** - What to create
2. **Brand context** - Compressed brand lens (if brand strength > loose)
3. **Art style** - If specified
4. **Mood** - If specified
5. **Composition** - Layout guidance
6. **Visual constraints** - Top 2 brand-specific constraints
7. **Quality modifiers** - Based on parameters

### Output

```typescript
interface AssembledPrompt {
  // The final concise prompt for DALL-E
  finalPrompt: string
  
  // Metadata
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
  
  // Parameters (sent separately)
  parameters: GenerationParameters
  
  // Debug info
  debug: {
    generationSpec: GenerationSpec
    referenceSelection: ReferenceSelectionResult
    promptBuildSteps: string[]
  }
}
```

### Example Output

```typescript
{
  finalPrompt: "A summer collection launch with premium streetwear aesthetic, clean editorial tone, muted olive palette, energetic mood, clean negative space, high quality, professional, minimal text, square composition",
  
  promptMetadata: {
    ideaType: 'social-media-ad',
    subject: 'summer collection launch',
    brandLensApplied: true,
    artStyleApplied: false,
    constraintsApplied: ['clean negative space', 'soft studio lighting'],
    referenceCount: 2,
    tokenEstimate: 45
  },
  
  selectedReferences: [...],
  
  parameters: {
    aspectRatio: '1:1',
    quality: 'final',
    variants: 2
  }
}
```

---

## Usage

### Basic Usage

```typescript
import { runGenerationPipeline } from '@/lib/generation-pipeline'

// Raw prompt
const result = await runGenerationPipeline(
  {
    type: 'raw_prompt',
    prompt: 'Create a social media ad for summer collection',
    parameters: {
      aspectRatio: '1:1',
      quality: 'final',
      variants: 2
    }
  },
  {
    studioId: 'studio-123',
    brandProfile: compressedBrandProfile,
    availableAssets: brandAssets
  }
)

if (result.success) {
  const { finalPrompt, parameters } = result.assembledPrompt
  // Use finalPrompt with DALL-E
  // Send parameters separately
}
```

### Template-Based Generation

```typescript
const result = await runGenerationPipeline(
  {
    type: 'idea_selection',
    ideaTemplateId: 'product-shot',
    subject: 'new sneaker',
    parameters: {
      aspectRatio: '1:1',
      quality: 'final',
      variants: 2
    }
  },
  context
)
```

### Convenience Functions

```typescript
// Simplified raw prompt
const result = await generatePrompt(
  'Create a social media ad',
  context,
  { aspectRatio: '1:1' }
)

// Simplified template
const result = await generateFromTemplate(
  'product-shot',
  'new sneaker',
  context,
  { quality: 'final' }
)
```

---

## Integration with Generation Worker

**File:** `src/workers/generation.ts`

The generation worker now uses the 4-stage pipeline:

```typescript
// Prepare context
const pipelineContext: PipelineContext = {
  studioId,
  brandProfile: compressedBrandProfile,
  availableAssets: brandAssets
}

// Build input
const pipelineInput: GenerationInput = {
  type: parameters.outputType ? 'idea_selection' : 'raw_prompt',
  // ... input details
}

// Run pipeline
const pipelineResult = await runGenerationPipeline(pipelineInput, pipelineContext)

// Use assembled prompt
const enhancedPrompt = pipelineResult.assembledPrompt.finalPrompt

// Generate with DALL-E
const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: enhancedPrompt,
  size: getDallESize(parameters.aspectRatio),
  quality: parameters.quality === 'hd' ? 'hd' : 'standard'
})
```

---

## Key Benefits

### 1. **Separation of Concerns**
- Each stage has a single responsibility
- Easy to test and debug independently
- Clear data flow between stages

### 2. **Transparency**
- Every decision is logged and explained
- Debug output shows why references were selected
- Prompt build steps are tracked

### 3. **Token Efficiency**
- Compressed brand lens (not full kit)
- Only essential information in prompt
- Token estimation before generation

### 4. **Flexibility**
- Supports raw prompts and templates
- Configurable brand strength
- Extensible reference selection

### 5. **Type Safety**
- Comprehensive TypeScript interfaces
- Validation at each stage
- Clear error messages

---

## Reference Selection Examples

### Product Shot

```typescript
referencePolicy: {
  preferredTypes: ['product_photo', 'apparel_photo', 'packaging_image'],
  optionalTypes: ['label_tag_detail'],
  excludedTypes: ['icon_set', 'illustration_style_sample'],
  maxReferences: 5
}
```

### Social Media Ad

```typescript
referencePolicy: {
  preferredTypes: ['campaign_visual', 'hero_image', 'product_photo'],
  optionalTypes: ['logo_mark'],
  excludedTypes: [],
  maxReferences: 5
}
```

### Quote Card

```typescript
referencePolicy: {
  preferredTypes: ['logo_wordmark', 'campaign_visual', 'motif_crop'],
  optionalTypes: [],
  excludedTypes: ['product_photo'],
  maxReferences: 5
}
```

---

## Debug Output Example

```
[Pipeline] Stage 1: Input Processing
  - Processed input: "summer collection launch"
  - Idea template: social-media-ad
  - Parameters: { aspectRatio: '1:1', quality: 'final', variants: 2 }

[Pipeline] Stage 2: Planning
  - Generation spec created
  - Idea type: social-media-ad
  - Subject: summer collection launch
  - Brand strength: balanced
  - Reference policy: preferredTypes=['campaign_visual', 'hero_image']

[Pipeline] Stage 3: Reference Selection
  - References selected: 2
  - Total available: 12
  - Strategy: template_guided
  - Diversity score: 100

[Pipeline] Stage 4: Final Prompt Assembly
  - Final prompt (45 tokens): "A summer collection launch..."
  - Brand lens applied: true
  - Reference count: 2
  - Constraints applied: ['clean negative space', 'soft studio lighting']
```

---

## Validation

Each stage includes validation:

```typescript
// Stage 1
validateInput(input) // Checks prompt length, template exists

// Stage 2
validateGenerationSpec(spec) // Checks required fields

// Stage 4
validateAssembledPrompt(assembled) // Checks prompt quality, token count
```

---

## Future Enhancements

### Potential Improvements:
1. **AI-powered subject extraction** - Use NLP to extract main subject
2. **Dynamic reference scoring** - Learn from generation success
3. **Multi-language support** - Translate prompts
4. **Style transfer** - Apply reference styles more explicitly
5. **Prompt optimization** - A/B test different prompt structures
6. **Negative prompt generation** - Build comprehensive negative prompts
7. **Batch generation** - Optimize for multiple variants
8. **Prompt caching** - Cache common prompt patterns

---

## Comparison with Previous System

| Feature | Previous | New 4-Stage |
|---------|----------|-------------|
| Structure | Monolithic | Modular (4 stages) |
| Reference Selection | Mixed with prompt | Separate stage |
| Brand Integration | Full kit dump | Compressed lens |
| Transparency | Limited logging | Full debug output |
| Validation | Minimal | Each stage validated |
| Token Efficiency | Variable | Optimized |
| Extensibility | Difficult | Easy to extend |
| Testing | Hard to test | Easy to test stages |

---

## Files Structure

```
src/lib/generation-pipeline/
├── index.ts                        # Main orchestrator
├── types.ts                        # Type definitions
├── stage1-input.ts                 # Input processing
├── stage2-planning.ts              # Planning/spec generation
├── stage3-reference-selection.ts   # Reference selection
└── stage4-prompt-assembly.ts       # Final assembly
```

---

## Conclusion

The 4-stage pipeline provides a clean, maintainable, and transparent system for generating high-quality prompts. It separates concerns, optimizes token usage, and provides full visibility into the generation process.

**Key Achievements:**
- ✅ Modular architecture
- ✅ Separated reference selection from prompt writing
- ✅ Compressed brand lens (not full kit)
- ✅ Type-safe with comprehensive validation
- ✅ Full debug transparency
- ✅ Easy to test and extend

**Status:** ✅ Fully implemented and integrated
**Commit:** `adbaf08`
**Branch:** `main`
