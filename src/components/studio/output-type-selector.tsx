"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Search } from "lucide-react"
import { OUTPUT_TYPES, OUTPUT_TYPE_CATEGORIES, getOutputTypeById, type OutputType } from "@/lib/output-types"

interface OutputTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function OutputTypeSelector({ value, onChange }: OutputTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      searchInputRef.current?.focus()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedType = value ? getOutputTypeById(value) : null

  const filteredTypes = Object.entries(OUTPUT_TYPES).reduce((acc, [categoryKey, types]) => {
    const filtered = types.filter(type =>
      type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[categoryKey] = filtered
    }
    return acc
  }, {} as Record<string, OutputType[]>)

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(30, 35, 48, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#F3F7FF',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '180px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedType?.icon && <span>{selectedType.icon}</span>}
          {selectedType?.label || 'Select output type'}
        </span>
        <ChevronDown style={{ width: '16px', height: '16px', opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          minWidth: '380px',
          maxHeight: '500px',
          background: 'rgba(15, 18, 25, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflowY: 'auto'
        }}>
          {/* Search */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '16px', 
              height: '16px', 
              color: '#A8B5CC' 
            }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search output types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                background: 'rgba(30, 35, 48, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#F3F7FF',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Categories and Types */}
          {Object.keys(filteredTypes).length > 0 ? (
            Object.entries(filteredTypes).map(([categoryKey, types]) => (
              <div key={categoryKey} style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#A8B5CC', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                  paddingLeft: '8px'
                }}>
                  {OUTPUT_TYPE_CATEGORIES[categoryKey as keyof typeof OUTPUT_TYPE_CATEGORIES]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {types.map(type => {
                    const isSelected = value === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => {
                          onChange(type.id)
                          setIsOpen(false)
                          setSearchQuery("")
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(122, 108, 255, 0.15)' : 'transparent',
                          border: isSelected ? '1px solid rgba(122, 108, 255, 0.3)' : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {type.icon && <span style={{ fontSize: '16px' }}>{type.icon}</span>}
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#F3F7FF' }}>
                            {type.label}
                          </span>
                        </div>
                        {type.description && (
                          <div style={{ fontSize: '12px', color: '#A8B5CC', paddingLeft: type.icon ? '24px' : '0' }}>
                            {type.description}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              color: '#A8B5CC', 
              fontSize: '14px' 
            }}>
              No output types found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
