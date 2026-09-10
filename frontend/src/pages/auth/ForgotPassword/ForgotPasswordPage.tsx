import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/Icon'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          background: 'linear-gradient(160deg, #0d1f17, #064e3b)',
          padding: '48px 24px 60px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <button
          onClick={() => navigate('/login')}
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
          <Icon name="arrow-left" size={20} color="#6ee7b7" />
        </button>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem', marginBottom: 6 }}>Reset Password</h2>
        <p style={{ color: '#6ee7b7', fontSize: '0.9rem', margin: 0 }}>
          Enter your registered email to receive a recovery code
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 24px', marginTop: -24 }}>
        <div className="card" style={{ padding: 24 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Icon name="check" size={24} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Reset Link Sent
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                We have sent instructions to <strong>{email}</strong>. Please check your inbox.
              </p>
              <button onClick={() => navigate('/login')} className="btn btn-primary btn-full">
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="mathavan@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full">
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
