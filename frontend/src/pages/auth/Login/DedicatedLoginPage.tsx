import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'
import { getRoleDashboardPath, normalizeRole } from '../../../services/role/roleService'

export default function DedicatedLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!identifier.trim()) {
      setError('Please enter your mobile number or email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const loggedInUser = await login(identifier.trim(), password)
      const targetPath = getRoleDashboardPath(normalizeRole(loggedInUser.role))
      navigate(targetPath, { replace: true })
    } catch (err: any) {
      console.error('[Green Loop Login] Error:', err)
      setError(err.message || 'Login failed. Please verify your credentials and connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 28px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent), #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Icon name="recycle" size={28} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}
          >
            Welcome Back to Green Loop
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Sign in to access your e-waste marketplace, claims, and eco-wallet
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: 18,
              fontSize: '0.82rem',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            <Icon name="alert" size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Identifier: Phone or Email */}
          <div>
            <label
              htmlFor="login-identifier"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}
            >
              Mobile Number or Email
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ position: 'absolute', left: 14, pointerEvents: 'none' }}>
                <Icon name="phone" size={16} color="var(--text-tertiary)" />
              </span>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or user@example.com"
                className="input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  height: 44,
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ position: 'absolute', left: 14, pointerEvents: 'none' }}>
                <Icon name="shield" size={16} color="var(--text-tertiary)" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 42,
                  height: 44,
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} color="var(--text-tertiary)" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              height: 46,
              width: '100%',
              marginTop: 6,
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <Icon name="arrow-right" size={16} color="#ffffff" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            margin: '24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        {/* Switch to Register */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            New to Green Loop?{' '}
          </span>
          <Link
            to="/register"
            style={{
              fontSize: '0.84rem',
              color: 'var(--accent)',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
