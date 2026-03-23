"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { PromptComposer } from "@/components/studio/prompt-composer"
import { ParameterRail } from "@/components/studio/parameter-rail"
import { AssetHistory } from "@/components/studio/asset-history"

export default function StudioWorkspacePage() {
  const params = useParams()
  const studioId = params.studioId as string

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
  })

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Prompt composer */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <PromptComposer studioId={studioId} parameters={parameters} />
        </div>

        {/* Asset history */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <AssetHistory studioId={studioId} />
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
  )
}
