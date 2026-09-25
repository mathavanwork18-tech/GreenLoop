import { useState } from 'react'
import Icon from '../../../components/Icon'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'

interface LanguageOption {
  code: LanguageCode
  native: string
  english: string
  greeting: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'EN', native: 'English', english: 'English', greeting: 'Welcome to Green Loop' },
  { code: 'TA', native: 'தமிழ்', english: 'Tamil', greeting: 'கிரீன் லூப்பிற்கு நல்வரவு' },
  { code: 'HI', native: 'हिन्दी', english: 'Hindi', greeting: 'ग्रीन लूप में आपका स्वागत है' },
  { code: 'ML', native: 'മലയാളം', english: 'Malayalam', greeting: 'ഗ്രീൻ ലൂപ്പിലേക്ക് സ്വാഗതം' },
  { code: 'KN', native: 'ಕನ್ನಡ', english: 'Kannada', greeting: 'ಗ್ರೀನ್ ಲೂಪ್‌ಗೆ ಸುಸ್ವಾಗತ' },
  { code: 'TE', native: 'తెలుగు', english: 'Telugu', greeting: 'గ్రీన్ లూప్‌కు స్వాగతం' },
]

interface Props {
  currentLanguage: LanguageCode
  onSelectLanguage: (lang: LanguageCode) => void
  onContinue: () => void
  onBack?: () => void
}

export default function LanguageSelectStep({
  currentLanguage,
  onSelectLanguage,
  onContinue,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<LanguageCode>(currentLanguage)
  const t = getAuthTranslation(selected)

  const handleSelect = (code: LanguageCode) => {
    setSelected(code)
    onSelectLanguage(code)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        padding: '24px 20px',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="arrow-left" size={18} color="var(--accent)" />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t.chooseLanguage}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {t.selectLanguageSubtitle}
          </p>
        </div>
      </div>

      {/* Language Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code

          return (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isSelected ? '2px solid #10b981' : '1.5px solid var(--border-color)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(16,185,129,0.18) 100%)'
                  : 'var(--bg-surface)',
                boxShadow: isSelected
                  ? '0 0 20px rgba(16,185,129,0.22), 0 4px 12px rgba(0,0,0,0.2)'
                  : '0 2px 6px rgba(0,0,0,0.1)',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: isSelected ? '#34d399' : 'var(--text-primary)',
                    }}
                  >
                    {lang.native}
                  </span>
                  {lang.native !== lang.english && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                      — {lang.english}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', color: isSelected ? '#a7f3d0' : 'var(--text-secondary)' }}>
                  {lang.greeting}
                </span>
              </div>

              {/* Selection Check Circle */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #10b981' : '2px solid var(--border-color)',
                  background: isSelected ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.18s ease',
                  flexShrink: 0,
                }}
              >
                {isSelected && <Icon name="check" size={14} color="#0d1f17" />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Sticky Action Area */}
      <div style={{ paddingTop: 24, marginTop: 'auto' }}>
        <button
          type="button"
          onClick={onContinue}
          className="btn btn-primary btn-lg btn-full"
          style={{
            height: 52,
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(16,185,129,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span>{t.continueBtn}</span>
          <Icon name="arrow-right" size={18} color="#fff" />
        </button>
      </div>
    </div>
  )
}
