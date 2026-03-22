import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
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

    const { brandId } = await params
    const body = await request.json()

    // Update profile with confirmed data
    const profile = await prisma.brandProfile.update({
      where: {
        brandId,
      },
      data: {
        colors: body.colors,
        fonts: body.fonts,
        logos: body.logos,
        styleTraits: body.styleTraits,
        isConfirmed: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ profile, message: "Brand profile confirmed" })
  } catch (error) {
    console.error("Error confirming brand profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
