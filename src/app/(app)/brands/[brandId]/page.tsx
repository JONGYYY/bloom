import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"

export default function BrandOverviewPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brand Overview</h1>
          <p className="text-mist-300">Your confirmed brand profile</p>
        </div>
        <div className="flex gap-3">
          <Link href="./review">
            <Button variant="ghost">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
          <div className="flex gap-2">
            {/* Placeholder color swatches */}
            <div className="w-12 h-12 rounded-lg bg-violet-500" />
            <div className="w-12 h-12 rounded-lg bg-cyan-500" />
            <div className="w-12 h-12 rounded-lg bg-teal-500" />
          </div>
        </div>

        {/* Fonts */}
        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Typography</h2>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-mist-300">Heading</div>
              <div className="text-lg font-semibold">Geist Sans</div>
            </div>
            <div>
              <div className="text-sm text-mist-300">Body</div>
              <div>Geist Sans</div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Logo</h2>
          <div className="aspect-video bg-slate-glass-800/50 rounded-lg flex items-center justify-center">
            <p className="text-sm text-mist-300">Logo preview</p>
          </div>
        </div>

        {/* Style Traits */}
        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Style Traits</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-500 text-sm">
              Minimal
            </span>
            <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-500 text-sm">
              Premium
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
        <div className="glass-panel rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-mist-300 mb-6">
              Create your first campaign using this brand profile
            </p>
            <Button>
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
