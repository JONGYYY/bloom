"use client"

import { Plus, X } from "lucide-react"

interface Reference {
  id: string
  url: string
  tags?: string[]
}

interface ReferencesSectionProps {
  references: Reference[]
  onAddReference: () => void
  onRemoveReference: (id: string) => void
}

export default function ReferencesSection({ references, onAddReference, onRemoveReference }: ReferencesSectionProps) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '16px' }}>
        Saved References
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {references.map((reference) => (
          <div
            key={reference.id}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface-2)',
              cursor: 'pointer'
            }}
            className="hover:border-border-medium hover-lift"
          >
            <img 
              src={reference.url} 
              alt="Reference"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveReference(reference.id)
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-danger-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Add Reference Button */}
        <button
          onClick={onAddReference}
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
            Add reference
          </span>
        </button>
      </div>
    </div>
  )
}
