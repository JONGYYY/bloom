"use client"

import { X, Download, Heart, Sparkles, Copy } from "lucide-react"
import { useEffect } from "react"

interface Asset {
  id: string
  url: string
  prompt?: string
  parameters?: {
    aspectRatio?: string
    quality?: string
    aesthetic?: string
    outputType?: string
    variants?: number
  }
  createdAt: string
  isFavorite?: boolean
}

interface AssetDetailModalProps {
  asset: Asset
  onClose: () => void
  onReuseInGenerate: () => void
  onDownload: () => void
  onToggleFavorite: () => void
}

export default function AssetDetailModal({ 
  asset, 
  onClose, 
  onReuseInGenerate, 
  onDownload, 
  onToggleFavorite 
}: AssetDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopyPrompt = () => {
    if (asset.prompt) {
      navigator.clipboard.writeText(asset.prompt)
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 18, 25, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginBottom: '24px'
        }}>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2 text-text-primary hover:bg-surface-3 transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'flex',
          gap: '48px',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left: Image */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-canvas)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden'
          }}>
            <img 
              src={asset.url} 
              alt="Asset detail"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Right: Details & Actions */}
          <div style={{ 
            width: '360px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Metadata */}
            <div className="card" style={{ padding: '24px' }}>
              {asset.prompt && (
                <div style={{ marginBottom: '20px' }}>
                  <div className="text-caption" style={{ 
                    color: 'var(--color-text-tertiary)',
                    marginBottom: '8px'
                  }}>
                    Prompt
                  </div>
                  <p className="text-body" style={{ 
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '8px'
                  }}>
                    {asset.prompt}
                  </p>
                  <button
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-2 text-label text-ivy hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    Copy prompt
                  </button>
                </div>
              )}

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border-subtle)'
              }}>
                {asset.parameters?.aspectRatio && (
                  <div>
                    <div className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '4px'
                    }}>
                      Aspect Ratio
                    </div>
                    <p className="text-label">
                      {asset.parameters.aspectRatio}
                    </p>
                  </div>
                )}

                {asset.parameters?.quality && (
                  <div>
                    <div className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '4px'
                    }}>
                      Quality
                    </div>
                    <p className="text-label">
                      {asset.parameters.quality}
                    </p>
                  </div>
                )}

                {asset.parameters?.aesthetic && (
                  <div>
                    <div className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '4px'
                    }}>
                      Style
                    </div>
                    <p className="text-label" style={{ textTransform: 'capitalize' }}>
                      {asset.parameters.aesthetic}
                    </p>
                  </div>
                )}

                {asset.parameters?.outputType && (
                  <div>
                    <div className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '4px'
                    }}>
                      Output Type
                    </div>
                    <p className="text-label">
                      {asset.parameters.outputType}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ 
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border-subtle)'
              }}>
                <div className="text-caption" style={{ 
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '4px'
                }}>
                  Created
                </div>
                <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(asset.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={onReuseInGenerate}
                className="w-full inline-flex items-center justify-center gap-2 h-12 px-4 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft"
              >
                <Sparkles className="w-5 h-5" />
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
                <Heart className={`w-4 h-4 ${asset.isFavorite ? 'fill-current' : ''}`} />
                {asset.isFavorite ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
