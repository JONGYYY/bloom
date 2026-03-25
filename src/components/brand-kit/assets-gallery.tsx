"use client"

import { useState } from "react"
import { Image as ImageIcon, AlertCircle } from "lucide-react"

interface BrandAsset {
  id: string
  type: string
  storageKey: string
  sourceUrl?: string
  metadata?: {
    width?: number
    height?: number
    format?: string
    location?: string
    colors?: string[]
  }
}

interface AssetsGalleryProps {
  assets: BrandAsset[]
  onSelectAsset?: (asset: BrandAsset) => void
}

export default function AssetsGallery({ assets, onSelectAsset }: AssetsGalleryProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set())
  
  // Get unique asset types
  const assetTypes = Array.from(new Set(assets.map(a => a.type)))
  
  // Filter assets by selected type
  const filteredAssets = selectedType 
    ? assets.filter(a => a.type === selectedType)
    : assets

  // Get asset URL - now provided by API
  const getAssetUrl = (asset: BrandAsset) => {
    // URL is now constructed by the API endpoint
    return (asset as any).url || ''
  }

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleImageError = (assetId: string) => {
    setImageErrors(prev => new Set(prev).add(assetId))
    setImageLoading(prev => {
      const next = new Set(prev)
      next.delete(assetId)
      return next
    })
  }

  const handleImageLoad = (assetId: string) => {
    setImageLoading(prev => {
      const next = new Set(prev)
      next.delete(assetId)
      return next
    })
  }

  if (assets.length === 0) {
    return (
      <section style={{ marginBottom: '48px' }}>
        <h2 className="text-heading" style={{ marginBottom: '24px' }}>
          Visual Assets
        </h2>
        <div
          className="bg-surface-1 rounded-xl border border-border-subtle"
          style={{
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ImageIcon size={32} style={{ color: 'var(--color-text-tertiary)' }} />
          </div>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            No visual assets extracted yet
          </p>
          <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
            Assets will appear here after brand kit extraction
          </p>
        </div>
      </section>
    )
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h2 className="text-heading">
          Visual Assets
        </h2>
        <span className="text-label" style={{ color: 'var(--color-text-tertiary)' }}>
          {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
        </span>
      </div>

      {/* Type Filter */}
      {assetTypes.length > 1 && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedType(null)}
            className="text-label"
            style={{
              padding: '8px 16px',
              background: selectedType === null ? 'var(--color-ivy-500)' : 'var(--color-surface-2)',
              color: selectedType === null ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid',
              borderColor: selectedType === null ? 'var(--color-ivy-500)' : 'var(--color-border-subtle)',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            All
          </button>
          {assetTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="text-label"
              style={{
                padding: '8px 16px',
                background: selectedType === type ? 'var(--color-ivy-500)' : 'var(--color-surface-2)',
                color: selectedType === type ? 'white' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: selectedType === type ? 'var(--color-ivy-500)' : 'var(--color-border-subtle)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
      )}

      {/* Assets Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => onSelectAsset?.(asset)}
            className="bg-surface-1 rounded-xl border border-border-subtle"
            style={{
              cursor: onSelectAsset ? 'pointer' : 'default',
              overflow: 'hidden',
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              if (onSelectAsset) {
                e.currentTarget.style.borderColor = 'var(--color-ivy-500)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (onSelectAsset) {
                e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {/* Image */}
            <div
              style={{
                aspectRatio: '1',
                background: 'var(--color-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {imageErrors.has(asset.id) ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px'
                }}>
                  <AlertCircle size={24} style={{ color: 'var(--color-text-tertiary)' }} />
                  <p className="text-caption" style={{ 
                    color: 'var(--color-text-tertiary)',
                    textAlign: 'center',
                    fontSize: '11px'
                  }}>
                    Image unavailable
                  </p>
                </div>
              ) : (
                <>
                  {imageLoading.has(asset.id) && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-surface-2)',
                    }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          border: '2px solid var(--color-border-medium)',
                          borderTop: '2px solid var(--color-ivy-500)',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                        }}
                      />
                    </div>
                  )}
                  <img
                    src={getAssetUrl(asset)}
                    alt={getTypeLabel(asset.type)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '16px',
                    }}
                    loading="lazy"
                    onError={() => handleImageError(asset.id)}
                    onLoad={() => handleImageLoad(asset.id)}
                  />
                </>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '16px' }}>
              <p className="text-label" style={{ 
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
                fontWeight: '500',
              }}>
                {getTypeLabel(asset.type)}
              </p>
              
              {asset.metadata && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {asset.metadata.width && asset.metadata.height && (
                    <span className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      fontSize: '11px',
                      padding: '2px 6px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {asset.metadata.width}×{asset.metadata.height}
                    </span>
                  )}
                  {asset.metadata.format && (
                    <span className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {asset.metadata.format}
                    </span>
                  )}
                </div>
              )}

              {/* Priority indicator if available */}
              {asset.metadata?.priority && (
                <div style={{ marginBottom: '8px' }}>
                  <span className="text-caption" style={{ 
                    color: asset.metadata.priority === 'high' 
                      ? 'var(--color-ivy-500)' 
                      : 'var(--color-text-tertiary)',
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: asset.metadata.priority === 'high'
                      ? 'rgba(74, 101, 89, 0.1)'
                      : 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '500',
                  }}>
                    {asset.metadata.priority} priority
                  </span>
                </div>
              )}

              {/* Color palette if available */}
              {asset.metadata?.colors && asset.metadata.colors.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '4px', 
                  marginTop: '8px',
                  flexWrap: 'wrap'
                }}>
                  {asset.metadata.colors.slice(0, 6).map((color, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: color,
                        border: '1px solid var(--color-border-medium)',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
