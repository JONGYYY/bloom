export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(circle at 20% 50%, rgba(122, 108, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(60, 203, 255, 0.1) 0%, transparent 50%), #090B10'
    }}>
      {children}
    </div>
  )
}
