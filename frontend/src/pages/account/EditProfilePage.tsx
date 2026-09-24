import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userService } from '../../services/userService'
import type { UserSession } from '../../services/userService'
import { CATEGORIES } from '../../data/mockData'
import Icon from '../../components/Icon'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, setUser, updatePassword } = useAuth()

  // Active sub-section tab for desktop view
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'privacy' | 'security' | 'role'>('personal')

  // Form states
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [city, setCity] = useState(user?.city || 'Coimbatore')
  const [area, setArea] = useState(user?.area || 'RS Puram')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null)

  // Preferences
  const [language, setLanguage] = useState<'EN' | 'TA' | 'HI' | 'ML' | 'KN'>(user?.preferences?.language || 'EN')
  const [preferredCategories, setPreferredCategories] = useState<string[]>(
    user?.preferences?.preferredCategories || ['Mobile', 'Laptop']
  )
  const [preferredAction, setPreferredAction] = useState<'Sell' | 'Donate' | 'Recycle' | 'Repair' | 'Exchange'>(
    user?.preferences?.preferredAction || 'Sell'
  )
  const [pickupPreference, setPickupPreference] = useState<'doorstep' | 'hub_dropoff'>(
    user?.preferences?.pickupPreference || 'doorstep'
  )
  const [aiRecommendations, setAiRecommendations] = useState<boolean>(
    user?.preferences?.aiRecommendations !== undefined ? user.preferences.aiRecommendations : true
  )
  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    sms: user?.preferences?.notifications?.sms ?? true,
    missionReminders: user?.preferences?.notifications?.missionReminders ?? true,
    pickupUpdates: user?.preferences?.notifications?.pickupUpdates ?? true
  })

  // Privacy
  const [privacy, setPrivacy] = useState({
    showApproximateLocation: user?.privacy?.showApproximateLocation ?? true,
    showPhoneToVerifiedOnly: user?.privacy?.showPhoneToVerifiedOnly ?? true,
    profileVisibility: user?.privacy?.profileVisibility || 'community',
    activityVisibility: user?.privacy?.activityVisibility ?? true,
    aiDataAnalysis: user?.privacy?.aiDataAnalysis ?? true
  })

  // Role Profile states
  const [interests, setInterests] = useState<string[]>(user?.roleProfile?.interests || ['E-Waste Recycling', 'Refurbished Parts'])
  const [shopName, setShopName] = useState(user?.roleProfile?.shopName || 'Coimbatore TechCare & Repairs')
  const [shopDescription, setShopDescription] = useState(user?.roleProfile?.shopDescription || 'Authorized electronics repair and component harvesting hub.')
  const [shopServices, setShopServices] = useState<string[]>(user?.roleProfile?.shopServices || ['Repair', 'Buyback', 'Collection'])
  const [shopHours, setShopHours] = useState(user?.roleProfile?.shopHours || '9:30 AM – 8:30 PM (Mon–Sat)')
  const [shopAddress, setShopAddress] = useState(user?.roleProfile?.shopAddress || '102 Cross Cut Rd, Gandhipuram, Coimbatore')
  const [shopGst, setShopGst] = useState(user?.roleProfile?.shopGst || '33AAACG1234F1Z5')

  const [companyName, setCompanyName] = useState(user?.roleProfile?.companyName || 'GreenCycle Recyclers Pvt Ltd')
  const [companyDescription, setCompanyDescription] = useState(user?.roleProfile?.companyDescription || 'TNPCB Authorized E-Waste Dismantling & Material Recovery Facility.')
  const [companyMaterials, setCompanyMaterials] = useState<string[]>(user?.roleProfile?.companyMaterials || ['Lithium Batteries', 'Circuit Boards', 'Displays', 'Cables'])
  const [serviceAreas, setServiceAreas] = useState<string[]>(user?.roleProfile?.serviceAreas || ['Coimbatore Urban', 'Tiruppur', 'SIPCOT'])
  const [tnpcbLicenseNo, setTnpcbLicenseNo] = useState(user?.roleProfile?.tnpcbLicenseNo || 'TNPCB/E-WASTE/CBE/2024/091')

  // Password Change modal & states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Live Camera Snapshot state
  const [showCameraModal, setShowCameraModal] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Active Sessions
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [sessionLoading, setSessionLoading] = useState(false)

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Track isDirty
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setIsDirty(true)
  }, [
    name, username, email, phone, city, area, bio, avatar,
    language, preferredCategories, preferredAction, pickupPreference, aiRecommendations, notifications,
    privacy, interests, shopName, shopDescription, shopServices, shopHours, shopAddress, shopGst,
    companyName, companyDescription, companyMaterials, serviceAreas, tnpcbLicenseNo
  ])

  // Load sessions
  useEffect(() => {
    userService.getActiveSessions().then(setSessions)
    // Mark initial clean state
    setTimeout(() => setIsDirty(false), 200)
  }, [])

  // Camera Management
  const startCamera = async (mode: 'user' | 'environment' = cameraFacing) => {
    stopCamera()
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      cameraStreamRef.current = stream
    } catch {
      setCameraError('Camera access denied or unavailable.')
    }
  }

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const size = Math.min(video.videoWidth, video.videoHeight) || 400
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(
          video,
          (video.videoWidth - size) / 2,
          (video.videoHeight - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        )
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(dataUrl)
        stopCamera()
        setShowCameraModal(false)
      }
    }
  }

  const handleFilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (JPG, PNG, or WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDimension = 600
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(compressed)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) errs.name = 'Full name must be at least 2 characters'
    if (!username.trim() || username.trim().length < 3) errs.username = 'Username must be at least 3 characters'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address'
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) errs.phone = 'Please enter a valid 10-digit mobile number'
    if (!city.trim()) errs.city = 'City is required'
    if (!area.trim()) errs.area = 'Area / Locality is required'
    if (preferredCategories.length === 0) errs.categories = 'Select at least one e-waste category'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validate()) {
      setActiveTab('personal')
      return
    }

    setIsSaving(true)
    setSaveSuccess(null)

    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        area: area.trim(),
        bio: bio.trim(),
        avatar,
        language,
        preferredCategories,
        preferredAction,
        pickupPreference,
        aiRecommendations,
        notifications,
        privacy,
        roleProfile: {
          interests,
          shopName: shopName.trim(),
          shopDescription: shopDescription.trim(),
          shopServices,
          shopHours: shopHours.trim(),
          shopAddress: shopAddress.trim(),
          shopGst: shopGst.trim(),
          companyName: companyName.trim(),
          companyDescription: companyDescription.trim(),
          companyMaterials,
          serviceAreas,
          tnpcbLicenseNo: tnpcbLicenseNo.trim()
        }
      })

      setUser(updated)
      setIsDirty(false)
      setSaveSuccess('Profile updated successfully! All changes are synced to your Green Loop account.')
      setTimeout(() => {
        setSaveSuccess(null)
      }, 4000)
    } catch {
      alert('Failed to update profile. Please check your network and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackClick = () => {
    if (isDirty) {
      setShowUnsavedModal(true)
    } else {
      navigate('/account')
    }
  }

  const handleTerminateOtherSessions = async () => {
    setSessionLoading(true)
    try {
      const res = await userService.logoutOtherSessions()
      setSessions(res.activeSessions)
      alert('Successfully logged out of all other active devices!')
    } finally {
      setSessionLoading(false)
    }
  }

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await updatePassword(newPassword)
      setPasswordSuccess('Password saved securely! You can now use this password to sign in.')
      setNewPassword('')
      setConfirmPassword('')
      if (user && !user.isProfileComplete) {
        setUser({ ...user, isProfileComplete: true })
      }
      setTimeout(() => {
        setShowPasswordModal(false)
      }, 3000)
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const currentRole = user?.role || 'GENERAL_USER'

  return (
    <div className="page-content" style={{ paddingBottom: 110 }}>
      {/* ===== TOP NAV BAR ===== */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 35,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 16px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleBackClick}
            aria-label="Go Back"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <Icon name="close" size={16} color="var(--text-primary)" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              Edit Profile
            </h1>
            <span style={{ fontSize: '0.72rem', color: isDirty ? '#f59e0b' : 'var(--accent)', fontWeight: 700 }}>
              {isDirty ? 'Unsaved Changes' : 'All Synced'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="btn btn-primary btn-sm"
            style={{
              fontSize: '0.8rem',
              padding: '7px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? (
              <>
                <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="check" size={14} color="#fff" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== SUCCESS ALERT BANNER ===== */}
      {saveSuccess && (
        <div className="container" style={{ paddingTop: 14 }}>
          <div style={{
            background: 'var(--accent-light)',
            border: '1.5px solid var(--accent)',
            color: 'var(--accent-text)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'scale-in 0.2s ease'
          }}>
            <Icon name="verified" size={18} color="var(--accent)" />
            <span>{saveSuccess}</span>
          </div>
        </div>
      )}

      {/* ===== MAIN FORM CONTAINER ===== */}
      <div className="container" style={{ paddingTop: 16 }}>
        
        {/* ===== 1. PROFILE PHOTO CARD ===== */}
        <div className="card" style={{ padding: 20, marginBottom: 18, border: '1.5px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {/* Avatar Preview */}
            <div style={{
              position: 'relative',
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #047857)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              boxShadow: 'var(--shadow-md)',
              border: '3px solid var(--bg-surface)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {avatar ? (
                <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{name?.[0]?.toUpperCase() || 'M'}</span>
              )}
            </div>

            {/* Photo Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Profile Photo
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Upload a clear picture or take a live snapshot with camera. Max 5MB.
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {/* Live Camera Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCameraModal(true)
                    startCamera()
                  }}
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent-text)',
                    border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Icon name="camera" size={14} color="var(--accent)" />
                  <span>Take Live Photo</span>
                </button>

                {/* Upload File Input */}
                <label
                  style={{
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Icon name="image" size={14} color="var(--text-secondary)" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleFilePhoto} style={{ display: 'none' }} />
                </label>

                {/* Remove Photo */}
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    style={{
                      background: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Icon name="trash" size={13} color="#ef4444" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION SELECTOR PILLS ===== */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: 4,
          marginBottom: 16
        }}>
          {[
            { id: 'personal', label: 'Personal Info', icon: 'user' as const },
            { id: 'preferences', label: 'Preferences', icon: 'settings' as const },
            { id: 'privacy', label: 'Privacy', icon: 'shield' as const },
            { id: 'security', label: 'Security & Sessions', icon: 'certificate' as const },
            { id: 'role', label: `${currentRole.replace('_', ' ')} Profile`, icon: 'shop' as const },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: activeTab === t.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.18s ease'
              }}
            >
              <Icon name={t.icon} size={14} color={activeTab === t.id ? '#fff' : 'var(--text-secondary)'} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ===== SECTION 1: PERSONAL INFORMATION ===== */}
        {activeTab === 'personal' && (
          <div className="card" style={{ padding: 22, border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon name="user" size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Personal Information
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mathavan Kumar"
                  style={{ width: '100%', borderColor: errors.name ? '#ef4444' : undefined }}
                />
                {errors.name && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{errors.name}</div>}
              </div>

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="@mathavan_eco"
                  style={{ width: '100%', borderColor: errors.username ? '#ef4444' : undefined }}
                />
                {errors.username && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{errors.username}</div>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mathavan@example.com"
                  style={{ width: '100%', borderColor: errors.email ? '#ef4444' : undefined }}
                />
                {errors.email && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', borderColor: errors.phone ? '#ef4444' : undefined }}
                />
                {errors.phone && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{errors.phone}</div>}
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="input"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Coimbatore"
                  style={{ width: '100%', borderColor: errors.city ? '#ef4444' : undefined }}
                />
                {errors.city && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{errors.city}</div>}
              </div>

              {/* Area / Locality */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Area / Locality <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="input"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="RS Puram"
                  style={{ width: '100%', borderColor: errors.area ? '#ef4444' : undefined }}
                />
                {errors.area && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{errors.area}</div>}
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  About You / Bio
                </label>
                <span style={{ fontSize: '0.7rem', color: bio.length > 240 ? '#ef4444' : 'var(--text-tertiary)' }}>
                  {bio.length}/250 chars
                </span>
              </div>
              <textarea
                className="input"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 250))}
                placeholder="Share your sustainability goals or devices you specialize in..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* ===== ACCOUNT PASSWORD & SECURITY CARD ===== */}
            <div
              style={{
                marginTop: 20,
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--bg-surface-2), rgba(16, 185, 129, 0.05))',
                border: '1.5px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <Icon name="certificate" size={18} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Account Password
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                      Set or update your password to sign in via email & password in addition to Google
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  Password Security
                </span>
              </div>

              {passwordSuccess && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: 14,
                    fontSize: '0.8rem',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <Icon name="check" size={15} color="#34d399" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: 14,
                    fontSize: '0.8rem',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <Icon name="alert" size={15} color="#f87171" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      style={{ width: '100%', paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                      tabIndex={-1}
                    >
                      <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={15} color="var(--text-tertiary)" />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      style={{ width: '100%', paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                      tabIndex={-1}
                    >
                      <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={15} color="var(--text-tertiary)" />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => handleChangePassword()}
                  disabled={passwordLoading || !newPassword}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: passwordLoading || !newPassword ? 'not-allowed' : 'pointer',
                    opacity: passwordLoading || !newPassword ? 0.6 : 1,
                  }}
                >
                  {passwordLoading ? (
                    <>
                      <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                      <span>Saving Password...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} color="var(--accent)" />
                      <span>Set / Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== SECTION 2: GREEN LOOP PREFERENCES ===== */}
        {activeTab === 'preferences' && (
          <div className="card" style={{ padding: 22, border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon name="settings" size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Green Loop Preferences
              </h2>
            </div>

            {/* Preferred Language */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Preferred Platform Language
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { code: 'EN', label: 'English' },
                  { code: 'TA', label: 'தமிழ் (Tamil)' },
                  { code: 'HI', label: 'हिंदी (Hindi)' },
                  { code: 'ML', label: 'മലയാളം (Malayalam)' },
                  { code: 'KN', label: 'ಕನ್ನಡ (Kannada)' },
                ].map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code as any)}
                    style={{
                      background: language === l.code ? 'var(--accent)' : 'var(--bg-surface-2)',
                      color: language === l.code ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Categories */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Interested E-Waste Categories
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const isSelected = preferredCategories.includes(cat.label)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (preferredCategories.length > 1) {
                            setPreferredCategories(preferredCategories.filter(c => c !== cat.label))
                          }
                        } else {
                          setPreferredCategories([...preferredCategories, cat.label])
                        }
                      }}
                      style={{
                        background: isSelected ? 'var(--accent)' : 'var(--bg-surface-2)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Icon name={cat.icon} size={14} color={isSelected ? '#fff' : 'var(--text-secondary)'} />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preferred Action & Pickup mode */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Default Action Preference
                </label>
                <select
                  className="input"
                  value={preferredAction}
                  onChange={e => setPreferredAction(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="Sell">Sell (Earn Cash & Coins)</option>
                  <option value="Donate">Donate (Community Education)</option>
                  <option value="Recycle">Recycle (Zero-Landfill)</option>
                  <option value="Repair">Repair (Extend Device Life)</option>
                  <option value="Exchange">Exchange (Device Swap)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Pickup & Logistics Mode
                </label>
                <select
                  className="input"
                  value={pickupPreference}
                  onChange={e => setPickupPreference(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="doorstep">Doorstep Pickup by Verified Collector</option>
                  <option value="hub_dropoff">Self Drop-Off at Partner Shop</option>
                </select>
              </div>
            </div>

            {/* Notification & AI Toggles */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 12 }}>
                AI & Notification Preferences
              </div>
              
              {/* Personalized AI Recommendations */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 10
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>Personalized AI Device Recommendations</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Tailors recycling estimates, reuse tips, and price valuation to your hardware</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiRecommendations}
                  onChange={e => setAiRecommendations(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'pickupUpdates', title: 'Pickup Status Tracker Updates', desc: 'Real-time alerts when collector is en route' },
                  { key: 'missionReminders', title: 'Daily Eco Mission Reminders', desc: 'Morning notifications to keep your 7-day streak' },
                  { key: 'email', title: 'Email Recycling Certificates & Receipts', desc: 'Digital TNPCB-verified documentation sent to your email' },
                  { key: 'sms', title: 'SMS Transaction Alerts', desc: 'Instant OTP and pickup confirmation codes' },
                ].map(n => (
                  <div
                    key={n.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-surface-2)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{n.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifications as any)[n.key]}
                      onChange={e => setNotifications({ ...notifications, [n.key]: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== SECTION 3: PRIVACY SETTINGS ===== */}
        {activeTab === 'privacy' && (
          <div className="card" style={{ padding: 22, border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon name="shield" size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Privacy & Data Safeguards
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Approximate Location */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    Show Approximate Location Only
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Your exact street/door address is never shown publicly. Only locality ({area}) is displayed.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showApproximateLocation}
                  onChange={e => setPrivacy({ ...privacy, showApproximateLocation: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>

              {/* Show Phone */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    Show Phone Number Only to Verified Partners
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Protects against spam by restricting phone visibility to KYC-verified shops and recyclers.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showPhoneToVerifiedOnly}
                  onChange={e => setPrivacy({ ...privacy, showPhoneToVerifiedOnly: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>

              {/* Profile Visibility */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                  Profile Visibility Mode
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'public', label: 'Public', desc: 'Visible to all community members' },
                    { id: 'community', label: 'Verified Only', desc: 'Visible to registered members' },
                    { id: 'private', label: 'Private', desc: 'Hidden from search directories' },
                  ].map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setPrivacy({ ...privacy, profileVisibility: v.id as any })}
                      style={{
                        background: privacy.profileVisibility === v.id ? 'var(--accent)' : 'var(--bg-surface)',
                        color: privacy.profileVisibility === v.id ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard Activity */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    Show Impact on Eco Leaderboards
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Display your Green Coin ranking and recycled kg on college and city scoreboards.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.activityVisibility}
                  onChange={e => setPrivacy({ ...privacy, activityVisibility: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== SECTION 4: SECURITY & SESSIONS ===== */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: 22, border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon name="certificate" size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Security & Account Sessions
              </h2>
            </div>

            {/* Change Password Trigger */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Account Password</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Last changed 45 days ago</div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                Change Password
              </button>
            </div>

            {/* 2FA Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="verified" size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Requires SMS OTP confirmation on new device logins</div>
                </div>
              </div>
              <span style={{
                background: 'var(--accent-light)',
                color: 'var(--accent-text)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)'
              }}>
                Enabled
              </span>
            </div>

            {/* Active Sessions List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Active Login Sessions ({sessions.length})
                </span>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleTerminateOtherSessions}
                    disabled={sessionLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Logout from other devices
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sessions.map(s => (
                  <div
                    key={s.id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-surface-2)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: s.isCurrent ? 'var(--accent)' : 'var(--border-color)',
                        color: s.isCurrent ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon name={s.device.includes('iPhone') ? 'phone' : 'laptop'} size={18} color={s.isCurrent ? '#fff' : 'var(--text-secondary)'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{s.device}</span>
                          {s.isCurrent && (
                            <span style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4 }}>Current</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {s.browser} • {s.location} • {s.lastActive}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== SECTION 5: ROLE-SPECIFIC PROFILE ===== */}
        {activeTab === 'role' && (
          <div className="card" style={{ padding: 22, border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Icon name="shop" size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {currentRole === 'GENERAL_USER' && 'General User Eco Profile'}
                {currentRole === 'LOCAL_SHOP' && 'Local Shop Business Profile'}
                {currentRole === 'RECYCLER' && 'Recycling Company Profile'}
                {currentRole === 'ADMIN' && 'Admin Governance Profile'}
              </h2>
            </div>

            {/* General User */}
            {currentRole === 'GENERAL_USER' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Eco Interests & DIY Skills
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {['E-Waste Recycling', 'Refurbished Parts', 'Arduino/Robotics', 'Battery Safety', 'Display Harvesting'].map(item => {
                    const selected = interests.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setInterests(interests.filter(i => i !== item))
                          } else {
                            setInterests([...interests, item])
                          }
                        }}
                        style={{
                          background: selected ? 'var(--accent)' : 'var(--bg-surface-2)',
                          color: selected ? '#fff' : 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-full)',
                          padding: '6px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Local Shop */}
            {currentRole === 'LOCAL_SHOP' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Shop / Store Name
                  </label>
                  <input className="input" value={shopName} onChange={e => setShopName(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Store Description & Specialization
                  </label>
                  <textarea className="input" rows={2} value={shopDescription} onChange={e => setShopDescription(e.target.value)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Services Offered
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Repair', 'Buyback', 'Collection', 'Refurbishing', 'Component Sales'].map(s => {
                      const selected = shopServices.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => selected ? setShopServices(shopServices.filter(item => item !== s)) : setShopServices([...shopServices, s])}
                          style={{
                            background: selected ? 'var(--accent)' : 'var(--bg-surface-2)',
                            color: selected ? '#fff' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            padding: '5px 12px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Opening Hours
                    </label>
                    <input className="input" value={shopHours} onChange={e => setShopHours(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      GST / Business Trade License No.
                    </label>
                    <input className="input" value={shopGst} onChange={e => setShopGst(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Store Physical Address (Displayed on Ecosystem Map)
                  </label>
                  <input className="input" value={shopAddress} onChange={e => setShopAddress(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {/* Recycling Company */}
            {currentRole === 'RECYCLER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Authorized Recycling Facility Name
                  </label>
                  <input className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Facility Description & Recovery Methodology
                  </label>
                  <textarea className="input" rows={2} value={companyDescription} onChange={e => setCompanyDescription(e.target.value)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Accepted Hazardous & Precious Materials
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Lithium Batteries', 'Circuit Boards', 'Displays', 'Cables', 'Lead Acid', 'Rare Earth Magnetics'].map(m => {
                      const selected = companyMaterials.includes(m)
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => selected ? setCompanyMaterials(companyMaterials.filter(item => item !== m)) : setCompanyMaterials([...companyMaterials, m])}
                          style={{
                            background: selected ? 'var(--accent)' : 'var(--bg-surface-2)',
                            color: selected ? '#fff' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            padding: '5px 12px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {m}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      TNPCB E-Waste Authorization License
                    </label>
                    <input className="input" value={tnpcbLicenseNo} onChange={e => setTnpcbLicenseNo(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Fleet Coverage Areas
                    </label>
                    <input className="input" value={serviceAreas.join(', ')} onChange={e => setServiceAreas(e.target.value.split(',').map(s => s.trim()))} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Admin */}
            {currentRole === 'ADMIN' && (
              <div style={{ padding: 16, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon name="shield" size={18} color="var(--accent)" />
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>System Administrator Level 1</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Full administrative permissions to verify local shops, issue digital certificates, audit recycling weight statements, and govern ecosystem trust ratings.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== BOTTOM STICKY ACTION BAR ===== */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '14px 20px',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}>
        <button
          type="button"
          onClick={handleBackClick}
          className="btn btn-ghost"
          style={{ fontSize: '0.85rem' }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="btn btn-primary"
          style={{
            fontSize: '0.88rem',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {isSaving ? (
            <>
              <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Icon name="check" size={16} color="#fff" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* ===== LIVE CAMERA PHOTO MODAL ===== */}
      {showCameraModal && (
        <>
          <div className="modal-backdrop" onClick={() => { stopCamera(); setShowCameraModal(false) }} style={{ zIndex: 120 }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 420,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 130,
            padding: 20,
            overflow: 'hidden',
            animation: 'scale-in 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Take Profile Photo</span>
              <button
                onClick={() => { stopCamera(); setShowCameraModal(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Icon name="close" size={16} color="var(--text-secondary)" />
              </button>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{
              position: 'relative',
              width: '100%',
              height: 280,
              background: '#000',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Circular profile crop guideline */}
              <div style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: '50%',
                border: '2px dashed #10b981',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'none'
              }} />
            </div>

            {cameraError && (
              <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 12, textAlign: 'center' }}>
                {cameraError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const next = cameraFacing === 'user' ? 'environment' : 'user'
                  setCameraFacing(next)
                  startCamera(next)
                }}
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Icon name="refresh" size={16} color="var(--text-secondary)" />
              </button>

              <button
                onClick={handleCapturePhoto}
                style={{
                  background: '#fff',
                  border: '4px solid var(--accent)',
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)' }} />
              </button>

              <button
                onClick={() => { stopCamera(); setShowCameraModal(false) }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      {showPasswordModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)} style={{ zIndex: 120 }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 400,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 130,
            padding: 24,
            animation: 'scale-in 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Set or Update Password</span>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="close" size={16} color="var(--text-secondary)" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  New Password (Min. 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="input"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ width: '100%', paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    tabIndex={-1}
                  >
                    <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={15} color="var(--text-tertiary)" />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{ width: '100%', paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    tabIndex={-1}
                  >
                    <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={15} color="var(--text-tertiary)" />
                  </button>
                </div>
              </div>

              {passwordError && (
                <div style={{ color: '#ef4444', fontSize: '0.76rem', fontWeight: 600 }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{ color: 'var(--accent)', fontSize: '0.76rem', fontWeight: 700 }}>
                  {passwordSuccess}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn btn-primary btn-sm"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ===== UNSAVED CHANGES MODAL ===== */}
      {showUnsavedModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowUnsavedModal(false)} style={{ zIndex: 120 }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 380,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 130,
            padding: 24,
            textAlign: 'center',
            animation: 'scale-in 0.2s ease'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <Icon name="alert" size={24} color="#f59e0b" />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              You have unsaved changes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.4 }}>
              Are you sure you want to leave? Any unsaved modifications to your profile will be discarded.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="btn btn-secondary btn-full"
                style={{ fontSize: '0.82rem' }}
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setIsDirty(false)
                  setShowUnsavedModal(false)
                  navigate('/account')
                }}
                className="btn btn-primary btn-full"
                style={{ fontSize: '0.82rem', background: '#ef4444' }}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
