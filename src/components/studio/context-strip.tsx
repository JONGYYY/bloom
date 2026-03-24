"use client"

import Link from "next/link"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface StudioProfile {
  logos?: {
    primary?: { url: string }
  }
  colors?: {
    primary?: string[]
  }
  styleTraits?: string[]
}

interface ContextStripProps {
  studioId: string
  studioName: string
  domain: string
  logo?: string
  brandKitStatus: "complete" | "incomplete" | "processing"
}

export default function ContextStrip({ 
  studioId, 
  studioName, 
  domain, 
  logo,
  brandKitStatus 
}: ContextStripProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-surface-1 rounded-lg border border-border-subtle gap-3">
      <div className="flex items-center gap-3">
        {logo && (
          <img 
            src={logo} 
            alt={studioName}
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        )}
        <div>
          <p className="text-label">{studioName}</p>
          <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
            {domain}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        {/* Brand Kit status */}
        <div className="flex items-center gap-2">
          {brandKitStatus === "complete" && (
            <>
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success-500)' }} />
              <span className="text-label hidden sm:inline" style={{ color: 'var(--color-text-secondary)' }}>
                Brand Kit complete
              </span>
            </>
          )}
          {brandKitStatus === "incomplete" && (
            <>
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-warning-500)' }} />
              <span className="text-label hidden sm:inline" style={{ color: 'var(--color-text-secondary)' }}>
                Brand Kit needs review
              </span>
            </>
          )}
          {brandKitStatus === "processing" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-ivy-500)' }} />
              <span className="text-label hidden sm:inline" style={{ color: 'var(--color-text-secondary)' }}>
                Analyzing brand...
              </span>
            </>
          )}
        </div>
        
        {/* Quick link */}
        <Link 
          href={`/studios/${studioId}/brand-kit`} 
          className="text-label text-ivy hover:underline"
        >
          Review →
        </Link>
      </div>
    </div>
  )
}
