import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

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
    const { searchParams } = new URL(request.url)
    
    const tab = searchParams.get('tab') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereClause: any = { studioId }

    if (tab === 'favorites') {
      whereClause.isFavorite = true
    } else if (tab === 'references') {
      whereClause.isReference = true
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        generation: {
          select: {
            id: true,
            prompt: true,
            parameters: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.asset.count({ where: whereClause })

    return NextResponse.json({ assets, total })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
