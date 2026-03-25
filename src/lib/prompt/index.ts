// Layer 1: Brand Profile Compression
export {
  compressBrandProfile,
  getBrandField,
  type BrandPromptProfile,
} from './brand-profile'

// Layer 2: Asset Metadata
export {
  type AssetMetadata,
  type AssetType,
  type BrandRole,
  type TextPresence,
  ASSET_TYPE_LABELS,
  ASSET_TYPE_CATEGORIES,
  DEFAULT_IDEA_COMPATIBILITY,
  getDefaultCompatibility,
  validateAssetMetadata,
  createDefaultMetadata,
  isAssetMetadata,
} from './asset-metadata'

// Layer 2: Asset Tagging
export {
  tagBrandAsset,
  tagGeneratedAsset,
  bulkTagAssets,
  getTaggedAssets,
} from './asset-tagger'

// Layer 3: Idea Templates
export {
  type IdeaTemplate,
  type BrandField,
  type ArtStyleWeight,
  type TypographyRelevance,
  type BrandStrengthLevel,
  type TextPresenceLevel,
  IDEA_TEMPLATES,
  getIdeaTemplate,
  getAllIdeaTemplates,
  getTemplatesByCategory,
  getTemplateCategories,
  findTemplateForConcept,
} from './idea-templates'

// Layer 4: Reference Selection
export {
  type ReferenceSelectionOptions,
  type SelectedReference,
  selectReferences,
  getSelectionStats,
  explainAssetSelection,
} from './reference-selector'

// Layer 4: Prompt Assembly
export {
  type PromptAssemblyInput,
  type AssembledPrompt,
  assemblePrompt,
  validatePromptInput,
  previewPrompt,
} from './prompt-assembler'
