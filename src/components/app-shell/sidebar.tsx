"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Layers, Settings, User, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Studios", href: "/studios", icon: Layers },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-40 flex items-center justify-center w-12 h-12 bg-surface-1 border border-border-medium rounded-lg text-text-primary shadow-soft"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-canvas/80 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-1 border-r border-border-subtle flex flex-col z-50 drawer-enter">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
                <Link href="/home" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-ivy-600 flex items-center justify-center text-white font-bold text-sm">
                    I
                  </div>
                  <span className="text-label font-semibold">Ivylume</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-all duration-150"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 h-12 rounded-lg transition-all duration-150",
                        isActive
                          ? "bg-surface-2 text-ivy-500 border border-ivy-500"
                          : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-label font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* User section */}
              <div className="p-4 border-t border-border-subtle">
                <button className="flex items-center gap-3 w-full px-4 h-12 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all duration-150">
                  <User className="w-5 h-5" />
                  <span className="text-label">Account</span>
                </button>
              </div>
            </aside>
          </>
        )}
      </>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-surface-1 border-r border-border-subtle flex flex-col">
      {/* Logo mark */}
      <div className="h-16 flex items-center justify-center border-b border-border-subtle">
        <Link href="/home" className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-ivy-600 flex items-center justify-center text-white font-bold text-sm">
            I
          </div>
        </Link>
      </div>

      {/* Navigation icons */}
      <nav className="flex-1 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <div key={item.name} className="relative px-2">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-150 relative",
                  isActive
                    ? "bg-surface-2 text-ivy-500"
                    : "text-text-tertiary hover:bg-surface-2 hover:text-text-secondary"
                )}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ivy-500 rounded-r" />
                )}
              </Link>
              
              {/* Tooltip */}
              {hoveredItem === item.name && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface-2 border border-border-medium rounded-lg text-label whitespace-nowrap pointer-events-none z-50 shadow-soft">
                  {item.name}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User menu at bottom */}
      <div className="p-2 border-t border-border-subtle">
        <button 
          className="flex items-center justify-center w-12 h-12 rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-secondary transition-all duration-150"
          aria-label="User menu"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}

