import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import type { IconName } from '../../components/Icon'
import PasswordRequirements2Ticks from '../../components/PasswordRequirements2Ticks'
import { normalizeRole, getRoleDashboardPath } from '../../services/role/roleService'

type Step = 1 | 2 | 3
type Role = 'GENERAL_USER' | 'LOCAL_SHOP' | 'RECYCLER'

const ROLES: { id: Role; icon: IconName; name: string; desc: string; color: string; bg: string }[] = [
  {
    id: 'GENERAL_USER',
    icon: 'user',
    name: 'General User',
    desc: 'Scan, sell, donate, repair, recycle your e-waste. Earn Green Coins.',
    color: '#059669',
    bg: '#d1fae5'
  },
  {
    id: 'LOCAL_SHOP',
    icon: 'shop',
    name: 'Local Shop',
    desc: 'Buy/sell electronics, offer repair services, collect e-waste.',
    color: '#2563eb',
    bg: '#dbeafe'
  },
  {
    id: 'RECYCLER',
    icon: 'recycle',
    name: 'Recycling Company',
    desc: 'Accept e-waste, manage pickups, issue recycling certificates.',
    color: '#7c3aed',
    bg: '#ede9fe'
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, signInWithGoogle } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true)
      setError('')
      if (selectedRole) {
        localStorage.setItem('gl_pending_role', normalizeRole(selectedRole))
      }
      await signInWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Google Sign-Up failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  const isPasswordMin = form.password.length >= 6
  const isPasswordMax = form.password.length <= 16
  const isPasswordLengthValid = isPasswordMin && isPasswordMax
  const isPasswordMismatch = Boolean(form.confirm && form.password !== form.confirm)
  const isPasswordValid = isPasswordLengthValid && !isPasswordMismatch && Boolean(form.confirm)

  const handleSubmit = async () => {
    if (!form.password) { setError('Password is required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password.length > 16) { setError('Password must be 16 characters or fewer.'); return }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return }
    if (!selectedRole) { setError('Please select a role'); return }
    setLoading(true); setError('')
    try {
      const newUser = await register({ ...form, role: selectedRole })
      const targetPath = getRoleDashboardPath(normalizeRole(newUser?.role || selectedRole))
      navigate(targetPath, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #0d1f17, #064e3b)',
        padding: '36px 24px 48px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)'
        }} />
        <button
          onClick={() => step > 1 ? setStep(s => (s - 1) as Step) : navigate('/login')}
          style={{ color: '#6ee7b7', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center' }}
        >
          <Icon name="close" size={20} color="#6ee7b7" />
        </button>

        {/* Step indicators */}
        <div className="step-indicator" style={{ marginBottom: 20 }}>
          {[1,2,3].map(s => (
            <div key={`step-wrap-${s}`} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
                style={{ borderColor: step >= s ? '#10b981' : 'rgba(255,255,255,0.3)', color: step >= s ? '#fff' : 'rgba(255,255,255,0.4)', background: step > s ? '#10b981' : step === s ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step > s ? <Icon name="check" size={11} color="#fff" /> : s}
              </div>
              {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
          {step === 1 ? 'Choose Your Role' : step === 2 ? 'Personal Details' : 'Create Password'}
        </h2>
        <p style={{ color: '#6ee7b7', fontSize: '0.88rem' }}>
          {step === 1 ? 'How will you use Green Loop?' : step === 2 ? 'Tell us about yourself' : 'Keep your account secure'}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 20px', marginTop: -24, paddingBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              color: '#991b1b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Icon name="alert" size={16} color="#991b1b" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ROLES.map(role => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 16, borderRadius: 14,
                    border: `2px solid ${selectedRole === role.id ? role.color : 'var(--border-color)'}`,
                    background: selectedRole === role.id ? role.bg : 'var(--bg-surface)',
                    cursor: 'pointer', transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{
                    width: 50, height: 50, borderRadius: 12,
                    background: role.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    border: `1px solid ${role.color}30`
                  }}>
                    <Icon name={role.icon} size={24} color={role.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 3 }}>{role.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{role.desc}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${selectedRole === role.id ? role.color : 'var(--border-color)'}`,
                    background: selectedRole === role.id ? role.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem', flexShrink: 0
                  }}>
                    {selectedRole === role.id && <Icon name="check" size={11} color="#fff" />}
                  </div>
                </div>
              ))}
              <button
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={!selectedRole}
                onClick={() => setStep(2)}
              >
                <span>Continue</span>
                <Icon name="arrow-right" size={16} color="#fff" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 4px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              </div>

              <button
                type="button"
                disabled={isGoogleLoading || loading}
                onClick={handleGoogleSignUp}
                style={{
                  height: 48,
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: isGoogleLoading ? 'wait' : 'pointer',
                  opacity: isGoogleLoading ? 0.7 : 1,
                  width: '100%',
                  transition: 'all 0.18s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Connecting...' : selectedRole ? `Sign Up as ${ROLES.find(r => r.id === selectedRole)?.name} with Google` : 'Sign Up with Google'}</span>
              </button>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input className="input" placeholder="Mathavan Kumar" value={form.name} onChange={e => updateForm('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address (Optional)</label>
                <input className="input" type="email" placeholder="mathavan@example.com (optional)" value={form.email} onChange={e => updateForm('email', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number *</label>
                <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">City *</label>
                <input className="input" placeholder="Coimbatore" value={form.city} onChange={e => updateForm('city', e.target.value)} />
              </div>
              <button
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={!form.name || !form.phone || !form.city}
                onClick={() => setStep(3)}
              >
                <span>Continue</span>
                <Icon name="arrow-right" size={16} color="#fff" />
              </button>
            </div>
          )}

          {/* STEP 3: Password */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="input-label" style={{ margin: 0 }}>Password *</label>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: form.password.length > 16 ? '#ef4444' : form.password.length >= 6 ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    {form.password.length}/16
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter 6–16 characters"
                    value={form.password}
                    onChange={e => updateForm('password', e.target.value)}
                    style={{
                      paddingRight: 44,
                      borderColor: form.password.length > 0 && !isPasswordLengthValid ? '#ef4444' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4,
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color="var(--text-secondary)" />
                  </button>
                </div>
                {form.password.length > 0 && form.password.length < 6 && (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
                    Password must be at least 6 characters.
                  </span>
                )}
                {form.password.length > 16 && (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
                    Password must be 16 characters or fewer.
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={e => updateForm('confirm', e.target.value)}
                    style={{
                      paddingRight: 44,
                      borderColor: isPasswordMismatch ? '#ef4444' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4,
                    }}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color="var(--text-secondary)" />
                  </button>
                </div>
                {isPasswordMismatch && (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
                    Passwords don't match.
                  </span>
                )}
              </div>

              {/* 2-Tick Password Acceptance Indicator */}
              <PasswordRequirements2Ticks
                password={form.password}
                confirmPassword={form.confirm}
              />

              <button
                className="btn btn-primary btn-lg btn-full"
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading || !form.password || !isPasswordValid ? 0.6 : 1,
                  cursor: loading || !form.password || !isPasswordValid ? 'not-allowed' : 'pointer',
                }}
                disabled={loading || !form.password || !isPasswordValid}
                onClick={handleSubmit}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                    Creating account...
                  </span>
                ) : (
                  <>
                    <span>Create My Account</span>
                    <Icon name="leaf" size={16} color="#fff" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 20 }}>
          Already have an account?{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign in</span>
        </div>
      </div>
    </div>
  )
}
