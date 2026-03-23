"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import StudioHeader from "@/components/studio/studio-header"
import { PromptComposer } from "@/components/studio/prompt-composer"
import { ParameterRail } from "@/components/studio/parameter-rail"
import { AssetHistory } from "@/components/studio/asset-history"
import { AESTHETICS } from "@/lib/aesthetics"

export default function StudioWorkspacePage() {
  const params = useParams()
  const studioId = params.studioId as string

  const [studio, setStudio] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [parameters, setParameters] = useState({
    outputType: '',
    aesthetic: '',
    aspectRatio: 'square',
    variants: 1,
    brandStrength: 'balanced',
    textPresence: 'minimal',
    composition: '',
    mood: '',
    artMovement: [] as string[],
    quality: 'standard',
    referenceImages: [] as string[],
    dalleStyle: 'vivid',
  })
  const [promptValue, setPromptValue] = useState('')

  useEffect(() => {
    fetchStudioData()
  }, [studioId])

  const fetchStudioData = async () => {
    try {
      const [studiosRes, profileRes] = await Promise.all([
        fetch('/api/studios'),
        fetch(`/api/studios/${studioId}/profile`)
      ])

      if (studiosRes.ok) {
        const studiosData = await studiosRes.json()
        const currentStudio = studiosData.studios?.find((s: any) => s.id === studioId)
        setStudio(currentStudio)
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
      }
    } catch (error) {
      console.error('Error fetching studio data:', error)
    }
  }

  const handleRemix = (asset: any) => {
    // Reuse exact settings from the asset
    if (asset.prompt) {
      setPromptValue(asset.prompt)
    }
    if (asset.parameters) {
      setParameters({ ...parameters, ...asset.parameters })
    }
    // Scroll to top to show prompt composer
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTryDifferentStyle = (asset: any) => {
    // Same prompt but cycle to a different aesthetic
    if (asset.prompt) {
      setPromptValue(asset.prompt)
    }
    
    const currentAesthetic = asset.parameters?.aesthetic || parameters.aesthetic
    const currentIndex = AESTHETICS.findIndex(a => a.id === currentAesthetic)
    const nextIndex = (currentIndex + 1) % AESTHETICS.length
    const nextAesthetic = AESTHETICS[nextIndex].id
    
    setParameters({ 
      ...parameters, 
      ...asset.parameters,
      aesthetic: nextAesthetic 
    })
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCopyPrompt = (prompt: string) => {
    setPromptValue(prompt)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Studio Header */}
      <div style={{ padding: '24px 24px 0 24px' }}>
        <StudioHeader studioId={studioId} studio={studio} profile={profile} />
      </div>

      {/* Main workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Prompt composer */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <PromptComposer 
              studioId={studioId} 
              parameters={parameters} 
              onParametersChange={setParameters}
              initialPrompt={promptValue}
            />
          </div>

          {/* Asset history */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <AssetHistory 
              studioId={studioId}
              onRemix={handleRemix}
              onTryDifferentStyle={handleTryDifferentStyle}
              onCopyPrompt={handleCopyPrompt}
            />
          </div>
        </div>

        {/* Parameter rail */}
        <div style={{ 
          width: '320px', 
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'auto',
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
        }}>
          <ParameterRail studioId={studioId} parameters={parameters} onChange={setParameters} />
        </div>
      </div>
    </div>
  )
}
