"use client"

import { AESTHETICS, ASPECT_RATIOS, BRAND_STRENGTH_LEVELS, TEXT_PRESENCE_LEVELS, QUALITY_LEVELS, COMPOSITIONS, MOODS } from "@/lib/aesthetics"
import { getAllOutputTypes } from "@/lib/output-types"
import { PresetSelector } from "./preset-selector"

interface ParameterRailProps {
  studioId: string
  parameters: any
  onChange: (parameters: any) => void
}

export function ParameterRail({ studioId, parameters, onChange }: ParameterRailProps) {
  const updateParameter = (key: string, value: any) => {
    onChange({ ...parameters, [key]: value })
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#F3F7FF' }}>
        Parameters
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Preset selector */}
        <PresetSelector 
          studioId={studioId}
          parameters={parameters}
          onLoadPreset={onChange}
        />
        {/* Output Type */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Output Type
          </label>
          <select
            value={parameters.outputType}
            onChange={(e) => updateParameter('outputType', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              background: 'rgba(15, 18, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#F3F7FF',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            <option value="">Select type...</option>
            {getAllOutputTypes().map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Aesthetic */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Aesthetic
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {AESTHETICS.map(aesthetic => (
              <button
                key={aesthetic.id}
                onClick={() => updateParameter('aesthetic', aesthetic.id)}
                style={{
                  padding: '12px',
                  background: parameters.aesthetic === aesthetic.id ? 'rgba(122, 108, 255, 0.2)' : 'rgba(15, 18, 25, 0.6)',
                  border: parameters.aesthetic === aesthetic.id ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: parameters.aesthetic === aesthetic.id ? '#7A6CFF' : '#F3F7FF',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {aesthetic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Aspect Ratio
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio.id}
                onClick={() => updateParameter('aspectRatio', ratio.id)}
                style={{
                  padding: '12px',
                  background: parameters.aspectRatio === ratio.id ? 'rgba(122, 108, 255, 0.2)' : 'rgba(15, 18, 25, 0.6)',
                  border: parameters.aspectRatio === ratio.id ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: parameters.aspectRatio === ratio.id ? '#7A6CFF' : '#F3F7FF',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{ratio.label}</span>
                <span style={{ fontSize: '11px', color: '#A8B5CC' }}>{ratio.dimensions}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Variants: {parameters.variants}
          </label>
          <input
            type="range"
            min="1"
            max="4"
            value={parameters.variants}
            onChange={(e) => updateParameter('variants', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Brand Strength */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Brand Strength
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BRAND_STRENGTH_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => updateParameter('brandStrength', level.id)}
                style={{
                  padding: '12px',
                  background: parameters.brandStrength === level.id ? 'rgba(122, 108, 255, 0.2)' : 'rgba(15, 18, 25, 0.6)',
                  border: parameters.brandStrength === level.id ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: parameters.brandStrength === level.id ? '#7A6CFF' : '#F3F7FF',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>{level.label}</div>
                <div style={{ fontSize: '11px', color: '#A8B5CC', marginTop: '4px' }}>{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Presence */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Text Presence
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TEXT_PRESENCE_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => updateParameter('textPresence', level.id)}
                style={{
                  padding: '12px',
                  background: parameters.textPresence === level.id ? 'rgba(122, 108, 255, 0.2)' : 'rgba(15, 18, 25, 0.6)',
                  border: parameters.textPresence === level.id ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: parameters.textPresence === level.id ? '#7A6CFF' : '#F3F7FF',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>{level.label}</div>
                <div style={{ fontSize: '11px', color: '#A8B5CC', marginTop: '4px' }}>{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Composition */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Composition
          </label>
          <select
            value={parameters.composition}
            onChange={(e) => updateParameter('composition', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              background: 'rgba(15, 18, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#F3F7FF',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            <option value="">Auto</option>
            {COMPOSITIONS.map(comp => (
              <option key={comp.id} value={comp.id}>{comp.label}</option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Mood
          </label>
          <select
            value={parameters.mood}
            onChange={(e) => updateParameter('mood', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              background: 'rgba(15, 18, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#F3F7FF',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            <option value="">Auto</option>
            {MOODS.map(mood => (
              <option key={mood.id} value={mood.id}>{mood.label}</option>
            ))}
          </select>
        </div>

        {/* Quality */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
            Quality
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {QUALITY_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => updateParameter('quality', level.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: parameters.quality === level.id ? 'rgba(122, 108, 255, 0.2)' : 'rgba(15, 18, 25, 0.6)',
                  border: parameters.quality === level.id ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: parameters.quality === level.id ? '#7A6CFF' : '#F3F7FF',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
