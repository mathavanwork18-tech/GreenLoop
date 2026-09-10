import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { MOCK_USER } from '../data/mockData'
import type { LanguageCode } from '../types/common.types'
import { apiClient } from '../services/api/apiClient'

export type Role = 'GENERAL_USER' | 'LOCAL_SHOP' | 'RECYCLER' | 'ADMIN'

export interface User {
  id: string
  name: string
  username: string
  email: string
  phone: string
  city: string
  area: string
  bio: string
  avatar: string | null
  role: Role
  greenCoins: number
  level: string
  levelIcon: string
  levelMin: number
  levelMax: number
  streak: number
  isVerified: boolean
  isProfileComplete?: boolean
  rating: number
  transactions: number
  joinedAt: string
  preferences?: {
    language: LanguageCode
    preferredCategories: string[]
    preferredAction: 'Sell' | 'Donate' | 'Recycle' | 'Repair' | 'Exchange'
    pickupPreference: 'doorstep' | 'hub_dropoff'
    aiRecommendations: boolean
    notifications: {
      email: boolean
      sms: boolean
      missionReminders: boolean
      pickupUpdates: boolean
    }
  }
  privacy?: {
    showApproximateLocation: boolean
    showPhoneToVerifiedOnly: boolean
    profileVisibility: 'public' | 'community' | 'private'
    activityVisibility: boolean
    aiDataAnalysis: boolean
  }
  roleProfile?: {
    interests?: string[]
    shopName?: string
    ownerName?: string
    shopLogo?: string
    shopDescription?: string
    shopServices?: string[]
    shopHours?: string
    shopAddress?: string
    shopGst?: string
    category?: string
    landmark?: string
    coordinates?: { lat: number; lng: number } | null
    companyName?: string
    companyLogo?: string
    companyDescription?: string
    companyMaterials?: string[]
    serviceAreas?: string[]
    pickupFleetAvailable?: boolean
    tnpcbLicenseNo?: string
    adminLevel?: string
  }
}

export interface RegistrationDraft {
  phone: string
  role?: Role
  step?: number
  formData?: Record<string, any>
  updatedAt: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; isExistingUser: boolean; isProfileComplete: boolean; user?: User }>
  completeProfile: (role: Role, profileData: any) => Promise<User>
  saveRegistrationDraft: (draft: Partial<RegistrationDraft>) => void
  getRegistrationDraft: () => RegistrationDraft | null
  clearRegistrationDraft: () => void
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateCoins: (amount: number) => void
  redeemCoins: (amount: number, title?: string) => void
  setRole: (role: Role) => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: Role
  city: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('gl_language') as LanguageCode) || 'EN'
  })

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('gl_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.id) return parsed
      } catch {
        localStorage.removeItem('gl_user')
      }
    }
    return null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('gl_user', JSON.stringify(user))
    }
  }, [user])

  const setLanguage = (lang: LanguageCode) => {
    setLangState(lang)
    localStorage.setItem('gl_language', lang)
    if (user) {
      const updated: User = {
        ...user,
        preferences: {
          ...(user.preferences || {
            preferredCategories: [],
            preferredAction: 'Recycle',
            pickupPreference: 'doorstep',
            aiRecommendations: true,
            notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
          }),
          language: lang,
        },
      }
      setUser(updated)
      localStorage.setItem('gl_user', JSON.stringify(updated))
    }
  }

  // --- Registration Resume Draft Management ---
  const saveRegistrationDraft = (draft: Partial<RegistrationDraft>) => {
    try {
      const existing = getRegistrationDraft() || { phone: '', updatedAt: Date.now() }
      const merged: RegistrationDraft = {
        ...existing,
        ...draft,
        formData: { ...(existing.formData || {}), ...(draft.formData || {}) },
        updatedAt: Date.now(),
      }
      localStorage.setItem('gl_registration_draft', JSON.stringify(merged))
    } catch (e) {
      console.warn('Could not save registration draft', e)
    }
  }

  const getRegistrationDraft = (): RegistrationDraft | null => {
    try {
      const raw = localStorage.getItem('gl_registration_draft')
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const clearRegistrationDraft = () => {
    try {
      localStorage.removeItem('gl_registration_draft')
    } catch {}
  }

  // --- Phone + OTP Authentication ---
  const sendOtp = async (phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)

    try {
      const res = await apiClient<{ success: boolean; message: string; devOtp?: string }>('/api/auth/send-otp', {
        method: 'POST',
        body: { phone: cleanPhone },
      })
      if (res && res.success) {
        return res
      }
    } catch {}

    // Graceful offline fallback simulation
    await new Promise(r => setTimeout(r, 600))
    const devOtp = Math.floor(100000 + Math.random() * 900000).toString()
    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone.slice(0, 2)}******${cleanPhone.slice(-2)}`,
      devOtp,
    }
  }

  const verifyOtp = async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; isExistingUser: boolean; isProfileComplete: boolean; user?: User }> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)

    try {
      const res = await apiClient<any>('/api/auth/verify-otp', {
        method: 'POST',
        body: { phone: cleanPhone, otp },
      })
      if (res && res.success) {
        if (res.isProfileComplete && res.user) {
          const loggedInUser: User = {
            ...MOCK_USER,
            ...res.user,
            isProfileComplete: true,
          }
          setUser(loggedInUser)
          localStorage.setItem('gl_user', JSON.stringify(loggedInUser))
          clearRegistrationDraft()
          return { success: true, isExistingUser: true, isProfileComplete: true, user: loggedInUser }
        }
        return { success: true, isExistingUser: res.isExistingUser, isProfileComplete: false }
      }
    } catch {}

    // Offline fallback check against gl_registered_users
    await new Promise(r => setTimeout(r, 500))
    const registered: any[] = JSON.parse(localStorage.getItem('gl_registered_users') || '[]')
    const existing = registered.find(u => u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone)

    if (existing && existing.isProfileComplete) {
      const loggedInUser: User = {
        ...MOCK_USER,
        ...existing,
        isProfileComplete: true,
      }
      setUser(loggedInUser)
      localStorage.setItem('gl_user', JSON.stringify(loggedInUser))
      clearRegistrationDraft()
      return { success: true, isExistingUser: true, isProfileComplete: true, user: loggedInUser }
    }

    return { success: true, isExistingUser: !!existing, isProfileComplete: false }
  }

  const completeProfile = async (role: Role, profileData: any): Promise<User> => {
    const cleanPhone = (profileData.phone || '').replace(/\D/g, '').slice(-10)

    try {
      const res = await apiClient<any>('/api/auth/complete-profile', {
        method: 'POST',
        body: {
          phone: cleanPhone,
          role,
          profileData: {
            ...profileData,
            language,
          },
        },
      })
      if (res && res.success && res.user) {
        const completedUser: User = {
          ...MOCK_USER,
          ...res.user,
          role,
          isProfileComplete: true,
        }
        setUser(completedUser)
        localStorage.setItem('gl_user', JSON.stringify(completedUser))

        // Update local registered list
        const registered: any[] = JSON.parse(localStorage.getItem('gl_registered_users') || '[]')
        const filtered = registered.filter(u => u.phone?.replace(/\D/g, '').slice(-10) !== cleanPhone)
        localStorage.setItem('gl_registered_users', JSON.stringify([completedUser, ...filtered]))

        clearRegistrationDraft()
        return completedUser
      }
    } catch {}

    // Offline fallback
    await new Promise(r => setTimeout(r, 600))
    const completedUser: User = {
      ...MOCK_USER,
      id: 'u_' + Date.now(),
      name: profileData.name || (role === 'LOCAL_SHOP' ? profileData.shopName : 'Eco Citizen'),
      username: (profileData.name || 'citizen').toLowerCase().replace(/\s+/g, '_'),
      email: profileData.email || '',
      phone: cleanPhone,
      city: profileData.city || 'Chennai',
      area: profileData.area || 'Guindy',
      role,
      greenCoins: 100, // 100 Green Coins welcome bonus
      level: 'Eco Beginner',
      levelIcon: 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak: 1,
      isVerified: true,
      isProfileComplete: true,
      avatar: profileData.avatar || null,
      preferences: {
        language,
        preferredCategories: ['Smartphones', 'Laptops'],
        preferredAction: 'Recycle',
        pickupPreference: 'doorstep',
        aiRecommendations: true,
        notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
      },
      roleProfile: role === 'LOCAL_SHOP' ? {
        shopName: profileData.shopName || '',
        ownerName: profileData.ownerName || '',
        category: profileData.category || 'General Electronics',
        shopAddress: profileData.shopAddress || '',
      } : {
        landmark: profileData.landmark || '',
        coordinates: profileData.coordinates || null,
      },
    }

    setUser(completedUser)
    localStorage.setItem('gl_user', JSON.stringify(completedUser))

    const registered: any[] = JSON.parse(localStorage.getItem('gl_registered_users') || '[]')
    const filtered = registered.filter(u => u.phone?.replace(/\D/g, '').slice(-10) !== cleanPhone)
    localStorage.setItem('gl_registered_users', JSON.stringify([completedUser, ...filtered]))

    clearRegistrationDraft()
    return completedUser
  }

  // --- Legacy Auth Methods (Preserved for compatibility) ---
  const login = async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 600))
    const registered: any[] = JSON.parse(localStorage.getItem('gl_registered_users') || '[]')
    const match = registered.find(u => u.email.toLowerCase() === email.trim().toLowerCase())

    const loggedIn: User = {
      ...MOCK_USER,
      name: match?.name || (email.toLowerCase().includes('admin') ? 'State Compliance Officer' : MOCK_USER.name),
      email: match?.email || email.trim(),
      phone: match?.phone || MOCK_USER.phone,
      city: match?.city || MOCK_USER.city,
      role: match?.role || (email.toLowerCase().includes('admin') ? 'ADMIN' : MOCK_USER.role),
      isProfileComplete: true,
    }
    setUser(loggedIn)
    localStorage.setItem('gl_user', JSON.stringify(loggedIn))
  }

  const register = async (data: RegisterData) => {
    await new Promise(r => setTimeout(r, 1000))
    const newUser: User = {
      ...MOCK_USER,
      id: 'u_' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      city: data.city,
      greenCoins: 100,
      level: 'Eco Beginner',
      levelIcon: 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak: 1,
      transactions: 0,
      isVerified: true,
      isProfileComplete: true,
    }
    setUser(newUser)
    localStorage.setItem('gl_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gl_user')
  }

  const updateCoins = (amount: number) => {
    setUser(prev => {
      if (!prev) return prev
      const newCoins = Math.max(0, prev.greenCoins + amount)
      let level = 'Eco Beginner'
      let levelIcon: any = 'leaf'
      let levelMin = 0
      let levelMax = 499

      if (newCoins >= 5000) {
        level = 'Planet Guardian'
        levelIcon = 'verified'
        levelMin = 5000
        levelMax = 99999
      } else if (newCoins >= 1500) {
        level = 'Green Champion'
        levelIcon = 'recycle'
        levelMin = 1500
        levelMax = 4999
      } else if (newCoins >= 500) {
        level = 'Eco Explorer'
        levelIcon = 'tree'
        levelMin = 500
        levelMax = 1499
      }

      const updated = { ...prev, greenCoins: newCoins, level, levelIcon, levelMin, levelMax }
      localStorage.setItem('gl_user', JSON.stringify(updated))
      return updated
    })
  }

  const redeemCoins = (amount: number, title: string = 'Redeemed Eco Token') => {
    updateCoins(amount)
    try {
      const existing = JSON.parse(localStorage.getItem('gl_custom_coin_history') || '[]')
      const newTx = {
        id: 'c_' + Date.now(),
        type: amount >= 0 ? 'earn' : 'spent',
        title: title,
        amount: amount >= 0 ? `+${amount}` : `${amount}`,
        time: 'Just now',
        status: 'Completed'
      }
      localStorage.setItem('gl_custom_coin_history', JSON.stringify([newTx, ...existing]))
    } catch {}
  }

  useEffect(() => {
    (window as any).redeemCoins = (amount: number = 100, title: string = 'Eco Token Voucher') => {
      redeemCoins(amount, title)
      console.log(`[Green Loop] +${amount} Green Coins credited to wallet: "${title}"`)
    }
  }, [user])

  const setRole = (role: Role) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, role }
      localStorage.setItem('gl_user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!user.isProfileComplete,
        language,
        setLanguage,
        sendOtp,
        verifyOtp,
        completeProfile,
        saveRegistrationDraft,
        getRegistrationDraft,
        clearRegistrationDraft,
        login,
        register,
        logout,
        updateCoins,
        redeemCoins,
        setRole,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
