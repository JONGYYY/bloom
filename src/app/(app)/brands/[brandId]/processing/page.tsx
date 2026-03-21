"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  { id: "extracting", label: "Detecting brand signals", description: "Analyzing colors, fonts, and logos" },
  { id: "building", label: "Building draft profile", description: "Creating your brand profile" },
  { id: "complete", label: "Ready for review", description: "Extraction complete" },
]

export default function ProcessingPage() {
  const router = useRouter()
  const params = useParams()
  const brandId = params.brandId as string

  const [job, setJob] = useState<JobStatus | null>(null)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/brands/${brandId}/job`)
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
              router.push(`/app/brands/${brandId}/review`)
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
  }, [brandId, router])

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel rounded-lg p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-mist-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (job.status === "failed") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel rounded-lg p-12 text-center">
          <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Extraction Failed</h2>
          <p className="text-mist-300 mb-6">
            {job.error || "We couldn't extract your brand profile. Please try again."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/app/brands/new")}>
              Try Another URL
            </Button>
            <Button variant="ghost" onClick={() => router.push("/app/brands")}>
              Back to Brands
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Analyzing Your Brand</h1>
        <p className="text-mist-300">
          This usually takes 30-60 seconds. We'll redirect you when ready.
        </p>
      </div>

      <div className="glass-panel rounded-lg p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-slate-glass-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-mist-300 text-center">
            {job.progress}% complete
          </div>
        </div>

        {/* Stage timeline */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isComplete = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            const isPending = index > currentStageIndex

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  isCurrent
                    ? "bg-violet-500/10 border border-violet-500/20"
                    : isComplete
                    ? "bg-success-500/10 border border-success-500/20"
                    : "bg-slate-glass-800/30 border border-transparent"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-mist-300/30" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      isCurrent
                        ? "text-violet-500"
                        : isComplete
                        ? "text-success-500"
                        : "text-mist-300"
                    }`}
                  >
                    {stage.label}
                  </h3>
                  <p className="text-sm text-mist-300 mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info box */}
        <div className="mt-8 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-sm text-cyan-500">
            💡 We're analyzing your public website to detect colors, fonts, logos, and brand style. 
            You'll review everything before we generate any campaigns.
          </p>
        </div>
      </div>
    </div>
  )
}
