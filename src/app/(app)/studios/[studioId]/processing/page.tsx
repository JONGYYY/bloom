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
  { id: "queued", label: "Queued", description: "Waiting to start" },
  { id: "preflight", label: "Fetching public site", description: "Validating URL" },
  { id: "rendering", label: "Rendering surfaces", description: "Capturing desktop and mobile views" },
  { id: "extracting", label: "Detecting studio signals", description: "Analyzing colors, fonts, and logos" },
  { id: "building", label: "Building draft profile", description: "Creating your studio profile" },
  { id: "complete", label: "Ready for review", description: "Extraction complete" },
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
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#7A6CFF', margin: '0 auto 16px' }} className="animate-spin" />
          <p style={{ color: '#A8B5CC' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (job.status === "failed") {
    return (
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <XCircle style={{ width: '48px', height: '48px', color: '#FF6B6B', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Extraction Failed</h2>
          <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
            {job.error || "We couldn't extract your studio profile. Please try again."}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push("/studios/new")}
              style={{
                height: '44px',
                padding: '0 24px',
                background: '#7A6CFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Another URL
            </button>
            <button
              onClick={() => router.push("/studios")}
              style={{
                height: '44px',
                padding: '0 24px',
                background: 'transparent',
                color: '#F3F7FF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Back to Studios
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Analyzing Your Studio</h1>
        <p style={{ color: '#A8B5CC' }}>
          This usually takes 30-60 seconds. We'll redirect you when ready.
        </p>
      </div>

      <div style={{
        background: 'rgba(15, 18, 25, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '32px'
      }}>
        {/* Progress bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ height: '8px', background: 'rgba(30, 35, 48, 0.5)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(to right, #7A6CFF, #3CCBFF)',
                transition: 'width 0.5s',
                width: `${job.progress}%`
              }}
            />
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#A8B5CC', textAlign: 'center' }}>
            {job.progress}% complete
          </div>
        </div>

        {/* Stage timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  borderRadius: '12px',
                  transition: 'all 0.3s',
                  background: isCurrent
                    ? 'rgba(122, 108, 255, 0.1)'
                    : isComplete
                    ? 'rgba(76, 217, 100, 0.1)'
                    : 'rgba(30, 35, 48, 0.3)',
                  border: isCurrent
                    ? '1px solid rgba(122, 108, 255, 0.2)'
                    : isComplete
                    ? '1px solid rgba(76, 217, 100, 0.2)'
                    : '1px solid transparent'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '4px' }}>
                  {isComplete ? (
                    <CheckCircle2 style={{ width: '20px', height: '20px', color: '#4CD964' }} />
                  ) : isCurrent ? (
                    <Loader2 style={{ width: '20px', height: '20px', color: '#7A6CFF' }} className="animate-spin" />
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(168, 181, 204, 0.3)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontWeight: '500',
                      color: isCurrent
                        ? '#7A6CFF'
                        : isComplete
                        ? '#4CD964'
                        : '#A8B5CC'
                    }}
                  >
                    {stage.label}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#A8B5CC', marginTop: '4px' }}>
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info box */}
        <div style={{ marginTop: '32px', padding: '16px', borderRadius: '12px', background: 'rgba(60, 203, 255, 0.1)', border: '1px solid rgba(60, 203, 255, 0.2)' }}>
          <p style={{ fontSize: '14px', color: '#3CCBFF' }}>
            💡 We're analyzing your public website to detect colors, fonts, logos, and studio style. 
            You'll review everything before we generate any campaigns.
          </p>
        </div>
      </div>
    </div>
  )
}
