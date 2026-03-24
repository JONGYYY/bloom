"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { User, Building, Sliders, Bell, CreditCard } from "lucide-react"

export default function SettingsPage() {
  const [defaultQuality, setDefaultQuality] = useState("draft")
  const [defaultVariants, setDefaultVariants] = useState(2)
  const [defaultAspectRatio, setDefaultAspectRatio] = useState("1:1")

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', padding: '48px' }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 className="text-display" style={{ marginBottom: '8px' }}>
          Settings
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your account and workspace preferences
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Account Section */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <User className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
            <h2 className="text-heading">Account</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                className="w-full h-10 px-3 bg-surface-2 border border-border-medium rounded-lg text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 focus-visible:border-ivy-500 transition-all duration-150"
                placeholder="your@email.com"
                disabled
              />
              <p className="text-caption" style={{ color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                Contact support to change your email
              </p>
            </div>

            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Display Name
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 bg-surface-2 border border-border-medium rounded-lg text-body text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 focus-visible:border-ivy-500 transition-all duration-150"
                placeholder="Your name"
              />
            </div>
          </div>
        </Card>

        {/* Workspace Section */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Building className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
            <h2 className="text-heading">Workspace</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Workspace Name
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 bg-surface-2 border border-border-medium rounded-lg text-body text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivy-500 focus-visible:border-ivy-500 transition-all duration-150"
                placeholder="My Workspace"
              />
            </div>

            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Plan
              </label>
              <div style={{ 
                padding: '12px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p className="text-label">Free Plan</p>
                  <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                    100 generations per month
                  </p>
                </div>
                <button className="inline-flex items-center justify-center h-9 px-4 bg-ivy-600 text-white rounded-lg text-label font-medium hover:bg-ivy-700 transition-all duration-150">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Generation Defaults Section */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sliders className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
            <h2 className="text-heading">Generation Defaults</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Default Quality
              </label>
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setDefaultQuality("draft")}
                  className={`px-4 h-9 rounded text-label font-medium transition-all duration-150 ${
                    defaultQuality === "draft"
                      ? "bg-ivy-600 text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Draft (2K)
                </button>
                <button
                  onClick={() => setDefaultQuality("final")}
                  className={`px-4 h-9 rounded text-label font-medium transition-all duration-150 ${
                    defaultQuality === "final"
                      ? "bg-ivy-600 text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Final (4K)
                </button>
              </div>
            </div>

            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Default Variants
              </label>
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1 inline-flex">
                {[1, 2, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDefaultVariants(num)}
                    className={`px-4 h-9 rounded text-label font-medium transition-all duration-150 ${
                      defaultVariants === num
                        ? "bg-ivy-600 text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
                Default Aspect Ratio
              </label>
              <div className="flex items-center gap-1 bg-surface-2 border border-border-medium rounded-lg p-1 inline-flex">
                {["1:1", "4:5", "9:16", "16:9"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setDefaultAspectRatio(ratio)}
                    className={`px-4 h-9 rounded text-label font-medium transition-all duration-150 ${
                      defaultAspectRatio === ratio
                        ? "bg-ivy-600 text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Bell className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
            <h2 className="text-heading">Notifications</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="text-label">Generation complete</p>
                <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                  Get notified when your generations are ready
                </p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="text-label">Brand profile updates</p>
                <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                  Get notified about brand kit changes
                </p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </Card>

        {/* Billing Section */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CreditCard className="w-5 h-5" style={{ color: 'var(--color-ivy-500)' }} />
            <h2 className="text-heading">Billing</h2>
          </div>
          
          <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Manage your subscription and payment methods
          </p>
          
          <button className="inline-flex items-center justify-center h-10 px-6 bg-surface-2 border border-border-medium text-text-primary rounded-lg text-label hover:bg-surface-3 hover:border-border-strong transition-all duration-150">
            Manage Billing
          </button>
        </Card>
      </div>
    </div>
  )
}
