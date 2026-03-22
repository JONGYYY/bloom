"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Palette, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Brands", href: "/brands", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-panel border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-stroke-subtle">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            Campaign Gen
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-violet-500/20 text-violet-500 border border-violet-500/30"
                  : "text-mist-300 hover:bg-slate-glass-800/50 hover:text-pearl-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-stroke-subtle">
        <div className="text-sm text-mist-300">
          Logged in
        </div>
      </div>
    </aside>
  )
}
