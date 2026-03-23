import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createStudioSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url } = createStudioSchema.parse(body)

    // Extract domain from URL
    const urlObj = new URL(url)
    const rootDomain = urlObj.hostname

    // Get or create user and workspace
    let user = await prisma.user.findUnique({
      where: { authId: authUser.id },
      include: { workspace: true },
    })

    if (!user) {
      // Create workspace and user
      const workspace = await prisma.workspace.create({
        data: {
          name: "My Workspace",
          ownerId: authUser.id,
        },
      })

      user = await prisma.user.create({
        data: {
          authId: authUser.id,
          email: authUser.email || "user@example.com",
          name: authUser.user_metadata?.name || null,
          workspaceId: workspace.id,
        },
        include: { workspace: true },
      })
    }

    // Create studio
    const studio = await prisma.studio.create({
      data: {
        workspaceId: user.workspaceId,
        submittedUrl: url,
        rootDomain,
        displayName: rootDomain,
        status: "pending",
      },
    })

    // Create extraction job
    const job = await prisma.generationJob.create({
      data: {
        jobType: "brand_extraction",
        status: "queued",
        stage: "queued",
        studioId: studio.id,
        payload: { url },
      },
    })

    // Enqueue job to BullMQ
    try {
      const { preflightQueue } = await import('@/workers/queue')
      await preflightQueue.add('preflight', {
        studioId: studio.id,
        url,
        jobId: job.id,
      })
    } catch (error) {
      console.error('Error enqueuing job:', error)
    }

    return NextResponse.json({
      studioId: studio.id,
      jobId: job.id,
      message: "Studio extraction started",
    })
  } catch (error) {
    console.error("Error creating studio:", error)
    
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { authId: authUser.id },
    })

    if (!user) {
      return NextResponse.json({ studios: [] })
    }

    const studios = await prisma.studio.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      include: {
        profile: true,
        _count: {
          select: {
            brandAssets: true,
            assets: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ studios })
  } catch (error) {
    console.error("Error fetching studios:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
