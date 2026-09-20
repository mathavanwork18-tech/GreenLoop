import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import { isAuthTestMode } from '../../utils/supabase'
import { normalizePhone } from '../../utils/phone'
import { getRoleDashboardPath, normalizeRole } from '../../services/role/roleService'

type Step = 'PHONE' | 'OTP'

export default function PhoneLoginPage() {
  const navigate = useNavigate()
  const { sendOtp, verifyOtp } = useAuth()

  const [step, setStep] = useState<Step>('PHONE')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [otpExpired, setOtpExpired] = useState(false)

  // Timer countdown for resend
  useEffect(() => {
    let interval: any = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // OTP expiry countdown (5 minutes = 300 seconds)
  useEffect(() => {
    let expiryTimer: any = null
    if (step === 'OTP') {
      setOtpExpired(false)
      expiryTimer = setTimeout(() => {
        setOtpExpired(true)
      }, 300000)
    }
    return () => clearTimeout(expiryTimer)
  }, [step])

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)

    const { isValid } = normalizePhone(phoneNumber)
    if (!isValid) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    setLoading(true)
    try {
      await sendOtp(phoneNumber)
      setStep('OTP')
      setResendTimer(30)
      setAttemptsLeft(3)
      setOtpExpired(false)
      setOtp(['', '', '', '', '', ''])
    } catch (err: any) {
      setError(err?.message || 'Could not send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Auto-advance focus
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const enteredOtp = otp.join('')
    if (enteredOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP.')
      return
    }

    if (otpExpired) {
      setError('This OTP has expired. Request a new OTP.')
      return
    }

    if (attemptsLeft <= 0) {
      setError('Too many incorrect attempts. Please request a new OTP.')
      return
    }

    setLoading(true)
    try {
      const res = await verifyOtp(phoneNumber, enteredOtp)
      if (res.success) {
        if (res.user && res.isProfileComplete) {
          const targetPath = getRoleDashboardPath(normalizeRole(res.user.role))
          navigate(targetPath, { replace: true })
        } else {
          // If new or incomplete user, go to register
          navigate('/register', { replace: true })
        }
      }
    } catch (err: any) {
      const remaining = attemptsLeft - 1
      setAttemptsLeft(remaining)
      if (remaining <= 0) {
        setError('Too many incorrect attempts. Please request a new OTP.')
      } else {
        setError(err?.message || 'The OTP is incorrect. Please try again.')
      }
    } finally {
      setLoading(false)
    }
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--bg-surface, #0f2d22)',
          border: '1px solid var(--border-color, rgba(16, 185, 129, 0.25))',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Back Link */}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => (step === 'OTP' ? setStep('PHONE') : navigate('/login'))}
            style={{
              background: 'none',
              border: 'none',
              color: '#34d399',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: 0,
            }}
          >
            <Icon name="arrow-left" size={16} color="#34d399" />
            <span>{step === 'OTP' ? 'Change Phone Number' : 'Back to Email Sign In'}</span>
          </button>
        </div>

        {/* Development Dummy OTP Badge */}
        {isAuthTestMode && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: 16,
              fontSize: '0.78rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
            }}
          >
            <span>🛠️</span>
            <span>Dev Mode: Dummy OTP is <strong>123456</strong></span>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--accent, #10b981), #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Icon name={step === 'PHONE' ? 'phone' : 'shield'} size={24} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary, #ffffff)',
              margin: '0 0 6px',
            }}
          >
            {step === 'PHONE' ? 'Phone Number Sign In' : 'Verify Mobile OTP'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #a7f3d0)', margin: 0 }}>
            {step === 'PHONE'
              ? 'Enter your mobile number to receive a 6-digit verification code'
              : `Enter the code sent to +91 ${phoneNumber}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: 18,
              fontSize: '0.82rem',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            <Icon name="alert" size={16} color="#f87171" />
            <span>{error}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          /* Step 1: Phone Input Form */
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                htmlFor="login-phone"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #ffffff)',
                  marginBottom: 6,
                }}
              >
                Mobile Number
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-card, #0a1f17)',
                  border: '1px solid var(--border-color, rgba(16, 185, 129, 0.25))',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    padding: '0 12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary, #a7f3d0)',
                    borderRight: '1px solid var(--border-color, rgba(16, 185, 129, 0.25))',
                  }}
                >
                  🇮🇳 +91
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary, #ffffff)',
                    padding: '12px 14px',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className="btn btn-primary"
              style={{
                height: 48,
                width: '100%',
                fontSize: '0.94rem',
                fontWeight: 800,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || phoneNumber.length !== 10 ? 0.65 : 1,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <Icon name="arrow-right" size={16} color="#ffffff" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Entry Form */
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    style={{
                      width: 46,
                      height: 52,
                      textAlign: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      borderRadius: '12px',
                      border: digit ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: '#ffffff',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6 || otpExpired}
              className="btn btn-primary"
              style={{
                height: 48,
                width: '100%',
                fontSize: '0.94rem',
                fontWeight: 800,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || otp.join('').length !== 6 || otpExpired ? 0.65 : 1,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <Icon name="check" size={16} color="#ffffff" />
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a7f3d0' }}>
              {resendTimer > 0 ? (
                <span>Resend OTP in <strong>{resendTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#34d399',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Resend OTP Code
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
