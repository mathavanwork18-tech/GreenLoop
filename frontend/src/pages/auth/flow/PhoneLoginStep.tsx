import React, { useState } from 'react'
import Icon from '../../../components/Icon'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'

interface Props {
  language: LanguageCode
  initialPhone?: string
  onSendOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>
  onOtpSent: (phone: string, devOtp?: string) => void
  onGoogleSignIn?: () => Promise<void>
  onBack: () => void
}

export default function PhoneLoginStep({
  language,
  initialPhone = '',
  onSendOtp,
  onOtpSent,
  onGoogleSignIn,
  onBack,
}: Props) {
  const t = getAuthTranslation(language)
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, '').slice(-10))
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only permit digits, maximum 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(cleaned)
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate 10-digit Indian mobile number format starting with 6-9
    if (!phone) {
      setError(t.invalidPhoneError)
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t.invalidPhoneError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await onSendOtp(phone)
      if (res.success) {
        // Brief transition delay so user sees sending state
        setTimeout(() => {
          onOtpSent(phone, res.devOtp || '123456')
        }, 400)
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Network error while sending OTP. Please retry.')
    } finally {
      setLoading(false)
    }
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
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Green Loop
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
            {t.welcomeBack}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {t.loginSubtitle}
          </p>
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <label
          htmlFor="phone-input"
          style={{
            display: 'block',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}
        >
          Mobile Number
        </label>

        {/* Country Code & Phone Input Group */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '14px',
            border: error ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
            background: 'var(--bg-surface)',
            overflow: 'hidden',
            transition: 'border 0.2s ease',
          }}
        >
          {/* Prefix Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 14px',
              height: 52,
              background: 'rgba(255,255,255,0.03)',
              borderRight: '1.5px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800 }}>IN</span>
            <span>+91</span>
          </div>

          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            autoFocus
            value={phone}
            onChange={handlePhoneChange}
            placeholder={t.phonePlaceholder}
            maxLength={10}
            style={{
              flex: 1,
              height: 52,
              border: 'none',
              outline: 'none',
              padding: '0 16px',
              fontSize: '1.05rem',
              fontWeight: 600,
              background: 'transparent',
              color: 'var(--text-primary)',
              letterSpacing: phone.length > 0 ? '1px' : 'normal',
            }}
          />
        </div>

        {/* Field-level error */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              fontSize: '0.82rem',
              color: '#ef4444',
            }}
          >
            <Icon name="alert" size={14} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={loading || phone.length < 10}
          className="btn btn-primary btn-lg btn-full"
          style={{
            height: 52,
            marginTop: 24,
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(16,185,129,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: phone.length < 10 && !loading ? 0.6 : 1,
            cursor: phone.length < 10 && !loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>{t.sendingOtp}</span>
            </>
          ) : (
            <>
              <span>{t.sendOtp}</span>
              <Icon name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0 20px',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t.orContinueWith}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        {/* Secondary Authentication (Google & Apple - Subdued) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            disabled={isGoogleLoading || loading}
            onClick={async () => {
              if (onGoogleSignIn) {
                try {
                  setIsGoogleLoading(true)
                  setError('')
                  await onGoogleSignIn()
                } catch (err: any) {
                  setError(err.message || 'Google Sign-In could not be started.')
                  setIsGoogleLoading(false)
                }
              }
            }}
            style={{
              height: 46,
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: isGoogleLoading ? 'wait' : 'pointer',
              opacity: isGoogleLoading ? 0.7 : 1,
              transition: 'all 0.18s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPhone('9444284711')
            }}
            style={{
              height: 46,
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-1.98.6-2.62 1.34-.57.65-1.06 1.71-.93 2.72 1.01.08 2.03-.5 2.63-1.22z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Sign up prompt */}
        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 28 }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {t.noAccountPrompt}{' '}
          </span>
          <button
            type="button"
            onClick={() => {
              if (phone) {
                handleSubmit(new Event('submit') as any)
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t.signUpLink}
          </button>
        </div>
      </form>
    </div>
  )
}
