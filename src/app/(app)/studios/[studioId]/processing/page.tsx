"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

interface JobStatus {
  id: string
  status: "queued" | "processing" | "completed" | "failed"
  stage: string | null
  progress: number
  error: string | null
}

const stages = [
  { id: "queued", label: "Added to queue", description: "Your brand analysis is queued" },
  { id: "preflight", label: "Understanding the brand", description: "Connecting to your website" },
  { id: "rendering", label: "Mapping visual patterns", description: "Capturing screenshots and layout" },
  { id: "extracting", label: "Capturing the color palette", description: "Extracting colors, fonts, and visual elements" },
  { id: "building", label: "Learning the aesthetics", description: "Analyzing brand identity and style" },
  { id: "complete", label: "Putting everything together", description: "Finalizing your brand kit" },
]

export default function ProcessingPage() {
  const router = useRouter()
  const params = useParams()
  const studioId = params.studioId as string

  const [job, setJob] = useState<JobStatus | null>(null)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [profile, setProfile] = useState<any>(null)
  const [showCompleteButton, setShowCompleteButton] = useState(false)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/studios/${studioId}/job`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.job)

          // Update stage index based on job stage
          const stageIndex = stages.findIndex(s => s.id === data.job.stage)
          if (stageIndex >= 0) {
            setCurrentStageIndex(stageIndex)
          }

          // If completed, fetch profile and show button
          if (data.job.status === "completed") {
            clearInterval(intervalId)
            fetchProfile()
            setTimeout(() => {
              setShowCompleteButton(true)
            }, 1500)
          }

          // If failed, stop polling
          if (data.job.status === "failed") {
            clearInterval(intervalId)
          }
        }
      } catch (error) {
        console.error("Error polling job status:", error)
      }
    }

    // Initial poll
    pollJobStatus()

    // Poll every 2 seconds
    intervalId = setInterval(pollJobStatus, 2000)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [studioId, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/studios/${studioId}/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleBegin = () => {
    router.push(`/studios/${studioId}/brand-kit`)
  }

  if (!job) {
    return (
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px' }}>
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Loader2 className="w-12 h-12 animate-spin" style={{ 
            color: 'var(--color-ivy-500)',
            margin: '0 auto 16px'
          }} />
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (job.status === "failed") {
    return (
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px' }}>
        <div className="card" style={{ 
          padding: '48px', 
          textAlign: 'center',
          border: '1px solid var(--color-danger-500)'
        }}>
          <XCircle className="w-12 h-12" style={{ 
            color: 'var(--color-danger-500)',
            margin: '0 auto 16px'
          }} />
          <h2 className="text-heading" style={{ marginBottom: '8px' }}>
            Extraction Failed
          </h2>
          <p className="text-body" style={{ 
            color: 'var(--color-text-secondary)',
            marginBottom: '24px'
          }}>
            {job.error || "We couldn't extract your brand profile. Please try again."}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push("/studios/new")}
              className="inline-flex items-center justify-center h-10 px-6 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft"
            >
              Try Another URL
            </button>
            <button
              onClick={() => router.push("/studios")}
              className="inline-flex items-center justify-center h-10 px-6 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150"
            >
              Back to Studios
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getLogo = () => {
    if (!profile?.logos?.candidates || profile.logos.candidates.length === 0) {
      return null
    }
    return profile.logos.candidates[0]?.url
  }

  const logo = getLogo()

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', padding: '48px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Extracting brand identity
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          This is a one-time setup for your brand
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
        {/* Left: Progress Steps */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stages.map((stage, index) => {
              const isComplete = index < currentStageIndex || job?.status === 'completed'
              const isCurrent = index === currentStageIndex && job?.status !== 'completed'

              return (
                <div
                  key={stage.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    transition: 'all 300ms ease',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-ivy-500)' }} />
                    ) : (
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        border: '2px solid var(--color-border-medium)' 
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-label" style={{
                      color: isComplete || isCurrent
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-tertiary)',
                    }}>
                      {stage.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {job?.status === 'completed' && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                About 34 seconds
              </p>
            </div>
          )}
        </div>

        {/* Right: Logo and Brand Info */}
        <div className="bg-surface-1 rounded-xl border border-border-subtle" style={{ padding: '48px' }}>
          {/* Logo Display */}
          {logo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '32px',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <img
                src={logo}
                alt="Brand logo"
                style={{
                  maxWidth: '300px',
                  maxHeight: '120px',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Brand Info (shown when extraction is complete) */}
          {profile && job?.status === 'completed' && (
            <div style={{ marginBottom: '32px' }}>
              {profile.brandName && (
                <h2 className="text-display" style={{ marginBottom: '16px', textAlign: 'center' }}>
                  {profile.brandName}
                </h2>
              )}

              {profile.description && (
                <p className="text-body" style={{ 
                  color: 'var(--color-text-secondary)', 
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  {profile.description}
                </p>
              )}

              {profile.tagline && (
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--color-sage-50)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--color-ivy-500)',
                    marginBottom: '24px',
                  }}
                >
                  <p className="text-label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                    Tagline
                  </p>
                  <p className="text-body" style={{ color: 'var(--color-text-primary)', fontStyle: 'italic' }}>
                    "{profile.tagline}"
                  </p>
                </div>
              )}

              {/* Fonts Preview */}
              {profile.fonts && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 className="text-subheading" style={{ marginBottom: '12px' }}>
                    Fonts
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="bg-surface-2 rounded-lg border border-border-subtle" style={{ padding: '16px' }}>
                      <p className="text-caption" style={{ color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
                        Headings
                      </p>
                      <p className="text-label" style={{ fontWeight: '600' }}>
                        Aa Bb Cc
                      </p>
                      <p className="text-caption" style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {profile.fonts.heading?.family}
                      </p>
                    </div>
                    <div className="bg-surface-2 rounded-lg border border-border-subtle" style={{ padding: '16px' }}>
                      <p className="text-caption" style={{ color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
                        Body
                      </p>
                      <p className="text-label">
                        Aa Bb Cc
                      </p>
                      <p className="text-caption" style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {profile.fonts.body?.family}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Assets Preview */}
              {profile.toneKeywords && profile.toneKeywords.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {profile.toneKeywords.slice(0, 5).map((keyword: string) => (
                      <span
                        key={keyword}
                        className="text-caption"
                        style={{
                          padding: '6px 12px',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-pill)',
                          color: 'var(--color-text-secondary)',
                          fontSize: '12px',
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Let's Begin Button */}
          {showCompleteButton && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleBegin}
                className="inline-flex items-center justify-center h-12 px-8 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150 shadow-soft"
                style={{ width: '100%' }}
              >
                Let's Begin
              </button>
            </div>
          )}

          {/* Loading state message */}
          {!showCompleteButton && job?.status !== 'completed' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ 
                color: 'var(--color-ivy-500)',
                margin: '0 auto 16px'
              }} />
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                Analyzing your website...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
