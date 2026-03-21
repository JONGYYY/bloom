import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { brandId } = await params

    const profile = await prisma.brandProfile.findUnique({
      where: {
        brandId,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching brand profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { brandId } = await params
    const body = await request.json()

    const profile = await prisma.brandProfile.update({
      where: {
        brandId,
      },
      data: {
        colors: body.colors,
        fonts: body.fonts,
        logos: body.logos,
        styleTraits: body.styleTraits,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error updating brand profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
