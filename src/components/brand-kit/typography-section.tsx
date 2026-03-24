"use client"

import { Edit2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Font {
  family: string
  weight: string
}

interface TypographySectionProps {
  headingFont: Font
  bodyFont: Font
  onEdit: () => void
}

export default function TypographySection({ headingFont, bodyFont, onEdit }: TypographySectionProps) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 className="text-heading">Typography</h2>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 h-9 px-3 text-text-secondary rounded-lg text-label hover:bg-surface-2 hover:text-text-primary transition-all duration-150"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Headings */}
        <Card style={{ flex: 1, padding: '24px' }}>
          <div className="text-caption" style={{ 
            color: 'var(--color-text-tertiary)',
            marginBottom: '12px'
          }}>
            Headings
          </div>
          <div style={{ 
            fontFamily: headingFont.family,
            fontWeight: headingFont.weight,
            fontSize: '28px',
            lineHeight: '1.2',
            marginBottom: '12px',
            color: 'var(--color-text-primary)'
          }}>
            The quick brown fox
          </div>
          <div className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
            {headingFont.family} {headingFont.weight}
          </div>
        </Card>

        {/* Body */}
        <Card style={{ flex: 1, padding: '24px' }}>
          <div className="text-caption" style={{ 
            color: 'var(--color-text-tertiary)',
            marginBottom: '12px'
          }}>
            Body
          </div>
          <div style={{ 
            fontFamily: bodyFont.family,
            fontWeight: bodyFont.weight,
            fontSize: '16px',
            lineHeight: '1.5',
            marginBottom: '12px',
            color: 'var(--color-text-primary)'
          }}>
            The quick brown fox jumps over the lazy dog
          </div>
          <div className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
            {bodyFont.family} {bodyFont.weight}
          </div>
        </Card>
      </div>
    </div>
  )
}
