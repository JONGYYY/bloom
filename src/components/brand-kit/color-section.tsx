"use client"

import { Plus, X } from "lucide-react"

interface ColorGroup {
  role: "primary" | "secondary" | "accent"
  colors: string[]
}

interface ColorSectionProps {
  colorGroups: ColorGroup[]
  onAddColor: (role: string) => void
  onRemoveColor: (role: string, color: string) => void
}

export default function ColorSection({ colorGroups, onAddColor, onRemoveColor }: ColorSectionProps) {
  // Flatten all colors with their ranks
  const allColors = colorGroups.flatMap((group, groupIdx) => 
    group.colors.map((color, colorIdx) => ({
      color,
      role: group.role,
      rank: groupIdx * 100 + colorIdx + 1 // Calculate overall rank
    }))
  )

  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '16px' }}>
        Colors
      </h2>
      
      <p className="text-body" style={{ 
        marginBottom: '20px',
        color: 'var(--color-text-secondary)',
        fontSize: '14px'
      }}>
        Top {allColors.length} colors ranked by frequency on the website
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {allColors.map((item, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Rank badge */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--color-ivy-500)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              zIndex: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {idx + 1}
            </div>
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-lg)',
              background: item.color,
              border: '2px solid var(--color-border-subtle)',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <button
                onClick={() => onRemoveColor(item.role, item.color)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150"
                style={{ zIndex: 2 }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-caption" style={{ 
              textAlign: 'center',
              marginTop: '8px',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'monospace',
              fontSize: '11px'
            }}>
              {item.color}
            </p>
          </div>
        ))}
        
        {/* Add Color Button */}
        <button
          onClick={() => onAddColor('primary')}
          style={{
            width: '80px',
            height: '80px',
            border: '2px dashed var(--color-border-medium)',
            borderRadius: 'var(--radius-lg)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          className="hover:border-ivy hover:bg-surface-2"
        >
          <Plus className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
        </button>
      </div>
    </div>
  )
}
