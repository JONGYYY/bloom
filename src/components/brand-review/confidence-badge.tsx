import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ConfidenceLevel = "high" | "medium" | "low"

interface ConfidenceBadgeProps {
  level: ConfidenceLevel
  className?: string
}

export function ConfidenceBadge({ level, className }: ConfidenceBadgeProps) {
  const config = {
    high: {
      icon: CheckCircle2,
      label: "High confidence",
      className: "bg-success-500/10 text-success-500 border-success-500/20",
    },
    medium: {
      icon: AlertTriangle,
      label: "Medium confidence",
      className: "bg-warning-500/10 text-warning-500 border-warning-500/20",
    },
    low: {
      icon: AlertCircle,
      label: "Needs review",
      className: "bg-danger-500/10 text-danger-500 border-danger-500/20",
    },
  }

  const { icon: Icon, label, className: levelClassName } = config[level]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium",
        levelClassName,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  )
}
