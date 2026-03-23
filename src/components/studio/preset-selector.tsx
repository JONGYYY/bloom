"use client"

import { useState, useEffect } from "react"
import { Save, Check } from "lucide-react"

interface PresetSelectorProps {
  studioId: string
  parameters: any
  onLoadPreset: (parameters: any) => void
}

export function PresetSelector({ studioId, parameters, onLoadPreset }: PresetSelectorProps) {
  const [presets, setPresets] = useState<any[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPresets()
  }, [studioId])

  const fetchPresets = async () => {
    try {
      const response = await fetch(`/api/studios/${studioId}/presets`)
      if (response.ok) {
        const data = await response.json()
        setPresets(data.presets)
      }
    } catch (error) {
      console.error("Error fetching presets:", error)
    }
  }

  const savePreset = async () => {
    if (!presetName.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/studios/${studioId}/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName,
          parameters,
        }),
      })

      if (response.ok) {
        setPresetName("")
        setShowSaveDialog(false)
        fetchPresets()
      }
    } catch (error) {
      console.error("Error saving preset:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      {/* Preset selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
          Load Preset
        </label>
        <select
          onChange={(e) => {
            const preset = presets.find(p => p.id === e.target.value)
            if (preset) {
              onLoadPreset(preset.parameters)
            }
          }}
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
          <option value="">Select a preset...</option>
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
      </div>

      {/* Save preset button */}
      {!showSaveDialog ? (
        <button
          onClick={() => setShowSaveDialog(true)}
          style={{
            width: '100%',
            height: '40px',
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
          <Save style={{ width: '16px', height: '16px' }} />
          Save Current as Preset
        </button>
      ) : (
        <div style={{ 
          padding: '16px', 
          background: 'rgba(15, 18, 25, 0.6)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '8px' 
        }}>
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px',
              background: 'rgba(15, 18, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#F3F7FF',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={savePreset}
              disabled={!presetName.trim() || isSaving}
              style={{
                flex: 1,
                height: '36px',
                background: '#7A6CFF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: !presetName.trim() || isSaving ? 'not-allowed' : 'pointer',
                opacity: !presetName.trim() || isSaving ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check style={{ width: '14px', height: '14px' }} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false)
                setPresetName("")
              }}
              disabled={isSaving}
              style={{
                flex: 1,
                height: '36px',
                background: 'transparent',
                color: '#F3F7FF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
