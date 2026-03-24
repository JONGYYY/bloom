"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import IdeaCard from "@/components/studio/idea-card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Idea {
  title: string
  channel: string
  outputType: string
  whyItWorks: string
  prompt: string
}

const marketingCategories = [
  {
    id: "launch",
    name: "Launch",
    ideas: [
      {
        title: "Product Announcement Hero",
        channel: "Website",
        outputType: "Hero Banner",
        whyItWorks: "First impression for new product launches. High-impact visual that communicates innovation and brand quality.",
        prompt: "Create a hero banner announcing our new product launch"
      },
      {
        title: "Launch Email Header",
        channel: "Email",
        outputType: "Email Header",
        whyItWorks: "Drives opens and sets tone for launch campaign. Needs to work at small sizes while maintaining impact.",
        prompt: "Design an email header for our product launch announcement"
      },
      {
        title: "Social Launch Teaser",
        channel: "Social Media",
        outputType: "Social Post",
        whyItWorks: "Builds anticipation before launch. Creates shareable moment that extends reach organically.",
        prompt: "Create a teaser post for our upcoming product launch"
      },
    ]
  },
  {
    id: "acquisition",
    name: "Acquisition",
    ideas: [
      {
        title: "Paid Social Ad",
        channel: "Meta Ads",
        outputType: "Social Ad",
        whyItWorks: "Stops scroll with strong visual hook. Optimized for feed placement and mobile viewing.",
        prompt: "Design a paid social ad that highlights our key product benefit"
      },
      {
        title: "Display Banner",
        channel: "Display Network",
        outputType: "Banner Ad",
        whyItWorks: "Works across placements. Clear value prop visible at multiple sizes.",
        prompt: "Create a display banner ad showcasing our product"
      },
      {
        title: "Landing Page Hero",
        channel: "Website",
        outputType: "Hero Banner",
        whyItWorks: "Converts traffic from ads. Reinforces message continuity from ad to landing page.",
        prompt: "Design a landing page hero that matches our ad campaign"
      },
    ]
  },
  {
    id: "conversion",
    name: "Conversion",
    ideas: [
      {
        title: "Product Feature Highlight",
        channel: "Website",
        outputType: "Feature Card",
        whyItWorks: "Demonstrates value clearly. Helps users understand why they should convert.",
        prompt: "Create a feature highlight showing our product's key benefit"
      },
      {
        title: "Testimonial Card",
        channel: "Website",
        outputType: "Quote Card",
        whyItWorks: "Social proof at decision point. Builds trust with real customer stories.",
        prompt: "Design a testimonial card with customer quote and photo"
      },
      {
        title: "Limited Offer Banner",
        channel: "Website",
        outputType: "Promotional Banner",
        whyItWorks: "Creates urgency. Drives immediate action with time-sensitive offer.",
        prompt: "Create a limited-time offer banner with countdown urgency"
      },
    ]
  },
  {
    id: "retention",
    name: "Retention",
    ideas: [
      {
        title: "Feature Update Announcement",
        channel: "Email",
        outputType: "Email Banner",
        whyItWorks: "Re-engages existing users. Shows product evolution and continued value.",
        prompt: "Design an email banner announcing our new feature update"
      },
      {
        title: "Tips & Tricks Card",
        channel: "Email",
        outputType: "Content Card",
        whyItWorks: "Increases product adoption. Helps users get more value from existing features.",
        prompt: "Create a tips card showing how to use our product better"
      },
      {
        title: "Milestone Celebration",
        channel: "Email",
        outputType: "Celebration Card",
        whyItWorks: "Strengthens emotional connection. Celebrates user achievements and loyalty.",
        prompt: "Design a milestone celebration card for user anniversary"
      },
    ]
  },
  {
    id: "organic",
    name: "Organic Content",
    ideas: [
      {
        title: "Behind the Scenes",
        channel: "Instagram",
        outputType: "Story",
        whyItWorks: "Humanizes brand. Builds authentic connection through process transparency.",
        prompt: "Create a behind-the-scenes story showing our team at work"
      },
      {
        title: "Educational Carousel",
        channel: "LinkedIn",
        outputType: "Carousel Post",
        whyItWorks: "Positions as thought leader. Provides value while building authority.",
        prompt: "Design an educational carousel explaining industry insights"
      },
      {
        title: "User-Generated Content Frame",
        channel: "Instagram",
        outputType: "Story Template",
        whyItWorks: "Encourages community participation. Amplifies reach through user sharing.",
        prompt: "Create a branded frame template for user-generated content"
      },
    ]
  },
  {
    id: "seasonal",
    name: "Seasonal / Campaign",
    ideas: [
      {
        title: "Holiday Campaign Hero",
        channel: "Website",
        outputType: "Hero Banner",
        whyItWorks: "Capitalizes on seasonal demand. Creates timely relevance and urgency.",
        prompt: "Design a holiday campaign hero banner with seasonal theme"
      },
      {
        title: "Event Promotion Poster",
        channel: "Social Media",
        outputType: "Event Poster",
        whyItWorks: "Drives event awareness. Clear date, time, and value prop for attendance.",
        prompt: "Create an event promotion poster with key details"
      },
      {
        title: "Seasonal Sale Badge",
        channel: "Website",
        outputType: "Badge",
        whyItWorks: "Highlights limited-time offer. Adds visual emphasis to seasonal pricing.",
        prompt: "Design a seasonal sale badge for product pages"
      },
    ]
  },
  {
    id: "merchandising",
    name: "Merchandising / Catalog",
    ideas: [
      {
        title: "Product Hero Shot",
        channel: "E-commerce",
        outputType: "Product Image",
        whyItWorks: "Primary decision driver. Shows product in best light with consistent styling.",
        prompt: "Create a hero product shot with clean background"
      },
      {
        title: "Lifestyle Context Shot",
        channel: "E-commerce",
        outputType: "Lifestyle Image",
        whyItWorks: "Helps customers envision use. Shows product in real-world context.",
        prompt: "Design a lifestyle shot showing product in use"
      },
      {
        title: "Size Comparison Visual",
        channel: "E-commerce",
        outputType: "Comparison Image",
        whyItWorks: "Reduces returns. Helps customers understand scale and fit.",
        prompt: "Create a size comparison visual for product dimensions"
      },
    ]
  },
  {
    id: "brand-story",
    name: "Brand Story",
    ideas: [
      {
        title: "Mission Statement Visual",
        channel: "Website",
        outputType: "Hero Banner",
        whyItWorks: "Communicates purpose. Connects emotionally with brand values.",
        prompt: "Design a mission statement visual for our about page"
      },
      {
        title: "Founder Story Card",
        channel: "Website",
        outputType: "Story Card",
        whyItWorks: "Builds trust through authenticity. Humanizes brand with personal narrative.",
        prompt: "Create a founder story card with photo and quote"
      },
      {
        title: "Impact Report Visual",
        channel: "Website",
        outputType: "Infographic",
        whyItWorks: "Demonstrates values in action. Shows measurable commitment to mission.",
        prompt: "Design an impact report visual with key metrics"
      },
    ]
  },
]

export default function IdeasPage() {
  const params = useParams()
  const router = useRouter()
  const studioId = params.studioId as string

  const [studio, setStudio] = useState<any>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchStudioData()
  }, [studioId])

  const fetchStudioData = async () => {
    try {
      const response = await fetch('/api/studios')
      if (response.ok) {
        const data = await response.json()
        const currentStudio = data.studios?.find((s: any) => s.id === studioId)
        setStudio(currentStudio)
      }
    } catch (error) {
      console.error('Error fetching studio data:', error)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleUseInGenerate = (prompt: string) => {
    router.push(`/studios/${studioId}/generate?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Ideas
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          What should {studio?.displayName || 'your brand'} make next?
        </p>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {marketingCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          const visibleIdeas = isExpanded ? category.ideas : category.ideas.slice(0, 3)
          const hasMore = category.ideas.length > 3

          return (
            <div key={category.id}>
              {/* Category Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h2 className="text-heading">{category.name}</h2>
                {hasMore && (
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-1 text-label text-ivy hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        Show less
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show all ({category.ideas.length})
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Ideas Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {visibleIdeas.map((idea, idx) => (
                  <IdeaCard
                    key={idx}
                    title={idea.title}
                    channel={idea.channel}
                    outputType={idea.outputType}
                    whyItWorks={idea.whyItWorks}
                    onUseInGenerate={() => handleUseInGenerate(idea.prompt)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
