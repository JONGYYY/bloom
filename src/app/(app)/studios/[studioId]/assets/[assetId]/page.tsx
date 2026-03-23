"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Download, Heart, Copy, RefreshCw, Trash2, ArrowLeft } from "lucide-react"

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studioId = params.studioId as string
  const assetId = params.assetId as string

  const [asset, setAsset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAsset()
  }, [assetId])

  const fetchAsset = async () => {
    try {
      const response = await fetch(`/api/studios/${studioId}/assets/${assetId}`)
      if (response.ok) {
        const data = await response.json()
        setAsset(data.asset)
      }
    } catch (error) {
      console.error("Error fetching asset:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!asset) return
    try {
      await fetch(`/api/studios/${studioId}/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !asset.isFavorite }),
      })
      setAsset({ ...asset, isFavorite: !asset.isFavorite })
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const deleteAsset = async () => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    try {
      await fetch(`/api/studios/${studioId}/assets/${assetId}`, {
        method: 'DELETE',
      })
      router.push(`/studios/${studioId}/workspace`)
    } catch (error) {
      console.error("Error deleting asset:", error)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#A8B5CC' }}>Loading...</p>
      </div>
    )
  }

  if (!asset) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#A8B5CC' }}>Asset not found</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#F3F7FF',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* Main preview */}
        <div>
          <div style={{
            background: 'rgba(15, 18, 25, 0.6)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <img
              src={asset.url}
              alt={asset.prompt || 'Generated asset'}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>

        {/* Metadata and actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Actions */}
          <div style={{
            background: 'rgba(15, 18, 25, 0.6)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>
              Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => window.open(asset.url, '_blank')}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  background: '#7A6CFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Download
              </button>
              <button
                onClick={toggleFavorite}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  background: 'transparent',
                  color: '#F3F7FF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Heart style={{ width: '16px', height: '16px', fill: asset.isFavorite ? 'currentColor' : 'none' }} />
                {asset.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              <button
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  background: 'transparent',
                  color: '#F3F7FF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Copy style={{ width: '16px', height: '16px' }} />
                Duplicate Settings
              </button>
              <button
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  background: 'transparent',
                  color: '#F3F7FF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                Regenerate Similar
              </button>
              <button
                onClick={deleteAsset}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  background: 'transparent',
                  color: '#FF6B6B',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                Delete
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div style={{
            background: 'rgba(15, 18, 25, 0.6)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>
              Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {asset.prompt && (
                <div>
                  <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '4px' }}>Prompt</div>
                  <div style={{ fontSize: '14px', color: '#F3F7FF', lineHeight: '1.5' }}>{asset.prompt}</div>
                </div>
              )}
              {asset.metadata && (
                <>
                  <div>
                    <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '4px' }}>Model</div>
                    <div style={{ fontSize: '14px', color: '#F3F7FF' }}>{asset.metadata.model || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '4px' }}>Size</div>
                    <div style={{ fontSize: '14px', color: '#F3F7FF' }}>{asset.metadata.size || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '4px' }}>Quality</div>
                    <div style={{ fontSize: '14px', color: '#F3F7FF' }}>{asset.metadata.quality || 'N/A'}</div>
                  </div>
                </>
              )}
              <div>
                <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '4px' }}>Created</div>
                <div style={{ fontSize: '14px', color: '#F3F7FF' }}>
                  {new Date(asset.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Parameters used */}
          {asset.parameters && (
            <div style={{
              background: 'rgba(15, 18, 25, 0.6)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>
                Parameters
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(asset.parameters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(122, 108, 255, 0.2)',
                        border: '1px solid rgba(122, 108, 255, 0.3)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#7A6CFF',
                      }}
                    >
                      {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
