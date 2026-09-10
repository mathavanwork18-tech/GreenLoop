import Icon from '../../../components/Icon'

interface LoginHeaderProps {
  onBack?: () => void
  title?: string
  subtitle?: string
}

export default function LoginHeader({ onBack, title = 'Welcome back', subtitle = 'Sign in to your Green Loop account' }: LoginHeaderProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #0d1f17, #064e3b)',
        padding: '48px 24px 60px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)'
        }}
      />
      {onBack && (
        <button
          onClick={onBack}
          style={{
            color: '#6ee7b7',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Icon name="close" size={20} color="#6ee7b7" />
        </button>
      )}
      <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem', marginBottom: 6 }}>{title}</h2>
      <p style={{ color: '#6ee7b7', fontSize: '0.9rem', margin: 0 }}>{subtitle}</p>
    </div>
  )
}
