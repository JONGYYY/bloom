import { Sidebar } from "@/components/app-shell/sidebar"
import { Topbar } from "@/components/app-shell/topbar"
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
    <div className="min-h-screen chromic-bg">
      <Sidebar />
      <div className="ml-64">
        <Topbar user={{ email: user.email, name: user.user_metadata?.name }} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
