import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex min-h-screen flex-col chromic-bg">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            Bloom
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/sign-in" 
              className="text-mist-300 hover:text-pearl-100 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Brand-aware creative{" "}
              <span className="bg-gradient-to-r from-violet-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                generation studio
              </span>
            </h1>
            <p className="text-xl text-mist-300 mb-8 leading-relaxed">
              Generate on-brand creative assets with AI that understands your brand's visual identity. 
              From social posts to marketing materials, all consistent with your brand.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/sign-up" 
                className="px-8 py-4 bg-violet-500 hover:bg-violet-600 text-white text-lg rounded-lg transition-colors font-medium"
              >
                Start with your brand
              </Link>
              <button className="px-8 py-4 glass-panel text-pearl-100 text-lg rounded-lg hover:border-violet-500 transition-colors font-medium">
                See how it works
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-lg">
                <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Create your brand studio</h3>
                <p className="text-mist-300">
                  Submit your website URL. We analyze your public site to extract colors, fonts, logos, and brand style.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Review your brand profile</h3>
                <p className="text-mist-300">
                  Review the detected brand elements. Edit colors, fonts, and style traits before generating.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Generate creative assets</h3>
                <p className="text-mist-300">
                  Describe what you need. AI generates on-brand assets using your brand's visual identity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Differentiation */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Bloom is different</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Brand-aware, not generic</h3>
                <p className="text-mist-300">
                  Unlike generic AI tools, Bloom learns your brand's visual identity and generates assets that match your style, colors, and aesthetic.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Structured creative control</h3>
                <p className="text-mist-300">
                  Control output type, aesthetic, composition, and brand strength. Generate exactly what you need, not random variations.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Built for workflow</h3>
                <p className="text-mist-300">
                  Save presets, reuse settings, organize favorites. Built for teams that generate creative assets regularly.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Trust and transparency</h3>
                <p className="text-mist-300">
                  Review all detected brand values before generation. No hidden assumptions. Every parameter is explicit and adjustable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto glass-panel p-12 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Public site analysis only</h2>
            <p className="text-mist-300 mb-6">
              We only analyze publicly available site styling and assets from your website. 
              You review and confirm everything before any creative generation begins.
            </p>
            <p className="text-sm text-fog-400">
              Clarity over spectacle. Trust over novelty. Workflow over demo.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stroke-subtle py-8">
        <div className="container mx-auto px-6 text-center text-mist-300">
          <p>&copy; 2026 Bloom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
