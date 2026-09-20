import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { LanguageCode } from '../../types/common.types'
import LanguageSelectStep from './flow/LanguageSelectStep'

export default function LanguageSelectionPage() {
  const navigate = useNavigate()
  const { language, setLanguage } = useAuth()
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language || 'EN')

  const handleSelectLanguage = (code: LanguageCode) => {
    setSelectedLang(code)
    setLanguage(code)
  }

  const handleContinue = () => {
    // Explicitly guarantee language preference is stored
    localStorage.setItem('gl_language', selectedLang)
    setLanguage(selectedLang)
    navigate('/login', { replace: true })
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
          maxWidth: 440,
          background: 'var(--bg-surface, #0f2d22)',
          border: '1px solid var(--border-color, rgba(16, 185, 129, 0.2))',
          borderRadius: '24px',
          padding: '28px 20px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
          minHeight: 520,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LanguageSelectStep
          currentLanguage={selectedLang}
          onSelectLanguage={handleSelectLanguage}
          onContinue={handleContinue}
        />
      </div>
    </div>
  )
}
