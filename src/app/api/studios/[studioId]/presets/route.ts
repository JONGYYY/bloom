import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createPresetSchema = z.object({
  name: z.string().min(1).max(100),
  parameters: z.object({}).passthrough(),
})

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

    const presets = await prisma.preset.findMany({
      where: { studioId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ presets })
  } catch (error) {
    console.error("Error fetching presets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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
    const { name, parameters } = createPresetSchema.parse(body)

    const preset = await prisma.preset.create({
      data: {
        studioId,
        name,
        parameters: parameters as any,
      },
    })

    return NextResponse.json({ preset })
  } catch (error) {
    console.error("Error creating preset:", error)
    
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
