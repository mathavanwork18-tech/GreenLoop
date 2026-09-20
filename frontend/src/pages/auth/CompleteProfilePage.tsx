import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type Role } from '../../context/AuthContext'
import Icon, { type IconName } from '../../components/Icon'
import { getRoleDashboardPath, normalizeRole } from '../../services/role/roleService'
import { normalizePhone } from '../../utils/phone'

type OnboardingRole = 'GENERAL_USER' | 'LOCAL_SHOP' | 'RECYCLER'

interface RoleOption {
  id: OnboardingRole
  dbRole: Role
  title: string
  subtitle: string
  desc: string
  icon: IconName
  color: string
  bg: string
  border: string
  bonusCoins: number
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'GENERAL_USER',
    dbRole: 'citizen',
    title: 'General User',
    subtitle: 'Citizen / Household',
    desc: 'Post unwanted e-waste, find nearby drop hubs, sell used gadgets, and earn Green Coins for verified eco actions.',
    icon: 'user',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    bonusCoins: 50,
  },
  {
    id: 'LOCAL_SHOP',
    dbRole: 'shop',
    title: 'Local Shop User',
    subtitle: 'Repair & Retailers',
    desc: 'Procure spare parts, offer repair services, accept neighborhood e-waste drop-offs, and list refurbished items.',
    icon: 'shop',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
    bonusCoins: 100,
  },
  {
    id: 'RECYCLER',
    dbRole: 'company',
    title: 'Recycler Company',
    subtitle: 'Certified Recycler',
    desc: 'Procure bulk commercial e-waste, manage recycling logistics, issue green compliance certificates, and process raw materials.',
    icon: 'recycle',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.35)',
    bonusCoins: 100,
  },
]

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, completeProfile, logout } = useAuth()

  // Selected role
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>('GENERAL_USER')

  // Common Fields pre-filled from Google
  const [fullName, setFullName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [city, setCity] = useState(user?.city || 'Coimbatore')
  const [area, setArea] = useState(user?.area || '')

  // General User Specific
  const [landmark, setLandmark] = useState('')

  // Local Shop Specific
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState(user?.name || '')
  const [shopCategory, setShopCategory] = useState('Electronics Repair & Services')
  const [shopAddress, setShopAddress] = useState('')

  // Recycler Company Specific
  const [companyName, setCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState(user?.name || '')
  const [companyCategory, setCompanyCategory] = useState('Authorized Recycler')
  const [licenseNo, setLicenseNo] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  // Geolocation
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'acquired' | 'failed'>('idle')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep fields synced if user hydrates late
  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name)
      setOwnerName(user.name)
      setContactPerson(user.name)
    }
    if (user?.phone && !phone) {
      setPhone(user.phone)
    }
  }, [user])

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
        setError('Location access was denied or timed out.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const activeRoleConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole)
    if (!activeRoleConfig) return

    // Validate phone number if provided (Strictly Optional: No OTP required!)
    let formattedPhone = ''
    if (phone.trim()) {
      const { isValid, e164 } = normalizePhone(phone)
      if (!isValid) {
        setError('Please enter a valid 10-digit Indian mobile number or leave it blank.')
        return
      }
      formattedPhone = e164
    }

    if (!city.trim()) {
      setError('Please specify your city.')
      return
    }

    // Role-specific validations
    const payload: any = {
      phone: formattedPhone,
      city: city.trim(),
      coordinates: coords,
    }

    if (selectedRole === 'GENERAL_USER') {
      if (!fullName.trim()) {
        setError('Please enter your full name.')
        return
      }
      payload.name = fullName.trim()
      payload.area = area.trim()
      payload.landmark = landmark.trim()
      payload.address = [area.trim(), landmark.trim(), city.trim()].filter(Boolean).join(', ')
    } else if (selectedRole === 'LOCAL_SHOP') {
      if (!shopName.trim()) {
        setError('Please enter your Shop / Business name.')
        return
      }
      if (!ownerName.trim()) {
        setError('Please enter the owner/manager contact name.')
        return
      }
      if (!shopAddress.trim()) {
        setError('Please enter your shop address.')
        return
      }
      payload.name = shopName.trim()
      payload.shopName = shopName.trim()
      payload.ownerName = ownerName.trim()
      payload.shopCategory = shopCategory
      payload.shopAddress = shopAddress.trim()
      payload.address = shopAddress.trim()
    } else if (selectedRole === 'RECYCLER') {
      if (!companyName.trim()) {
        setError('Please enter your Company / Facility name.')
        return
      }
      if (!contactPerson.trim()) {
        setError('Please enter the primary contact person.')
        return
      }
      if (!companyAddress.trim()) {
        setError('Please enter your facility address.')
        return
      }
      payload.name = companyName.trim()
      payload.companyName = companyName.trim()
      payload.contactPerson = contactPerson.trim()
      payload.companyCategory = companyCategory
      payload.licenseNo = licenseNo.trim()
      payload.companyAddress = companyAddress.trim()
      payload.address = companyAddress.trim()
    }

    setIsSubmitting(true)

    try {
      const completedUser = await completeProfile(activeRoleConfig.dbRole, payload)
      const targetDashboard = getRoleDashboardPath(normalizeRole(completedUser.role))
      navigate(targetDashboard, { replace: true })
    } catch (err: any) {
      console.error('[Green Loop] Complete Profile error:', err)
      setError(err?.message || 'Could not complete registration. Please check your details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeRoleConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole)!

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(165deg, #061e14 0%, #064e3b 45%, #052e22 100%)',
        color: '#ffffff',
        padding: '28px 16px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: -60,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.10)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 1 }}>
        {/* Top Bar with Sign Out option if user wants to switch accounts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="recycle" size={22} color="#10b981" />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.3px' }}>
                Green <span style={{ color: '#10b981' }}>Loop</span>
              </span>
              <div style={{ fontSize: '0.68rem', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Eco Registration
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#d1fae5',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name="logout" size={14} color="#a7f3d0" />
            <span>Switch Account</span>
          </button>
        </div>

        {/* Authenticated Google User Banner */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Icon name="user" size={24} color="#10b981" />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                {user?.name || 'Google User'}
              </span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#6ee7b7',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Icon name="check" size={10} color="#6ee7b7" /> Verified Google
              </span>
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: '#a7f3d0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 2,
              }}
            >
              {email || 'Signed in via Google OAuth'}
            </div>
          </div>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: 6, color: '#ffffff' }}>
            Complete Your Green Loop Profile
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#a7f3d0', margin: 0, lineHeight: 1.5 }}>
            Choose your role in the circular economy to customize your tools and get started.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <Icon name="alert" size={18} color="#ef4444" />
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        {/* Step 1: Role Selection */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#a7f3d0',
              marginBottom: 10,
            }}
          >
            1. Select Your Role
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = selectedRole === opt.id
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRole(opt.id)}
                  style={{
                    background: isSelected ? opt.bg : 'rgba(255, 255, 255, 0.04)',
                    border: `2px solid ${isSelected ? opt.color : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? `0 4px 20px ${opt.color}25` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: opt.bg,
                      border: `1px solid ${opt.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={opt.icon} size={22} color={opt.color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#ffffff' }}>
                        {opt.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: opt.color,
                          background: `${opt.color}20`,
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        +{opt.bonusCoins} Coins
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#a7f3d0', marginTop: 1, fontWeight: 600 }}>
                      {opt.subtitle}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: 4, lineHeight: 1.4 }}>
                      {opt.desc}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? opt.color : 'rgba(255, 255, 255, 0.25)'}`,
                      background: isSelected ? opt.color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {isSelected && <Icon name="check" size={13} color="#ffffff" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 2: Role-Specific Profile Details Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#a7f3d0',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>2. {activeRoleConfig.title} Details</span>
            <span style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>All profiles secured by RLS</span>
          </div>

          {/* GENERAL USER FIELDS */}
          {selectedRole === 'GENERAL_USER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. RS Puram / Peelamedu"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  Landmark / Street Address
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near DB Road / Behind Bus Stand"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* LOCAL SHOP USER FIELDS */}
          {selectedRole === 'LOCAL_SHOP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  Shop / Business Name *
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Coimbatore TechCare & Repairs"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    Owner / Manager Name *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh S."
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    Shop Category
                  </label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: '#06261a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Electronics Repair & Services">Electronics Repair & Services</option>
                    <option value="Refurbished Laptop & Mobile Sales">Refurbished Laptop & Mobile Sales</option>
                    <option value="Component Harvesting & Spare Parts">Component Harvesting & Spare Parts</option>
                    <option value="Authorized E-Waste Collection Point">Authorized E-Waste Collection Point</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  Shop Address *
                </label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="e.g. 102 Cross Cut Rd, Gandhipuram"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Coimbatore"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* RECYCLER COMPANY FIELDS */}
          {selectedRole === 'RECYCLER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  Company / Facility Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. GreenCycle Recyclers Pvt Ltd"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Priya M."
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    Recycler Category
                  </label>
                  <select
                    value={companyCategory}
                    onChange={(e) => setCompanyCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: '#06261a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Authorized Recycler">Authorized Recycler</option>
                    <option value="Material Recovery Facility (MRF)">Material Recovery Facility (MRF)</option>
                    <option value="Dismantling & Shredding Plant">Dismantling & Shredding Plant</option>
                    <option value="EPR Compliance Partner">EPR Compliance Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                  TNPCB / CPCB License No. (Optional)
                </label>
                <input
                  type="text"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="e.g. TNPCB/EW/CBE/2024/091"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    Facility Address *
                  </label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. Plot 42, SIPCOT Industrial Park"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5', marginBottom: 6 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PHONE NUMBER (OPTIONAL POLICY - NO OTP REQUIRED) */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d1fae5' }}>
                Mobile Number <span style={{ color: '#a7f3d0', fontWeight: 400 }}>(Optional)</span>
              </label>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#6ee7b7',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                No OTP required
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a7f3d0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  pointerEvents: 'none',
                }}
              >
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 52px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a7f3d0', marginTop: 4 }}>
              Used only for direct pickup coordination and dispatch updates.
            </div>
          </div>

          {/* LOCATION GPS PIN (OPTIONAL) */}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={handleAcquireLocation}
              disabled={gpsStatus === 'locating'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: '10px',
                background: gpsStatus === 'acquired' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${gpsStatus === 'acquired' ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                color: gpsStatus === 'acquired' ? '#6ee7b7' : '#d1fae5',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name="location-pin" size={16} color={gpsStatus === 'acquired' ? '#10b981' : '#a7f3d0'} />
              <span>
                {gpsStatus === 'locating'
                  ? 'Detecting Location...'
                  : gpsStatus === 'acquired'
                  ? 'Location Attached (Precise Hub Matching)'
                  : 'Detect Current Location (Optional)'}
              </span>
            </button>
          </div>

          {/* SUBMIT BUTTON */}
          <div style={{ marginTop: 22 }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#ffffff',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Creating Your Green Loop Profile...</span>
                </>
              ) : (
                <>
                  <span>Save Profile & Enter Green Loop</span>
                  <Icon name="arrow-right" size={18} color="#ffffff" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
