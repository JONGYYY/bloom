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
  { id: "preflight", label: "Connecting to site", description: "Accessing your website" },
  { id: "rendering", label: "Capturing visual language", description: "Taking screenshots and analyzing layout" },
  { id: "extracting", label: "Extracting brand signals", description: "Identifying colors, fonts, and logos" },
  { id: "building", label: "Assembling brand profile", description: "Creating your brand kit" },
  { id: "complete", label: "Draft ready for review", description: "Brand profile complete" },
]

export default function ProcessingPage() {
  const router = useRouter()
  const params = useParams()
  const studioId = params.studioId as string

  const [job, setJob] = useState<JobStatus | null>(null)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)

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

          // If completed, redirect to review
          if (data.job.status === "completed") {
            clearInterval(intervalId)
            setTimeout(() => {
              router.push(`/studios/${studioId}/review`)
            }, 1000)
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

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Analyzing Your Brand
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          This usually takes 30-60 seconds. We'll redirect you when ready.
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {/* Stage timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stages.map((stage, index) => {
            const isComplete = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            const isPending = index > currentStageIndex

            return (
              <div
                key={stage.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 300ms ease',
                  background: isCurrent
                    ? 'rgba(91, 123, 111, 0.1)'
                    : isComplete
                    ? 'rgba(91, 154, 127, 0.1)'
                    : 'transparent',
                  border: isCurrent
                    ? '1px solid var(--color-ivy-500)'
                    : isComplete
                    ? '1px solid var(--color-success-500)'
                    : '1px solid transparent'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success-500)' }} />
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
                  <h3 className="text-label" style={{
                    color: isCurrent
                      ? 'var(--color-ivy-500)'
                      : isComplete
                      ? 'var(--color-success-500)'
                      : 'var(--color-text-secondary)',
                    marginBottom: '4px'
                  }}>
                    {stage.label}
                  </h3>
                  <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info box */}
        <div style={{ 
          marginTop: '32px', 
          padding: '16px', 
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(91, 123, 111, 0.1)', 
          border: '1px solid rgba(91, 123, 111, 0.2)' 
        }}>
          <p className="text-body" style={{ color: 'var(--color-ivy-400)' }}>
            We're analyzing your website to extract colors, fonts, logos, and brand style. 
            You'll review everything before generating any assets.
          </p>
        </div>
      </div>
    </div>
  )
}
