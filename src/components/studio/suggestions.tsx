"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface SuggestionsProps {
  studioId: string
  studioName: string
  onApplySuggestion: (suggestion: string) => void
}

export default function Suggestions({ studioId, studioName, onApplySuggestion }: SuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()
  }, [studioId])

  const fetchSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/studios/${studioId}/suggest`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 text-label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading suggestions...</span>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h3 className="text-label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>
        Suggestions for {studioName}
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onApplySuggestion(suggestion)}
            className="px-4 py-2 bg-surface-1 border border-border-subtle rounded-full text-label hover:border-ivy hover:text-ivy transition-all duration-150"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
