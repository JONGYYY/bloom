"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Lightbulb, Settings as SettingsIcon, ChevronDown } from "lucide-react"
import OutputTypeSelector from "./output-type-selector"
import ArtMovementSelector from "./art-movement-selector"
import ReferenceUploader from "./reference-uploader"
import AdvancedSettings from "./advanced-settings"
import TemplateSelector from "./template-selector"
import { AESTHETICS, ASPECT_RATIOS, QUALITY_LEVELS } from "@/lib/aesthetics"
import { OUTPUT_TYPES } from "@/lib/output-types"
import type { PromptTemplate } from "@/lib/templates"

interface PromptComposerProps {
  studioId: string
  parameters: any
  onParametersChange?: (parameters: any) => void
  initialPrompt?: string
}

export function PromptComposer({ studioId, parameters, onParametersChange, initialPrompt }: PromptComposerProps) {
  const [prompt, setPrompt] = useState(initialPrompt || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReferences, setShowReferences] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showBatchMenu, setShowBatchMenu] = useState(false)
  const batchMenuRef = useRef<HTMLDivElement>(null)
  
  // Local parameter state
  const [localParams, setLocalParams] = useState(parameters)

  // Update prompt when initialPrompt changes
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt)
    }
  }, [initialPrompt])

  // Update local params when parameters change
  useEffect(() => {
    setLocalParams(parameters)
  }, [parameters])

  // Close batch menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (batchMenuRef.current && !batchMenuRef.current.contains(event.target as Node)) {
        setShowBatchMenu(false)
      }
    }

    if (showBatchMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBatchMenu])

  const updateParam = (key: string, value: any) => {
    const updated = { ...localParams, [key]: value }
    setLocalParams(updated)
    onParametersChange?.(updated)
  }

  const handleGenerate = async (batchVariants?: number) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setError(null)
    setShowBatchMenu(false)

    const variantsToGenerate = batchVariants || localParams.variants

    try {
      const response = await fetch(`/api/studios/${studioId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          parameters: { ...localParams, variants: variantsToGenerate },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start generation")
      }

      const result = await response.json()
      console.log("Generation started:", result.generationId)
      
      // Clear prompt after successful generation
      setPrompt("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const getCostEstimate = (variants: number) => {
    // DALL-E 3 pricing: $0.04 per standard image, $0.08 per HD image
    const pricePerImage = localParams.quality === 'hd' ? 0.08 : 0.04
    return (variants * pricePerImage).toFixed(2)
  }

  const handleSuggest = async () => {
    setIsLoadingSuggestions(true)
    setError(null)

    try {
      const response = await fetch(`/api/studios/${studioId}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outputType: localParams.outputType,
          currentPrompt: prompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions")
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const applySuggestion = (suggestion: string) => {
    setPrompt(suggestion)
    setSuggestions([])
  }

  const applyTemplate = (template: PromptTemplate) => {
    setPrompt(template.prompt)
    
    // Apply suggested parameters if available
    if (template.suggestedOutputType) {
      updateParam('outputType', template.suggestedOutputType)
    }
    if (template.suggestedAesthetic) {
      updateParam('aesthetic', template.suggestedAesthetic)
    }
    if (template.suggestedAspectRatio) {
      updateParam('aspectRatio', template.suggestedAspectRatio)
    }
  }

  // Smart defaults: detect keywords and suggest parameters
  useEffect(() => {
    if (!prompt.trim()) return

    const lowerPrompt = prompt.toLowerCase()

    // Detect output type keywords
    const allOutputTypes = Object.values(OUTPUT_TYPES).flat()
    for (const outputType of allOutputTypes) {
      const keywords = [
        outputType.label.toLowerCase(),
        outputType.id.toLowerCase(),
        ...outputType.description?.toLowerCase().split(' ') || []
      ]
      
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        if (localParams.outputType !== outputType.id) {
          updateParam('outputType', outputType.id)
          
          // Auto-adjust aspect ratio based on output type
          if (outputType.aspectRatio && localParams.aspectRatio !== outputType.aspectRatio) {
            updateParam('aspectRatio', outputType.aspectRatio)
          }
        }
        break
      }
    }

    // Detect aesthetic keywords
    const aestheticKeywords: Record<string, string[]> = {
      minimal: ['minimal', 'minimalist', 'simple', 'clean', 'whitespace'],
      luxury: ['luxury', 'luxurious', 'premium', 'elegant', 'sophisticated'],
      bold: ['bold', 'strong', 'vibrant', 'powerful', 'striking'],
      playful: ['playful', 'fun', 'energetic', 'vibrant', 'colorful'],
      professional: ['professional', 'corporate', 'business', 'formal'],
      modern: ['modern', 'contemporary', 'sleek', 'cutting-edge'],
      organic: ['organic', 'natural', 'earthy', 'warm'],
      vintage: ['vintage', 'retro', 'classic', 'nostalgic'],
    }

    for (const [aesthetic, keywords] of Object.entries(aestheticKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        if (!localParams.aesthetic || localParams.aesthetic === '') {
          updateParam('aesthetic', aesthetic)
        }
        break
      }
    }

    // Detect aspect ratio keywords
    if ((lowerPrompt.includes('story') || lowerPrompt.includes('vertical') || lowerPrompt.includes('portrait')) 
        && localParams.aspectRatio === 'square') {
      updateParam('aspectRatio', 'portrait')
    } else if ((lowerPrompt.includes('banner') || lowerPrompt.includes('horizontal') || lowerPrompt.includes('landscape'))
        && localParams.aspectRatio === 'square') {
      updateParam('aspectRatio', 'landscape')
    }
  }, [prompt])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Quick Controls - Above Input */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <OutputTypeSelector 
          value={localParams.outputType} 
          onChange={(value) => updateParam('outputType', value)} 
        />
        
        {/* Aesthetic Selector */}
        <select
          value={localParams.aesthetic}
          onChange={(e) => updateParam('aesthetic', e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(30, 35, 48, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#F3F7FF',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            minWidth: '140px'
          }}
        >
          <option value="">✨ Aesthetic</option>
          {AESTHETICS.map(aesthetic => (
            <option key={aesthetic.id} value={aesthetic.id}>
              {aesthetic.label}
            </option>
          ))}
        </select>

        <ArtMovementSelector
          value={localParams.artMovement || []}
          onChange={(value) => updateParam('artMovement', value)}
        />
      </div>

      {/* Text Input */}
      <div style={{ marginBottom: '16px' }}>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to create..."
          disabled={isGenerating}
          rows={4}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(15, 18, 25, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#F3F7FF',
            fontSize: '16px',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#A8B5CC' }}>
            {prompt.length} characters
          </span>
          <span style={{ fontSize: '12px', color: '#A8B5CC' }}>
            Press ⌘+Enter to generate
          </span>
        </div>
      </div>

      {/* Secondary Controls - Below Input */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Aspect Ratio */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(30, 35, 48, 0.5)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {ASPECT_RATIOS.slice(0, 3).map(ratio => (
            <button
              key={ratio.id}
              onClick={() => updateParam('aspectRatio', ratio.id)}
              style={{
                padding: '8px 12px',
                background: localParams.aspectRatio === ratio.id ? 'rgba(122, 108, 255, 0.3)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: '#F3F7FF',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {ratio.label}
            </button>
          ))}
        </div>

        {/* Quality */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(30, 35, 48, 0.5)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {QUALITY_LEVELS.map(quality => (
            <button
              key={quality.id}
              onClick={() => updateParam('quality', quality.id)}
              style={{
                padding: '8px 12px',
                background: localParams.quality === quality.id ? 'rgba(122, 108, 255, 0.3)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: '#F3F7FF',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {quality.label}
            </button>
          ))}
        </div>

        {/* Variants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(30, 35, 48, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span style={{ fontSize: '13px', color: '#A8B5CC' }}>Variants:</span>
          <input
            type="number"
            min="1"
            max="4"
            value={localParams.variants}
            onChange={(e) => updateParam('variants', parseInt(e.target.value) || 1)}
            style={{
              width: '50px',
              padding: '4px 8px',
              background: 'rgba(15, 18, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#F3F7FF',
              fontSize: '13px',
              textAlign: 'center'
            }}
          />
        </div>

        {/* Reference Images Button */}
        <button
          onClick={() => setShowReferences(!showReferences)}
          style={{
            padding: '8px 12px',
            background: 'rgba(30, 35, 48, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#F3F7FF',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🖼️ References {localParams.referenceImages?.length > 0 && `(${localParams.referenceImages.length})`}
        </button>
      </div>

      {/* Reference Images Upload (Collapsible) */}
      {showReferences && (
        <div style={{ marginBottom: '16px' }}>
          <ReferenceUploader
            studioId={studioId}
            value={localParams.referenceImages || []}
            onChange={(value) => updateParam('referenceImages', value)}
          />
        </div>
      )}

      {/* Advanced Settings (Collapsible) */}
      <AdvancedSettings
        parameters={localParams}
        onChange={updateParam}
        isOpen={showAdvanced}
        onToggle={() => setShowAdvanced(!showAdvanced)}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#A8B5CC', marginBottom: '8px' }}>
            💡 Suggestions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => applySuggestion(suggestion)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(30, 35, 48, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#F3F7FF',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(122, 108, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.background = 'rgba(30, 35, 48, 0.5)'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          background: 'rgba(255, 107, 107, 0.1)', 
          border: '1px solid rgba(255, 107, 107, 0.2)', 
          color: '#FF6B6B', 
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Generate button with dropdown */}
        <div style={{ flex: 1, position: 'relative' }} ref={batchMenuRef}>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              style={{
                flex: 1,
                height: '48px',
                padding: '0 24px',
                background: isGenerating || !prompt.trim() ? 'rgba(122, 108, 255, 0.5)' : '#7A6CFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px 0 0 8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles style={{ width: '20px', height: '20px' }} />
              {isGenerating ? "Generating..." : "Generate"}
            </button>
            <button
              onClick={() => setShowBatchMenu(!showBatchMenu)}
              disabled={isGenerating || !prompt.trim()}
              style={{
                width: '48px',
                height: '48px',
                background: isGenerating || !prompt.trim() ? 'rgba(122, 108, 255, 0.5)' : '#7A6CFF',
                color: 'white',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronDown style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Batch menu dropdown */}
          {showBatchMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(15, 18, 25, 0.98)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              {[1, 2, 4].map(count => (
                <button
                  key={count}
                  onClick={() => handleGenerate(count)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F7FF',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(122, 108, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span>Generate {count} {count === 1 ? 'variant' : 'variants'}</span>
                  <span style={{ fontSize: '12px', color: '#A8B5CC' }}>
                    ${getCostEstimate(count)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSuggest}
          disabled={isGenerating || isLoadingSuggestions}
          style={{
            height: '48px',
            padding: '0 20px',
            background: 'transparent',
            color: '#F3F7FF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isGenerating || isLoadingSuggestions ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Lightbulb style={{ width: '16px', height: '16px' }} />
          {isLoadingSuggestions ? 'Loading...' : 'Suggest Ideas'}
        </button>

        <TemplateSelector onSelect={applyTemplate} />
      </div>
    </div>
  )
}
