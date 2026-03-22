"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Globe, CheckCircle2, AlertCircle } from "lucide-react"

const brandUrlSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
})

type BrandUrlForm = z.infer<typeof brandUrlSchema>

export default function NewBrandPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandUrlForm>({
    resolver: zodResolver(brandUrlSchema),
  })

  const onSubmit = async (data: BrandUrlForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: data.url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create brand")
      }

      const result = await response.json()
      router.push(`/brands/${result.brandId}/processing`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Add Your Brand</h1>
        <p style={{ color: '#A8B5CC' }}>
          Enter your website URL and we'll analyze your brand styling
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Left: Form */}
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label htmlFor="url" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>
                Website URL
              </label>
              <div style={{ position: 'relative' }}>
                <Globe style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#A8B5CC' }} />
                <input
                  id="url"
                  type="url"
                  placeholder="https://yourbrand.com"
                  {...register("url")}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    background: 'rgba(15, 18, 25, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#F3F7FF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              {errors.url && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#FF6B6B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle style={{ width: '16px', height: '16px' }} />
                  {errors.url.message}
                </p>
              )}
            </div>

            {error && (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#FF6B6B', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#7A6CFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? "Analyzing..." : "Analyze Brand"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/brands")}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'transparent',
                  color: '#F3F7FF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Trust message */}
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(122, 108, 255, 0.1)', border: '1px solid rgba(122, 108, 255, 0.2)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#F3F7FF' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#7A6CFF' }} />
              What we analyze
            </h3>
            <p style={{ fontSize: '14px', color: '#A8B5CC' }}>
              We analyze publicly available site styling and assets. 
              You'll review every detected brand value before generating campaigns.
            </p>
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'rgba(15, 18, 25, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>What we'll detect</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#A8B5CC', listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#4CD964', flexShrink: 0, marginTop: '2px' }} />
                <span>Color palette (primary, secondary, accent colors)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#4CD964', flexShrink: 0, marginTop: '2px' }} />
                <span>Typography (heading and body fonts)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#4CD964', flexShrink: 0, marginTop: '2px' }} />
                <span>Logo candidates from your site</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#4CD964', flexShrink: 0, marginTop: '2px' }} />
                <span>Brand style traits and aesthetic</span>
              </li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(15, 18, 25, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Example brands</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(30, 35, 48, 0.5)' }}>
                <code style={{ color: '#3CCBFF' }}>https://stripe.com</code>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(30, 35, 48, 0.5)' }}>
                <code style={{ color: '#3CCBFF' }}>https://airbnb.com</code>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(30, 35, 48, 0.5)' }}>
                <code style={{ color: '#3CCBFF' }}>https://shopify.com</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
