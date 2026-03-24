"use client"

import { Card } from "@/components/ui/card"

interface StylePresetCardProps {
  name: string
  preview: string
  whenToUse: string
  bestFitCategories: string[]
  onApply: () => void
}

export default function StylePresetCard({ 
  name, 
  preview, 
  whenToUse, 
  bestFitCategories, 
  onApply 
}: StylePresetCardProps) {
  return (
    <Card style={{ overflow: 'hidden' }}>
      {/* Preview image */}
      <div style={{ 
        aspectRatio: '4/3',
        background: 'var(--color-surface-2)',
        overflow: 'hidden'
      }}>
        <img 
          src={preview} 
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h4 className="text-heading" style={{ marginBottom: '4px' }}>
          {name}
        </h4>
        <p className="text-caption" style={{ 
          color: 'var(--color-text-tertiary)',
          marginBottom: '12px'
        }}>
          {whenToUse}
        </p>
        
        {/* Best fit tags */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '4px',
          marginBottom: '16px'
        }}>
          {bestFitCategories.map((cat, idx) => (
            <span
              key={idx}
              style={{
                padding: '2px 8px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: '500',
                color: 'var(--color-text-secondary)'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
        
        {/* Action */}
        <button
          onClick={onApply}
          className="w-full h-9 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150"
        >
          Apply to Generate
        </button>
      </div>
    </Card>
  )
}
