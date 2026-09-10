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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="input-group">
        <label className="input-label">Password *</label>
        <input
          className="input"
          type="password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={e => updateForm('password', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label className="input-label">Confirm Password *</label>
        <input
          className="input"
          type="password"
          placeholder="Re-enter password"
          value={form.confirm}
          onChange={e => updateForm('confirm', e.target.value)}
        />
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
          gap: 8
        }}
      >
        <Icon name="shield" size={15} color="var(--accent-text)" />
        <span>Your data is encrypted and never shared without your consent.</span>
      </div>
      <button
        className="btn btn-primary btn-lg btn-full"
        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        disabled={!form.password || form.password.length < 8 || loading}
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
                borderRadius: '50%'
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
