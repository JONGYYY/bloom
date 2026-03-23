import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string; presetId: string }> }
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

    const { presetId } = await params

    await prisma.preset.delete({
      where: { id: presetId },
    })

    return NextResponse.json({ message: "Preset deleted" })
  } catch (error) {
    console.error("Error deleting preset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
