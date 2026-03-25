"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import IdentitySection from "@/components/brand-kit/identity-section"
import DesignLanguageSection from "@/components/brand-kit/design-language-section"
import AssetsGallery from "@/components/brand-kit/assets-gallery"
import TemplatesSection from "@/components/brand-kit/templates-section"
import TraitsSection from "@/components/brand-kit/traits-section"
import CapturesSection from "@/components/brand-kit/captures-section"
import ReferencesSection from "@/components/brand-kit/references-section"
import { Loader2 } from "lucide-react"

interface ColorGroup {
  role: "primary" | "secondary" | "accent"
  colors: string[]
}

interface Font {
  family: string
  weight: string
}

interface BrandAsset {
  id: string
  type: string
  storageKey: string
  sourceUrl?: string
  metadata?: any
}

interface Capture {
  id: string
  url: string
  capturedAt: string
}

interface Reference {
  id: string
  url: string
  tags?: string[]
}

export default function BrandKitPage() {
  const params = useParams()
  const studioId = params.studioId as string

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [logo, setLogo] = useState<string | undefined>(undefined)
  const [brandName, setBrandName] = useState<string | undefined>(undefined)
  const [tagline, setTagline] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([
    { role: "primary", colors: [] },
    { role: "secondary", colors: [] },
    { role: "accent", colors: [] },
  ])
  const [headingFont, setHeadingFont] = useState<Font>({ family: "Inter", weight: "600" })
  const [bodyFont, setBodyFont] = useState<Font>({ family: "Inter", weight: "400" })
  const [toneKeywords, setToneKeywords] = useState<string[]>([])
  const [aestheticDesc, setAestheticDesc] = useState<string | undefined>(undefined)
  const [traits, setTraits] = useState<string[]>([])
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([])
  const [captures, setCaptures] = useState<Capture[]>([])
  const [references, setReferences] = useState<Reference[]>([])

  useEffect(() => {
    fetchProfile()
    fetchBrandAssets()
  }, [studioId])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/studios/${studioId}/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        
        if (data.profile) {
          // Brand identity
          setBrandName(data.profile.brandName || undefined)
          setTagline(data.profile.tagline || undefined)
          setDescription(data.profile.description || undefined)
          setAestheticDesc(data.profile.aestheticDesc || undefined)
          setToneKeywords(data.profile.toneKeywords || [])
          
          // Logo
          if (data.profile.logos?.candidates && data.profile.logos.candidates.length > 0) {
            const primaryLogo = data.profile.logos.candidates[0]
            if (primaryLogo.url) {
              setLogo(primaryLogo.url)
            }
          }
          
          // Colors
          if (data.profile.colors) {
            setColorGroups([
              { role: "primary", colors: data.profile.colors.primary || [] },
              { role: "secondary", colors: data.profile.colors.secondary || [] },
              { role: "accent", colors: data.profile.colors.accent || [] },
            ])
          }
          
          // Fonts
          if (data.profile.fonts) {
            setHeadingFont({
              family: data.profile.fonts.heading?.family || "Inter",
              weight: data.profile.fonts.heading?.weight || "600"
            })
            setBodyFont({
              family: data.profile.fonts.body?.family || "Inter",
              weight: data.profile.fonts.body?.weight || "400"
            })
          }
          
          // Traits
          if (data.profile.styleTraits) {
            setTraits(data.profile.styleTraits)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBrandAssets = async () => {
    try {
      const response = await fetch(`/api/studios/${studioId}/assets`)
      if (response.ok) {
        const data = await response.json()
        setBrandAssets(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching brand assets:', error)
    }
  }

  const calculateCompleteness = () => {
    let total = 0
    let completed = 0

    // Brand identity (30%)
    if (brandName) completed += 10
    total += 10
    if (logo) completed += 10
    total += 10
    if (description || tagline) completed += 10
    total += 10

    // Colors (15%)
    if (colorGroups.some(g => g.colors.length > 0)) completed += 15
    total += 15

    // Typography (15%)
    if (headingFont.family && bodyFont.family) completed += 15
    total += 15

    // Tone & Aesthetic (15%)
    if (toneKeywords.length > 0 || aestheticDesc) completed += 15
    total += 15

    // Visual Assets (15%)
    if (brandAssets.length > 0) completed += 15
    total += 15

    // Other (10%)
    if (traits.length > 0) completed += 5
    total += 5
    if (captures.length > 0 || references.length > 0) completed += 5
    total += 5

    return Math.round((completed / total) * 100)
  }

  const completeness = calculateCompleteness()

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ 
            color: 'var(--color-ivy-500)',
            margin: '0 auto 16px'
          }} />
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Loading brand kit...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', padding: '48px' }}>
      {/* Page Header with Completeness */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Brand Kit
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            flex: 1,
            height: '8px',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completeness}%`,
              height: '100%',
              background: 'var(--color-ivy-500)',
              transition: 'width 300ms ease'
            }} />
          </div>
          <span className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
            {completeness}% complete
          </span>
        </div>
      </div>

      {/* Sections */}
      <IdentitySection
        logo={logo}
        brandName={brandName}
        tagline={tagline}
        description={description}
      />

      <DesignLanguageSection
        colorGroups={colorGroups}
        headingFont={headingFont}
        bodyFont={bodyFont}
        toneKeywords={toneKeywords}
        aestheticDescription={aestheticDesc}
        onAddColor={(role) => console.log('Add color', role)}
        onRemoveColor={(role, color) => {
          setColorGroups(colorGroups.map(g => 
            g.role === role 
              ? { ...g, colors: g.colors.filter(c => c !== color) }
              : g
          ))
        }}
      />

      <AssetsGallery
        assets={brandAssets}
        onSelectAsset={(asset) => console.log('Selected asset', asset)}
      />

      <TemplatesSection studioId={studioId} />

      <TraitsSection
        traits={traits}
        onAddTrait={() => console.log('Add trait')}
        onRemoveTrait={(trait) => setTraits(traits.filter(t => t !== trait))}
      />

      <CapturesSection
        captures={captures}
        onViewCapture={(capture) => console.log('View capture', capture)}
      />

      <ReferencesSection
        references={references}
        onAddReference={() => console.log('Add reference')}
        onRemoveReference={(id) => setReferences(references.filter(r => r.id !== id))}
      />
    </div>
  )
}
