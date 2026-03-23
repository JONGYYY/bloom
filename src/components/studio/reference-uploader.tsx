"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ReferenceUploaderProps {
  studioId: string
  value: string[]
  onChange: (value: string[]) => void
}

export default function ReferenceUploader({ studioId, value, onChange }: ReferenceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      await uploadFiles(files)
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFiles = async (files: File[]) => {
    if (value.length + files.length > 5) {
      alert('Maximum 5 reference images allowed')
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'reference')

        const response = await fetch(`/api/studios/${studioId}/assets/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        return data.asset.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...value, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (url: string) => {
    onChange(value.filter(u => u !== url))
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload Zone */}
      {value.length < 5 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '20px',
            border: isDragging 
              ? '2px dashed rgba(122, 108, 255, 0.5)' 
              : '2px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            background: isDragging 
              ? 'rgba(122, 108, 255, 0.05)' 
              : 'rgba(30, 35, 48, 0.3)',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {isUploading ? (
              <>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: '3px solid rgba(122, 108, 255, 0.2)',
                  borderTop: '3px solid #7A6CFF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: '14px', color: '#A8B5CC' }}>Uploading...</span>
              </>
            ) : (
              <>
                <Upload style={{ width: '32px', height: '32px', color: '#7A6CFF' }} />
                <div style={{ fontSize: '14px', color: '#F3F7FF', fontWeight: '500' }}>
                  Click or drag images here
                </div>
                <div style={{ fontSize: '12px', color: '#A8B5CC' }}>
                  Max 5 images • PNG, JPG, WebP
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {value.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '12px',
          marginTop: value.length < 5 ? '12px' : '0'
        }}>
          {value.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(30, 35, 48, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <img
                src={url}
                alt={`Reference ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const placeholder = document.createElement('div')
                    placeholder.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;'
                    const icon = document.createElement('div')
                    icon.style.cssText = 'color: #A8B5CC;'
                    icon.innerHTML = '🖼️'
                    placeholder.appendChild(icon)
                    parent.appendChild(placeholder)
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(url)
                }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.9)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'
                }}
              >
                <X style={{ width: '14px', height: '14px', color: 'white' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
