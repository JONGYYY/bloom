"use client"

import { useState, useEffect, useRef } from "react"
import { BookOpen, ChevronDown, X } from "lucide-react"
import { PROMPT_TEMPLATES, TEMPLATE_CATEGORIES, type PromptTemplate } from "@/lib/templates"

interface TemplateSelectorProps {
  onSelect: (template: PromptTemplate) => void
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelect(template)
    setIsOpen(false)
    setSelectedCategory(null)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          height: '48px',
          padding: '0 20px',
          background: 'transparent',
          color: '#F3F7FF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
        <BookOpen style={{ width: '16px', height: '16px' }} />
        Templates
      </button>

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div
            ref={modalRef}
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '80vh',
              background: 'rgba(15, 18, 25, 0.98)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '32px',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#F3F7FF', marginBottom: '4px' }}>
                  Prompt Templates
                </h2>
                <p style={{ fontSize: '14px', color: '#A8B5CC' }}>
                  Start with a pre-made prompt and customize it for your needs
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F3F7FF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  style={{
                    padding: '8px 16px',
                    background: selectedCategory === key ? 'rgba(122, 108, 255, 0.2)' : 'rgba(30, 35, 48, 0.5)',
                    border: selectedCategory === key ? '1px solid rgba(122, 108, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#F3F7FF',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries(PROMPT_TEMPLATES)
                .filter(([category]) => !selectedCategory || category === selectedCategory)
                .flatMap(([_, templates]) => templates)
                .map(template => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    style={{
                      padding: '20px',
                      background: 'rgba(30, 35, 48, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(122, 108, 255, 0.5)'
                      e.currentTarget.style.background = 'rgba(122, 108, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.background = 'rgba(30, 35, 48, 0.5)'
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#F3F7FF', marginBottom: '8px' }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#A8B5CC', marginBottom: '12px' }}>
                      {template.description}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#A8B5CC', 
                      lineHeight: '1.5',
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {template.prompt}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
