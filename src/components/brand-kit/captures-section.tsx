"use client"

import { ExternalLink } from "lucide-react"

interface Capture {
  id: string
  url: string
  capturedAt: string
}

interface CapturesSectionProps {
  captures: Capture[]
  onViewCapture: (capture: Capture) => void
}

export default function CapturesSection({ captures, onViewCapture }: CapturesSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '16px' }}>
        Website Captures
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {captures.map((capture) => (
          <div
            key={capture.id}
            onClick={() => onViewCapture(capture)}
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--color-border-subtle)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            className="hover:border-border-medium hover-lift"
          >
            <div style={{ 
              aspectRatio: '16/10',
              background: 'var(--color-surface-2)',
              overflow: 'hidden'
            }}>
              <img 
                src={capture.url} 
                alt="Website capture"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ 
              padding: '12px',
              background: 'var(--color-surface-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                {formatDate(capture.capturedAt)}
              </span>
              <ExternalLink className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>
        ))}
      </div>
      
      {captures.length === 0 && (
        <p className="text-body" style={{ color: 'var(--color-text-tertiary)' }}>
          No website captures yet
        </p>
      )}
    </div>
  )
}
