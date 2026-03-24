"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Studio {
  id: string
  displayName: string | null
  rootDomain: string
  status: string
  updatedAt: string
  profile?: {
    colors?: {
      primary?: string[]
      secondary?: string[]
      accent?: string[]
    }
    logos?: {
      primary?: { url: string }
    }
  }
  _count?: {
    assets: number
  }
}

export default function HomePage() {
  const router = useRouter()
  const [studios, setStudios] = useState<Studio[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStudios()
  }, [])

  const fetchStudios = async () => {
    try {
      const response = await fetch('/api/studios')
      if (response.ok) {
        const data = await response.json()
        setStudios(data.studios || [])
      }
    } catch (err) {
      console.error('Error fetching studios:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const recentStudios = studios.slice(0, 5)
  const getBrandColor = (studio: Studio) => {
    const colors = [
      ...(studio.profile?.colors?.primary || []),
      ...(studio.profile?.colors?.accent || []),
    ]
    return colors[0] || '#5B7B6F'
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 48px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Welcome back
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Continue working on your brand studios
        </p>
      </div>

      {/* Recent Studios Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="text-heading">Recent Studios</h2>
          {studios.length > 5 && (
            <Link href="/studios" className="text-label text-ivy flex items-center gap-1 hover:underline">
              View all studios
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ minWidth: '280px', height: '200px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : studios.length === 0 ? (
          <Card style={{ padding: '48px', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'var(--color-surface-2)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Plus style={{ width: '32px', height: '32px', color: 'var(--color-ivy-500)' }} />
            </div>
            <h3 className="text-heading" style={{ marginBottom: '8px' }}>
              Start your first brand studio
            </h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              We'll analyze your website and extract your brand's visual language, colors, and style.
            </p>
            <Link href="/studios/new">
              <button className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft">
                <Plus className="w-5 h-5" />
                Create new brand
              </button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
            {/* New Brand CTA Card */}
            <Link href="/studios/new" style={{ minWidth: '280px' }}>
              <Card style={{ 
                padding: '32px', 
                textAlign: 'center',
                border: '2px dashed var(--color-border-medium)',
                background: 'transparent',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'var(--color-surface-2)', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Plus style={{ width: '24px', height: '24px', color: 'var(--color-ivy-500)' }} />
                </div>
                <p className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                  Create new brand
                </p>
              </Card>
            </Link>

            {/* Recent Studio Cards */}
            {recentStudios.map(studio => {
              const brandColor = getBrandColor(studio)
              const colors = [
                ...(studio.profile?.colors?.primary || []),
                ...(studio.profile?.colors?.secondary || []),
                ...(studio.profile?.colors?.accent || [])
              ].slice(0, 4)

              return (
                <div 
                  key={studio.id} 
                  onClick={() => router.push(`/studios/${studio.id}/generate`)}
                  style={{ minWidth: '280px', cursor: 'pointer' }}
                >
                  <Card style={{ overflow: 'hidden', height: '100%' }}>
                    {/* Brand color wash */}
                    <div style={{ 
                      height: '8px', 
                      background: brandColor,
                      opacity: 0.3
                    }} />
                    
                    <div style={{ padding: '24px' }}>
                      {/* Logo */}
                      {studio.profile?.logos?.primary?.url && (
                        <img 
                          src={studio.profile.logos.primary.url} 
                          alt={studio.displayName || 'Studio logo'}
                          style={{ height: '48px', width: 'auto', marginBottom: '16px', objectFit: 'contain' }}
                        />
                      )}
                      
                      {/* Studio name */}
                      <h3 className="text-heading" style={{ 
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {studio.displayName || 'Untitled Studio'}
                      </h3>
                      
                      {/* Domain */}
                      <p className="text-caption" style={{ 
                        color: 'var(--color-text-tertiary)',
                        marginBottom: '16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {studio.rootDomain}
                      </p>
                      
                      {/* Color palette */}
                      {colors.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                          {colors.map((color, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-md)',
                                background: color,
                                border: '1px solid var(--color-border-subtle)',
                              }}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Metadata */}
                      <div className="text-caption" style={{ 
                        color: 'var(--color-text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>{studio._count?.assets || 0} assets</span>
                        <span>Updated recently</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
