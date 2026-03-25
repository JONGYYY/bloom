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

    // Fetch brand assets
    const assets = await prisma.brandAsset.findMany({
      where: { studioId },
      orderBy: { createdAt: 'desc' },
    })

    // Construct full S3 URLs for each asset
    const bucket = process.env.AWS_S3_BUCKET || 'bloom-assets'
    const region = process.env.AWS_REGION || 'us-east-1'
    
    console.log(`[Assets API] Constructing URLs with bucket: ${bucket}, region: ${region}`)
    
    const assetsWithUrls = assets.map(asset => ({
      ...asset,
      url: `https://${bucket}.s3.${region}.amazonaws.com/${asset.storageKey}`
    }))

    if (assetsWithUrls.length > 0) {
      console.log(`[Assets API] Sample URL: ${assetsWithUrls[0].url}`)
    }

    return NextResponse.json({ assets: assetsWithUrls })
  } catch (error) {
    console.error('Error fetching brand assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand assets' },
      { status: 500 }
    )
  }
}
