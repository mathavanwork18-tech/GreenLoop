import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import { supabase } from '../../utils/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    async function checkRecoverySession() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          setHasSession(true)
        }
      } catch {}
      setCheckingSession(false)
    }

    checkRecoverySession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(true)
        setCheckingSession(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      // Sign out recovery session and redirect to login
      await supabase.auth.signOut()
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2500)
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please request a new recovery link.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#061e14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: '#10b981',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ fontSize: '0.88rem', color: '#a7f3d0' }}>Verifying recovery link...</p>
        </div>
      </div>
    )
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
      }}
    >
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
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="check" size={28} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
              Password Updated!
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#a7f3d0', lineHeight: 1.5, marginBottom: 12 }}>
              Your password has been changed successfully. Redirecting you to sign in...
            </p>
          </div>
        ) : !hasSession ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="alert" size={26} color="#f87171" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
              Invalid or Expired Link
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#fca5a5', lineHeight: 1.5, marginBottom: 20 }}>
              The password reset link is invalid or has expired. Please request a new link from the forgot password page.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn btn-primary"
              style={{ width: '100%', height: 46, borderRadius: '12px', fontWeight: 700 }}
            >
              Request New Link
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981, #047857)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Icon name="shield" size={24} color="#ffffff" />
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                Set New Password
              </h1>
              <p style={{ fontSize: '0.82rem', color: '#a7f3d0', margin: 0 }}>
                Choose a secure password with at least 8 characters
              </p>
            </div>

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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  htmlFor="new-password"
                  style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}
                >
                  New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                    className="input"
                    style={{ width: '100%', paddingRight: 40, height: 46, fontSize: '0.9rem', borderRadius: '12px' }}
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
                      color: '#6ee7b7',
                    }}
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} color="#6ee7b7" />
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={loading}
                  className="input"
                  style={{ width: '100%', height: 46, fontSize: '0.9rem', borderRadius: '12px' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  height: 48,
                  width: '100%',
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
                  marginTop: 6,
                }}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
