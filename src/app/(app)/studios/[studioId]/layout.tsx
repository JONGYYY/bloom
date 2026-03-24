import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StudioHeader from "@/components/studio/studio-header"
import StudioTabs from "@/components/studio/studio-tabs"

export default async function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ studioId: string }>
}) {
  const { studioId } = await params

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!user) {
    redirect("/sign-in")
  }

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
    redirect("/studios")
  }

  return (
    <div className="flex flex-col h-screen">
      <StudioHeader 
        studioId={studioId} 
        studio={studio}
        profile={studio.profile || undefined}
      />
      <StudioTabs studioId={studioId} />
      
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
