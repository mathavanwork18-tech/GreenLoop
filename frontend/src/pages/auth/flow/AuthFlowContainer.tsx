import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type Role } from '../../../context/AuthContext'
import type { LanguageCode } from '../../../types/common.types'
import LanguageSelectStep from './LanguageSelectStep'
import AccountTypeStep from './AccountTypeStep'
import CitizenRegisterStep from './CitizenRegisterStep'
import ShopRegisterStep from './ShopRegisterStep'
import { usePwaInstall } from '../../../context/PwaInstallContext'
import InstallButton from '../../../components/InstallButton'
import { normalizeRole, getRoleDashboardPath } from '../../../services/role/roleService'

export type AuthStep =
  | 'LANGUAGE'
  | 'ROLE'
  | 'CITIZEN_REG'
  | 'SHOP_REG'

export default function AuthFlowContainer() {
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    isInitializing,
    language,
    setLanguage,
    completeProfile,
    saveRegistrationDraft,
  } = useAuth()

  const { openInstallModal } = usePwaInstall()

  // Start at Language selection if language is not yet selected, else open Registration directly
  const [step, setStep] = useState<AuthStep>(() => {
    const savedLang = localStorage.getItem('gl_language')
    return savedLang ? 'ROLE' : 'LANGUAGE'
  })
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('GENERAL_USER')
  const [draftData, setDraftData] = useState<Record<string, any>>({})

  // If user is already authenticated, route directly to their dashboard
  useEffect(() => {
    if (!isInitializing && isAuthenticated && user?.id) {
      const targetRole = normalizeRole(user.role)
      navigate(getRoleDashboardPath(targetRole), { replace: true })
    }
  }, [isAuthenticated, isInitializing, user, navigate])

  // Step 1: Language Continue -> Open Registration directly
  const handleLanguageContinue = () => {
    setStep('ROLE')
  }

  // Step 2: Role Selected Continue
  const handleRoleContinue = () => {
    saveRegistrationDraft({ phone, role, step: 2 })
    if (role === 'LOCAL_SHOP') {
      setStep('SHOP_REG')
    } else {
      setStep('CITIZEN_REG')
    }
  }

  // Final Step: Complete Registration (Citizen or Shop)
  const handleFinalSubmit = async (formData: any) => {
    const submittedPhone = formData.phone || phone
    const completed = await completeProfile(role, {
      ...formData,
      phone: submittedPhone,
    })

    // Profile is completed! Navigate to appropriate dashboard based on user's role
    const targetRole = normalizeRole(completed.role)
    navigate(getRoleDashboardPath(targetRole), { replace: true })
  }

  // Save intermediate form draft
  const handleSaveFormDraft = (data: any) => {
    setDraftData((prev) => ({ ...prev, ...data }))
    if (data.phone) setPhone(data.phone)
    saveRegistrationDraft({
      phone: data.phone || phone,
      role,
      step: 2,
      formData: data,
    })
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'linear-gradient(160deg, #0d1f17 0%, #064e3b 50%, #0d1f17 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'rgba(16,185,129,0.12)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(5,150,105,0.1)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Quick Install Pill for Unauthenticated / Landing View */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 20,
          zIndex: 30,
        }}
      >
        <InstallButton onFallback={openInstallModal} label="Install App" />
      </div>

      {/* Responsive Centered Card Container */}
      <div className="auth-card-container">
        {/* Step 1: Language Selection */}
        {step === 'LANGUAGE' && (
          <LanguageSelectStep
            currentLanguage={language}
            onSelectLanguage={(lang: LanguageCode) => setLanguage(lang)}
            onContinue={handleLanguageContinue}
          />
        )}

        {/* Step 2: Account Type (Role Selection) */}
        {step === 'ROLE' && (
          <AccountTypeStep
            language={language}
            selectedRole={role}
            onSelectRole={(r: Role) => setRole(r)}
            onContinue={handleRoleContinue}
            onBack={() => setStep('LANGUAGE')}
          />
        )}

        {/* Step 3: Citizen Registration */}
        {step === 'CITIZEN_REG' && (
          <CitizenRegisterStep
            language={language}
            phone={phone}
            initialData={draftData}
            onSaveDraft={handleSaveFormDraft}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep('ROLE')}
          />
        )}

        {/* Step 4: Shop Registration */}
        {step === 'SHOP_REG' && (
          <ShopRegisterStep
            language={language}
            phone={phone}
            initialData={draftData}
            onSaveDraft={handleSaveFormDraft}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep('ROLE')}
          />
        )}
      </div>
    </div>
  )
}

