"use client"

import { useRouter } from "next/navigation"
import { Sparkles, Image as ImageIcon, Megaphone, FileText, Layout, Package } from "lucide-react"

interface Template {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  category: string
}

interface TemplatesSectionProps {
  studioId: string
}

const QUICK_START_TEMPLATES: Template[] = [
  {
    id: 'social-media-ad',
    name: 'Social Media Ad',
    icon: <ImageIcon size={20} />,
    description: 'Eye-catching social media advertisement',
    category: 'Social',
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    icon: <Sparkles size={20} />,
    description: 'Exciting product launch announcement',
    category: 'Announcement',
  },
  {
    id: 'quote-card',
    name: 'Quote Card',
    icon: <FileText size={20} />,
    description: 'Inspirational quote with brand styling',
    category: 'Social',
  },
  {
    id: 'website-hero',
    name: 'Website Hero',
    icon: <Layout size={20} />,
    description: 'Hero section for website',
    category: 'Web',
  },
  {
    id: 'product-shot',
    name: 'Product Shot',
    icon: <Package size={20} />,
    description: 'Clean product photography',
    category: 'Product',
  },
  {
    id: 'announcement-poster',
    name: 'Announcement',
    icon: <Megaphone size={20} />,
    description: 'General announcement poster',
    category: 'Announcement',
  },
]

export default function TemplatesSection({ studioId }: TemplatesSectionProps) {
  const router = useRouter()

  const handleSelectTemplate = (template: Template) => {
    // Navigate to generate page with template pre-selected
    router.push(`/studios/${studioId}/generate?template=${template.id}`)
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="text-heading" style={{ marginBottom: '8px' }}>
          Quick Start Templates
        </h2>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Jump-start your creative process with pre-configured templates
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {QUICK_START_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="bg-surface-1 rounded-lg border border-border-subtle"
            style={{
              padding: '20px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ivy-500)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-ivy-500)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              {template.icon}
            </div>
            <h3 className="text-subheading" style={{ marginBottom: '4px' }}>
              {template.name}
            </h3>
            <p className="text-caption" style={{ color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
              {template.description}
            </p>
            <span
              className="text-caption"
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-secondary)',
                fontSize: '11px',
              }}
            >
              {template.category}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
