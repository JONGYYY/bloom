"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { BRAND_STRENGTH_LEVELS, TEXT_PRESENCE_LEVELS, COMPOSITIONS, MOODS, DALLE_STYLES } from "@/lib/aesthetics"

interface AdvancedSettingsProps {
  parameters: any
  onChange: (key: string, value: any) => void
  isOpen: boolean
  onToggle: () => void
}

export default function AdvancedSettings({ parameters, onChange, isOpen, onToggle }: AdvancedSettingsProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(30, 35, 48, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#F3F7FF',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <span>⚙️ Advanced Settings</span>
        {isOpen ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div style={{
          marginTop: '12px',
          padding: '20px',
          background: 'rgba(30, 35, 48, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Brand Strength */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#F3F7FF', marginBottom: '8px' }}>
              Brand Strength
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="0"
                max="3"
                value={BRAND_STRENGTH_LEVELS.findIndex(l => l.id === parameters.brandStrength)}
                onChange={(e) => {
                  const level = BRAND_STRENGTH_LEVELS[parseInt(e.target.value)]
                  onChange('brandStrength', level.id)
                }}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '13px', color: '#A8B5CC', minWidth: '80px', textAlign: 'right' }}>
                {BRAND_STRENGTH_LEVELS.find(l => l.id === parameters.brandStrength)?.label || 'Balanced'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#A8B5CC', marginTop: '4px' }}>
              {BRAND_STRENGTH_LEVELS.find(l => l.id === parameters.brandStrength)?.description}
            </div>
          </div>

          {/* Text Presence */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#F3F7FF', marginBottom: '8px' }}>
              Text Presence
            </label>
            <select
              value={parameters.textPresence}
              onChange={(e) => onChange('textPresence', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(15, 18, 25, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#F3F7FF',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {TEXT_PRESENCE_LEVELS.map(level => (
                <option key={level.id} value={level.id}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          {/* Composition */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#F3F7FF', marginBottom: '8px' }}>
              Composition
            </label>
            <select
              value={parameters.composition}
              onChange={(e) => onChange('composition', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(15, 18, 25, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#F3F7FF',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="">Auto (based on output type)</option>
              {COMPOSITIONS.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.label} - {comp.description}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#F3F7FF', marginBottom: '8px' }}>
              Mood
            </label>
            <select
              value={parameters.mood}
              onChange={(e) => onChange('mood', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(15, 18, 25, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#F3F7FF',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="">Auto (based on brand)</option>
              {MOODS.map(mood => (
                <option key={mood.id} value={mood.id}>
                  {mood.label}
                </option>
              ))}
            </select>
          </div>

          {/* DALL-E Style */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#F3F7FF', marginBottom: '8px' }}>
              Style (DALL-E 3)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DALLE_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => onChange('dalleStyle', style.id)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: parameters.dalleStyle === style.id ? 'rgba(122, 108, 255, 0.3)' : 'rgba(15, 18, 25, 0.6)',
                    border: parameters.dalleStyle === style.id ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#F3F7FF',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div>{style.label}</div>
                  <div style={{ fontSize: '11px', color: '#A8B5CC', marginTop: '4px' }}>
                    {style.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
