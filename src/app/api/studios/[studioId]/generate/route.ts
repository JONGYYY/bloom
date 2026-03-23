import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const generateSchema = z.object({
  prompt: z.string().min(1),
  parameters: z.object({
    outputType: z.string().optional(),
    aesthetic: z.string().optional(),
    aspectRatio: z.string().optional(),
    variants: z.number().min(1).max(4).default(1),
    brandStrength: z.string().optional(),
    textPresence: z.string().optional(),
    composition: z.string().optional(),
    mood: z.string().optional(),
    artMovement: z.array(z.string()).optional(),
    quality: z.string().optional(),
    referenceImages: z.array(z.string()).optional(),
  }),
})

export async function POST(
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
    const body = await request.json()
    const { prompt, parameters } = generateSchema.parse(body)

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        studioId,
        prompt,
        parameters,
        status: 'queued',
      },
    })

    // Enqueue generation job
    try {
      const { generationQueue } = await import('@/workers/queue')
      await generationQueue.add('generate', {
        generationId: generation.id,
        studioId,
        prompt,
        parameters,
      })
    } catch (error) {
      console.error('Error enqueuing generation job:', error)
    }

    return NextResponse.json({
      generationId: generation.id,
      message: "Generation started",
    })
  } catch (error) {
    console.error("Error creating generation:", error)
    
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
    const generationId = searchParams.get('generationId')

    if (generationId) {
      // Get specific generation with its assets
      const generation = await prisma.generation.findUnique({
        where: { id: generationId },
        include: {
          assets: true,
        },
      })

      if (!generation) {
        return NextResponse.json(
          { error: "Generation not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ generation })
    }

    // Get all generations for studio
    const generations = await prisma.generation.findMany({
      where: { studioId },
      include: {
        assets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({ generations })
  } catch (error) {
    console.error("Error fetching generations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
