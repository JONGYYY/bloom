"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Search, Bell, HelpCircle, Plus } from "lucide-react"

interface StudioProfile {
  colors?: {
    primary?: string[]
    secondary?: string[]
    accent?: string[]
  }
  logos?: {
    primary?: { url: string }
  }
  styleTraits?: string[]
}

interface Studio {
  id: string
  displayName: string
  rootDomain: string
  profile?: StudioProfile
}

interface StudioHeaderProps {
  studioId: string
  studio?: Studio
  profile?: StudioProfile
}

export default function StudioHeader({ studioId, studio, profile }: StudioHeaderProps) {
  const router = useRouter()
  const [allStudios, setAllStudios] = useState<Studio[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStudios()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false)
        setSearchQuery("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchStudios = async () => {
    try {
      const response = await fetch('/api/studios')
      if (response.ok) {
        const data = await response.json()
        setAllStudios(data.studios || [])
      }
    } catch (error) {
      console.error('Error fetching studios:', error)
    }
  }

  const getStudioColors = (studioProfile?: StudioProfile) => {
    if (!studioProfile?.colors) return []
    const colors = [
      ...(studioProfile.colors.primary || []),
      ...(studioProfile.colors.secondary || []),
      ...(studioProfile.colors.accent || [])
    ]
    return colors.slice(0, 4)
  }

  const recentStudios = allStudios.slice(0, 5)
  const otherStudios = allStudios.slice(5)

  return (
    <header className="h-16 border-b border-border-subtle bg-surface-1">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left: Studio Switcher */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-body font-medium text-text-primary hover:bg-surface-2 transition-all duration-150"
          >
            {studio?.profile?.logos?.primary?.url && (
              <img 
                src={studio.profile.logos.primary.url} 
                alt={studio.displayName}
                style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            )}
            <span>{studio?.displayName || 'Studio'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Flyout */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-surface-1 border border-border-medium rounded-lg shadow-soft-lg z-50" style={{ maxHeight: '480px', display: 'flex', flexDirection: 'column' }}>
              {/* Recent Studios */}
              {recentStudios.length > 0 && (
                <div style={{ padding: '8px' }}>
                  <div className="text-caption" style={{ color: 'var(--color-text-tertiary)', padding: '8px 12px' }}>
                    Recent
                  </div>
                  {recentStudios.map((s) => {
                    const isActive = s.id === studioId
                    const studioColors = getStudioColors(s.profile)
                    
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (!isActive) {
                            router.push(`/studios/${s.id}/generate`)
                          }
                          setIsDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150"
                        style={{
                          background: isActive ? 'var(--color-surface-2)' : 'transparent',
                          border: isActive ? '1px solid var(--color-ivy-500)' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--color-surface-2)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent'
                          }
                        }}
                      >
                        {s.profile?.logos?.primary?.url && (
                          <img 
                            src={s.profile.logos.primary.url} 
                            alt={s.displayName}
                            style={{ height: '24px', width: '24px', objectFit: 'contain' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="text-label" style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {s.displayName}
                          </div>
                          <div className="text-caption" style={{ 
                            color: 'var(--color-text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {s.rootDomain}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Divider */}
              {recentStudios.length > 0 && otherStudios.length > 0 && (
                <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '4px 0' }} />
              )}

              {/* Search Input */}
              {otherStudios.length > 0 && (
                <div style={{ padding: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input
                      type="text"
                      placeholder="Search studios..."
                      className="w-full h-9 pl-9 pr-3 bg-canvas border border-border-medium rounded-lg text-label text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 transition-all duration-150"
                    />
                  </div>
                </div>
              )}

              {/* All Studios */}
              {otherStudios.length > 0 && (
                <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
                  {otherStudios.map((s) => {
                    const isActive = s.id === studioId
                    
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (!isActive) {
                            router.push(`/studios/${s.id}/generate`)
                          }
                          setIsDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150"
                        style={{
                          background: isActive ? 'var(--color-surface-2)' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--color-surface-2)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent'
                          }
                        }}
                      >
                        {s.profile?.logos?.primary?.url && (
                          <img 
                            src={s.profile.logos.primary.url} 
                            alt={s.displayName}
                            style={{ height: '24px', width: '24px', objectFit: 'contain' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="text-label" style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {s.displayName}
                          </div>
                          <div className="text-caption" style={{ 
                            color: 'var(--color-text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {s.rootDomain}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '4px 0' }} />

              {/* Create New Studio */}
              <div style={{ padding: '8px' }}>
                <button
                  onClick={() => {
                    router.push('/studios/new')
                    setIsDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 h-9 px-3 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150"
                >
                  <Plus className="w-4 h-4" />
                  Create new studio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Search */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} ref={searchRef}>
          {isSearchExpanded ? (
            <div style={{ position: 'relative', width: '320px' }}>
              <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder={`Search ${studio?.displayName || 'studio'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-9 pl-9 pr-3 bg-surface-2 border border-border-medium rounded-lg text-label text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 transition-all duration-150"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-secondary transition-all duration-150"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center justify-center w-9 h-9 rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-secondary transition-all duration-150"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button 
            className="flex items-center justify-center w-9 h-9 rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-secondary transition-all duration-150"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
