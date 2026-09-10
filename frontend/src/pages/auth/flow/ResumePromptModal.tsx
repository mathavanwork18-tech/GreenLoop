import Icon from '../../../components/Icon'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'

interface Props {
  language: LanguageCode
  phone: string
  role?: string
  onResume: () => void
  onStartOver: () => void
}

export default function ResumePromptModal({
  language,
  phone,
  role,
  onResume,
  onStartOver,
}: Props) {
  const t = getAuthTranslation(language)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 20,
          background: 'linear-gradient(160deg, #152a1e 0%, #0d1f17 100%)',
          border: '1.5px solid #10b981',
          padding: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            border: '2px solid #10b981',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="refresh" size={24} color="#10b981" />
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
            {t.resumeTitle}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {t.resumeDesc}
          </p>
          <div
            style={{
              marginTop: 10,
              fontSize: '0.8rem',
              color: '#34d399',
              fontWeight: 700,
              background: 'rgba(16,185,129,0.1)',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'inline-block',
            }}
          >
            +91 {phone} {role ? `• ${role === 'LOCAL_SHOP' ? 'Shop' : 'Citizen'}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onResume}
            className="btn btn-primary btn-lg btn-full"
            style={{
              height: 48,
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span>{t.resumeContinue}</span>
            <Icon name="arrow-right" size={16} color="#fff" />
          </button>

          <button
            type="button"
            onClick={onStartOver}
            style={{
              height: 42,
              borderRadius: '12px',
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.startOver}
          </button>
        </div>
      </div>
    </div>
  )
}
