import Link from "next/link"
import { Plus } from "lucide-react"

export default function BrandsPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Brands</h1>
          <p style={{ color: '#A8B5CC' }}>Manage your brand profiles and campaigns</p>
        </div>
        <Link href="/brands/new">
          <button style={{
            height: '48px',
            padding: '0 24px',
            background: '#7A6CFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Plus style={{ width: '20px', height: '20px' }} />
            Add Brand
          </button>
        </Link>
      </div>

      {/* Brand list will go here */}
      <div style={{
        background: 'rgba(15, 18, 25, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#F3F7FF' }}>No brands yet</h2>
          <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
            Add your first brand to get started with campaign generation.
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
