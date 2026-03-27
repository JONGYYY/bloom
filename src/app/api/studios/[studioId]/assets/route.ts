import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string }> }
) {
  try {
    const { studioId } = await params
    
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify studio ownership
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    })

    if (!studio || studio.workspaceId !== dbUser.workspaceId) {
      return NextResponse.json(
        { error: 'Studio not found or access denied' },
        { status: 404 }
      )
    }

    // Get tab filter from query params
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'recent'
    
    // Fetch assets based on tab
    let whereClause: any = { studioId }
    
    if (tab === 'favorites') {
      whereClause.isFavorite = true
    } else if (tab === 'references') {
      whereClause.isReference = true
    }
    // 'recent' shows all assets
    
    const assets = await prisma.asset.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    })

    console.log(`[Assets API] Found ${assets.length} assets for tab: ${tab}`)
    
    // Assets already have the 'url' field from generation worker
    // Just return them directly
    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching brand assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand assets' },
      { status: 500 }
    )
  }
}
