"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Stepper, type Step } from "@/components/brand-review/stepper"
import { Loader2 } from "lucide-react"

// Define the schema for brand profile
const brandProfileSchema = z.object({
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

type BrandProfileForm = z.infer<typeof brandProfileSchema>

const steps: Step[] = [
  { id: "overview", label: "Overview", description: "Brand summary" },
  { id: "colors", label: "Colors", description: "Color palette" },
  { id: "fonts", label: "Fonts", description: "Typography" },
  { id: "logos", label: "Logos", description: "Logo selection" },
  { id: "traits", label: "Style", description: "Brand traits" },
  { id: "review", label: "Review", description: "Final confirmation" },
]

export default function BrandReviewPage() {
  const router = useRouter()
  const params = useParams()
  const brandId = params.brandId as string

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [brandProfile, setBrandProfile] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandProfileForm>({
    resolver: zodResolver(brandProfileSchema),
  })

  // Fetch brand profile
  useEffect(() => {
    async function fetchBrandProfile() {
      try {
        const response = await fetch(`/api/brands/${brandId}/profile`)
        if (response.ok) {
          const data = await response.json()
          setBrandProfile(data.profile)
          
          // Set form defaults
          if (data.profile) {
            setValue("colors", data.profile.colors)
            setValue("fonts", data.profile.fonts)
            setValue("logos", data.profile.logos)
            setValue("styleTraits", data.profile.styleTraits)
          }
        }
      } catch (error) {
        console.error("Error fetching brand profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrandProfile()
  }, [brandId, setValue])

  const onSubmit = async (data: BrandProfileForm) => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/brands/${brandId}/profile/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/brands/${brandId}`)
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
          <p style={{ color: '#A8B5CC' }}>Loading brand profile...</p>
        </div>
      </div>
    )
  }

  if (!brandProfile) {
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
          <p style={{ color: '#A8B5CC' }}>Brand profile not found</p>
          <button 
            onClick={() => router.push("/brands")}
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
            Back to Brands
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Review Your Brand Profile</h1>
        <p style={{ color: '#A8B5CC' }}>
          Review and edit the detected brand elements before confirming
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
                    We've analyzed your brand and extracted the following elements.
                    Review each section and make any necessary adjustments.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(122, 108, 255, 0.1)', border: '1px solid rgba(122, 108, 255, 0.2)' }}>
                      <h3 style={{ fontWeight: '500', marginBottom: '8px', color: '#F3F7FF' }}>What's next?</h3>
                      <ul style={{ fontSize: '14px', color: '#A8B5CC', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                        <li>• Review your color palette</li>
                        <li>• Confirm typography choices</li>
                        <li>• Select your logo</li>
                        <li>• Define brand style traits</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Colors</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Review and adjust your brand color palette
                  </p>
                  <div style={{ color: '#A8B5CC' }}>Color palette editor coming soon...</div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Fonts</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Review your typography choices
                  </p>
                  <div style={{ color: '#A8B5CC' }}>Font selector coming soon...</div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Logos</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Select your primary logo
                  </p>
                  <div style={{ color: '#A8B5CC' }}>Logo selector coming soon...</div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Style Traits</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Define your brand's visual style
                  </p>
                  <div style={{ color: '#A8B5CC' }}>Style trait editor coming soon...</div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Final Review</h2>
                  <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
                    Review all your brand elements before confirming
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(76, 217, 100, 0.1)', border: '1px solid rgba(76, 217, 100, 0.2)' }}>
                      <p style={{ fontSize: '14px', color: '#4CD964' }}>
                        ✓ Your brand profile is ready to be confirmed
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
                      "Confirm Brand Profile"
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
