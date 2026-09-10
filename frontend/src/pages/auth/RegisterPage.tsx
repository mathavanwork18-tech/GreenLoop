import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import type { IconName } from '../../components/Icon'

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
  const { register } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (!selectedRole) { setError('Please select a role'); return }
    setLoading(true); setError('')
    try {
      await register({ ...form, role: selectedRole })
      navigate('/')
    } catch {
      setError('Registration failed. Please try again.')
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
                <label className="input-label">Email Address *</label>
                <input className="input" type="email" placeholder="mathavan@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} />
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
                disabled={!form.name || !form.email || !form.phone || !form.city}
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
                <label className="input-label">Password *</label>
                <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password *</label>
                <input className="input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => updateForm('confirm', e.target.value)} />
              </div>
              <div style={{
                background: 'var(--accent-light)', borderRadius: 10, padding: '10px 14px',
                fontSize: '0.8rem', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Icon name="shield" size={15} color="var(--accent-text)" />
                <span>Your data is encrypted and never shared without your consent.</span>
              </div>
              <button
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={!form.password || form.password.length < 8 || loading}
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
