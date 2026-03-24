"use client"

import { Plus, X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Logo {
  id: string
  url: string
  type: "primary" | "secondary" | "icon"
}

interface LogoSectionProps {
  logos: Logo[]
  onAddLogo: () => void
  onRemoveLogo: (id: string) => void
}

export default function LogoSection({ logos, onAddLogo, onRemoveLogo }: LogoSectionProps) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '16px' }}>
        Logos
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {logos.map((logo) => (
          <Card key={logo.id} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              aspectRatio: '1',
              background: 'var(--color-canvas)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}>
              <img 
                src={logo.url} 
                alt={`${logo.type} logo`}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
            <div style={{ 
              padding: '12px',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span className="text-label" style={{ textTransform: 'capitalize' }}>
                {logo.type}
              </span>
              <button
                onClick={() => onRemoveLogo(logo.id)}
                className="flex items-center justify-center w-7 h-7 rounded text-text-tertiary hover:bg-danger-500 hover:text-white transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        
        {/* Add Logo Button */}
        <button
          onClick={onAddLogo}
          style={{
            aspectRatio: '1',
            border: '2px dashed var(--color-border-medium)',
            borderRadius: 'var(--radius-lg)',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          className="hover:border-ivy hover:bg-surface-2"
        >
          <Plus className="w-6 h-6" style={{ color: 'var(--color-ivy-500)' }} />
          <span className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
            Add logo
          </span>
        </button>
      </div>
    </div>
  )
}
