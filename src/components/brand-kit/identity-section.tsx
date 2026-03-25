"use client"

interface IdentitySectionProps {
  logo?: string
  brandName?: string
  tagline?: string
  description?: string
}

export default function IdentitySection({
  logo,
  brandName,
  tagline,
  description,
}: IdentitySectionProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 className="text-heading" style={{ marginBottom: '24px' }}>
        Identity
      </h2>

      <div
        className="bg-surface-1 rounded-xl border border-border-subtle"
        style={{ padding: '32px' }}
      >
        {/* Logo Display */}
        {logo ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px',
            }}
          >
            <img
              src={logo}
              alt={brandName || 'Brand logo'}
              style={{
                maxWidth: '200px',
                maxHeight: '80px',
                objectFit: 'contain',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 32px',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px',
              border: '2px dashed var(--color-border-medium)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-surface-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-tertiary)' }}>
              No logo extracted
            </p>
          </div>
        )}

        {/* Brand Name */}
        <div style={{ marginBottom: brandName ? '16px' : '0' }}>
          <h3 className="text-display" style={{ marginBottom: '8px' }}>
            {brandName || 'Brand Name'}
          </h3>
          {!brandName && (
            <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
              Brand name will be extracted from the website
            </p>
          )}
        </div>

        {/* Description */}
        {description && (
          <div style={{ marginBottom: '16px' }}>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              {description}
            </p>
          </div>
        )}

        {/* Tagline */}
        {tagline && (
          <div
            style={{
              padding: '16px',
              background: 'var(--color-sage-50)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-ivy-500)',
            }}
          >
            <p className="text-label" style={{ color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
              Tagline
            </p>
            <p className="text-body" style={{ color: 'var(--color-text-primary)', fontStyle: 'italic' }}>
              "{tagline}"
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
