import React, { useState, useRef } from 'react'
import Icon from '../../../components/Icon'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'

interface Props {
  language: LanguageCode
  phone: string
  initialData?: any
  onSaveDraft: (data: any) => void
  onSubmit: (data: any) => Promise<void>
  onBack: () => void
}

export default function CitizenRegisterStep({
  language,
  phone,
  initialData = {},
  onSaveDraft,
  onSubmit,
  onBack,
}: Props) {
  const t = getAuthTranslation(language)

  const [avatar, setAvatar] = useState<string | null>(initialData.avatar || null)
  const [name, setName] = useState(initialData.name || '')
  const [email, setEmail] = useState(initialData.email || '')
  const [password, setPassword] = useState(initialData.password || '')
  const [confirmPassword, setConfirmPassword] = useState(initialData.confirmPassword || '')
  const [area, setArea] = useState(initialData.area || 'Guindy')
  const [city, setCity] = useState(initialData.city || 'Chennai')
  const [landmark, setLandmark] = useState(initialData.landmark || '')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialData.coordinates || { lat: 13.0067, lng: 80.2023 }
  )

  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(Boolean(initialData.coordinates))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Password requirement tests
  const passLength = password.length >= 8
  const passUpper = /[A-Z]/.test(password)
  const passLower = /[a-z]/.test(password)
  const passNumber = /[0-9]/.test(password)
  const passSpecial = /[@$!%*?&#^()_-]/.test(password)
  const allPassReqsMet = passLength && passUpper && passLower && passNumber && passSpecial

  // Autosave draft helper
  const handleFieldChange = (field: string, val: any) => {
    onSaveDraft({
      name: field === 'name' ? val : name,
      email: field === 'email' ? val : email,
      area: field === 'area' ? val : area,
      city: field === 'city' ? val : city,
      landmark: field === 'landmark' ? val : landmark,
      coordinates: field === 'coordinates' ? val : coordinates,
      avatar: field === 'avatar' ? val : avatar,
      phone,
    })
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setAvatar(base64)
        handleFieldChange('avatar', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  // Request GPS Location ONLY on click
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, location: 'Geolocation is not supported by your browser.' }))
      return
    }

    setLocating(true)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.location
      return copy
    })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        }
        setCoordinates(newCoords)
        setLocationSuccess(true)
        setLocating(false)
        handleFieldChange('coordinates', newCoords)
      },
      (err) => {
        setLocating(false)
        console.warn('Geolocation denied or timed out:', err.message)
        setErrors((prev) => ({
          ...prev,
          location: 'Location access was not granted. Please enter your Area and City manually.',
        }))
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    // Name validation
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length < 3) {
      newErrors.name = t.fullNameError
    }

    // Email validation (optional, but validate format if provided)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = t.emailError
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!allPassReqsMet) {
      newErrors.password = 'Password must meet all 5 requirements below'
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatchError
    }

    // Area & City validation
    if (!area.trim()) {
      newErrors.area = 'Area is required'
    }
    if (!city.trim()) {
      newErrors.city = 'City is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        name: trimmedName,
        email: email.trim(),
        password,
        phone,
        area: area.trim(),
        city: city.trim(),
        landmark: landmark.trim(),
        avatar,
        coordinates,
        role: 'GENERAL_USER',
      })
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' })
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
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
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t.citizenHeading}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {t.citizenSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Image Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: avatar ? `url(${avatar}) center/cover` : 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #10b981',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {!avatar && <Icon name="camera" size={26} color="#10b981" />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t.profilePhoto}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(16,185,129,0.2)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.gallery}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatar(null)
                    handleFieldChange('avatar', null)
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.fullName} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              handleFieldChange('name', e.target.value)
            }}
            placeholder={t.fullNamePlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.name ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.name && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Email Address (Optional) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.emailOptional}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              handleFieldChange('email', e.target.value)
            }}
            placeholder={t.emailPlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.email ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.email && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Verified Phone (Locked / Read-only) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            Verified Mobile Number
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 48,
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              background: 'rgba(255,255,255,0.03)',
              padding: '0 14px',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            <span>+91 {phone}</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16,185,129,0.2)',
                color: '#34d399',
                fontWeight: 700,
              }}
            >
              Verified ✓
            </span>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.password} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              handleFieldChange('password', e.target.value)
            }}
            placeholder={t.passwordPlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.password ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
              marginBottom: 10,
            }}
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              handleFieldChange('confirmPassword', e.target.value)
            }}
            placeholder={t.confirmPasswordPlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.confirmPassword ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.confirmPassword && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.confirmPassword}
            </span>
          )}

          {/* Progressive Password Requirements Checklist */}
          <div
            style={{
              marginTop: 10,
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {[
              { label: t.passReqLength, valid: passLength },
              { label: t.passReqUpper, valid: passUpper },
              { label: t.passReqLower, valid: passLower },
              { label: t.passReqNumber, valid: passNumber },
              { label: t.passReqSpecial, valid: passSpecial },
            ].map((req, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.76rem',
                  color: req.valid ? '#34d399' : 'var(--text-tertiary)',
                  fontWeight: req.valid ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon name={req.valid ? 'check' : 'close'} size={12} color={req.valid ? '#34d399' : 'var(--text-tertiary)'} />
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                {t.area} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value)
                  handleFieldChange('area', e.target.value)
                }}
                placeholder={t.areaPlaceholder}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: '12px',
                  border: errors.area ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  padding: '0 12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                {t.city} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  handleFieldChange('city', e.target.value)
                }}
                placeholder={t.cityPlaceholder}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: '12px',
                  border: errors.city ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  padding: '0 12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
              {t.landmarkOptional}
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => {
                setLandmark(e.target.value)
                handleFieldChange('landmark', e.target.value)
              }}
              placeholder={t.landmarkPlaceholder}
              style={{
                width: '100%',
                height: 48,
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                padding: '0 12px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* GPS Location On-Demand Section */}
          <div
            style={{
              marginTop: 6,
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="location-pin" size={18} color="#10b981" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.gpsSectionTitle}
                </span>
              </div>
              {locationSuccess && (
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                  Active ✓
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              {t.gpsSectionDesc}
            </p>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              style={{
                width: '100%',
                height: 40,
                borderRadius: '10px',
                background: locationSuccess ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)',
                border: locationSuccess ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                color: locationSuccess ? '#34d399' : 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              {locating ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '2px solid var(--text-primary)',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>{t.locating}</span>
                </>
              ) : (
                <>
                  <Icon name="location-pin" size={16} color={locationSuccess ? '#34d399' : '#10b981'} />
                  <span>{locationSuccess ? t.locationAcquired : t.useCurrentLocation}</span>
                </>
              )}
            </button>

            {/* Small Map Preview of Coordinates */}
            {coordinates && (
              <div
                style={{
                  marginTop: 12,
                  height: 100,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0d1f17, #064e3b)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 4,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Icon name="map" size={24} color="#10b981" />
                <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600 }}>
                  GPS: {coordinates.lat}°N, {coordinates.lng}°E ({area}, {city})
                </span>
              </div>
            )}

            {errors.location && (
              <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 8, display: 'block' }}>
                {errors.location}
              </span>
            )}
          </div>
        </div>

        {/* Global form error */}
        {errors.form && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontSize: '0.84rem',
            }}
          >
            {errors.form}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
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
            marginTop: 10,
          }}
        >
          {loading ? (
            <span>Creating Citizen Account...</span>
          ) : (
            <>
              <span>{t.continueBtn}</span>
              <Icon name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
