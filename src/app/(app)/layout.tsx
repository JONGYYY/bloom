import { Sidebar } from "@/components/app-shell/sidebar"
import { Topbar } from "@/components/app-shell/topbar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen chromic-bg">
      <Sidebar />
      <div className="ml-64">
        <Topbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
