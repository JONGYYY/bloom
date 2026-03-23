import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

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

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        generation: true,
        studio: {
          select: {
            id: true,
            displayName: true,
            rootDomain: true,
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ asset })
  } catch (error) {
    console.error("Error fetching asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const body = await request.json()

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        isFavorite: body.isFavorite,
        isReference: body.isReference,
      },
    })

    return NextResponse.json({ asset })
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.asset.delete({
      where: { id: assetId },
    })

    return NextResponse.json({ message: "Asset deleted" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
