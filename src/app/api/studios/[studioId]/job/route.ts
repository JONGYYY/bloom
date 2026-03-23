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

    // Get the most recent job for this studio
    const job = await prisma.generationJob.findFirst({
      where: {
        studioId,
        jobType: "brand_extraction",
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error fetching job status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
