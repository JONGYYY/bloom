import Link from "next/link"
import { Plus } from "lucide-react"

export default function StudiosPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Studios</h1>
          <p style={{ color: '#A8B5CC' }}>Manage your brand studios and creative assets</p>
        </div>
        <Link href="/studios/new">
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
            New Studio
          </button>
        </Link>
      </div>

      {/* Studio list will go here */}
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
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#F3F7FF' }}>No studios yet</h2>
          <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
            Create your first brand studio to start generating creative assets.
          </p>
          <Link href="/studios/new">
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
              Create your first studio
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
