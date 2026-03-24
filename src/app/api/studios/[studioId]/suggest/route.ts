import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string }> }
) {
  try {
    const { studioId } = await params

    // Verify authentication
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with workspace
    const user = await prisma.user.findUnique({
      where: { authId: authUser.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify studio ownership
    const studio = await prisma.studio.findFirst({
      where: {
        id: studioId,
        workspaceId: user.workspaceId,
      },
      include: {
        profile: true,
      },
    })

    if (!studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { outputType, currentPrompt } = body

    // Build context for GPT-4
    const profile = studio.profile as any
    const colors = [
      ...(profile?.colors?.primary || []),
      ...(profile?.colors?.secondary || []),
      ...(profile?.colors?.accent || [])
    ].slice(0, 6)

    const styleTraits = profile?.styleTraits || []
    const fonts = profile?.fonts || {}

    const systemPrompt = `You are a creative assistant helping users generate visual content for their brand. 
    
Brand Context:
- Colors: ${colors.join(', ')}
- Style Traits: ${styleTraits.join(', ')}
- Heading Font: ${fonts.heading?.family || 'Not specified'}
- Body Font: ${fonts.body?.family || 'Not specified'}

Generate 3-5 creative prompt suggestions that:
1. Align with the brand's visual identity
2. Are specific and actionable
3. ${outputType ? `Are suitable for "${outputType}" format` : 'Work well for various formats'}
4. Include relevant details (composition, mood, style)
5. Are concise (1-2 sentences each)

${currentPrompt ? `User's current prompt: "${currentPrompt}"\nBuild upon or refine this idea.` : ''}

Return ONLY a JSON array of strings, no other text:
["suggestion 1", "suggestion 2", "suggestion 3", ...]`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate creative prompt suggestions for this brand." }
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("No suggestions generated")
    }

    // Parse JSON response
    let suggestions: string[]
    try {
      suggestions = JSON.parse(content)
    } catch (parseError) {
      // Fallback: extract suggestions from text
      suggestions = content
        .split('\n')
        .filter(line => line.trim().startsWith('"') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[-"]\s*/, '').replace(/"$/, '').trim())
        .filter(s => s.length > 10)
        .slice(0, 5)
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Suggestion error:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
