"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{
        background: 'rgba(28, 35, 49, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(168, 181, 204, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '40px'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#F3F7FF'
          }}>Welcome back</h1>
          <p style={{ color: '#A8B5CC' }}>Sign in to your account</p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={async () => {
            const supabase = createClient()
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${siteUrl}/auth/callback?next=${redirect}`
              }
            })
          }}
          style={{
            width: '100%',
            height: '44px',
            background: 'white',
            color: '#1f2937',
            border: '1px solid rgba(168, 181, 204, 0.3)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(168, 181, 204, 0.2)' }}></div>
          <span style={{ color: '#A8B5CC', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(168, 181, 204, 0.2)' }}></div>
        </div>

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              background: 'rgba(255, 107, 122, 0.1)',
              border: '1px solid rgba(255, 107, 122, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              color: '#FF6B7A'
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#F3F7FF'
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                height: '44px',
                background: '#121722',
                color: '#F3F7FF',
                border: '1px solid rgba(168, 181, 204, 0.2)',
                borderRadius: '8px',
                padding: '0 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#F3F7FF'
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{
                width: '100%',
                height: '44px',
                background: '#121722',
                color: '#F3F7FF',
                border: '1px solid rgba(168, 181, 204, 0.2)',
                borderRadius: '8px',
                padding: '0 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              background: '#7A6CFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              marginTop: '4px'
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: '#A8B5CC' }}>Don't have an account? </span>
          <Link href="/sign-up" style={{ color: '#7A6CFF', fontWeight: '500', textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-mist-300/20 rounded w-32 mx-auto mb-4"></div>
            <div className="h-4 bg-mist-300/20 rounded w-48 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-mist-300/20 rounded"></div>
              <div className="h-10 bg-mist-300/20 rounded"></div>
              <div className="h-10 bg-mist-300/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
