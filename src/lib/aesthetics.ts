export interface Aesthetic {
  id: string
  label: string
  description: string
  preview?: string
}

export interface ArtMovement {
  id: string
  label: string
  description?: string
}

export interface Mood {
  id: string
  label: string
  description?: string
}

export interface Composition {
  id: string
  label: string
  description?: string
}

// MVP: 8 core aesthetics
export const AESTHETICS: Aesthetic[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean, simple, lots of whitespace',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'Premium, elegant, refined',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Strong colors, high contrast, impactful',
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Fun, energetic, vibrant',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Corporate, trustworthy, polished',
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Contemporary, sleek, cutting-edge',
  },
  {
    id: 'organic',
    label: 'Organic',
    description: 'Natural, earthy, warm',
  },
  {
    id: 'tech',
    label: 'Tech',
    description: 'Digital, futuristic, innovative',
  },
]

// MVP: 8-10 art movements
export const ART_MOVEMENTS: ArtMovement[] = [
  { id: 'swiss', label: 'Swiss', description: 'Grid-based, clean typography' },
  { id: 'bauhaus', label: 'Bauhaus', description: 'Geometric, functional' },
  { id: 'brutalism', label: 'Brutalism', description: 'Raw, bold, unconventional' },
  { id: 'memphis', label: 'Memphis', description: 'Colorful, geometric, 80s-inspired' },
  { id: 'art-deco', label: 'Art Deco', description: 'Glamorous, geometric, luxurious' },
  { id: 'mid-century', label: 'Mid-Century Modern', description: 'Retro, organic shapes' },
  { id: 'minimalism', label: 'Minimalism', description: 'Less is more, essential elements' },
  { id: 'maximalism', label: 'Maximalism', description: 'More is more, layered, rich' },
]

// MVP: 6 moods
export const MOODS: Mood[] = [
  { id: 'sophisticated', label: 'Sophisticated' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'calm', label: 'Calm' },
  { id: 'bold', label: 'Bold' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
]

// MVP: 6 compositions
export const COMPOSITIONS: Composition[] = [
  { id: 'centered', label: 'Centered', description: 'Symmetrical, balanced' },
  { id: 'split', label: 'Split Layout', description: 'Divided into sections' },
  { id: 'poster', label: 'Poster Style', description: 'Bold, impactful layout' },
  { id: 'editorial', label: 'Editorial', description: 'Magazine-style layout' },
  { id: 'grid', label: 'Grid', description: 'Structured grid system' },
  { id: 'asymmetric', label: 'Asymmetric', description: 'Dynamic, off-balance' },
]

// Aspect ratios
export const ASPECT_RATIOS = [
  { id: 'square', label: 'Square', ratio: '1:1', dimensions: '1024×1024' },
  { id: 'portrait', label: 'Portrait', ratio: '4:5', dimensions: '1024×1280' },
  { id: 'landscape', label: 'Landscape', ratio: '16:9', dimensions: '1792×1024' },
  { id: 'wide', label: 'Wide', ratio: '21:9', dimensions: '1792×768' },
  { id: 'story', label: 'Story', ratio: '9:16', dimensions: '1024×1792' },
]

// Brand strength levels
export const BRAND_STRENGTH_LEVELS = [
  { id: 'loose', label: 'Loose', description: 'Minimal brand influence' },
  { id: 'balanced', label: 'Balanced', description: 'Moderate brand influence' },
  { id: 'strong', label: 'Strong', description: 'Strong brand adherence' },
  { id: 'strict', label: 'Strict', description: 'Maximum brand consistency' },
]

// Text presence levels
export const TEXT_PRESENCE_LEVELS = [
  { id: 'none', label: 'None', description: 'No text, purely visual' },
  { id: 'minimal', label: 'Minimal', description: 'Small text overlay' },
  { id: 'headline', label: 'Headline', description: 'Prominent headline' },
  { id: 'text-heavy', label: 'Text-Heavy', description: 'Multiple text elements' },
]

// Quality levels (DALL-E 3)
export const QUALITY_LEVELS = [
  { id: 'standard', label: 'Standard', description: '1K resolution, faster generation' },
  { id: 'hd', label: 'HD', description: '1K resolution, higher quality' },
]

// DALL-E 3 style parameter
export const DALLE_STYLES = [
  { id: 'vivid', label: 'Vivid', description: 'Hyper-real and dramatic' },
  { id: 'natural', label: 'Natural', description: 'More realistic and subtle' },
]

// Helper functions
export function getAestheticById(id: string): Aesthetic | undefined {
  return AESTHETICS.find(a => a.id === id)
}

export function getArtMovementById(id: string): ArtMovement | undefined {
  return ART_MOVEMENTS.find(m => m.id === id)
}

export function getMoodById(id: string): Mood | undefined {
  return MOODS.find(m => m.id === id)
}

export function getCompositionById(id: string): Composition | undefined {
  return COMPOSITIONS.find(c => c.id === id)
}
