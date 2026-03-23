"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  id: string
  label: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step */}
            <button
              onClick={() => onStepClick?.(index)}
              disabled={isPending}
              className={cn(
                "flex items-center gap-3 transition-all",
                isPending && "cursor-not-allowed opacity-50"
              )}
            >
              {/* Circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isComplete && "bg-success-500 border-success-500",
                  isCurrent && "border-violet-500 bg-violet-500/20",
                  isPending && "border-mist-300/30"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-violet-500",
                      isPending && "text-mist-300"
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="text-left hidden md:block">
                <div
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-violet-500",
                    isComplete && "text-success-500",
                    isPending && "text-mist-300"
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-mist-300">{step.description}</div>
                )}
              </div>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-mist-300/20">
                <div
                  className={cn(
                    "h-full transition-all",
                    isComplete && "bg-success-500",
                    isCurrent && "bg-violet-500 w-1/2"
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
