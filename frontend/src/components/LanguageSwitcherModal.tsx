import { useTranslation } from '../i18n/useTranslation'
import Icon from './Icon'

interface LanguageSwitcherModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LanguageSwitcherModal({ isOpen, onClose }: LanguageSwitcherModalProps) {
  const { language, setLanguage, languages, t } = useTranslation()

  if (!isOpen) return null

  const handleSelect = (code: string) => {
    setLanguage(code)
    onClose()
  }

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 420,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 9999,
          animation: 'scale-in 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="globe" size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {t('auth.chooseLanguage')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                {t('account.languagePref')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-2)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
          {languages.map((l) => {
            const isSelected = language === l.code
            return (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,78,59,0.4))'
                    : 'var(--bg-surface-2)',
                  border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>{l.flag || '🌐'}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {l.nativeName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {l.name} • {l.greeting}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--accent)' : '1.5px solid var(--border-color)',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Icon name="check" size={13} color="#fff" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
