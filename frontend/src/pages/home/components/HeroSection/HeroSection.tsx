import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import Icon from '../../../../components/Icon'

export default function HeroSection() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userName = user?.name ? user.name.split(' ')[0] : 'Citizen'

  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #0e1612 0%, #080d0a 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '24px 0 28px',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Welcome and Actions"
    >
      {/* Subtle ambient environmental glow */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container">
        {/* 1. Greeting & Identity */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.22)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--accent-text)',
            }}
          >
            <Icon name="sparkles" size={13} color="var(--accent)" />
            <span>AI Circular Network • Verified Zero Landfill</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 1.85rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}
        >
          Give Your E-Waste a Second Life, {userName}.
        </h1>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            margin: '0 0 20px',
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          Diagnose devices with AI, trade working components, or request certified doorstep recycling with official TNPCB compliance.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/post')}
            style={{
              flex: '1 1 180px',
              padding: '12px 20px',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            <Icon name="plus" size={18} color="#ffffff" />
            <span>Post E-Waste / Device</span>
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => navigate('/map')}
            style={{
              flex: '1 1 150px',
              padding: '12px 18px',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'var(--bg-surface)',
            }}
          >
            <Icon name="map" size={17} color="var(--accent)" />
            <span>Nearby Hubs</span>
          </button>
        </div>
      </div>
    </section>
  )
}
