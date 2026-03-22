import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '30px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#F3F7FF'
          }}>Dashboard</h1>
          <p style={{ color: '#A8B5CC' }}>Welcome back. Start creating your next campaign.</p>
        </div>
        <Link href="/brands/new">
          <button style={{
            height: '44px',
            padding: '0 24px',
            background: '#7A6CFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Plus className="w-5 h-5" />
            Add Brand
          </button>
        </Link>
      </div>

      {/* Empty state */}
      <div style={{
        background: 'rgba(28, 35, 49, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(168, 181, 204, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(122, 108, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Plus style={{ width: '32px', height: '32px', color: '#7A6CFF' }} />
          </div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#F3F7FF'
          }}>No brands yet</h2>
          <p style={{ 
            color: '#A8B5CC', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Get started by adding your first brand. We'll analyze your website and extract your brand profile.
          </p>
          <Link href="/brands/new">
            <button style={{
              height: '44px',
              padding: '0 24px',
              background: '#7A6CFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Add your first brand
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
