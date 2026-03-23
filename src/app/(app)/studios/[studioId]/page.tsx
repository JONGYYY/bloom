import Link from "next/link"
import { Edit, Plus } from "lucide-react"

export default function StudioOverviewPage() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Studio Overview</h1>
          <p style={{ color: '#A8B5CC' }}>Your confirmed studio profile</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="./review">
            <button style={{
              height: '44px',
              padding: '0 20px',
              background: 'transparent',
              color: '#F3F7FF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Edit style={{ width: '16px', height: '16px' }} />
              Edit Profile
            </button>
          </Link>
          <button style={{
            height: '44px',
            padding: '0 20px',
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
            <Plus style={{ width: '16px', height: '16px' }} />
            Generate
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Colors */}
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Color Palette</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Placeholder color swatches */}
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#7A6CFF' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3CCBFF' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#14B8A6' }} />
          </div>
        </div>

        {/* Fonts */}
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Typography</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#A8B5CC' }}>Heading</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#F3F7FF' }}>Geist Sans</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#A8B5CC' }}>Body</div>
              <div style={{ color: '#F3F7FF' }}>Geist Sans</div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Logo</h2>
          <div style={{ aspectRatio: '16/9', background: 'rgba(30, 35, 48, 0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '14px', color: '#A8B5CC' }}>Logo preview</p>
          </div>
        </div>

        {/* Style Traits */}
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Style Traits</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '9999px', background: 'rgba(122, 108, 255, 0.2)', color: '#7A6CFF', fontSize: '14px' }}>
              Minimal
            </span>
            <span style={{ padding: '6px 12px', borderRadius: '9999px', background: 'rgba(122, 108, 255, 0.2)', color: '#7A6CFF', fontSize: '14px' }}>
              Premium
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns section */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#F3F7FF' }}>Campaigns</h2>
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
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#F3F7FF' }}>No campaigns yet</h3>
            <p style={{ color: '#A8B5CC', marginBottom: '24px' }}>
              Create your first campaign using this studio profile
            </p>
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
