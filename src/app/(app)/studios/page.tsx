"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Loader2, Palette } from "lucide-react"

interface Studio {
  id: string
  displayName: string
  rootDomain: string
  status: string
  profile?: {
    colors?: {
      primary?: string[]
      secondary?: string[]
      accent?: string[]
    }
  }
  _count?: {
    assets: number
  }
}

export default function StudiosPage() {
  const router = useRouter()
  const [studios, setStudios] = useState<Studio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudios()
  }, [])

  const fetchStudios = async () => {
    try {
      const response = await fetch('/api/studios')
      if (response.ok) {
        const data = await response.json()
        setStudios(data.studios || [])
      } else {
        setError('Failed to load studios')
      }
    } catch (err) {
      console.error('Error fetching studios:', err)
      setError('Failed to load studios')
    } finally {
      setIsLoading(false)
    }
  }

  const getStudioColors = (studio: Studio) => {
    const colors = [
      ...(studio.profile?.colors?.primary || []),
      ...(studio.profile?.colors?.secondary || []),
      ...(studio.profile?.colors?.accent || [])
    ]
    return colors.slice(0, 4)
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Studios</h1>
          <p style={{ color: '#A8B5CC' }}>Manage your brand studios and creative assets</p>
        </div>
        <Link href="/studios/new">
          <button style={{
            height: '48px',
            padding: '0 24px',
            background: '#7A6CFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Plus style={{ width: '20px', height: '20px' }} />
            New Studio
          </button>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#7A6CFF', margin: '0 auto 16px' }} className="animate-spin" />
          <p style={{ color: '#A8B5CC' }}>Loading studios...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#FF6B6B', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={fetchStudios}
            style={{
              height: '44px',
              padding: '0 24px',
              background: '#7A6CFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && studios.length === 0 && (
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '448px', margin: '0 auto' }}>
            <Palette style={{ width: '48px', height: '48px', color: '#7A6CFF', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#F3F7FF' }}>No studios yet</h2>
            <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
              Create your first brand studio to start generating creative assets.
            </p>
            <Link href="/studios/new">
              <button style={{
                height: '44px',
                padding: '0 24px',
                background: '#7A6CFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Create your first studio
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Studios grid */}
      {!isLoading && !error && studios.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {studios.map(studio => {
            const colors = getStudioColors(studio)
            const assetCount = studio._count?.assets || 0
            
            return (
              <div
                key={studio.id}
                onClick={() => router.push(`/studios/${studio.id}/workspace`)}
                style={{
                  background: 'rgba(15, 18, 25, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: '#F3F7FF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {studio.displayName}
                </h3>
                
                <div style={{ 
                  fontSize: '13px', 
                  color: '#A8B5CC', 
                  marginBottom: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {studio.rootDomain}
                </div>

                {/* Color palette preview */}
                {colors.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {colors.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: color,
                          border: '2px solid rgba(255, 255, 255, 0.1)',
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                {/* Asset count */}
                <div style={{ 
                  fontSize: '14px', 
                  color: '#A8B5CC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Palette style={{ width: '14px', height: '14px' }} />
                  {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
                </div>

                {/* Status badge */}
                {studio.status !== 'ready' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: studio.status === 'pending' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                    border: studio.status === 'pending' ? '1px solid rgba(255, 193, 7, 0.2)' : '1px solid rgba(255, 107, 107, 0.2)',
                    color: studio.status === 'pending' ? '#FFC107' : '#FF6B6B',
                    fontSize: '12px',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    {studio.status === 'pending' ? 'Processing...' : 'Failed'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
