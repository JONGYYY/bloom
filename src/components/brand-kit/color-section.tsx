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
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '16px' }}>
        Colors
      </h2>
      
      {colorGroups.map((group) => (
        <div key={group.role} style={{ marginBottom: '24px' }}>
          <h3 className="text-label" style={{ 
            marginBottom: '12px',
            textTransform: 'capitalize',
            color: 'var(--color-text-secondary)'
          }}>
            {group.role}
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {group.colors.map((color, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-lg)',
                  background: color,
                  border: '1px solid var(--color-border-subtle)',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <button
                    onClick={() => onRemoveColor(group.role, color)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-caption" style={{ 
                  textAlign: 'center',
                  marginTop: '8px',
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'monospace'
                }}>
                  {color}
                </p>
              </div>
            ))}
            
            {/* Add Color Button */}
            <button
              onClick={() => onAddColor(group.role)}
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
      ))}
    </div>
  )
}
