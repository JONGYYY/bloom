"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Stepper, type Step } from "@/components/brand-review/stepper"
import { Button } from "@/components/ui/button"
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
        router.push(`/app/brands/${brandId}`)
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
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-lg p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-mist-300">Loading brand profile...</p>
        </div>
      </div>
    )
  }

  if (!brandProfile) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-lg p-12 text-center">
          <p className="text-mist-300">Brand profile not found</p>
          <Button onClick={() => router.push("/app/brands")} className="mt-4">
            Back to Brands
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Your Brand Profile</h1>
        <p className="text-mist-300">
          Review and edit the detected brand elements before confirming
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
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
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Form content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="glass-panel rounded-lg p-8">
              {/* Step content will go here */}
              {currentStep === 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Overview</h2>
                  <p className="text-mist-300 mb-6">
                    We've analyzed your brand and extracted the following elements.
                    Review each section and make any necessary adjustments.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <h3 className="font-medium mb-2">What's next?</h3>
                      <ul className="text-sm text-mist-300 space-y-2">
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
                  <h2 className="text-2xl font-bold mb-4">Colors</h2>
                  <p className="text-mist-300 mb-6">
                    Review and adjust your brand color palette
                  </p>
                  {/* Color picker component will go here */}
                  <div className="text-mist-300">Color palette editor coming soon...</div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Fonts</h2>
                  <p className="text-mist-300 mb-6">
                    Review your typography choices
                  </p>
                  {/* Font selector will go here */}
                  <div className="text-mist-300">Font selector coming soon...</div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Logos</h2>
                  <p className="text-mist-300 mb-6">
                    Select your primary logo
                  </p>
                  {/* Logo selector will go here */}
                  <div className="text-mist-300">Logo selector coming soon...</div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Style Traits</h2>
                  <p className="text-mist-300 mb-6">
                    Define your brand's visual style
                  </p>
                  {/* Style trait chips will go here */}
                  <div className="text-mist-300">Style trait editor coming soon...</div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Final Review</h2>
                  <p className="text-mist-300 mb-6">
                    Review all your brand elements before confirming
                  </p>
                  {/* Summary will go here */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-success-500/10 border border-success-500/20">
                      <p className="text-sm text-success-500">
                        ✓ Your brand profile is ready to be confirmed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      "Confirm Brand Profile"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right: Live preview */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div className="space-y-4">
              <div className="aspect-video bg-slate-glass-800/50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-mist-300">Brand preview</p>
              </div>
              <div className="text-sm text-mist-300">
                See how your brand elements come together
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
