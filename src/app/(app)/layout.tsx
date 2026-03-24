import { Sidebar } from "@/components/app-shell/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen surface-canvas">
      <Sidebar />
      <div className="ml-16 md:ml-16 ml-0">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
