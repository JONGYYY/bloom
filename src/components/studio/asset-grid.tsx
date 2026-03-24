"use client"

import { useState, useEffect } from "react"
import { Sparkles, Upload, Bookmark } from "lucide-react"

interface Asset {
  id: string
  url: string
  prompt?: string
  parameters?: any
  createdAt: string
  source: "generated" | "uploaded" | "reference"
}

interface AssetGridProps {
  studioId: string
  onSelectAsset: (asset: Asset | null) => void
  selectedAssetId: string | null
}

export default function AssetGrid({ studioId, onSelectAsset, selectedAssetId }: AssetGridProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null)

  useEffect(() => {
    fetchAssets()
  }, [studioId])

  const fetchAssets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/studios/${studioId}/assets`)
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupAssetsByDate = (assets: Asset[]) => {
    const now = new Date()
    const today: Asset[] = []
    const thisWeek: Asset[] = []
    const earlier: Asset[] = []

    assets.forEach(asset => {
      const assetDate = new Date(asset.createdAt)
      const diffMs = now.getTime() - assetDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        today.push(asset)
      } else if (diffDays < 7) {
        thisWeek.push(asset)
      } else {
        earlier.push(asset)
      }
    })

    return { today, thisWeek, earlier }
  }

  const { today, thisWeek, earlier } = groupAssetsByDate(assets)

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "generated":
        return <Sparkles className="w-3 h-3" />
      case "uploaded":
        return <Upload className="w-3 h-3" />
      case "reference":
        return <Bookmark className="w-3 h-3" />
      default:
        return null
    }
  }

  const renderAssetGroup = (title: string, groupAssets: Asset[]) => {
    if (groupAssets.length === 0) return null

    return (
      <div style={{ marginBottom: '32px' }}>
        <h3 className="text-label" style={{ 
          color: 'var(--color-text-tertiary)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }} className="md:gap-6">
          {groupAssets.map((asset) => {
            const isSelected = selectedAssetId === asset.id
            const isHovered = hoveredAssetId === asset.id

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(isSelected ? null : asset)}
                onMouseEnter={() => {
                  setHoveredAssetId(asset.id)
                  setTimeout(() => {
                    if (hoveredAssetId === asset.id) {
                      onSelectAsset(asset)
                    }
                  }, 300)
                }}
                onMouseLeave={() => setHoveredAssetId(null)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-ivy-500)' : '1px solid var(--color-border-subtle)',
                  transition: 'all 150ms ease',
                  position: 'relative',
                  background: 'var(--color-surface-2)'
                }}
              >
                <img
                  src={asset.url}
                  alt="Asset"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Source badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '4px',
                  background: 'rgba(26, 31, 46, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {getSourceIcon(asset.source)}
                </div>

                {/* Hover overlay */}
                {isHovered && !isSelected && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 18, 25, 0.3)',
                    transition: 'opacity 150ms ease'
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderAssetGroup("Today", today)}
      {renderAssetGroup("This Week", thisWeek)}
      {renderAssetGroup("Earlier", earlier)}
      
      {assets.length === 0 && (
        <div style={{ 
          padding: '48px',
          textAlign: 'center',
          color: 'var(--color-text-tertiary)'
        }}>
          <p className="text-body">No assets yet. Start generating in the Generate tab.</p>
        </div>
      )}
    </div>
  )
}
