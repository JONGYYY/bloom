"use client"

import { Plus, X } from "lucide-react"

interface TraitsSectionProps {
  traits: string[]
  onAddTrait: () => void
  onRemoveTrait: (trait: string) => void
}

export default function TraitsSection({ traits, onAddTrait, onRemoveTrait }: TraitsSectionProps) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '16px' }}>
        Brand Traits
      </h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {traits.slice(0, 8).map((trait, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border-medium rounded-full text-label transition-all duration-150 hover:border-border-strong"
            style={{ textTransform: 'capitalize' }}
          >
            <span>{trait}</span>
            <button
              onClick={() => onRemoveTrait(trait)}
              className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-danger-500 hover:text-white transition-all duration-150"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Add Trait Button */}
        <button
          onClick={onAddTrait}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border-medium rounded-full text-label text-text-secondary hover:border-ivy hover:text-ivy hover:bg-surface-2 transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Add trait
        </button>
      </div>
      
      {traits.length > 8 && (
        <p className="text-caption" style={{ 
          color: 'var(--color-text-tertiary)',
          marginTop: '12px'
        }}>
          Showing 8 of {traits.length} traits
        </p>
      )}
    </div>
  )
}
