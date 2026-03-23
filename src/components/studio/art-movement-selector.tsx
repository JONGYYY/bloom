"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, X } from "lucide-react"
import { ART_MOVEMENTS, type ArtMovement } from "@/lib/aesthetics"

interface ArtMovementSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
}

export default function ArtMovementSelector({ value, onChange }: ArtMovementSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleMovement = (movementId: string) => {
    if (value.includes(movementId)) {
      onChange(value.filter(id => id !== movementId))
    } else {
      onChange([...value, movementId])
    }
  }

  const removeMovement = (movementId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(id => id !== movementId))
  }

  const selectedMovements = ART_MOVEMENTS.filter(m => value.includes(m.id))

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
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {selectedMovements.length > 0 ? (
            selectedMovements.map(movement => (
              <span
                key={movement.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  background: 'rgba(122, 108, 255, 0.2)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#F3F7FF'
                }}
              >
                {movement.label}
                <X
                  onClick={(e) => removeMovement(movement.id, e)}
                  style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                />
              </span>
            ))
          ) : (
            <span style={{ color: '#A8B5CC' }}>🎨 Art Style</span>
          )}
        </div>
        <ChevronDown style={{ width: '16px', height: '16px', opacity: 0.7, flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          minWidth: '320px',
          maxHeight: '400px',
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
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#A8B5CC', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: '12px',
            paddingLeft: '8px'
          }}>
            Select Art Movements (Multi-select)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {ART_MOVEMENTS.map(movement => {
              const isSelected = value.includes(movement.id)
              return (
                <div
                  key={movement.id}
                  onClick={() => toggleMovement(movement.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(122, 108, 255, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(122, 108, 255, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
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
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: '2px solid ' + (isSelected ? '#7A6CFF' : 'rgba(255, 255, 255, 0.3)'),
                    background: isSelected ? '#7A6CFF' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#F3F7FF', marginBottom: '2px' }}>
                      {movement.label}
                    </div>
                    {movement.description && (
                      <div style={{ fontSize: '12px', color: '#A8B5CC' }}>
                        {movement.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {value.length > 0 && (
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#A8B5CC' }}>
                {value.length} selected
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onChange([])
                }}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#F3F7FF',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
