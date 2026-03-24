"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AssetGrid from "@/components/studio/asset-grid"
import AssetInspector from "@/components/studio/asset-inspector"
import { Filter, ArrowUpDown, Grid as GridIcon, List } from "lucide-react"

interface Asset {
  id: string
  url: string
  prompt?: string
  parameters?: any
  createdAt: string
  source: "generated" | "uploaded" | "reference"
  isFavorite?: boolean
}

export default function LibraryPage() {
  const params = useParams()
  const router = useRouter()
  const studioId = params.studioId as string

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleReuseInGenerate = () => {
    if (!selectedAsset) return
    
    const params = new URLSearchParams()
    if (selectedAsset.prompt) params.set('prompt', selectedAsset.prompt)
    if (selectedAsset.parameters?.aspectRatio) params.set('aspectRatio', selectedAsset.parameters.aspectRatio)
    if (selectedAsset.parameters?.quality) params.set('quality', selectedAsset.parameters.quality)
    
    router.push(`/studios/${studioId}/generate?${params.toString()}`)
  }

  const handleDownload = () => {
    if (!selectedAsset) return
    
    const link = document.createElement('a')
    link.href = selectedAsset.url
    link.download = `asset-${selectedAsset.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleToggleFavorite = async () => {
    if (!selectedAsset) return
    
    try {
      const response = await fetch(`/api/studios/${studioId}/assets/${selectedAsset.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !selectedAsset.isFavorite
        })
      })

      if (response.ok) {
        setSelectedAsset({
          ...selectedAsset,
          isFavorite: !selectedAsset.isFavorite
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex" style={{ height: '100%' }}>
        {/* Left: Asset Grid (70%) */}
        <div style={{ flex: '0 0 70%', overflowY: 'auto', padding: '48px' }}>
          {/* Toolbar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <h1 className="text-display">Library</h1>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="inline-flex items-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="inline-flex items-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all duration-150 ${
                    viewMode === "grid"
                      ? "bg-ivy-600 text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all duration-150 ${
                    viewMode === "list"
                      ? "bg-ivy-600 text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Asset Grid */}
          <AssetGrid 
            studioId={studioId}
            onSelectAsset={setSelectedAsset}
            selectedAssetId={selectedAsset?.id || null}
          />
        </div>

        {/* Right: Pinned Inspector (30%) */}
        <div style={{ flex: '0 0 30%' }}>
          <AssetInspector
            selectedAsset={selectedAsset}
            onReuseInGenerate={handleReuseInGenerate}
            onDownload={handleDownload}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 className="text-display" style={{ marginBottom: '16px' }}>Library</h1>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <button className="inline-flex items-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label whitespace-nowrap">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 h-10 px-4 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label whitespace-nowrap">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Asset Grid */}
        <AssetGrid 
          studioId={studioId}
          onSelectAsset={setSelectedAsset}
          selectedAssetId={selectedAsset?.id || null}
        />

        {/* Stacked Inspector (Bottom Sheet) */}
        {selectedAsset && (
          <div style={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '60vh',
            background: 'var(--color-surface-1)',
            borderTop: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            padding: '24px',
            overflowY: 'auto',
            zIndex: 40
          }}>
            <AssetInspector
              selectedAsset={selectedAsset}
              onReuseInGenerate={handleReuseInGenerate}
              onDownload={handleDownload}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}
      </div>
    </>
  )
}
