import { useState } from 'react'
import Icon from '../../../components/Icon'

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => Promise<void>
  loading: boolean
  error: string | null
}

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password)
  }

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#991b1b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Icon name="alert" size={16} color="#991b1b" />
            <span>{error}</span>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input
            className="input"
            type="email"
            placeholder="mathavan@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
            >
              <Icon name="shield" size={16} color="var(--text-tertiary)" />
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: 4 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
              Forgot password?
            </span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span
                className="animate-spin"
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%'
                }}
              />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo hint */}
      <div
        style={{
          marginTop: 16,
          padding: '10px 14px',
          background: 'var(--accent-light)',
          borderRadius: 10,
          fontSize: '0.8rem',
          color: 'var(--accent-text)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <Icon name="sparkles" size={16} color="var(--accent-text)" />
        <span>
          <strong>Demo:</strong> Enter any email & password to sign in
        </span>
      </div>
    </div>
  )
}
