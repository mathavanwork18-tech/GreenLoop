import Icon from '../../../components/Icon'

interface RegisterHeaderProps {
  step: 1 | 2 | 3
  onBack: () => void
}

export default function RegisterHeader({ step, onBack }: RegisterHeaderProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #0d1f17, #064e3b)',
        padding: '36px 24px 48px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)'
        }}
      />
      <button
        onClick={onBack}
        style={{
          color: '#6ee7b7',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Icon name="close" size={20} color="#6ee7b7" />
      </button>

      {/* Step indicators */}
      <div className="step-indicator" style={{ marginBottom: 20 }}>
        {[1, 2, 3].map(s => (
          <div key={`step-wrap-${s}`} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
              style={{
                borderColor: step >= s ? '#10b981' : 'rgba(255,255,255,0.3)',
                color: step >= s ? '#fff' : 'rgba(255,255,255,0.4)',
                background: step > s ? '#10b981' : step === s ? '#10b981' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {step > s ? <Icon name="check" size={11} color="#fff" /> : s}
            </div>
            {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
        {step === 1 ? 'Choose Your Role' : step === 2 ? 'Personal Details' : 'Create Password'}
      </h2>
      <p style={{ color: '#6ee7b7', fontSize: '0.88rem', margin: 0 }}>
        {step === 1 ? 'How will you use Green Loop?' : step === 2 ? 'Tell us about yourself' : 'Keep your account secure'}
      </p>
    </div>
  )
}
