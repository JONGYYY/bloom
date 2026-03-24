"use client"

import { X, Plus } from "lucide-react"

export interface ConceptTab {
  id: string
  name: string
  icon: string
  prompt: string
  parameters: {
    aspectRatio: string
    quality: string
    variants: number
    referenceImages: string[]
  }
}

interface ConceptTabsProps {
  tabs: ConceptTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

export default function ConceptTabs({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab,
}: ConceptTabsProps) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      overflowX: 'auto',
      marginBottom: '16px',
      paddingBottom: '8px'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 h-10 rounded-lg text-label font-medium transition-all duration-150 whitespace-nowrap ${
            activeTabId === tab.id
              ? 'bg-surface-2 border border-border-medium text-text-primary shadow-soft'
              : 'bg-transparent border border-transparent text-text-secondary hover:bg-surface-1 hover:text-text-primary'
          }`}
          style={{ flexShrink: 0 }}
        >
          <span style={{ fontSize: '16px' }}>{tab.icon}</span>
          <span>{tab.name}</span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              className="ml-1 p-0.5 rounded hover:bg-surface-3 transition-colors"
              aria-label="Close tab"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </button>
      ))}
      
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-transparent border border-border-medium text-text-secondary hover:bg-surface-1 hover:border-border-strong hover:text-text-primary transition-all duration-150"
        style={{ flexShrink: 0 }}
        aria-label="New concept"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}
