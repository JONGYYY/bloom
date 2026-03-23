"use client"

import { useState } from "react"
import { Sparkles, Wand2 } from "lucide-react"

interface PromptComposerProps {
  studioId: string
  parameters: any
}

export function PromptComposer({ studioId, parameters }: PromptComposerProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          parameters,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="prompt" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
          What would you like to create?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the creative asset you want to generate..."
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

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          style={{
            flex: 1,
            height: '48px',
            padding: '0 24px',
            background: isGenerating || !prompt.trim() ? 'rgba(122, 108, 255, 0.5)' : '#7A6CFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
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
          disabled={isGenerating}
          style={{
            height: '48px',
            padding: '0 20px',
            background: 'transparent',
            color: '#F3F7FF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Wand2 style={{ width: '16px', height: '16px' }} />
          Improve
        </button>
      </div>
    </div>
  )
}
