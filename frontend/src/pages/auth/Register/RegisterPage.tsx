import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, type Role } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'
import { getRoleDashboardPath, normalizeRole } from '../../../services/role/roleService'
import { normalizePhone } from '../../../utils/phone'

type Step = 'ROLE' | 'FORM'
type RegistrationRole = 'GENERAL_USER' | 'LOCAL_SHOP' | 'RECYCLER'

const ROLE_OPTIONS = [
  {
    id: 'GENERAL_USER' as RegistrationRole,
    dbRole: 'citizen' as Role,
    title: 'General User',
    subtitle: 'Citizen / Household',
    desc: 'Dispose, recycle, sell, or donate old electronics. Earn Green Coins and rewards.',
    icon: 'user' as const,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'LOCAL_SHOP' as RegistrationRole,
    dbRole: 'shop' as Role,
    title: 'Local Shop User',
    subtitle: 'Repair & Retailers',
    desc: 'Procure spare parts, offer repair services, and accept local community e-waste.',
    icon: 'shop' as const,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  {
    id: 'RECYCLER' as RegistrationRole,
    dbRole: 'company' as Role,
    title: 'Recycler Company',
    subtitle: 'Certified Recyclers',
    desc: 'Manage bulk industrial collection, issue recycling certificates, and process raw materials.',
    icon: 'recycle' as const,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, signInWithGoogle, language, setLanguage } = useAuth()

  const [step, setStep] = useState<Step>('ROLE')
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>('GENERAL_USER')

  // Common Fields
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [city, setCity] = useState('Coimbatore')
  const [area, setArea] = useState('')

  // General User Fields
  const [fullName, setFullName] = useState('')
  const [landmark, setLandmark] = useState('')
  const [userLang, setUserLang] = useState(language || 'EN')

  // Local Shop Fields
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [shopCategory, setShopCategory] = useState('Electronics Repair')
  const [shopAddress, setShopAddress] = useState('')
  const [shopDetails, setShopDetails] = useState('')

  // Recycler Company Fields
  const [companyName, setCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [companyCategory, setCompanyCategory] = useState('Authorized Recycler')
  const [companyAddress, setCompanyAddress] = useState('')
  const [licenseNo, setLicenseNo] = useState('')

  // Location Consent
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'acquired' | 'failed'>('idle')

  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Catch OAuth errors or cancellations in URL redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash.substring(1)
    const hashParams = new URLSearchParams(hash)

    const oauthError =
      params.get('error_description') ||
      params.get('error') ||
      hashParams.get('error_description') ||
      hashParams.get('error')

    if (oauthError) {
      if (oauthError.toLowerCase().includes('denied') || oauthError.toLowerCase().includes('cancel')) {
        setError('Google sign-up was cancelled. You can register using the form below or try again.')
      } else {
        setError('Google sign-up notice: ' + decodeURIComponent(oauthError).replace(/\+/g, ' '))
      }
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setGpsStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('acquired')
      },
      () => {
        setGpsStatus('failed')
        setError('Location permission denied or unavailable.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)
      const targetOption = ROLE_OPTIONS.find((r) => r.id === selectedRole)
      if (targetOption) {
        localStorage.setItem('gl_pending_role', targetOption.dbRole)
      }
      await signInWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Google sign-up failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Common validations
    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    let formattedPhone = ''
    if (phone.trim()) {
      const { isValid, e164 } = normalizePhone(phone)
      if (!isValid) {
        setError('Please enter a valid 10-digit Indian mobile number or leave it blank.')
        return
      }
      formattedPhone = e164
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!city.trim()) {
      setError('City / Area is required.')
      return
    }

    // Role-specific validations
    if (selectedRole === 'GENERAL_USER' && !fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (selectedRole === 'LOCAL_SHOP') {
      if (!shopName.trim()) {
        setError('Please enter your shop name.')
        return
      }
      if (!ownerName.trim()) {
        setError('Please enter the owner name.')
        return
      }
      if (!shopAddress.trim()) {
        setError('Please enter the complete shop address.')
        return
      }
    }

    if (selectedRole === 'RECYCLER') {
      if (!companyName.trim()) {
        setError('Please enter your company name.')
        return
      }
      if (!contactPerson.trim()) {
        setError('Please enter the contact person name.')
        return
      }
      if (!companyAddress.trim()) {
        setError('Please enter the facility / company address.')
        return
      }
    }

    setLoading(true)

    try {
      const targetOption = ROLE_OPTIONS.find((r) => r.id === selectedRole)!
      const name =
        selectedRole === 'GENERAL_USER'
          ? fullName.trim()
          : selectedRole === 'LOCAL_SHOP'
          ? ownerName.trim()
          : contactPerson.trim()

      if (userLang && userLang !== language) {
        setLanguage(userLang)
      }

      const createdUser = await register({
        name,
        email: cleanEmail,
        phone: formattedPhone,
        password,
        role: targetOption.dbRole,
        city: city.trim(),
        area: area.trim(),
        landmark: landmark.trim(),
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        shopCategory,
        shopAddress: shopDetails ? `${shopAddress.trim()} (${shopDetails.trim()})` : shopAddress.trim(),
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        companyCategory,
        companyAddress: licenseNo ? `${companyAddress.trim()} [Lic: ${licenseNo.trim()}]` : companyAddress.trim(),
        coordinates: coords,
      })

      const targetPath = getRoleDashboardPath(normalizeRole(createdUser.role))
      navigate(targetPath, { replace: true })
    } catch (err: any) {
      console.error('[Green Loop Registration] Error:', err)
      setError(err?.message || 'Registration failed. Please check your credentials.')
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
        padding: '32px 16px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg-surface, #0f2d22)',
          border: '1px solid var(--border-color, rgba(16, 185, 129, 0.25))',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navigation & Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          {step === 'FORM' ? (
            <button
              type="button"
              onClick={() => setStep('ROLE')}
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
              <span>Change Account Type</span>
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                color: '#34d399',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <Icon name="arrow-left" size={16} color="#34d399" />
              <span>Sign In Instead</span>
            </Link>
          )}

          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '4px 10px',
              borderRadius: '20px',
            }}
          >
            {step === 'ROLE' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </span>
        </div>

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
            <Icon name="user" size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
            {step === 'ROLE' ? 'Choose Account Type' : `Create ${ROLE_OPTIONS.find((r) => r.id === selectedRole)?.title} Account`}
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#a7f3d0', margin: 0 }}>
            {step === 'ROLE'
              ? 'Select how you would like to participate in Green Loop'
              : 'Fill in your details below to register and start managing e-waste'}
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

        {step === 'ROLE' ? (
          /* Step 1: Role Selection Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRole === role.id
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '16px',
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? role.color : 'rgba(255, 255, 255, 0.1)'}`,
                    background: isSelected ? role.bg : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isSelected ? role.color : 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={role.icon} size={22} color={isSelected ? '#ffffff' : '#a7f3d0'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#ffffff' }}>{role.title}</span>
                      <span style={{ fontSize: '0.74rem', color: role.color, fontWeight: 700 }}>{role.subtitle}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: 0, lineHeight: 1.4 }}>{role.desc}</p>
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={() => setStep('FORM')}
              className="btn btn-primary"
              style={{
                height: 48,
                marginTop: 10,
                fontWeight: 800,
                fontSize: '0.94rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>Continue to Registration</span>
              <Icon name="arrow-right" size={16} color="#ffffff" />
            </button>
          </div>
        ) : (
          /* Step 2: Role-Specific Registration Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* GENERAL USER SPECIFIC FIELDS */}
            {selectedRole === 'GENERAL_USER' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mathavan S"
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Preferred Language
                  </label>
                  <select
                    value={userLang}
                    onChange={(e) => setUserLang(e.target.value as any)}
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px', background: '#0a1f17', color: '#ffffff' }}
                  >
                    <option value="EN">English</option>
                    <option value="TA">தமிழ் (Tamil)</option>
                    <option value="HI">हिन्दी (Hindi)</option>
                    <option value="ML">മലയാളം (Malayalam)</option>
                    <option value="KN">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Lakshmi Mills"
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                  />
                </div>
              </>
            )}

            {/* LOCAL SHOP SPECIFIC FIELDS */}
            {selectedRole === 'LOCAL_SHOP' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                      Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="TechCare Electronics"
                      className="input"
                      style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Vimal Raj"
                      className="input"
                      style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Shop Category *
                  </label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px', background: '#0a1f17', color: '#ffffff' }}
                  >
                    <option value="Electronics Repair">Electronics Repair</option>
                    <option value="Component & Spare Parts">Component & Spare Parts</option>
                    <option value="Refurbished Devices">Refurbished Devices</option>
                    <option value="E-Waste Drop Point">E-Waste Collection Hub</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Complete Shop Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="Shop #14, Cross Cut Road"
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    GST / Shop Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={shopDetails}
                    onChange={(e) => setShopDetails(e.target.value)}
                    placeholder="GSTIN or Registration Number"
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                  />
                </div>
              </>
            )}

            {/* RECYCLER COMPANY SPECIFIC FIELDS */}
            {selectedRole === 'RECYCLER' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="EcoGreen Recyclers Ltd"
                      className="input"
                      style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Operations Head"
                      className="input"
                      style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Company Category *
                  </label>
                  <select
                    value={companyCategory}
                    onChange={(e) => setCompanyCategory(e.target.value)}
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px', background: '#0a1f17', color: '#ffffff' }}
                  >
                    <option value="Authorized Recycler">TNPCB / CPCB Authorized Recycler</option>
                    <option value="Dismantler Facility">Industrial Dismantler Facility</option>
                    <option value="Refurbishment Hub">Commercial Refurbishment Hub</option>
                    <option value="Precious Metal Extraction">Metal & PCB Extraction</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    Facility / Corporate Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Plot 42, SIDCO Industrial Estate"
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                    TNPCB / Environmental License No (Optional)
                  </label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="e.g. TNPCB/E-WASTE/2026/894"
                    className="input"
                    style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                  />
                </div>
              </>
            )}

            {/* COMMON CONTACT FIELDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@domain.com"
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210 (Optional)"
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* COMMON PASSWORD FIELDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* CITY & AREA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Coimbatore"
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: 5 }}>
                  Area / Locality
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="RS Puram / Gandhipuram"
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: '0.88rem', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* LOCATION CONSENT SECTION */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>GPS Location (Optional)</div>
                <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                  {coords ? `Acquired: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Helps match nearby pickups'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcquireLocation}
                disabled={gpsStatus === 'locating'}
                style={{
                  background: coords ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  color: coords ? '#ffffff' : '#34d399',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="location-pin" size={14} color={coords ? '#ffffff' : '#34d399'} />
                <span>{coords ? 'Acquired' : gpsStatus === 'locating' ? 'Locating...' : 'Enable GPS'}</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isGoogleLoading}
              className="btn btn-primary"
              style={{
                height: 48,
                marginTop: 6,
                fontWeight: 800,
                fontSize: '0.94rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <Icon name="check" size={16} color="#ffffff" />
                </>
              )}
            </button>

            {/* Google OAuth Alternative */}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                type="button"
                disabled={isGoogleLoading || loading}
                onClick={handleGoogleSignUp}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: isGoogleLoading ? 'wait' : 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Connecting...' : `Sign Up with Google (${ROLE_OPTIONS.find((r) => r.id === selectedRole)?.title})`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
