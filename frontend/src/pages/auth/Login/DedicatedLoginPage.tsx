import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'
import { getRoleDashboardPath, normalizeRole } from '../../../services/role/roleService'
import { getAuthTranslation } from '../../../utils/translations'

export default function DedicatedLoginPage() {
  const navigate = useNavigate()
  const { login, signInWithGoogle, language } = useAuth()
  const t = getAuthTranslation(language)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Catch OAuth errors or cancellations in URL redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash.substring(1)
    const hashParams = new URLSearchParams(hash)

    const oauthError =
      params.get('error_description') ||
      params.get('error') ||
      hashParams.get('error_description') ||
      hashParams.get('error')

    if (oauthError) {
      if (oauthError.toLowerCase().includes('denied') || oauthError.toLowerCase().includes('cancel')) {
        setError('Google Sign-In was cancelled. You can sign in with your email or try again.')
      } else {
        setError('Google Sign-In notice: ' + decodeURIComponent(oauthError).replace(/\+/g, ' '))
      }
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const loggedInUser = await login(cleanEmail, password)
      const targetPath = getRoleDashboardPath(normalizeRole(loggedInUser.role))
      navigate(targetPath, { replace: true })
    } catch (err: any) {
      console.error('[Green Loop Login] Error:', err)
      setError(err?.message || 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #061e14 0%, #064e3b 50%, #09261a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.08)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      {/* Language Switcher Link */}
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <Link
          to="/language"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#a7f3d0',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{language || 'EN'}</span>
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--bg-surface, #0f2d22)',
          border: '1px solid var(--border-color, rgba(16, 185, 129, 0.25))',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent, #10b981), #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Icon name="recycle" size={28} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary, #ffffff)',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}
          >
            {t.welcomeBack || 'Welcome to Green Loop'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #a7f3d0)', margin: 0 }}>
            Sign in to access your e-waste marketplace, claims, and eco-wallet
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: 18,
              fontSize: '0.82rem',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            <Icon name="alert" size={16} color="#f87171" />
            <span>{error}</span>
          </div>
        )}

        {/* Email + Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email Address */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary, #ffffff)',
                marginBottom: 6,
              }}
            >
              Email Address
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ position: 'absolute', left: 14, pointerEvents: 'none' }}>
                <Icon name="mail" size={16} color="var(--text-tertiary, #6ee7b7)" />
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading || isGoogleLoading}
                className="input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  height: 46,
                  fontSize: '0.88rem',
                  borderRadius: '12px',
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
                  color: 'var(--text-primary, #ffffff)',
                }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--accent, #10b981)',
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
                <Icon name="shield" size={16} color="var(--text-tertiary, #6ee7b7)" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading || isGoogleLoading}
                className="input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 42,
                  height: 46,
                  fontSize: '0.88rem',
                  borderRadius: '12px',
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
                  color: 'var(--text-tertiary, #6ee7b7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} color="var(--text-tertiary, #6ee7b7)" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isGoogleLoading}
            className="btn btn-primary"
            style={{
              height: 48,
              width: '100%',
              marginTop: 4,
              fontSize: '0.94rem',
              fontWeight: 800,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
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
                <span>Sign In with Email</span>
                <Icon name="arrow-right" size={16} color="#ffffff" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            margin: '22px 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border-color, rgba(255, 255, 255, 0.12))' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary, #6ee7b7)', fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color, rgba(255, 255, 255, 0.12))' }} />
        </div>

        {/* Alternative Auth Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Phone Login Option */}
          <Link
            to="/login/phone"
            style={{
              width: '100%',
              height: 46,
              borderRadius: '12px',
              border: '1px solid var(--border-color, rgba(16, 185, 129, 0.3))',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-primary, #ffffff)',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="phone" size={16} color="var(--accent, #10b981)" />
            <span>Sign in with Phone & OTP</span>
          </Link>

          {/* Real Google OAuth Button */}
          <button
            type="button"
            disabled={isGoogleLoading || loading}
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              height: 46,
              borderRadius: '12px',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-primary, #ffffff)',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: isGoogleLoading ? 'wait' : 'pointer',
              opacity: isGoogleLoading ? 0.7 : 1,
              transition: 'all 0.18s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #a7f3d0)' }}>
            New to Green Loop?{' '}
          </span>
          <Link
            to="/register"
            style={{
              fontSize: '0.84rem',
              color: 'var(--accent, #10b981)',
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
