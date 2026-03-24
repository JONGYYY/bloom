"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import ContextStrip from "@/components/studio/context-strip"
import Suggestions from "@/components/studio/suggestions"
import { AssetHistory } from "@/components/studio/asset-history"
import ConceptTabs, { ConceptTab } from "@/components/studio/concept-tabs"
import ConceptSelector, { ConceptTemplate } from "@/components/studio/concept-selector"
import { Image as ImageIcon, Sliders, Loader2, Sparkles, ChevronDown, Lightbulb } from "lucide-react"

export default function GeneratePage() {
  const params = useParams()
  const studioId = params.studioId as string

  const [studio, setStudio] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  
  // Tab state
  const [tabs, setTabs] = useState<ConceptTab[]>([
    {
      id: '1',
      name: 'New Concept',
      icon: '✨',
      prompt: '',
      parameters: {
        aspectRatio: '1:1',
        quality: 'draft',
        variants: 2,
        referenceImages: []
      }
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [showConceptSelector, setShowConceptSelector] = useState(false)
  
  // Current tab data (derived from active tab)
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]
  const [prompt, setPrompt] = useState(activeTab.prompt)
  const [aspectRatio, setAspectRatio] = useState(activeTab.parameters.aspectRatio)
  const [quality, setQuality] = useState(activeTab.parameters.quality)
  const [variants, setVariants] = useState(activeTab.parameters.variants)
  const [referenceImages, setReferenceImages] = useState<string[]>(activeTab.parameters.referenceImages)
  
  const [imageAssistEnabled, setImageAssistEnabled] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetchStudioData()
  }, [studioId])

  // Sync local state with active tab
  useEffect(() => {
    if (activeTab) {
      setPrompt(activeTab.prompt)
      setAspectRatio(activeTab.parameters.aspectRatio)
      setQuality(activeTab.parameters.quality)
      setVariants(activeTab.parameters.variants)
      setReferenceImages(activeTab.parameters.referenceImages)
    }
  }, [activeTabId])

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

  // Update active tab when local state changes
  const updateActiveTab = () => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              prompt,
              parameters: { aspectRatio, quality, variants, referenceImages }
            }
          : tab
      )
    )
  }

  useEffect(() => {
    updateActiveTab()
  }, [prompt, aspectRatio, quality, variants, referenceImages])

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return
    
    const tabIndex = tabs.findIndex(t => t.id === tabId)
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
    }
  }

  const handleNewTab = () => {
    setShowConceptSelector(true)
  }

  const handleSelectTemplate = (template: ConceptTemplate) => {
    const newTab: ConceptTab = {
      id: Date.now().toString(),
      name: template.name,
      icon: template.icon,
      prompt: template.prompt,
      parameters: {
        aspectRatio: template.parameters?.aspectRatio || '1:1',
        quality: template.parameters?.quality || 'draft',
        variants: 2,
        referenceImages: []
      }
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
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
    setShowSuggestions(false)
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
        {/* Concept Tabs */}
        <ConceptTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />

        {/* Prompt Composer */}
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-6" style={{ marginBottom: '48px' }}>
          {/* Top row: Image Assist toggle and AI Assist button */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            {/* Image Assist toggle */}
            <button
              onClick={() => setImageAssistEnabled(!imageAssistEnabled)}
              className={`flex items-center gap-2 h-9 px-3 rounded-lg text-label font-medium transition-all duration-150 ${
                imageAssistEnabled
                  ? 'bg-ivy-600 text-white'
                  : 'bg-surface-2 border border-border-medium text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image Assist</span>
            </button>

            {/* AI Assist button */}
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 h-9 px-3 bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary rounded-lg transition-all duration-150"
              title="Get AI suggestions"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-label">Suggestions</span>
            </button>
          </div>

          {/* Prompt field */}
          <div style={{ marginBottom: '16px' }}>
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
              {/* Aspect Ratio Dropdown */}
              <div className="relative">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150 appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: 'none',
                    minWidth: '100px'
                  }}
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="4:5">4:5 Portrait</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Story</option>
                  <option value="2:3">2:3 Tall</option>
                </select>
                <ChevronDown 
                  className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" 
                />
              </div>

              {/* Quality Dropdown */}
              <div className="relative">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150 appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: 'none',
                    minWidth: '100px'
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                </select>
                <ChevronDown 
                  className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" 
                />
              </div>

              {/* Variants Selector (keep as segmented control) */}
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

        {/* Suggestions (conditional) */}
        {showSuggestions && (
          <Suggestions 
            studioId={studioId}
            studioName={studio?.displayName || "Studio"}
            onApplySuggestion={handleApplySuggestion}
          />
        )}

        {/* Concept Selector Modal */}
        <ConceptSelector
          isOpen={showConceptSelector}
          onClose={() => setShowConceptSelector(false)}
          onSelectTemplate={handleSelectTemplate}
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
