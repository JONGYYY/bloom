"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Loader2, Search, Filter, ArrowUpDown } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Studio {
  id: string
  displayName: string
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

export default function StudiosPage() {
  const router = useRouter()
  const [studios, setStudios] = useState<Studio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

  const getBrandColor = (studio: Studio) => {
    const colors = [
      ...(studio.profile?.colors?.primary || []),
      ...(studio.profile?.colors?.accent || []),
    ]
    return colors[0] || '#5B7B6F'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredStudios = studios.filter(studio =>
    studio.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    studio.rootDomain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="text-display" style={{ marginBottom: '8px' }}>Studios</h1>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your brand studios and creative assets
          </p>
        </div>
        <Link href="/studios/new">
          <button className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft">
            <Plus className="w-5 h-5" />
            New Studio
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search studios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface-1 border border-border-medium rounded-lg text-body text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 focus-visible:border-ivy-500 transition-all duration-150"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
          <ArrowUpDown className="w-4 h-4" />
          Sort
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '32px' 
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card style={{ padding: '48px', textAlign: 'center', border: '1px solid var(--color-danger-500)' }}>
          <p className="text-body" style={{ color: 'var(--color-danger-500)', marginBottom: '16px' }}>
            {error}
          </p>
          <button 
            onClick={fetchStudios}
            className="inline-flex items-center justify-center h-10 px-6 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft"
          >
            Retry
          </button>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && studios.length === 0 && (
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
          <h2 className="text-heading" style={{ marginBottom: '8px' }}>
            Create your first studio
          </h2>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Start by analyzing a brand's website to extract visual language and create a studio.
          </p>
          <Link href="/studios/new">
            <button className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft">
              <Plus className="w-5 h-5" />
              Create your first studio
            </button>
          </Link>
        </Card>
      )}

      {/* Studios grid */}
      {!isLoading && !error && filteredStudios.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '32px' 
        }}>
          {filteredStudios.map(studio => {
            const colors = getStudioColors(studio)
            const brandColor = getBrandColor(studio)
            const assetCount = studio._count?.assets || 0
            
            return (
              <div
                key={studio.id}
                onClick={() => router.push(`/studios/${studio.id}/generate`)}
                style={{ cursor: 'pointer' }}
              >
                <Card style={{ overflow: 'hidden', transition: 'all 200ms ease' }}>
                  {/* Brand color wash */}
                  <div style={{ 
                    height: '8px', 
                    background: brandColor,
                    opacity: 0.3,
                    transition: 'opacity 200ms ease'
                  }} className="brand-wash" />
                  
                  <div style={{ padding: '24px' }}>
                    {/* Logo */}
                    {studio.profile?.logos?.primary?.url && (
                      <img 
                        src={studio.profile.logos.primary.url} 
                        alt={studio.displayName}
                        style={{ height: '48px', width: 'auto', marginBottom: '16px', objectFit: 'contain' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                    
                    {/* Studio name */}
                    <h3 className="text-heading" style={{ 
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {studio.displayName}
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
                      <span>{getTimeAgo(studio.updatedAt)}</span>
                      <span>{assetCount} {assetCount === 1 ? 'asset' : 'assets'}</span>
                    </div>

                    {/* Status badge */}
                    {studio.status !== 'ready' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: studio.status === 'pending' ? 'rgba(212, 165, 116, 0.1)' : 'rgba(212, 122, 122, 0.1)',
                        border: studio.status === 'pending' ? '1px solid rgba(212, 165, 116, 0.2)' : '1px solid rgba(212, 122, 122, 0.2)',
                        color: studio.status === 'pending' ? 'var(--color-warning-500)' : 'var(--color-danger-500)',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        {studio.status === 'pending' ? 'Processing...' : 'Failed'}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
