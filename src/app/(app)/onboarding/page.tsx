"use client"

import { useRouter } from "next/navigation"
import { Sparkles, Palette, Zap } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 20% 50%, rgba(122, 108, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(60, 203, 255, 0.1) 0%, transparent 50%), #090B10'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          {/* Logo/Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #7A6CFF, #3CCBFF)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>

          {/* Welcome message */}
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>
            Welcome to Bloom
          </h1>
          <p style={{ fontSize: '16px', color: '#A8B5CC', marginBottom: '32px', lineHeight: '1.6' }}>
            Your brand-aware creative generation studio. Generate on-brand assets with AI that understands your visual identity.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(122, 108, 255, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Palette style={{ width: '20px', height: '20px', color: '#7A6CFF' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#F3F7FF' }}>
                  Brand-aware generation
                </h3>
                <p style={{ fontSize: '14px', color: '#A8B5CC' }}>
                  AI that learns your brand's colors, fonts, and style to generate consistent assets
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(60, 203, 255, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Zap style={{ width: '20px', height: '20px', color: '#3CCBFF' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#F3F7FF' }}>
                  Structured creative control
                </h3>
                <p style={{ fontSize: '14px', color: '#A8B5CC' }}>
                  Control output type, aesthetic, composition, and brand strength with precision
                </p>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => router.push('/studios/new')}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 24px',
                background: '#7A6CFF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Create your first studio
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 24px',
                background: 'transparent',
                color: '#F3F7FF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Skip and explore
            </button>
          </div>

          {/* Help text */}
          <p style={{ fontSize: '12px', color: '#A8B5CC', marginTop: '24px' }}>
            Need help? Check out our documentation or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
