import React, { useState, useEffect, useRef } from 'react'
import Icon from '../../../components/Icon'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'
import { isAuthTestMode } from '../../../utils/supabase'

interface Props {
  language: LanguageCode
  phone: string
  devOtp?: string
  onVerifyOtp: (otp: string) => Promise<{
    success: boolean
    isExistingUser?: boolean
    isProfileComplete?: boolean
    user?: any
    role?: any
    message?: string
  }>
  onResendOtp: () => Promise<{ success: boolean; message: string; devOtp?: string }>
  onSuccess: (isExistingUser: boolean, isProfileComplete: boolean, role?: any) => void
  onBack: () => void
}

export default function OtpVerifyStep({
  language,
  phone,
  devOtp = '',
  onVerifyOtp,
  onResendOtp,
  onSuccess,
  onBack,
}: Props) {
  const t = getAuthTranslation(language)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [currentDevOtp, setCurrentDevOtp] = useState(devOtp || '')
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [welcomeTransition, setWelcomeTransition] = useState<{
    show: boolean
    name: string
    roleLabel: string
  } | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Format masked phone number (+91 98*** **210)
  const clean = phone.replace(/\D/g, '').slice(-10)
  const maskedPhone = `+91 ${clean.slice(0, 2)}*** **${clean.slice(-2)}`

  // Sync devOtp if prop changes
  useEffect(() => {
    if (devOtp && devOtp !== currentDevOtp) {
      setCurrentDevOtp(devOtp)
    }
  }, [devOtp])

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Auto-fill and auto-verify in development demo/test mode
  useEffect(() => {
    if (isAuthTestMode && currentDevOtp && currentDevOtp.length === 6 && !loading && !success) {
      const digits = currentDevOtp.split('')
      setOtp(digits)
      const timerId = setTimeout(() => {
        triggerVerify(currentDevOtp)
      }, 350)
      return () => clearTimeout(timerId)
    }
  }, [currentDevOtp, isAuthTestMode])

  // 30s Countdown timer (only active in production; disabled in demo mode to prevent artificial expiry)
  useEffect(() => {
    if (isAuthTestMode) return
    if (timer <= 0) return
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer, isAuthTestMode])

  // Automatically trigger verification when all 6 digits are entered
  const triggerVerify = async (code: string) => {
    if (code.length !== 6 || loading || success) return

    setLoading(true)
    setError('')

    try {
      const res = await onVerifyOtp(code)
      if (res.success) {
        setSuccess(true)
        if (res.isExistingUser && res.isProfileComplete) {
          const roleLabel =
            res.role === 'LOCAL_SHOP'
              ? 'Local Shop / Repair Hub'
              : res.role === 'RECYCLER'
              ? 'Industrial Recycler'
              : 'Citizen / General User'

          setWelcomeTransition({
            show: true,
            name: res.user?.name || 'Member',
            roleLabel,
          })

          setTimeout(() => {
            onSuccess(true, true, res.role)
          }, 950)
        } else {
          setTimeout(() => {
            onSuccess(false, false)
          }, 400)
        }
      } else {
        setError(res.message || t.otpInvalidError)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || t.otpInvalidError)
      setLoading(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanVal = value.replace(/\D/g, '')
    if (!cleanVal && value !== '') return

    const newOtp = [...otp]
    newOtp[index] = cleanVal.slice(-1) // Take the last digit
    setOtp(newOtp)
    if (error) setError('')

    // Move to next box if digit was typed
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    const fullCode = newOtp.join('')
    if (fullCode.length === 6) {
      triggerVerify(fullCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move backward if current is already empty
        inputRefs.current[index - 1]?.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newOtp = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)

    // Focus on the next empty or last input
    const nextIdx = Math.min(pasted.length, 5)
    inputRefs.current[nextIdx]?.focus()

    if (pasted.length === 6) {
      triggerVerify(pasted)
    }
  }

  const handleAutofill = () => {
    const code = currentDevOtp || ''
    if (!code) return
    const digits = code.split('').slice(0, 6)
    while (digits.length < 6) digits.push('')
    setOtp(digits)
    if (code.length === 6) {
      triggerVerify(code)
    }
  }

  const handleResend = async () => {
    if (timer > 0 || loading) return

    setLoading(true)
    setError('')
    try {
      const res = await onResendOtp()
      if (res.success) {
        setTimer(30)
        if (res.devOtp) setCurrentDevOtp(res.devOtp)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setError(res.message || 'Failed to resend OTP.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const formatTimer = (sec: number) => {
    const s = sec < 10 ? `0${sec}` : `${sec}`
    return `00:${s}`
  }

  if (welcomeTransition?.show) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 380,
          padding: '32px 20px',
          textAlign: 'center',
          color: 'var(--text-primary)',
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.45))',
            border: '2.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 0 32px rgba(16,185,129,0.4)',
          }}
        >
          <Icon name="check" size={36} color="#10b981" />
        </div>

        <span
          style={{
            fontSize: '0.78rem',
            color: '#34d399',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          Phone Verified
        </span>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
          }}
        >
          Welcome back to Green Loop!
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            margin: '0 0 18px',
          }}
        >
          Recognized as <strong style={{ color: '#fff' }}>{welcomeTransition.name}</strong>
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: 28,
          }}
        >
          <Icon name="user" size={15} color="#10b981" />
          <span>{welcomeTransition.roleLabel}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#10b981',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #10b981',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Entering your dashboard...</span>
        </div>
      </div>
    )
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 12 }}>
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
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t.enterOtp}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {t.otpSentTo} <strong style={{ color: '#10b981' }}>{maskedPhone}</strong>
          </p>
        </div>
      </div>

      {/* Test Mode / Production Information Banner */}
      {isAuthTestMode ? (
        <div
          onClick={handleAutofill}
          style={{
            background: 'rgba(16,185,129,0.14)',
            border: '1.5px solid rgba(16,185,129,0.45)',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="sparkles" size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Dev Test Mode Code
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '2px' }}>
                {currentDevOtp}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAutofill()
            }}
            disabled={loading || success}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8rem',
              padding: '8px 14px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
            }}
          >
            {loading ? 'Verifying...' : 'Fill Code'}
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="shield" size={18} color="#10b981" />
          <span>Enter the 6-digit verification code sent to your mobile phone via SMS.</span>
        </div>
      )}

      {/* 6 OTP Boxes Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {otp.map((digit, idx) => {
          const isFilled = Boolean(digit)

          return (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              disabled={loading || success}
              style={{
                height: 56,
                borderRadius: '14px',
                border: error
                  ? '2px solid #ef4444'
                  : isFilled
                  ? '2px solid #10b981'
                  : '1.5px solid var(--border-color)',
                background: isFilled ? 'var(--accent-light)' : 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                fontWeight: 800,
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.18s ease',
                boxShadow: isFilled ? '0 0 10px rgba(16,185,129,0.2)' : 'none',
              }}
            />
          )
        })}
      </div>

      {/* Explicit Verify Button */}
      <button
        type="button"
        onClick={() => triggerVerify(otp.join(''))}
        disabled={otp.join('').length !== 6 || loading || success}
        style={{
          width: '100%',
          height: 48,
          borderRadius: '12px',
          border: 'none',
          background: otp.join('').length === 6 && !loading && !success
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'rgba(255,255,255,0.08)',
          color: otp.join('').length === 6 && !loading && !success ? '#ffffff' : 'rgba(255,255,255,0.4)',
          fontWeight: 700,
          fontSize: '0.92rem',
          cursor: otp.join('').length === 6 && !loading && !success ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
          transition: 'all 0.2s ease',
          boxShadow: otp.join('').length === 6 ? '0 4px 14px rgba(16,185,129,0.25)' : 'none',
        }}
      >
        <Icon name="check" size={18} color={otp.join('').length === 6 ? '#ffffff' : 'rgba(255,255,255,0.4)'} />
        <span>{loading ? t.verifying : 'Verify OTP & Continue'}</span>
      </button>

      {/* Field-level error */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
            fontSize: '0.82rem',
            color: '#ef4444',
          }}
        >
          <Icon name="alert" size={14} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Success indicator */}
      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            fontSize: '0.86rem',
            color: '#34d399',
            fontWeight: 700,
          }}
        >
          <Icon name="check" size={16} color="#34d399" />
          <span>{t.otpSuccess}</span>
        </div>
      )}

      {/* Verifying Spinner */}
      {loading && !success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            margin: '12px 0',
            color: '#a7f3d0',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #10b981',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>{t.verifying}</span>
        </div>
      )}

      {/* Timer & Resend Controls */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {isAuthTestMode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: '#10b981' }}>
            <Icon name="sparkles" size={14} color="#10b981" />
            <span>Demo Mode Active • Auto-Verification</span>
          </div>
        ) : timer > 0 ? (
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <span>{t.resendIn} </span>
            <strong style={{ color: '#10b981', fontWeight: 800 }}>{formatTimer(timer)}</strong>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{t.didntReceive}</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {t.resendOtp}
            </button>
          </div>
        )}
      </div>

      {/* Change Phone option */}
      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 28 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Wrong mobile number? Edit number
        </button>
      </div>
    </div>
  )
}
