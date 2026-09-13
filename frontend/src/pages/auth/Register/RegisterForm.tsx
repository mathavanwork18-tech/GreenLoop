import { useState } from 'react'
import Icon from '../../../components/Icon'

interface RegisterFormProps {
  step: 2 | 3
  form: { name: string; email: string; phone: string; city: string; password: string; confirm: string }
  updateForm: (k: string, v: string) => void
  onNext: () => void
  onSubmit: () => void
  loading: boolean
}

export default function RegisterForm({ step, form, updateForm, onNext, onSubmit, loading }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (step === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="input-group">
          <label className="input-label">Full Name *</label>
          <input
            className="input"
            placeholder="Mathavan Kumar"
            value={form.name}
            onChange={e => updateForm('name', e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Email Address *</label>
          <input
            className="input"
            type="email"
            placeholder="mathavan@example.com"
            value={form.email}
            onChange={e => updateForm('email', e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Phone Number *</label>
          <input
            className="input"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={e => updateForm('phone', e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">City *</label>
          <input
            className="input"
            placeholder="Coimbatore"
            value={form.city}
            onChange={e => updateForm('city', e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary btn-lg btn-full"
          style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          disabled={!form.name || !form.email || !form.phone || !form.city}
          onClick={onNext}
        >
          <span>Continue</span>
          <Icon name="arrow-right" size={16} color="#fff" />
        </button>
      </div>
    )
  }

  const isLengthValid = form.password.length >= 6 && form.password.length <= 16
  const isMatch = form.password === form.confirm
  const isTooShort = form.password.length > 0 && form.password.length < 6
  const isTooLong = form.password.length > 16
  const isMismatch = Boolean(form.confirm && !isMatch)
  const isFormValid = isLengthValid && isMatch

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="input-label" style={{ margin: 0 }}>Password *</label>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: isTooLong ? '#ef4444' : isLengthValid ? 'var(--accent)' : 'var(--text-tertiary)',
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
            style={{ paddingRight: 42 }}
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
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color="var(--text-secondary)" />
          </button>
        </div>
        {isTooShort && (
          <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
            Password must be at least 6 characters.
          </span>
        )}
        {isTooLong && (
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
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={form.confirm}
            onChange={e => updateForm('confirm', e.target.value)}
            style={{ paddingRight: 42 }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            <Icon name={showConfirm ? 'eye-off' : 'eye'} size={18} color="var(--text-secondary)" />
          </button>
        </div>
        {isMismatch && (
          <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
            Passwords don't match.
          </span>
        )}
      </div>

      <div
        style={{
          background: 'var(--accent-light)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: '0.8rem',
          color: 'var(--accent-text)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon name="shield" size={15} color="var(--accent-text)" />
        <span>Use 6–16 characters. Letters and numbers are enough; symbols are optional.</span>
      </div>

      <button
        className="btn btn-primary btn-lg btn-full"
        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        disabled={!isFormValid || loading}
        onClick={onSubmit}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="animate-spin"
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
              }}
            />
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
  )
}
