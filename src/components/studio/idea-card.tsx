"use client"

import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface IdeaCardProps {
  title: string
  channel: string
  outputType: string
  whyItWorks: string
  onUseInGenerate: () => void
}

export default function IdeaCard({ 
  title, 
  channel, 
  outputType, 
  whyItWorks, 
  onUseInGenerate 
}: IdeaCardProps) {
  return (
    <Card className="p-5">
      {/* Title */}
      <h4 className="text-heading" style={{ marginBottom: '8px' }}>
        {title}
      </h4>
      
      {/* Context */}
      <div className="flex items-center gap-2 text-caption" style={{ 
        color: 'var(--color-text-tertiary)',
        marginBottom: '12px'
      }}>
        <span style={{ 
          padding: '2px 8px',
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {channel}
        </span>
        <span>•</span>
        <span>{outputType}</span>
      </div>
      
      {/* Why it works */}
      <p className="text-body" style={{ 
        color: 'var(--color-text-secondary)',
        marginBottom: '16px',
        lineHeight: '1.6'
      }}>
        {whyItWorks}
      </p>
      
      {/* Action */}
      <button
        onClick={onUseInGenerate}
        className="inline-flex items-center gap-2 h-9 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150"
      >
        Use in Generate
        <ArrowRight className="w-4 h-4" />
      </button>
    </Card>
  )
}
