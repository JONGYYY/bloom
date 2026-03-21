import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function BrandsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brands</h1>
          <p className="text-mist-300">Manage your brand profiles and campaigns</p>
        </div>
        <Link href="/app/brands/new">
          <Button size="lg">
            <Plus className="w-5 h-5" />
            Add Brand
          </Button>
        </Link>
      </div>

      {/* Brand list will go here */}
      <div className="glass-panel rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">No brands yet</h2>
          <p className="text-mist-300 mb-6">
            Add your first brand to get started with campaign generation.
          </p>
          <Link href="/app/brands/new">
            <Button>Add your first brand</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
