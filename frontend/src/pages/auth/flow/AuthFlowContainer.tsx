import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type Role } from '../../../context/AuthContext'
import type { LanguageCode } from '../../../types/common.types'
import LanguageSelectStep from './LanguageSelectStep'
import PhoneLoginStep from './PhoneLoginStep'
import OtpVerifyStep from './OtpVerifyStep'
import AccountTypeStep from './AccountTypeStep'
import CitizenRegisterStep from './CitizenRegisterStep'
import ShopRegisterStep from './ShopRegisterStep'
import { usePwaInstall } from '../../../context/PwaInstallContext'
import InstallButton from '../../../components/InstallButton'
import ResumePromptModal from './ResumePromptModal'
import { normalizeRole, getRoleDashboardPath } from '../../../services/role/roleService'

export type AuthStep =
  | 'LANGUAGE'
  | 'PHONE'
  | 'OTP'
  | 'ROLE'
  | 'CITIZEN_REG'
  | 'SHOP_REG'

export default function AuthFlowContainer() {
  const navigate = useNavigate()
  const {
    language,
    setLanguage,
    sendOtp,
    verifyOtp,
    completeProfile,
    saveRegistrationDraft,
    getRegistrationDraft,
    clearRegistrationDraft,
  } = useAuth()

  const { openInstallModal } = usePwaInstall()

  const [step, setStep] = useState<AuthStep>('LANGUAGE')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('GENERAL_USER')
  const [draftData, setDraftData] = useState<Record<string, any>>({})
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [activeDraft, setActiveDraft] = useState<any | null>(null)

  // Check for any incomplete registration draft on initial mount
  useEffect(() => {
    const draft = getRegistrationDraft()
    if (draft && draft.phone && (draft.step || draft.formData)) {
      setActiveDraft(draft)
      setShowResumeModal(true)
    }
  }, [])

  // Handle Resume
  const handleResume = () => {
    if (!activeDraft) return
    setPhone(activeDraft.phone)
    if (activeDraft.role) setRole(activeDraft.role)
    if (activeDraft.formData) setDraftData(activeDraft.formData)

    // Restore step
    if (activeDraft.step === 5) {
      setStep(activeDraft.role === 'LOCAL_SHOP' ? 'SHOP_REG' : 'CITIZEN_REG')
    } else if (activeDraft.step === 4) {
      setStep('ROLE')
    } else if (activeDraft.step === 3) {
      setStep('OTP')
    } else {
      setStep('PHONE')
    }
    setShowResumeModal(false)
  }

  // Handle Start Over
  const handleStartOver = () => {
    clearRegistrationDraft()
    setShowResumeModal(false)
    setActiveDraft(null)
    setDraftData({})
  }

  // Step 1: Language Continue
  const handleLanguageContinue = () => {
    setStep('PHONE')
  }

  // Step 2: OTP Sent
  const handleOtpSent = (phoneNumber: string) => {
    setPhone(phoneNumber)
    saveRegistrationDraft({ phone: phoneNumber, step: 3 })
    setStep('OTP')
  }

  // Step 3: OTP Verified
  const handleOtpSuccess = (isExistingUser: boolean, isProfileComplete: boolean, detectedRole?: Role) => {
    if (isExistingUser && isProfileComplete) {
      // Existing user with completed profile immediately enters the appropriate dashboard!
      const targetRole = normalizeRole(detectedRole || role)
      navigate(getRoleDashboardPath(targetRole), { replace: true })
      return
    }

    // New or incomplete user continues to role selection
    saveRegistrationDraft({ phone, step: 4 })
    setStep('ROLE')
  }

  // Step 4: Role Selected Continue
  const handleRoleContinue = () => {
    saveRegistrationDraft({ phone, role, step: 5 })
    if (role === 'LOCAL_SHOP') {
      setStep('SHOP_REG')
    } else {
      setStep('CITIZEN_REG')
    }
  }

  // Final Step: Complete Registration (Citizen or Shop)
  const handleFinalSubmit = async (formData: any) => {
    const completed = await completeProfile(role, {
      ...formData,
      phone,
    })

    // Profile is completed! Navigate to appropriate dashboard based on user's role
    const targetRole = normalizeRole(completed.role)
    navigate(getRoleDashboardPath(targetRole), { replace: true })
  }

  // Save intermediate form draft
  const handleSaveFormDraft = (data: any) => {
    setDraftData((prev) => ({ ...prev, ...data }))
    saveRegistrationDraft({
      phone,
      role,
      step: 5,
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

        {/* Step 2: Phone Login */}
        {step === 'PHONE' && (
          <PhoneLoginStep
            language={language}
            initialPhone={phone}
            onSendOtp={(p: string) => sendOtp(p)}
            onOtpSent={handleOtpSent}
            onBack={() => setStep('LANGUAGE')}
          />
        )}

        {/* Step 3: OTP Verification */}
        {step === 'OTP' && (
          <OtpVerifyStep
            language={language}
            phone={phone}
            onVerifyOtp={(code: string) => verifyOtp(phone, code)}
            onResendOtp={() => sendOtp(phone)}
            onSuccess={handleOtpSuccess}
            onBack={() => setStep('PHONE')}
          />
        )}

        {/* Step 4: Account Type (Role Selection) */}
        {step === 'ROLE' && (
          <AccountTypeStep
            language={language}
            selectedRole={role}
            onSelectRole={(r: Role) => setRole(r)}
            onContinue={handleRoleContinue}
            onBack={() => setStep('OTP')}
          />
        )}

        {/* Step 5: Citizen Registration */}
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

        {/* Step 6: Shop Registration */}
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

      {/* Resume Registration Prompt Modal */}
      {showResumeModal && activeDraft && (
        <ResumePromptModal
          language={language}
          phone={activeDraft.phone}
          role={activeDraft.role}
          onResume={handleResume}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
