import Icon from './Icon'

interface PasswordRequirements2TicksProps {
  password: string
  confirmPassword?: string
  showSummary?: boolean
}

/**
 * 2-Tick Password Acceptance Component
 * Replaces complicated 5-tick password validation with 2 simple, intuitive checks:
 * 1. 6–16 characters
 * 2. Passwords match
 */
export default function PasswordRequirements2Ticks({
  password,
  confirmPassword = '',
  showSummary = true,
}: PasswordRequirements2TicksProps) {
  const isLengthValid = password.length >= 6 && password.length <= 16
  const isMatchValid = Boolean(confirmPassword && password === confirmPassword)
  const allAccepted = isLengthValid && isMatchValid

  // Don't clutter UI if user hasn't started typing
  if (!password && !confirmPassword) return null

  return (
    <div
      style={{
        background: allAccepted ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-2)',
        border: `1px solid ${allAccepted ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
        borderRadius: '12px',
        padding: '10px 14px',
        marginTop: 10,
        marginBottom: 12,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: allAccepted ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          Password Security (2 Simple Steps)
        </span>
        {showSummary && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              background: allAccepted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: allAccepted ? '#10b981' : 'var(--text-tertiary)',
            }}
          >
            {allAccepted ? '2/2 Accepted' : `${(isLengthValid ? 1 : 0) + (isMatchValid ? 1 : 0)}/2`}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Tick 1: Length */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: isLengthValid ? '#10b981' : 'var(--text-secondary)',
            transition: 'color 0.15s ease',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: isLengthValid ? '#10b981' : 'rgba(255,255,255,0.1)',
              border: `1.5px solid ${isLengthValid ? '#10b981' : 'var(--border-color)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isLengthValid ? (
              <Icon name="check" size={11} color="#ffffff" />
            ) : (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>1</span>
            )}
          </div>
          <span>6–16 characters</span>
        </div>

        {/* Tick 2: Passwords Match */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: isMatchValid ? '#10b981' : 'var(--text-secondary)',
            transition: 'color 0.15s ease',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: isMatchValid ? '#10b981' : 'rgba(255,255,255,0.1)',
              border: `1.5px solid ${isMatchValid ? '#10b981' : 'var(--border-color)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isMatchValid ? (
              <Icon name="check" size={11} color="#ffffff" />
            ) : (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>2</span>
            )}
          </div>
          <span>Passwords match</span>
        </div>
      </div>
    </div>
  )
}
