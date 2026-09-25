import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import { normalizeRole, getRoleDashboardPath } from '../../services/role/roleService'

type Step = 'welcome' | 'login'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState<Step>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true); setError('')
    try {
      const user = await login(email, password)
      const targetPath = getRoleDashboardPath(normalizeRole(user?.role))
      navigate(targetPath, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'welcome') {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0d1f17 0%, #064e3b 50%, #0d1f17 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(16,185,129,0.1)'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(16,185,129,0.08)'
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
          <div className="login-logo-wrapper">
            <img
              src="/logo.png"
              alt="Green Loop"
              className="login-logo-img"
              style={{ width: 88 }}
            />
          </div>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, color: '#fff',
            letterSpacing: '-0.02em', marginBottom: 8
          }}>Green Loop</h1>
          <p style={{ color: '#6ee7b7', fontSize: '1rem', fontWeight: 500 }}>
            Give Your E-Waste a Second Life.
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{ width: '100%', maxWidth: 360, marginBottom: 48 }}>
          {[
            { icon: 'sparkles' as const, text: 'AI-powered device identification' },
            { icon: 'map' as const, text: 'Find nearby repair & recycling' },
            { icon: 'coin' as const, text: 'Earn Green Coins for eco-actions' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', marginBottom: 10,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Icon name={f.icon} size={20} color="#34d399" />
              <span style={{ color: '#d1fae5', fontSize: '0.9rem', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn btn-primary btn-lg btn-full"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => setStep('login')}
          >
            <span>Get Started</span>
            <Icon name="arrow-right" size={16} color="#fff" />
          </button>
          <button
            className="btn btn-ghost btn-lg btn-full"
            style={{ border: '1.5px solid rgba(255,255,255,0.2)', color: '#d1fae5' }}
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: 32, textAlign: 'center' }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #0d1f17, #064e3b)',
        padding: '48px 24px 60px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)'
        }} />
        <button
          onClick={() => setStep('welcome')}
          style={{ color: '#6ee7b7', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center' }}
        >
          <Icon name="close" size={20} color="#6ee7b7" />
        </button>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem', marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>Sign in to your Green Loop account</p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '0 24px', marginTop: -24 }}>
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: 10, padding: '10px 14px',
                color: '#991b1b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8
              }}>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
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

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'var(--accent-light)',
            borderRadius: 10, fontSize: '0.8rem',
            color: 'var(--accent-text)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Icon name="sparkles" size={16} color="var(--accent-text)" />
            <span><strong>Demo:</strong> Enter any email & password to sign in</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <span
            style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >Create one</span>
        </div>
      </div>
    </div>
  )
}
