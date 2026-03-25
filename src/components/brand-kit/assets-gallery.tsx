"use client"

import { useState } from "react"
import { Image as ImageIcon } from "lucide-react"

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

  // Get unique asset types
  const assetTypes = Array.from(new Set(assets.map(a => a.type)))
  
  // Filter assets by selected type
  const filteredAssets = selectedType 
    ? assets.filter(a => a.type === selectedType)
    : assets

  // Get asset URL from storage key
  const getAssetUrl = (asset: BrandAsset) => {
    // Assuming S3 URL structure
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'bloom-assets'
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
    return `https://${bucket}.s3.${region}.amazonaws.com/${asset.storageKey}`
  }

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => onSelectAsset?.(asset)}
            className="bg-surface-1 rounded-lg border border-border-subtle"
            style={{
              cursor: onSelectAsset ? 'pointer' : 'default',
              overflow: 'hidden',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (onSelectAsset) {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
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
              }}
            >
              <img
                src={getAssetUrl(asset)}
                alt={asset.type}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                loading="lazy"
              />
            </div>

            {/* Info */}
            <div style={{ padding: '12px' }}>
              <p className="text-label" style={{ 
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
                textTransform: 'capitalize'
              }}>
                {getTypeLabel(asset.type)}
              </p>
              
              {asset.metadata && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {asset.metadata.width && asset.metadata.height && (
                    <span className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      fontSize: '11px'
                    }}>
                      {asset.metadata.width}×{asset.metadata.height}
                    </span>
                  )}
                  {asset.metadata.format && (
                    <span className="text-caption" style={{ 
                      color: 'var(--color-text-tertiary)',
                      fontSize: '11px',
                      textTransform: 'uppercase'
                    }}>
                      {asset.metadata.format}
                    </span>
                  )}
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
                  {asset.metadata.colors.slice(0, 5).map((color, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        backgroundColor: color,
                        border: '1px solid var(--color-border-subtle)',
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
