"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import StylePresetCard from "@/components/studio/style-preset-card"
import { ChevronDown } from "lucide-react"

interface StylePreset {
  id: string
  name: string
  preview: string
  whenToUse: string
  bestFitCategories: string[]
  parameters: {
    aesthetic?: string
    composition?: string
    mood?: string
    artMovement?: string[]
  }
}

const styleFamilies = [
  {
    id: "product-presentation",
    name: "Product Presentation",
    presets: [
      {
        id: "clean-minimal",
        name: "Clean Minimal",
        preview: "/placeholders/style-clean-minimal.jpg",
        whenToUse: "Premium products, tech, beauty. Emphasizes product quality through simplicity.",
        bestFitCategories: ["E-commerce", "Tech", "Beauty"],
        parameters: {
          aesthetic: "minimal",
          composition: "centered",
          mood: "calm"
        }
      },
      {
        id: "editorial-flat-lay",
        name: "Editorial Flat Lay",
        preview: "/placeholders/style-flat-lay.jpg",
        whenToUse: "Fashion, lifestyle, subscription boxes. Shows curation and styling.",
        bestFitCategories: ["Fashion", "Lifestyle", "Subscription"],
        parameters: {
          aesthetic: "editorial",
          composition: "flat-lay",
          mood: "aspirational"
        }
      },
      {
        id: "studio-lighting",
        name: "Studio Lighting",
        preview: "/placeholders/style-studio.jpg",
        whenToUse: "High-end products, luxury goods. Professional photography aesthetic.",
        bestFitCategories: ["Luxury", "Premium", "Professional"],
        parameters: {
          aesthetic: "luxury",
          composition: "centered",
          mood: "sophisticated"
        }
      },
      {
        id: "lifestyle-context",
        name: "Lifestyle Context",
        preview: "/placeholders/style-lifestyle.jpg",
        whenToUse: "Products in use, real-world settings. Helps customers envision ownership.",
        bestFitCategories: ["Lifestyle", "Home", "Wellness"],
        parameters: {
          aesthetic: "organic",
          composition: "environmental",
          mood: "warm"
        }
      },
    ]
  },
  {
    id: "fashion-apparel",
    name: "Fashion and Apparel",
    presets: [
      {
        id: "lookbook-editorial",
        name: "Lookbook Editorial",
        preview: "/placeholders/style-lookbook.jpg",
        whenToUse: "Seasonal collections, brand storytelling. High-fashion aesthetic.",
        bestFitCategories: ["Fashion", "Apparel", "Accessories"],
        parameters: {
          aesthetic: "editorial",
          composition: "portrait",
          mood: "confident"
        }
      },
      {
        id: "street-style",
        name: "Street Style",
        preview: "/placeholders/style-street.jpg",
        whenToUse: "Urban brands, casual wear. Authentic, relatable styling.",
        bestFitCategories: ["Streetwear", "Casual", "Youth"],
        parameters: {
          aesthetic: "bold",
          composition: "candid",
          mood: "energetic"
        }
      },
      {
        id: "product-detail",
        name: "Product Detail",
        preview: "/placeholders/style-detail.jpg",
        whenToUse: "Showcasing fabric, texture, craftsmanship. Close-up focus.",
        bestFitCategories: ["Premium", "Craftsmanship", "Quality"],
        parameters: {
          aesthetic: "minimal",
          composition: "macro",
          mood: "refined"
        }
      },
      {
        id: "outfit-flat-lay",
        name: "Outfit Flat Lay",
        preview: "/placeholders/style-outfit.jpg",
        whenToUse: "Styling inspiration, outfit ideas. Shows coordination and pairing.",
        bestFitCategories: ["Fashion", "Styling", "Inspiration"],
        parameters: {
          aesthetic: "editorial",
          composition: "flat-lay",
          mood: "curated"
        }
      },
    ]
  },
  {
    id: "paid-social",
    name: "Paid Social and Conversion",
    presets: [
      {
        id: "scroll-stopper",
        name: "Scroll Stopper",
        preview: "/placeholders/style-scroll-stopper.jpg",
        whenToUse: "Feed ads, high competition. Bold, attention-grabbing.",
        bestFitCategories: ["Meta Ads", "TikTok", "Instagram"],
        parameters: {
          aesthetic: "bold",
          composition: "dynamic",
          mood: "energetic"
        }
      },
      {
        id: "benefit-focused",
        name: "Benefit-Focused",
        preview: "/placeholders/style-benefit.jpg",
        whenToUse: "Performance ads, direct response. Clear value prop.",
        bestFitCategories: ["Conversion", "Performance", "Direct Response"],
        parameters: {
          aesthetic: "professional",
          composition: "split-screen",
          mood: "confident"
        }
      },
      {
        id: "testimonial-social",
        name: "Testimonial Social",
        preview: "/placeholders/style-testimonial.jpg",
        whenToUse: "Trust-building, social proof. Real customer stories.",
        bestFitCategories: ["Social Proof", "Trust", "Conversion"],
        parameters: {
          aesthetic: "authentic",
          composition: "portrait",
          mood: "genuine"
        }
      },
      {
        id: "offer-urgency",
        name: "Offer Urgency",
        preview: "/placeholders/style-urgency.jpg",
        whenToUse: "Limited-time offers, sales. Creates FOMO and immediate action.",
        bestFitCategories: ["Sales", "Promotions", "Urgency"],
        parameters: {
          aesthetic: "bold",
          composition: "centered",
          mood: "urgent"
        }
      },
    ]
  },
  {
    id: "brand-story",
    name: "Brand Story and Lifestyle",
    presets: [
      {
        id: "mission-driven",
        name: "Mission-Driven",
        preview: "/placeholders/style-mission.jpg",
        whenToUse: "About pages, brand values. Emotional connection to purpose.",
        bestFitCategories: ["Brand Story", "Values", "Mission"],
        parameters: {
          aesthetic: "organic",
          composition: "environmental",
          mood: "inspiring"
        }
      },
      {
        id: "founder-story",
        name: "Founder Story",
        preview: "/placeholders/style-founder.jpg",
        whenToUse: "Humanizing brand, building trust. Personal narrative.",
        bestFitCategories: ["About", "Trust", "Authenticity"],
        parameters: {
          aesthetic: "authentic",
          composition: "portrait",
          mood: "warm"
        }
      },
      {
        id: "community-moment",
        name: "Community Moment",
        preview: "/placeholders/style-community.jpg",
        whenToUse: "User stories, brand community. Celebrates customers and culture.",
        bestFitCategories: ["Community", "Social", "Engagement"],
        parameters: {
          aesthetic: "playful",
          composition: "candid",
          mood: "joyful"
        }
      },
      {
        id: "impact-visual",
        name: "Impact Visual",
        preview: "/placeholders/style-impact.jpg",
        whenToUse: "Sustainability, social impact. Data-driven storytelling.",
        bestFitCategories: ["Impact", "Sustainability", "Data"],
        parameters: {
          aesthetic: "modern",
          composition: "infographic",
          mood: "purposeful"
        }
      },
    ]
  },
  {
    id: "campaign-poster",
    name: "Campaign and Poster",
    presets: [
      {
        id: "bold-typographic",
        name: "Bold Typographic",
        preview: "/placeholders/style-typographic.jpg",
        whenToUse: "Announcements, events. Strong message hierarchy.",
        bestFitCategories: ["Events", "Announcements", "Campaigns"],
        parameters: {
          aesthetic: "bold",
          composition: "typographic",
          mood: "powerful"
        }
      },
      {
        id: "seasonal-campaign",
        name: "Seasonal Campaign",
        preview: "/placeholders/style-seasonal.jpg",
        whenToUse: "Holiday campaigns, seasonal promotions. Timely relevance.",
        bestFitCategories: ["Seasonal", "Holiday", "Promotions"],
        parameters: {
          aesthetic: "playful",
          composition: "thematic",
          mood: "festive"
        }
      },
      {
        id: "art-direction",
        name: "Art Direction",
        preview: "/placeholders/style-art-direction.jpg",
        whenToUse: "Brand campaigns, high-concept visuals. Creative storytelling.",
        bestFitCategories: ["Brand", "Creative", "Storytelling"],
        parameters: {
          aesthetic: "editorial",
          composition: "conceptual",
          mood: "dramatic"
        }
      },
      {
        id: "minimalist-poster",
        name: "Minimalist Poster",
        preview: "/placeholders/style-minimalist-poster.jpg",
        whenToUse: "Modern brands, design-forward. Less is more approach.",
        bestFitCategories: ["Design", "Modern", "Tech"],
        parameters: {
          aesthetic: "minimal",
          composition: "geometric",
          mood: "refined"
        }
      },
    ]
  },
  {
    id: "marketplace",
    name: "Marketplace and Merchandising",
    presets: [
      {
        id: "catalog-grid",
        name: "Catalog Grid",
        preview: "/placeholders/style-catalog.jpg",
        whenToUse: "Product catalogs, collections. Consistent product presentation.",
        bestFitCategories: ["E-commerce", "Catalog", "Collections"],
        parameters: {
          aesthetic: "professional",
          composition: "grid",
          mood: "organized"
        }
      },
      {
        id: "comparison-shot",
        name: "Comparison Shot",
        preview: "/placeholders/style-comparison.jpg",
        whenToUse: "Product variations, before/after. Helps decision-making.",
        bestFitCategories: ["E-commerce", "Comparison", "Variants"],
        parameters: {
          aesthetic: "minimal",
          composition: "side-by-side",
          mood: "clear"
        }
      },
      {
        id: "packaging-shot",
        name: "Packaging Shot",
        preview: "/placeholders/style-packaging.jpg",
        whenToUse: "Unboxing, gifting. Shows product presentation and quality.",
        bestFitCategories: ["Packaging", "Gifting", "Premium"],
        parameters: {
          aesthetic: "luxury",
          composition: "centered",
          mood: "elegant"
        }
      },
      {
        id: "scale-context",
        name: "Scale & Context",
        preview: "/placeholders/style-scale.jpg",
        whenToUse: "Size understanding, spatial context. Reduces returns.",
        bestFitCategories: ["E-commerce", "Furniture", "Scale"],
        parameters: {
          aesthetic: "realistic",
          composition: "environmental",
          mood: "practical"
        }
      },
    ]
  },
]

export default function StylesPage() {
  const params = useParams()
  const router = useRouter()
  const studioId = params.studioId as string

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMood, setSelectedMood] = useState<string>("all")

  const handleApplyStyle = (preset: StylePreset) => {
    const params = new URLSearchParams()
    if (preset.parameters.aesthetic) params.set('aesthetic', preset.parameters.aesthetic)
    if (preset.parameters.composition) params.set('composition', preset.parameters.composition)
    if (preset.parameters.mood) params.set('mood', preset.parameters.mood)
    
    router.push(`/studios/${studioId}/generate?${params.toString()}`)
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Styles
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Pre-configured style presets for different use cases
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
        <div style={{ position: 'relative' }}>
          <button className="flex items-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
            <span>Category: All</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button className="flex items-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
            <span>Mood: All</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Style Families */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {styleFamilies.map((family) => (
          <div key={family.id}>
            <h2 className="text-heading" style={{ marginBottom: '24px' }}>
              {family.name}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {family.presets.map((preset) => (
                <StylePresetCard
                  key={preset.id}
                  name={preset.name}
                  preview={preset.preview}
                  whenToUse={preset.whenToUse}
                  bestFitCategories={preset.bestFitCategories}
                  onApply={() => handleApplyStyle(preset)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
