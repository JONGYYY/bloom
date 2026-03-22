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
    <div className="w-full max-w-md">
      <div style={{
        background: 'rgba(28, 35, 49, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(168, 181, 204, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '32px'
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

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                height: '40px',
                background: '#121722',
                color: '#F3F7FF',
                border: '1px solid rgba(168, 181, 204, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px'
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
                height: '40px',
                background: '#121722',
                color: '#F3F7FF',
                border: '1px solid rgba(168, 181, 204, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              height: '40px',
              background: '#7A6CFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
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
