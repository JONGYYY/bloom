export default function SettingsPage() {
  return (
    <div style={{ maxWidth: '896px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#F3F7FF' }}>Settings</h1>
        <p style={{ color: '#A8B5CC' }}>Manage your account preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Profile</h2>
          <p style={{ color: '#A8B5CC' }}>Manage your profile settings</p>
        </div>

        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Theme</h2>
          <p style={{ color: '#A8B5CC' }}>Choose your preferred theme</p>
        </div>

        <div style={{
          background: 'rgba(15, 18, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#F3F7FF' }}>Notifications</h2>
          <p style={{ color: '#A8B5CC' }}>Configure notification preferences</p>
        </div>
      </div>
    </div>
  )
}
