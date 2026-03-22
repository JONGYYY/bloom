"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      // Check if email confirmation is required
      if (data.user.identities?.length === 0) {
        setError("An account with this email already exists")
        setLoading(false)
      } else {
        setSuccess(true)
        // Auto sign-in and redirect
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      }
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Account created!</h2>
          <p className="text-mist-300">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
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
          }}>Get started</h1>
          <p style={{ color: '#A8B5CC' }}>Create your account</p>
        </div>

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <label htmlFor="name" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#F3F7FF'
            }}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
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
              minLength={6}
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
            <p style={{ fontSize: '12px', color: '#A8B5CC', marginTop: '4px' }}>Must be at least 6 characters</p>
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: '#A8B5CC' }}>Already have an account? </span>
          <Link href="/sign-in" style={{ color: '#7A6CFF', fontWeight: '500', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
