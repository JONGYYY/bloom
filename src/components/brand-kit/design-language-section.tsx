"use client"

import { useEffect } from "react"

interface ColorGroup {
  role: "primary" | "secondary" | "accent"
  colors: string[]
}

interface Font {
  family: string
  weight: string
}

interface DesignLanguageSectionProps {
  colorGroups: ColorGroup[]
  headingFont: Font
  bodyFont: Font
  toneKeywords?: string[]
  aestheticDescription?: string
  onAddColor?: (role: string) => void
  onRemoveColor?: (role: string, color: string) => void
}

export default function DesignLanguageSection({
  colorGroups,
  headingFont,
  bodyFont,
  toneKeywords = [],
  aestheticDescription,
  onAddColor,
  onRemoveColor,
}: DesignLanguageSectionProps) {
  // Load Google Fonts dynamically
  useEffect(() => {
    const loadFont = (fontFamily: string) => {
      // Check if font is already loaded
      const linkId = `font-${fontFamily.replace(/\s+/g, '-')}`
      if (document.getElementById(linkId)) return

      // Create link element for Google Fonts
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`
      document.head.appendChild(link)
    }

    if (headingFont.family && headingFont.family !== 'Inter') {
      loadFont(headingFont.family)
    }
    if (bodyFont.family && bodyFont.family !== 'Inter' && bodyFont.family !== headingFont.family) {
      loadFont(bodyFont.family)
    }
  }, [headingFont.family, bodyFont.family])
  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '24px' }}>
        Design Language
      </h2>

      {/* Colors */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="text-subheading" style={{ marginBottom: '16px' }}>
          Colors
        </h3>
        
        {colorGroups.map((group) => (
          <div key={group.role} style={{ marginBottom: '20px' }}>
            <p className="text-label" style={{ 
              color: 'var(--color-text-tertiary)', 
              marginBottom: '8px',
              textTransform: 'capitalize'
            }}>
              {getRoleLabel(group.role)}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {group.colors.map((color) => (
                <div
                  key={color}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: color,
                      border: '1px solid var(--color-border-subtle)',
                      boxShadow: 'var(--shadow-soft)',
                      cursor: onRemoveColor ? 'pointer' : 'default',
                    }}
                    onClick={() => onRemoveColor?.(group.role, color)}
                    title={onRemoveColor ? 'Click to remove' : color}
                  />
                  <span className="text-caption" style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }}>
                    {color}
                  </span>
                </div>
              ))}
              
              {onAddColor && (
                <button
                  onClick={() => onAddColor(group.role)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--color-border-medium)',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-tertiary)',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-medium)'
                    e.currentTarget.style.color = 'var(--color-text-tertiary)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="text-subheading" style={{ marginBottom: '16px' }}>
          Typography
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Headings */}
          <div
            className="bg-surface-1 rounded-lg border border-border-subtle"
            style={{ padding: '20px' }}
          >
            <p className="text-label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>
              Headings
            </p>
            <div style={{ 
              fontFamily: headingFont.family,
              fontWeight: headingFont.weight,
              fontSize: '32px',
              lineHeight: '1.2',
              marginBottom: '8px'
            }}>
              Aa Bb Cc
            </div>
            <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
              {headingFont.family} {headingFont.weight}
            </p>
          </div>

          {/* Body */}
          <div
            className="bg-surface-1 rounded-lg border border-border-subtle"
            style={{ padding: '20px' }}
          >
            <p className="text-label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>
              Body
            </p>
            <div style={{ 
              fontFamily: bodyFont.family,
              fontWeight: bodyFont.weight,
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '8px'
            }}>
              The quick brown fox jumps over the lazy dog
            </div>
            <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
              {bodyFont.family} {bodyFont.weight}
            </p>
          </div>
        </div>
      </div>

      {/* Tone Keywords */}
      {toneKeywords.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 className="text-subheading" style={{ marginBottom: '16px' }}>
            Tone
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {toneKeywords.map((keyword) => (
              <span
                key={keyword}
                className="text-label"
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Aesthetic Description */}
      {aestheticDescription && (
        <div>
          <h3 className="text-subheading" style={{ marginBottom: '16px' }}>
            Aesthetic
          </h3>
          <div
            className="bg-surface-1 rounded-lg border border-border-subtle"
            style={{ padding: '24px' }}
          >
            <p className="text-body" style={{ 
              color: 'var(--color-text-primary)',
              lineHeight: '1.7'
            }}>
              {aestheticDescription}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
