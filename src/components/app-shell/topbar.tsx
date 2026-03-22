"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"

interface TopbarProps {
  title?: string
  breadcrumbs?: { label: string; href?: string }[]
  user: {
    email?: string
    name?: string
  }
}

export function Topbar({ title, breadcrumbs, user }: TopbarProps) {
  return (
    <header className="h-16 glass-panel border-b flex items-center justify-between px-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-mist-300">/</span>}
                <span className={index === breadcrumbs.length - 1 ? "text-pearl-100" : "text-mist-300"}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-xl font-semibold">{title}</h1>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
