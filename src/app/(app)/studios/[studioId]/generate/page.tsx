"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import ContextStrip from "@/components/studio/context-strip"
import Suggestions from "@/components/studio/suggestions"
import { AssetHistory } from "@/components/studio/asset-history"
import { Image as ImageIcon, Sliders, Loader2, Sparkles } from "lucide-react"

export default function GeneratePage() {
  const params = useParams()
  const studioId = params.studioId as string

  const [studio, setStudio] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [quality, setQuality] = useState("draft")
  const [variants, setVariants] = useState(2)
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/studios/${studioId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          parameters: {
            aspectRatio,
            quality,
            variants,
            referenceImages,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start generation")
      }

      setPrompt("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplySuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  const brandKitStatus = profile ? "complete" : "incomplete"

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Context Strip */}
      <div style={{ padding: '24px 48px' }} className="px-6 md:px-12">
        <ContextStrip
          studioId={studioId}
          studioName={studio?.displayName || "Studio"}
          domain={studio?.rootDomain || ""}
          logo={profile?.logos?.primary?.url}
          brandKitStatus={brandKitStatus}
        />
      </div>

      {/* Main Content - Centered */}
      <div style={{ 
        maxWidth: '896px', 
        margin: '0 auto', 
        padding: '0 48px 48px',
        width: '100%'
      }} className="px-6 md:px-12">
        {/* Prompt Composer */}
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-6" style={{ marginBottom: '48px' }}>
          {/* Prompt field */}
          <div style={{ marginBottom: '16px' }}>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
              What would you like to create?
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-canvas border border-border-medium rounded-lg p-4 text-body text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 focus-visible:border-ivy-500 transition-all duration-150"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Describe the visual you need..."
            />
            <p className="text-caption" style={{ color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
              Be specific about style, mood, and purpose for best results.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ 
              padding: '12px', 
              background: 'rgba(212, 122, 122, 0.1)', 
              border: '1px solid rgba(212, 122, 122, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px'
            }}>
              <p className="text-label" style={{ color: 'var(--color-danger-500)' }}>
                {error}
              </p>
            </div>
          )}
          
          {/* Footer controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pt-4 border-t border-border-subtle gap-3">
            {/* Left: Secondary controls */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Reference Images Button */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 h-10 px-3 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150 whitespace-nowrap"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">References</span>
              </button>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1">
                {["1:1", "4:5", "16:9"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 md:px-3 h-8 rounded text-caption font-medium transition-all duration-150 ${
                      aspectRatio === ratio
                        ? "bg-ivy-600 text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Quality Selector */}
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1">
                <button
                  onClick={() => setQuality("draft")}
                  className={`px-2 md:px-3 h-8 rounded text-caption font-medium transition-all duration-150 whitespace-nowrap ${
                    quality === "draft"
                      ? "bg-ivy-600 text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setQuality("final")}
                  className={`px-2 md:px-3 h-8 rounded text-caption font-medium transition-all duration-150 whitespace-nowrap ${
                    quality === "final"
                      ? "bg-ivy-600 text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Final
                </button>
              </div>

              {/* Variants Selector */}
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1">
                {[1, 2, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setVariants(num)}
                    className={`px-3 h-8 rounded text-caption font-medium transition-all duration-150 ${
                      variants === num
                        ? "bg-ivy-600 text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Right: Primary action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="hidden md:flex items-center gap-2 h-10 px-4 text-text-secondary rounded-lg text-label hover:bg-surface-2 hover:text-text-primary transition-all duration-150"
              >
                <Sliders className="w-4 h-4" />
                More options
              </button>
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <Suggestions 
          studioId={studioId}
          studioName={studio?.displayName || "Studio"}
          onApplySuggestion={handleApplySuggestion}
        />

        {/* Results / Generation History */}
        <div style={{ marginTop: '48px' }}>
          <h2 className="text-heading" style={{ marginBottom: '24px' }}>
            Recent Generations
          </h2>
          <AssetHistory 
            studioId={studioId}
            onRemix={(asset) => {
              setPrompt(asset.prompt || "")
              if (asset.parameters) {
                setAspectRatio(asset.parameters.aspectRatio || "1:1")
                setQuality(asset.parameters.quality || "draft")
                setVariants(asset.parameters.variants || 2)
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onTryDifferentStyle={(asset) => {
              setPrompt(asset.prompt || "")
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onCopyPrompt={(prompt) => {
              setPrompt(prompt)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      </div>
    </div>
  )
}
