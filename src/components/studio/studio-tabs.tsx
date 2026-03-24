"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Lightbulb, Palette, Grid, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudioTabsProps {
  studioId: string
}

const tabs = [
  { id: "generate", label: "Generate", icon: Sparkles, href: "generate" },
  { id: "ideas", label: "Ideas", icon: Lightbulb, href: "ideas" },
  { id: "styles", label: "Styles", icon: Palette, href: "styles" },
  { id: "library", label: "Library", icon: Grid, href: "library" },
  { id: "brand-kit", label: "Brand Kit", icon: Package, href: "brand-kit" },
]

export default function StudioTabs({ studioId }: StudioTabsProps) {
  const pathname = usePathname()

  return (
    <nav className="h-12 border-b border-border-subtle bg-canvas overflow-x-auto">
      <div className="flex items-center px-6 h-full gap-1 min-w-max">
        {tabs.map((tab) => {
          const href = `/studios/${studioId}/${tab.href}`
          const isActive = pathname === href || pathname.startsWith(href + "/")
          
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 h-full text-label font-medium transition-all duration-200 relative whitespace-nowrap",
                isActive
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-1"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ivy-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
