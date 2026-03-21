import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-mist-300">Welcome back. Start creating your next campaign.</p>
        </div>
        <Link href="/app/brands/new">
          <Button size="lg">
            <Plus className="w-5 h-5" />
            Add Brand
          </Button>
        </Link>
      </div>

      {/* Empty state for now */}
      <div className="glass-panel rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No brands yet</h2>
          <p className="text-mist-300 mb-6">
            Get started by adding your first brand. We'll analyze your website and extract your brand profile.
          </p>
          <Link href="/app/brands/new">
            <Button>Add your first brand</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
