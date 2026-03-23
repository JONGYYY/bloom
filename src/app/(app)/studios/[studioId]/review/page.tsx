"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Stepper, type Step } from "@/components/studio-review/stepper"
import { Loader2 } from "lucide-react"

// Define the schema for studio profile
const studioProfileSchema = z.object({
  colors: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    accent: z.array(z.string()),
    confidence: z.enum(["high", "medium", "low"]),
  }),
  fonts: z.object({
    heading: z.object({
      family: z.string(),
      weight: z.string(),
      confidence: z.enum(["high", "medium", "low"]),
    }),
    body: z.object({
      family: z.string(),
      weight: z.string(),
      confidence: z.enum(["high", "medium", "low"]),
    }),
  }),
  logos: z.object({
    candidates: z.array(
      z.object({
        url: z.string(),
        confidence: z.enum(["high", "medium", "low"]),
      })
    ),
    selected: z.string().nullable(),
  }),
  styleTraits: z.array(z.string()),
})

type StudioProfileForm = z.infer<typeof studioProfileSchema>

const steps: Step[] = [
  { id: "overview", label: "Overview", description: "Studio summary" },
  { id: "colors", label: "Colors", description: "Color palette" },
  { id: "fonts", label: "Fonts", description: "Typography" },
  { id: "logos", label: "Logos", description: "Logo selection" },
  { id: "traits", label: "Style", description: "Studio traits" },
  { id: "review", label: "Review", description: "Final confirmation" },
]

export default function StudioReviewPage() {
  const router = useRouter()
  const params = useParams()
  const studioId = params.studioId as string

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [studioProfile, setStudioProfile] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudioProfileForm>({
    resolver: zodResolver(studioProfileSchema),
  })

  // Fetch studio profile
  useEffect(() => {
    async function fetchStudioProfile() {
      try {
        const response = await fetch(`/api/studios/${studioId}/profile`)
        if (response.ok) {
          const data = await response.json()
          setStudioProfile(data.profile)
          
          // Set form defaults
          if (data.profile) {
            setValue("colors", data.profile.colors)
            setValue("fonts", data.profile.fonts)
            setValue("logos", data.profile.logos)
            setValue("styleTraits", data.profile.styleTraits)
          }
        }
      } catch (error) {
        console.error("Error fetching studio profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudioProfile()
  }, [studioId, setValue])

  const onSubmit = async (data: StudioProfileForm) => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/studios/${studioId}/profile/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/studios/${studioId}`)
      }
    } catch (error) {
      console.error("Error confirming profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#7A6CFF', margin: '0 auto 16px' }} className="animate-spin" />
          <p style={{ color: '#A8B5CC' }}>Loading studio profile...</p>
        </div>
      </div>
    )
  }

  if (!studioProfile) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#A8B5CC' }}>Studio profile not found</p>
          <button 
            onClick={() => router.push("/studios")}
            style={{
              marginTop: '16px',
              height: '44px',
              padding: '0 24px',
              background: '#7A6CFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Back to Studios
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Review Your Studio Profile</h1>
        <p style={{ color: '#A8B5CC' }}>
          Review and edit the detected studio elements before confirming
        </p>
      </div>

      {/* Stepper */}
      <div style={{ marginBottom: '32px' }}>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(index) => {
            if (index <= currentStep) {
              setCurrentStep(index)
            }
          }}
        />
      </div>

      {/* Main content area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Form content */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{
              background: 'rgba(15, 18, 25, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '32px'
            }}>
              {/* Step content will go here */}
              {currentStep === 0 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Overview</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    We've analyzed your studio and extracted the following elements.
                    Review each section and make any necessary adjustments.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(122, 108, 255, 0.1)', border: '1px solid rgba(122, 108, 255, 0.2)' }}>
                      <h3 style={{ fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>What's next?</h3>
                      <ul style={{ fontSize: '14px', color: '#A8B5CC', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>• Review your color palette</li>
                        <li>• Confirm typography choices</li>
                        <li>• Select your logo</li>
                        <li>• Define studio style traits</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Colors</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Review and adjust your studio color palette
                  </p>
                  
                  {studioProfile?.colors && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Primary Colors */}
                      {studioProfile.colors.primary && studioProfile.colors.primary.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#F3F7FF' }}>Primary Colors</h3>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {studioProfile.colors.primary.map((color: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <div style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  borderRadius: '12px', 
                                  background: color,
                                  border: '2px solid rgba(255, 255, 255, 0.1)'
                                }} />
                                <span style={{ fontSize: '12px', color: '#A8B5CC', fontFamily: 'monospace' }}>{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Secondary Colors */}
                      {studioProfile.colors.secondary && studioProfile.colors.secondary.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#F3F7FF' }}>Secondary Colors</h3>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {studioProfile.colors.secondary.map((color: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <div style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  borderRadius: '12px', 
                                  background: color,
                                  border: '2px solid rgba(255, 255, 255, 0.1)'
                                }} />
                                <span style={{ fontSize: '12px', color: '#A8B5CC', fontFamily: 'monospace' }}>{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Accent Colors */}
                      {studioProfile.colors.accent && studioProfile.colors.accent.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#F3F7FF' }}>Accent Colors</h3>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {studioProfile.colors.accent.map((color: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <div style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  borderRadius: '12px', 
                                  background: color,
                                  border: '2px solid rgba(255, 255, 255, 0.1)'
                                }} />
                                <span style={{ fontSize: '12px', color: '#A8B5CC', fontFamily: 'monospace' }}>{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Fonts</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Review your typography choices
                  </p>
                  
                  {studioProfile?.fonts && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Heading Font */}
                      {studioProfile.fonts.heading && (
                        <div style={{
                          padding: '24px',
                          borderRadius: '12px',
                          background: 'rgba(30, 35, 48, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#A8B5CC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Heading Font</h3>
                          <div style={{ 
                            fontSize: '32px', 
                            fontWeight: studioProfile.fonts.heading.weight || '600',
                            color: '#F3F7FF',
                            marginBottom: '8px'
                          }}>
                            {studioProfile.fonts.heading.family}
                          </div>
                          <div style={{ fontSize: '14px', color: '#A8B5CC' }}>
                            Weight: {studioProfile.fonts.heading.weight} • Confidence: {studioProfile.fonts.heading.confidence}
                          </div>
                        </div>
                      )}
                      
                      {/* Body Font */}
                      {studioProfile.fonts.body && (
                        <div style={{
                          padding: '24px',
                          borderRadius: '12px',
                          background: 'rgba(30, 35, 48, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#A8B5CC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body Font</h3>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: studioProfile.fonts.body.weight || '400',
                            color: '#F3F7FF',
                            marginBottom: '8px'
                          }}>
                            {studioProfile.fonts.body.family}
                          </div>
                          <div style={{ fontSize: '14px', color: '#A8B5CC' }}>
                            Weight: {studioProfile.fonts.body.weight} • Confidence: {studioProfile.fonts.body.confidence}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Logos</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Select your primary logo
                  </p>
                  
                  {studioProfile?.logos?.candidates && studioProfile.logos.candidates.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {studioProfile.logos.candidates.map((logo: any, idx: number) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            const updatedProfile = { ...studioProfile }
                            updatedProfile.logos.selected = logo.url
                            setStudioProfile(updatedProfile)
                            setValue('logos', updatedProfile.logos)
                          }}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'rgba(30, 35, 48, 0.5)',
                            border: studioProfile.logos.selected === logo.url 
                              ? '2px solid #7A6CFF' 
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ 
                            aspectRatio: '16/9', 
                            background: 'rgba(255, 255, 255, 0.05)', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px',
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={logo.url} 
                              alt={`Logo candidate ${idx + 1}`}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const placeholder = document.createElement('div')
                                  placeholder.style.cssText = 'color: #A8B5CC; font-size: 14px; text-align: center;'
                                  placeholder.textContent = 'Image unavailable'
                                  parent.appendChild(placeholder)
                                }
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '12px', color: '#A8B5CC', textAlign: 'center' }}>
                            Confidence: {logo.confidence}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '32px', 
                      textAlign: 'center', 
                      color: '#A8B5CC',
                      background: 'rgba(30, 35, 48, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      No logo candidates detected
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Style Traits</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Define your studio's visual style
                  </p>
                  
                  {studioProfile?.styleTraits && studioProfile.styleTraits.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {studioProfile.styleTraits.map((trait: string, idx: number) => (
                        <span 
                          key={idx}
                          style={{ 
                            padding: '12px 20px', 
                            borderRadius: '9999px', 
                            background: 'rgba(122, 108, 255, 0.2)', 
                            color: '#7A6CFF', 
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid rgba(122, 108, 255, 0.3)'
                          }}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '32px', 
                      textAlign: 'center', 
                      color: '#A8B5CC',
                      background: 'rgba(30, 35, 48, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      No style traits detected
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Final Review</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Review all your studio elements before confirming
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(76, 217, 100, 0.1)', border: '1px solid rgba(76, 217, 100, 0.2)' }}>
                      <p style={{ fontSize: '14px', color: '#4CD964' }}>
                        ✓ Your studio profile is ready to be confirmed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    style={{
                      height: '44px',
                      padding: '0 24px',
                      background: 'transparent',
                      color: '#F3F7FF',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Previous
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button 
                    type="button" 
                    onClick={handleNext}
                    style={{
                      height: '44px',
                      padding: '0 24px',
                      background: '#7A6CFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    style={{
                      height: '44px',
                      padding: '0 24px',
                      background: '#7A6CFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      "Confirm Studio Profile"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
