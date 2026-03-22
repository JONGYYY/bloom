"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Your Brand</h1>
        <p className="text-mist-300">
          Enter your website URL and we'll analyze your brand styling
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="glass-panel rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mist-300" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://yourbrand.com"
                  className="pl-10"
                  {...register("url")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.url && (
                <p className="mt-2 text-sm text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.url.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Analyzing..." : "Analyze Brand"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => router.push("/brands")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Trust message */}
          <div className="mt-6 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-500" />
              What we analyze
            </h3>
            <p className="text-sm text-mist-300">
              We analyze publicly available site styling and assets. 
              You'll review every detected brand value before generating campaigns.
            </p>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">What we'll detect</h2>
            <ul className="space-y-3 text-sm text-mist-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Color palette (primary, secondary, accent colors)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Typography (heading and body fonts)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Logo candidates from your site</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Brand style traits and aesthetic</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Example brands</h2>
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-slate-glass-800/50">
                <code className="text-cyan-500">https://stripe.com</code>
              </div>
              <div className="p-3 rounded-lg bg-slate-glass-800/50">
                <code className="text-cyan-500">https://airbnb.com</code>
              </div>
              <div className="p-3 rounded-lg bg-slate-glass-800/50">
                <code className="text-cyan-500">https://shopify.com</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
