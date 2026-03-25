import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { tagBrandAsset, AssetType, AssetMetadata } from "@/lib/prompt"
import { z } from "zod"

const tagSchema = z.object({
  assetType: z.enum([
    'product_photo',
    'apparel_photo',
    'logo_mark',
    'logo_wordmark',
    'icon_set',
    'illustration_style_sample',
    'hero_image',
    'campaign_visual',
    'packaging_image',
    'label_tag_detail',
    'motif_crop',
    'texture_reference',
    'user_uploaded_reference',
    'previous_generated_asset',
  ]),
  manualTags: z.object({
    subtype: z.string().optional(),
    contentSubject: z.array(z.string()).optional(),
    brandRole: z.enum(['primary', 'secondary', 'reference', 'inspiration']).optional(),
    visualTraits: z.array(z.string()).optional(),
    compositionTags: z.array(z.string()).optional(),
    paletteTags: z.array(z.string()).optional(),
    textPresence: z.enum(['none', 'minimal', 'prominent', 'heavy']).optional(),
    brandRelevanceScore: z.number().min(0).max(100).optional(),
    qualityScore: z.number().min(0).max(100).optional(),
  }).optional(),
  useAI: z.boolean().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string; assetId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { studioId, assetId } = await params
    const body = await request.json()
    const { assetType, manualTags, useAI } = tagSchema.parse(body)

    // Tag the asset
    const metadata = await tagBrandAsset(assetId, assetType as AssetType, {
      manualTags,
      useAI,
    })

    return NextResponse.json({
      success: true,
      metadata,
    })
  } catch (error) {
    console.error("Error tagging asset:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string; assetId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { assetId } = await params

    // Get asset with metadata
    const { prisma } = await import('@/lib/db')
    const asset = await prisma.brandAsset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      asset,
      metadata: asset.metadata,
      isTagged: !!asset.metadata,
    })
  } catch (error) {
    console.error("Error fetching asset metadata:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
