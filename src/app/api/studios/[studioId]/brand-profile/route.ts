import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { compressBrandProfile } from "@/lib/prompt"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string }> }
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

    const { studioId } = await params

    // Fetch studio with profile
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        profile: true,
        brandAssets: {
          take: 10, // Include some brand assets for context
        },
      },
    })

    if (!studio) {
      return NextResponse.json(
        { error: "Studio not found" },
        { status: 404 }
      )
    }

    if (!studio.profile) {
      return NextResponse.json(
        { error: "Studio profile not found" },
        { status: 404 }
      )
    }

    // Compress the brand profile
    const compressedProfile = compressBrandProfile(studio, studio.brandAssets)

    if (!compressedProfile) {
      return NextResponse.json(
        { error: "Failed to compress brand profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      studioId: studio.id,
      studioName: studio.displayName || studio.rootDomain,
      brandProfile: compressedProfile,
      rawProfile: {
        colors: studio.profile.colors,
        fonts: studio.profile.fonts,
        styleTraits: studio.profile.styleTraits,
      },
    })
  } catch (error) {
    console.error("Error fetching brand profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
