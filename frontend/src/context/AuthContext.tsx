import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { LanguageCode } from '../types/common.types'
import { normalizePhone } from '../utils/phone'
import { normalizeRole, updateUserRoleInDatabase } from '../services/role/roleService'
import { recommendationTracker } from '../services/ai/recommendationTracker'

export type Role = 'citizen' | 'shop' | 'company' | 'admin' | 'GENERAL_USER' | 'LOCAL_SHOP' | 'COMPANY' | 'RECYCLER' | 'ADMIN'

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

export interface RegisterData {
  name: string
  email?: string
  phone: string
  password: string
  role: Role
  city: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  completeProfile: (role: Role, profileData: any) => Promise<User>
  saveRegistrationDraft: (draft: Partial<RegistrationDraft>) => void
  getRegistrationDraft: () => RegistrationDraft | null
  clearRegistrationDraft: () => void
  login: (identifier: string, password?: string) => Promise<User>
  signInWithGoogle: (redirectTo?: string) => Promise<void>
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    role?: Role,
    city?: string
  ) => Promise<User>
  devLogin?: (role: 'citizen' | 'shop') => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  updateCoins: (amount: number) => void
  redeemCoins: (amount: number, title?: string) => void
  setRole: (role: Role) => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Default seed users for immediate local login
const DEMO_USERS: (User & { password?: string })[] = [
  {
    id: 'u-101',
    name: 'Mathavan Raman',
    username: 'mathavan_raman',
    email: 'mathavan@ecocircuit.org',
    phone: '9876543210',
    password: 'password123',
    city: 'Coimbatore',
    area: 'RS Puram',
    bio: 'Eco-conscious Green Loop community member',
    avatar: null,
    role: 'citizen',
    greenCoins: 340,
    level: 'Eco Champion',
    levelIcon: 'sparkles',
    levelMin: 0,
    levelMax: 499,
    streak: 5,
    isVerified: true,
    isProfileComplete: true,
    rating: 4.9,
    transactions: 4,
    joinedAt: '2024-01-15T00:00:00.000Z',
    preferences: {
      language: 'EN',
      preferredCategories: ['Smartphones', 'Laptops'],
      preferredAction: 'Recycle',
      pickupPreference: 'doorstep',
      aiRecommendations: true,
      notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
    },
  },
  {
    id: 'u-102',
    name: 'CircuitFix Repair Hub',
    username: 'circuitfix',
    email: 'contact@circuitfix.com',
    phone: '9444284711',
    password: 'password123',
    city: 'Chennai',
    area: 'Ritchie Street',
    bio: 'Electronics Repair & E-Waste Collection Hub',
    avatar: null,
    role: 'shop',
    greenCoins: 1250,
    level: 'Sustainability Hero',
    levelIcon: 'star',
    levelMin: 0,
    levelMax: 1999,
    streak: 12,
    isVerified: true,
    isProfileComplete: true,
    rating: 4.95,
    transactions: 42,
    joinedAt: '2024-02-01T00:00:00.000Z',
    roleProfile: {
      shopName: 'CircuitFix Repair Hub',
      ownerName: 'Rajesh Kumar',
      category: 'Electronics Repair',
      shopAddress: '44 Ritchie Street, Mount Road, Chennai',
    },
    preferences: {
      language: 'EN',
      preferredCategories: ['Smartphones', 'Motherboards'],
      preferredAction: 'Repair',
      pickupPreference: 'hub_dropoff',
      aiRecommendations: true,
      notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
    },
  },
]

function getStoredUsers(): (User & { password?: string })[] {
  try {
    const raw = localStorage.getItem('gl_registered_users')
    if (!raw) return DEMO_USERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? [...DEMO_USERS, ...parsed] : DEMO_USERS
  } catch {
    return DEMO_USERS
  }
}

function saveRegisteredUser(newUser: User & { password?: string }) {
  try {
    const current = getStoredUsers().filter(u => u.id !== newUser.id)
    localStorage.setItem('gl_registered_users', JSON.stringify([...current, newUser]))
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('gl_language') as LanguageCode) || 'EN'
  })

  const [isInitializing] = useState(false)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('gl_user')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {}
    return null
  })

  // Sync state to localStorage
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

  const saveRegistrationDraft = (draft: Partial<RegistrationDraft>) => {
    try {
      const existing = getRegistrationDraft() || { phone: '', updatedAt: Date.now() }
      const merged: RegistrationDraft = {
        phone: draft.phone ?? existing.phone,
        role: draft.role ?? existing.role,
        step: draft.step ?? existing.step,
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

  const completeProfile = async (role: Role, profileData: any): Promise<User> => {
    const rawPhone = profileData.phone || ''
    const { national } = normalizePhone(rawPhone)
    const dbRole = normalizeRole(role)
    const name = profileData.name || profileData.ownerName || (dbRole === 'shop' ? profileData.shopName : 'Eco Citizen')
    const email = profileData.email?.trim() || ''

    const newUserId = `u-${Date.now()}`
    const welcomeCoins = dbRole === 'shop' ? 100 : 50

    const completedUser: User = {
      id: newUserId,
      name,
      username: (name || 'citizen').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      email,
      phone: national || rawPhone,
      city: profileData.city || 'Coimbatore',
      area: profileData.area || 'RS Puram',
      bio: 'Eco-conscious Green Loop community member',
      role: dbRole,
      greenCoins: welcomeCoins,
      level: 'Eco Beginner',
      levelIcon: 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak: 1,
      isVerified: true,
      isProfileComplete: true,
      avatar: profileData.avatar || null,
      rating: 4.9,
      transactions: 0,
      joinedAt: new Date().toISOString(),
      preferences: {
        language,
        preferredCategories: ['Smartphones', 'Laptops'],
        preferredAction: 'Recycle',
        pickupPreference: 'doorstep',
        aiRecommendations: true,
        notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
      },
      roleProfile: dbRole === 'shop' ? {
        shopName: profileData.shopName || '',
        ownerName: profileData.ownerName || '',
        category: profileData.category || 'General Electronics',
        shopAddress: profileData.shopAddress || '',
      } : {
        landmark: profileData.landmark || '',
        coordinates: profileData.coordinates || null,
      },
    }

    saveRegisteredUser({
      ...completedUser,
      password: profileData.password || 'password123',
    })

    setUser(completedUser)
    localStorage.setItem('gl_user', JSON.stringify(completedUser))
    clearRegistrationDraft()

    return completedUser
  }

  const register = async (data: RegisterData): Promise<User> => {
    const dbRole = normalizeRole(data.role)
    const { national } = normalizePhone(data.phone)
    const newUserId = `u-${Date.now()}`
    const welcomeCoins = dbRole === 'shop' ? 100 : 50

    const newUser: User = {
      id: newUserId,
      name: data.name.trim(),
      username: data.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      email: data.email?.trim() || '',
      phone: national || data.phone,
      city: data.city.trim(),
      area: 'RS Puram',
      bio: 'Eco-conscious Green Loop community member',
      role: dbRole,
      greenCoins: welcomeCoins,
      level: 'Eco Beginner',
      levelIcon: 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak: 1,
      isVerified: true,
      isProfileComplete: true,
      avatar: null,
      rating: 4.9,
      transactions: 0,
      joinedAt: new Date().toISOString(),
      preferences: {
        language,
        preferredCategories: ['Smartphones', 'Laptops'],
        preferredAction: 'Recycle',
        pickupPreference: 'doorstep',
        aiRecommendations: true,
        notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
      },
    }

    saveRegisteredUser({
      ...newUser,
      password: data.password || 'password123',
    })

    setUser(newUser)
    localStorage.setItem('gl_user', JSON.stringify(newUser))
    clearRegistrationDraft()

    return newUser
  }

  const login = async (identifier: string, password?: string): Promise<User> => {
    const cleanId = identifier.trim().toLowerCase()
    const stored = getStoredUsers()

    // Look for matching user by email or phone
    const matched = stored.find(u => {
      const uEmail = (u.email || '').toLowerCase()
      const uPhone = (u.phone || '').replace(/\D/g, '')
      const cleanPhone = cleanId.replace(/\D/g, '')
      return (uEmail && uEmail === cleanId) || (cleanPhone && uPhone.includes(cleanPhone))
    })

    if (matched) {
      if (password && matched.password && matched.password !== password) {
        throw new Error('Incorrect password. Please try again.')
      }
      setUser(matched)
      localStorage.setItem('gl_user', JSON.stringify(matched))
      return matched
    }

    // If no existing user found, gracefully log in as default Demo Citizen or create account
    const fallbackUser: User = {
      ...DEMO_USERS[0],
      id: `u-${Date.now()}`,
      name: cleanId.includes('@') ? cleanId.split('@')[0] : 'Green Loop User',
      email: cleanId.includes('@') ? cleanId : 'user@greenloop.org',
      phone: cleanId.replace(/\D/g, '') || '9876543210',
    }

    setUser(fallbackUser)
    localStorage.setItem('gl_user', JSON.stringify(fallbackUser))
    return fallbackUser
  }

  const signInWithGoogle = async () => {
    // Standalone Google Sign-in creates or signs into the Google Demo Account
    const googleUser: User = {
      id: 'u-google-' + Date.now(),
      name: 'Google Eco Member',
      username: 'google_member',
      email: 'member@gmail.com',
      phone: '9876543210',
      city: 'Coimbatore',
      area: 'RS Puram',
      bio: 'Verified Green Loop Member via Google',
      avatar: null,
      role: 'citizen',
      greenCoins: 100,
      level: 'Eco Beginner',
      levelIcon: 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak: 1,
      isVerified: true,
      isProfileComplete: true,
      rating: 5.0,
      transactions: 0,
      joinedAt: new Date().toISOString(),
    }

    setUser(googleUser)
    localStorage.setItem('gl_user', JSON.stringify(googleUser))
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    role: Role = 'citizen',
    city: string = 'Coimbatore'
  ): Promise<User> => {
    return register({
      email,
      password,
      name,
      role,
      city,
      phone: '9876543210',
    })
  }

  const devLogin = async (targetRole: 'citizen' | 'shop'): Promise<User> => {
    const demo = targetRole === 'shop' ? DEMO_USERS[1] : DEMO_USERS[0]
    setUser(demo)
    localStorage.setItem('gl_user', JSON.stringify(demo))
    return demo
  }

  const logout = async () => {
    recommendationTracker.clearUserSession()
    setUser(null)
    localStorage.removeItem('gl_user')
    localStorage.removeItem('gl_registration_draft')
    localStorage.removeItem('gl_posts')
    sessionStorage.clear()
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

  const setRole = (newRole: Role) => {
    const normalized = normalizeRole(newRole)
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, role: normalized }
      localStorage.setItem('gl_user', JSON.stringify(updated))
      return updated
    })

    try {
      sessionStorage.removeItem('greenloop_shop_cache')
      sessionStorage.removeItem('greenloop_company_cache')
    } catch (_) {}

    if (user?.id) {
      updateUserRoleInDatabase(user.id, normalized)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.isProfileComplete !== false,
        isInitializing,
        language,
        setLanguage,
        completeProfile,
        saveRegistrationDraft,
        getRegistrationDraft,
        clearRegistrationDraft,
        login,
        signInWithGoogle,
        signUpWithEmail,
        devLogin,
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
