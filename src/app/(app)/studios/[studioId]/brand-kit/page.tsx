"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import LogoSection from "@/components/brand-kit/logo-section"
import ColorSection from "@/components/brand-kit/color-section"
import TypographySection from "@/components/brand-kit/typography-section"
import TraitsSection from "@/components/brand-kit/traits-section"
import CapturesSection from "@/components/brand-kit/captures-section"
import ReferencesSection from "@/components/brand-kit/references-section"
import { Loader2 } from "lucide-react"

interface Logo {
  id: string
  url: string
  type: "primary" | "secondary" | "icon"
}

interface ColorGroup {
  role: "primary" | "secondary" | "accent"
  colors: string[]
}

interface Font {
  family: string
  weight: string
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
  const [logos, setLogos] = useState<Logo[]>([])
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([
    { role: "primary", colors: [] },
    { role: "secondary", colors: [] },
    { role: "accent", colors: [] },
  ])
  const [headingFont, setHeadingFont] = useState<Font>({ family: "Inter", weight: "600" })
  const [bodyFont, setBodyFont] = useState<Font>({ family: "Inter", weight: "400" })
  const [traits, setTraits] = useState<string[]>([])
  const [captures, setCaptures] = useState<Capture[]>([])
  const [references, setReferences] = useState<Reference[]>([])

  useEffect(() => {
    fetchProfile()
  }, [studioId])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/studios/${studioId}/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        
        if (data.profile) {
          if (data.profile.logos?.primary) {
            setLogos([{ id: '1', url: data.profile.logos.primary.url, type: 'primary' }])
          }
          
          if (data.profile.colors) {
            setColorGroups([
              { role: "primary", colors: data.profile.colors.primary || [] },
              { role: "secondary", colors: data.profile.colors.secondary || [] },
              { role: "accent", colors: data.profile.colors.accent || [] },
            ])
          }
          
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

  const calculateCompleteness = () => {
    let total = 0
    let completed = 0

    if (logos.length > 0) completed += 20
    total += 20

    if (colorGroups.some(g => g.colors.length > 0)) completed += 20
    total += 20

    if (headingFont.family && bodyFont.family) completed += 15
    total += 15

    if (traits.length > 0) completed += 15
    total += 15

    if (captures.length > 0) completed += 15
    total += 15

    if (references.length > 0) completed += 15
    total += 15

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
      <LogoSection
        logos={logos}
        onAddLogo={() => console.log('Add logo')}
        onRemoveLogo={(id) => setLogos(logos.filter(l => l.id !== id))}
      />

      <ColorSection
        colorGroups={colorGroups}
        onAddColor={(role) => console.log('Add color', role)}
        onRemoveColor={(role, color) => {
          setColorGroups(colorGroups.map(g => 
            g.role === role 
              ? { ...g, colors: g.colors.filter(c => c !== color) }
              : g
          ))
        }}
      />

      <TypographySection
        headingFont={headingFont}
        bodyFont={bodyFont}
        onEdit={() => console.log('Edit typography')}
      />

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
