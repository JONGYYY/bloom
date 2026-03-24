import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-label font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ivy-600 text-white hover:bg-ivy-700 shadow-soft",
        secondary: "bg-surface-2 border border-border-medium text-text-primary hover:bg-surface-3 hover:border-border-strong",
        ghost: "text-text-secondary hover:bg-surface-1 hover:text-text-primary",
        destructive: "bg-danger-500 text-white hover:bg-danger-500/90 shadow-soft",
      },
      size: {
        sm: "h-9 px-3 text-caption",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
