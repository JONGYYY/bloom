"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Settings } from "lucide-react"

interface StudioProfile {
  colors?: {
    primary?: string[]
    secondary?: string[]
    accent?: string[]
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStudios()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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
    return colors.slice(0, 6)
  }

  const colors = getStudioColors(profile)
  const styleTraits = profile?.styleTraits?.slice(0, 3) || []

  return (
    <div style={{
      background: 'rgba(15, 18, 25, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Left: Studio Switcher */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'rgba(30, 35, 48, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#F3F7FF',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            {studio?.displayName || 'Studio'}
            <ChevronDown style={{ width: '16px', height: '16px' }} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && allStudios.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '280px',
              maxHeight: '400px',
              overflowY: 'auto',
              background: 'rgba(15, 18, 25, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              {allStudios.map((s) => {
                const isActive = s.id === studioId
                const studioColors = getStudioColors(s.profile)
                
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (!isActive) {
                        router.push(`/studios/${s.id}/workspace`)
                      }
                      setIsDropdownOpen(false)
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(122, 108, 255, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(122, 108, 255, 0.3)' : '1px solid transparent',
                      cursor: isActive ? 'default' : 'pointer',
                      marginBottom: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#F3F7FF', marginBottom: '6px' }}>
                      {s.displayName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '8px' }}>
                      {s.rootDomain}
                    </div>
                    {studioColors.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {studioColors.map((color, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              background: color,
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Center: Color Palette & Style Traits */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
          {/* Color Palette */}
          {colors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: color,
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  title={color}
                />
              ))}
            </div>
          )}

          {/* Style Traits */}
          {styleTraits.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {styleTraits.map((trait, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(122, 108, 255, 0.15)',
                    color: '#A8B5CC',
                    fontSize: '13px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Edit Profile Button */}
        <button
          onClick={() => router.push(`/studios/${studioId}/review`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#F3F7FF',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
            e.currentTarget.style.background = 'rgba(122, 108, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Settings style={{ width: '14px', height: '14px' }} />
          Edit Profile
        </button>
      </div>
    </div>
  )
}
