import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  
  // If user is authenticated, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex min-h-screen flex-col chromic-bg">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            Campaign Generator
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
              Turn your brand URL into{" "}
              <span className="bg-gradient-to-r from-violet-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                campaign-ready assets
              </span>
            </h1>
            <p className="text-xl text-mist-300 mb-8 leading-relaxed">
              The fastest way for a brand to turn a website URL and product context 
              into an on-brand, editable campaign set.
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
                <h3 className="text-xl font-semibold mb-3">1. Submit your brand URL</h3>
                <p className="text-mist-300">
                  We analyze your public website to detect colors, fonts, logos, and brand style.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Review and confirm</h3>
                <p className="text-mist-300">
                  Review what we detected before you generate. Edit anything that needs adjustment.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-lg">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Generate campaigns</h3>
                <p className="text-mist-300">
                  Create campaign-ready assets, not one-off images. Export and use immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto glass-panel p-12 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Built for trust and transparency</h2>
            <p className="text-mist-300 mb-6">
              We analyze publicly available site styling and assets. 
              You'll review all detected values before campaign generation.
            </p>
            <p className="text-sm text-fog-400">
              No hidden assumptions. Every step has a purpose.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stroke-subtle py-8">
        <div className="container mx-auto px-6 text-center text-mist-300">
          <p>&copy; 2026 Campaign Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
