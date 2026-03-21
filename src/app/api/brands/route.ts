import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createBrandSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url } = createBrandSchema.parse(body)

    // Extract domain from URL
    const urlObj = new URL(url)
    const rootDomain = urlObj.hostname

    // Get or create user and workspace
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { workspace: true },
    })

    if (!user) {
      // Create workspace and user
      const workspace = await prisma.workspace.create({
        data: {
          name: "My Workspace",
          ownerId: userId,
        },
      })

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "user@example.com", // Will be updated from Clerk webhook
          workspaceId: workspace.id,
        },
        include: { workspace: true },
      })
    }

    // Create brand
    const brand = await prisma.brand.create({
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
        brandId: brand.id,
        payload: { url },
      },
    })

    // Enqueue job to BullMQ
    try {
      const { preflightQueue } = await import('@/workers/queue')
      await preflightQueue.add('preflight', {
        brandId: brand.id,
        url,
        jobId: job.id,
      })
    } catch (error) {
      console.error('Error enqueuing job:', error)
      // Continue anyway - job will be in database
    }

    return NextResponse.json({
      brandId: brand.id,
      jobId: job.id,
      message: "Brand extraction started",
    })
  } catch (error) {
    console.error("Error creating brand:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
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
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ brands: [] })
    }

    const brands = await prisma.brand.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      include: {
        profile: true,
        _count: {
          select: {
            assets: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
