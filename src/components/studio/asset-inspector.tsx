"use client"

import { Download, Heart, Sparkles } from "lucide-react"

interface Asset {
  id: string
  url: string
  prompt?: string
  parameters?: {
    aspectRatio?: string
    quality?: string
    aesthetic?: string
    outputType?: string
  }
  createdAt: string
  isFavorite?: boolean
}

interface AssetInspectorProps {
  selectedAsset: Asset | null
  onReuseInGenerate: () => void
  onDownload: () => void
  onToggleFavorite: () => void
}

export default function AssetInspector({ 
  selectedAsset, 
  onReuseInGenerate, 
  onDownload, 
  onToggleFavorite 
}: AssetInspectorProps) {
  if (!selectedAsset) {
    return (
      <aside className="sticky top-0 h-screen p-6 bg-surface-1 border-l border-border-subtle overflow-auto">
        <div style={{ 
          textAlign: 'center',
          paddingTop: '48px',
          color: 'var(--color-text-tertiary)'
        }}>
          <p className="text-body">Select an asset to view details</p>
        </div>
      </aside>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <aside className="sticky top-0 h-screen p-6 bg-surface-1 border-l border-border-subtle overflow-auto">
      {/* Preview */}
      <div style={{ 
        aspectRatio: '1',
        background: 'var(--color-canvas)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <img 
          src={selectedAsset.url} 
          alt="Selected asset"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      
      {/* Metadata */}
      <div style={{ marginBottom: '24px' }}>
        {selectedAsset.prompt && (
          <div style={{ marginBottom: '12px' }}>
            <div className="text-caption" style={{ 
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px'
            }}>
              Prompt
            </div>
            <p className="text-label" style={{ 
              color: 'var(--color-text-secondary)',
              lineHeight: '1.5'
            }}>
              {selectedAsset.prompt}
            </p>
          </div>
        )}

        {selectedAsset.parameters?.aspectRatio && (
          <div style={{ marginBottom: '12px' }}>
            <div className="text-caption" style={{ 
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px'
            }}>
              Aspect Ratio
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
              {selectedAsset.parameters.aspectRatio}
            </p>
          </div>
        )}

        {selectedAsset.parameters?.quality && (
          <div style={{ marginBottom: '12px' }}>
            <div className="text-caption" style={{ 
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px'
            }}>
              Quality
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
              {selectedAsset.parameters.quality}
            </p>
          </div>
        )}

        {selectedAsset.parameters?.aesthetic && (
          <div style={{ marginBottom: '12px' }}>
            <div className="text-caption" style={{ 
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px'
            }}>
              Style
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
              {selectedAsset.parameters.aesthetic}
            </p>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <div className="text-caption" style={{ 
            color: 'var(--color-text-tertiary)',
            marginBottom: '4px'
          }}>
            Created
          </div>
          <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDate(selectedAsset.createdAt)}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onReuseInGenerate}
          className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft"
        >
          <Sparkles className="w-4 h-4" />
          Reuse in Generate
        </button>
        <button
          onClick={onDownload}
          className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={onToggleFavorite}
          className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 text-text-secondary rounded-lg text-label hover:bg-surface-2 hover:text-text-primary transition-all duration-150"
        >
          <Heart className={`w-4 h-4 ${selectedAsset.isFavorite ? 'fill-current' : ''}`} />
          {selectedAsset.isFavorite ? 'Unfavorite' : 'Favorite'}
        </button>
      </div>
    </aside>
  )
}
