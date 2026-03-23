"use client"

import { useState, useEffect } from "react"
import { Download, Heart, Image as ImageIcon } from "lucide-react"

interface AssetHistoryProps {
  studioId: string
}

export function AssetHistory({ studioId }: AssetHistoryProps) {
  const [tab, setTab] = useState<'recent' | 'favorites' | 'references'>('recent')
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
    
    // Poll for new assets every 5 seconds
    const interval = setInterval(fetchAssets, 5000)
    return () => clearInterval(interval)
  }, [studioId, tab])

  const fetchAssets = async () => {
    try {
      const response = await fetch(`/api/studios/${studioId}/assets?tab=${tab}`)
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets)
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (assetId: string, currentValue: boolean) => {
    try {
      await fetch(`/api/studios/${studioId}/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentValue }),
      })
      fetchAssets()
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {(['recent', 'favorites', 'references'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid #7A6CFF' : '2px solid transparent',
              color: tab === t ? '#7A6CFF' : '#A8B5CC',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Assets grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#A8B5CC' }}>
          Loading...
        </div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <ImageIcon style={{ width: '48px', height: '48px', color: '#A8B5CC', margin: '0 auto 16px' }} />
          <p style={{ color: '#A8B5CC', fontSize: '14px' }}>
            {tab === 'recent' ? 'No assets yet. Generate your first one above!' :
             tab === 'favorites' ? 'No favorites yet. Heart an asset to save it here.' :
             'No reference images yet.'}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          {assets.map(asset => (
            <div
              key={asset.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                background: 'rgba(15, 18, 25, 0.6)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
              }}
            >
              {asset.url && (
                <img
                  src={asset.url}
                  alt={asset.prompt || 'Generated asset'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
              
              {/* Overlay actions */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
              }}
              className="asset-overlay"
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(asset.id, asset.isFavorite)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      color: asset.isFavorite ? '#FF6B6B' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Heart style={{ width: '16px', height: '16px', fill: asset.isFavorite ? 'currentColor' : 'none' }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(asset.url, '_blank')
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
