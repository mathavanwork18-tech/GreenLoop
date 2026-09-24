import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { LanguageCode } from '../types/common.types'
import { supabase, isAuthTestMode, DEV_DUMMY_OTP } from '../utils/supabase'
import { normalizePhone } from '../utils/phone'
import { normalizeRole, updateUserRoleInDatabase } from '../services/role/roleService'
import { coinService } from '../services/coin/coinService'
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
  isPhoneVerified?: boolean
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
  email: string
  phone?: string
  password: string
  role: Role
  city: string
  area?: string
  landmark?: string
  shopName?: string
  ownerName?: string
  shopCategory?: string
  shopAddress?: string
  companyName?: string
  contactPerson?: string
  companyCategory?: string
  companyAddress?: string
  coordinates?: { lat: number; lng: number } | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>
  verifyOtp: (
    phone: string,
    otp: string
  ) => Promise<{
    success: boolean
    isExistingUser: boolean
    isProfileComplete: boolean
    user?: User
    role?: Role
    message?: string
  }>
  completeProfile: (role: Role, profileData: any) => Promise<User>
  saveRegistrationDraft: (draft: Partial<RegistrationDraft>) => void
  getRegistrationDraft: () => RegistrationDraft | null
  clearRegistrationDraft: () => void
  login: (email: string, password: string) => Promise<User>
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
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  logout: () => Promise<void>
  updateCoins: (amount: number) => void
  redeemCoins: (amount: number, title?: string) => void
  setRole: (role: Role) => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Maps a public.profiles database record + auth.users identity to the frontend User object.
 */
function mapDbProfileToUser(profile: any, authUser?: any, coinBalance?: number, streakVal?: number): User {
  const rawRole = profile?.role || authUser?.user_metadata?.role || ''
  const role: Role = normalizeRole(rawRole)

  const email = authUser?.email || profile?.email || ''
  const fullName =
    profile?.full_name ||
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    email.split('@')[0] ||
    'Green Loop Member'

  const avatar =
    profile?.avatar_url ||
    authUser?.user_metadata?.avatar_url ||
    authUser?.user_metadata?.picture ||
    null

  const resolvedCoins = coinBalance !== undefined
    ? coinBalance
    : (typeof profile?.coins === 'number' ? profile.coins : 0)

  const resolvedStreak = streakVal !== undefined
    ? streakVal
    : (typeof profile?.current_streak === 'number' ? profile.current_streak : 1)

  // Profile is complete only if explicitly marked complete in database,
  // or (as fallback for pre-existing records) has role, non-default name, and location/address
  const isProfileComplete = profile?.is_profile_complete !== undefined
    ? Boolean(profile.is_profile_complete)
    : Boolean(
        profile?.id &&
        profile?.full_name &&
        profile?.full_name !== 'Green Loop Member' &&
        profile?.role &&
        (profile?.address || profile?.city)
      )

  return {
    id: profile?.id || authUser?.id,
    name: fullName,
    username: fullName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'citizen',
    email,
    phone: profile?.phone || authUser?.user_metadata?.phone || '',
    city: profile?.city || 'Coimbatore',
    area: profile?.address || 'RS Puram',
    bio: 'Eco-conscious Green Loop community member',
    avatar,
    role,
    greenCoins: resolvedCoins,
    level: resolvedCoins >= 5000 ? 'Planet Guardian' : resolvedCoins >= 2000 ? 'Eco Master' : resolvedCoins >= 500 ? 'Eco Champion' : 'Eco Beginner',
    levelIcon: resolvedCoins >= 5000 ? 'verified' : resolvedCoins >= 2000 ? 'star' : resolvedCoins >= 500 ? 'sparkles' : 'leaf',
    levelMin: 0,
    levelMax: 499,
    streak: resolvedStreak,
    isVerified: true,
    isPhoneVerified: Boolean(profile?.phone_verified),
    isProfileComplete,
    rating: 4.9,
    transactions: 0,
    joinedAt: profile?.created_at || new Date().toISOString(),
    preferences: {
      language: (localStorage.getItem('gl_language') as LanguageCode) || 'EN',
      preferredCategories: ['Smartphones', 'Laptops'],
      preferredAction: 'Recycle',
      pickupPreference: 'doorstep',
      aiRecommendations: true,
      notifications: { email: true, sms: true, missionReminders: true, pickupUpdates: true },
    },
    privacy: {
      showApproximateLocation: true,
      showPhoneToVerifiedOnly: true,
      profileVisibility: 'community',
      activityVisibility: true,
      aiDataAnalysis: true,
    },
  }
}

/**
 * Checks if a profile exists for a given user ID; if missing or incomplete, upserts it safely.
 */
async function ensureProfile(
  userId: string,
  meta?: {
    full_name?: string
    phone?: string
    phone_verified?: boolean
    role?: string
    city?: string
    address?: string
    is_profile_complete?: boolean
  }
) {
  if (!userId) return null

  const dbRole = normalizeRole(meta?.role)

  const profilePayload: any = {
    id: userId,
    full_name: meta?.full_name || 'Green Loop Member',
    phone: meta?.phone || '',
    role: dbRole === 'admin' ? 'citizen' : dbRole,
    city: meta?.city || 'Coimbatore',
    address: meta?.address || '',
  }

  if (meta?.is_profile_complete !== undefined) {
    profilePayload.is_profile_complete = meta.is_profile_complete
  }

  if (meta?.phone_verified !== undefined) {
    profilePayload.phone_verified = meta.phone_verified
  }

  try {
    const { data: upserted, error: upsertErr } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    if (!upsertErr && upserted) {
      return upserted
    }
  } catch (err: any) {
    console.warn('[Green Loop] Profile upsert notice:', err?.message)
  }

  // Fallback check
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (existing) return existing
  } catch {}

  return profilePayload
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('gl_language') as LanguageCode) || 'EN'
  })

  const [isInitializing, setIsInitializing] = useState(true)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gl_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Hydrate user session from Supabase on mount and listen to auth changes
  useEffect(() => {
    let mounted = true

    async function syncAuthSession() {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (sessionErr) {
          console.warn('[Green Loop] Session check error:', sessionErr.message)
        }

        if (session?.user && mounted) {
          let { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (!profile && !profileErr) {
            const meta = session.user.user_metadata || {}
            profile = await ensureProfile(session.user.id, {
              full_name: meta.full_name || meta.name || session.user.email?.split('@')[0],
              phone: meta.phone,
              role: meta.role,
              city: meta.city,
              is_profile_complete: false,
            })
          }

          let dailyCoins = 0
          let dailyStreak = 1
          try {
            const dailyReward = await coinService.processDailyLoginReward(session.user.id)
            dailyCoins = dailyReward.totalCoins
            dailyStreak = dailyReward.streak
          } catch {}

          if (profile && mounted) {
            const syncedUser = mapDbProfileToUser(profile, session.user, dailyCoins, dailyStreak)
            setUser(syncedUser)
            localStorage.setItem('gl_user', JSON.stringify(syncedUser))
          }
        } else if (mounted) {
          setUser(null)
          localStorage.removeItem('gl_user')
        }
      } catch (err) {
        console.warn('[Green Loop] Session sync exception:', err)
        if (mounted) {
          setUser(null)
          localStorage.removeItem('gl_user')
        }
      } finally {
        if (mounted) {
          setIsInitializing(false)
        }
      }
    }

    syncAuthSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'INITIAL_SESSION') return

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!profile) {
          const meta = session.user.user_metadata || {}
          const pendingRole = (localStorage.getItem('gl_pending_role') as Role) || undefined
          if (pendingRole) {
            localStorage.removeItem('gl_pending_role')
          }
          profile = await ensureProfile(session.user.id, {
            full_name: meta.full_name || meta.name || session.user.email?.split('@')[0],
            phone: meta.phone,
            role: pendingRole || meta.role || 'citizen',
            city: meta.city || 'Coimbatore',
            is_profile_complete: false,
          })
        }

        let dailyCoins = 0
        let dailyStreak = 1
        try {
          const dailyReward = await coinService.processDailyLoginReward(session.user.id)
          dailyCoins = dailyReward.totalCoins
          dailyStreak = dailyReward.streak
        } catch {}

        if (profile && mounted) {
          const syncedUser = mapDbProfileToUser(profile, session.user, dailyCoins, dailyStreak)
          setUser(syncedUser)
          localStorage.setItem('gl_user', JSON.stringify(syncedUser))
        }
      } else if (event === 'SIGNED_OUT') {
        recommendationTracker.clearUserSession()
        setUser(null)
        localStorage.removeItem('gl_user')
        localStorage.removeItem('gl_registration_draft')
        localStorage.removeItem('gl_custom_coin_history')
        localStorage.removeItem('gl_posts')
        localStorage.removeItem('gl_sessions')
        sessionStorage.clear()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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

  // --- Registration Draft Management ---
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

  // --- Real Supabase Email + Password Authentication (Phase 2) ---
  const login = async (identifier: string, password: string): Promise<User> => {
    const cleanId = identifier.trim()
    if (!cleanId) {
      throw new Error('Please enter your email address.')
    }
    if (!password) {
      throw new Error('Please enter your password.')
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanId)) {
      throw new Error('Please enter a valid email address.')
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanId.toLowerCase(),
      password,
    })

    if (authError || !authData?.user) {
      const msg = (authError?.message || '').toLowerCase()
      const status = (authError as any)?.status

      // Unconfirmed email error
      if (msg.includes('email not confirmed') || msg.includes('unconfirmed')) {
        throw new Error('Please verify your email address before signing in. Check your inbox.')
      }

      // Disabled or banned user
      if (msg.includes('disabled') || msg.includes('banned') || msg.includes('deactivated')) {
        throw new Error('This account has been suspended or disabled. Please contact support.')
      }

      // Network / server connection error
      if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || status === 502 || status === 503) {
        throw new Error('Network connection error. Please check your internet connection.')
      }

      // Generic error message: never reveal whether account exists
      throw new Error('Incorrect email or password.')
    }

    const authUser = authData.user

    // Evict previous caches
    recommendationTracker.clearUserSession()

    // Retrieve profile from public.profiles
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (!profile) {
      const meta = authUser.user_metadata || {}
      profile = await ensureProfile(authUser.id, {
        full_name: meta.full_name || meta.name || authUser.email?.split('@')[0],
        phone: meta.phone || '',
        role: meta.role || 'citizen',
        city: meta.city || 'Coimbatore',
      })
    }

    let dailyCoins = 0
    let dailyStreak = 1
    try {
      const dailyReward = await coinService.processDailyLoginReward(authUser.id)
      dailyCoins = dailyReward.totalCoins
      dailyStreak = dailyReward.streak
    } catch {}

    const loggedInUser = mapDbProfileToUser(profile, authUser, dailyCoins, dailyStreak)
    setUser(loggedInUser)
    localStorage.setItem('gl_user', JSON.stringify(loggedInUser))
    return loggedInUser
  }

  // --- Real Supabase Google OAuth (Phase 3) ---
  const signInWithGoogle = async (redirectTo?: string) => {
    const targetUrl = redirectTo || window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })
    if (error) {
      console.error('[Green Loop] Google OAuth error:', error)
      throw new Error(error.message || 'Could not connect with Google. Please try again.')
    }
  }

  // --- Phone + OTP Flow with Development Dummy OTP (Phase 4) ---
  const sendOtp = async (rawPhone: string): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    const { e164, national, isValid, masked } = normalizePhone(rawPhone)
    if (!isValid) {
      throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6-9.')
    }

    // 1. Development Test Mode: Controlled dummy OTP 123456
    if (isAuthTestMode) {
      sessionStorage.setItem('gl_dev_otp_' + national, DEV_DUMMY_OTP)
      return {
        success: true,
        message: `[Dev Mode] Test OTP generated for ${masked}`,
        devOtp: DEV_DUMMY_OTP,
      }
    }

    // 2. Production: Native Supabase Phone OTP Flow
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      const status = (error as any)?.status

      if (status === 429 || msg.includes('rate limit') || msg.includes('too many') || msg.includes('limit exceeded')) {
        throw new Error('Too many OTP requests. Please wait a few moments before trying again.')
      }

      if (msg.includes('provider') || msg.includes('unavailable') || status === 502 || status === 503) {
        throw new Error('OTP service is temporarily unavailable. Please try again later.')
      }

      throw new Error('Could not send OTP. Please verify your phone number and try again.')
    }

    return {
      success: true,
      message: `OTP sent successfully to ${masked}`,
    }
  }

  const verifyOtp = async (
    rawPhone: string,
    otp: string
  ): Promise<{
    success: boolean
    isExistingUser: boolean
    isProfileComplete: boolean
    user?: User
    role?: Role
    message?: string
  }> => {
    const { e164, national, isValid } = normalizePhone(rawPhone)
    if (!isValid) {
      throw new Error('Invalid phone number.')
    }

    const cleanOtp = otp.toString().trim()
    if (cleanOtp.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP.')
    }

    // 1. Development Test Mode
    if (isAuthTestMode) {
      if (cleanOtp !== DEV_DUMMY_OTP) {
        throw new Error('The OTP is incorrect. Please try again.')
      }

      // Look up profile by phone number in public.profiles
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .or(`phone.eq.${e164},phone.eq.${national},phone.eq.91${national},phone.eq.+91 ${national}`)

      if (matchedProfiles && matchedProfiles.length > 0) {
        const dbProfile = matchedProfiles[0]
        const isComplete = Boolean(
          dbProfile.full_name &&
          dbProfile.full_name !== 'Green Loop Member' &&
          dbProfile.role
        )

        const devUser = mapDbProfileToUser(dbProfile, { id: dbProfile.id, user_metadata: { role: dbProfile.role } })
        setUser(devUser)
        localStorage.setItem('gl_user', JSON.stringify(devUser))

        return {
          success: true,
          isExistingUser: true,
          isProfileComplete: isComplete,
          user: devUser,
          role: devUser.role,
        }
      }

      return {
        success: true,
        isExistingUser: false,
        isProfileComplete: false,
      }
    }

    // 2. Production: Native Supabase GoTrue Phone Verification
    const { data: verifyData, error: authError } = await supabase.auth.verifyOtp({
      phone: e164,
      token: cleanOtp,
      type: 'sms',
    })

    if (authError || !verifyData?.user) {
      const msg = (authError?.message || '').toLowerCase()

      if (msg.includes('expired') || (authError as any)?.code === 'otp_expired') {
        throw new Error('This OTP has expired. Request a new OTP.')
      }

      throw new Error('The OTP is incorrect. Please try again.')
    }

    const authUser = verifyData.user

    let { data: dbProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (dbProfile && dbProfile.full_name && dbProfile.full_name !== 'Green Loop Member') {
      let dailyCoins = 0
      let dailyStreak = 1
      try {
        const dailyReward = await coinService.processDailyLoginReward(authUser.id)
        dailyCoins = dailyReward.totalCoins
        dailyStreak = dailyReward.streak
      } catch {}

      const loggedIn = mapDbProfileToUser(dbProfile, authUser, dailyCoins, dailyStreak)
      setUser(loggedIn)
      localStorage.setItem('gl_user', JSON.stringify(loggedIn))
      return {
        success: true,
        isExistingUser: true,
        isProfileComplete: true,
        user: loggedIn,
        role: loggedIn.role,
      }
    }

    return {
      success: true,
      isExistingUser: Boolean(dbProfile?.id),
      isProfileComplete: false,
    }
  }

  // --- Password Recovery Flow (Phase 5) ---
  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.')
    }

    const redirectUrl = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.warn('[Green Loop] Password reset notice:', error.message)
      // Throw generic error if rate-limited
      if ((error as any)?.status === 429) {
        throw new Error('Too many recovery requests. Please wait a few moments.')
      }
    }
  }

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.')
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message || 'Could not update password. Please try again.')
    }
  }

  // --- Role-Based Registration (Phase 6) ---
  const register = async (data: RegisterData): Promise<User> => {
    const dbRole = normalizeRole(data.role)
    if (dbRole === 'admin') {
      throw new Error('Administrator accounts cannot be registered publicly.')
    }

    const cleanEmail = data.email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.')
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.')
    }

    let finalPhone = ''
    if (data.phone && data.phone.trim()) {
      const { e164, isValid } = normalizePhone(data.phone)
      if (!isValid) {
        throw new Error('Please enter a valid 10-digit Indian mobile number or leave it blank.')
      }
      finalPhone = e164
    }

    const displayName = data.name.trim() || data.shopName || data.companyName || 'Green Loop Member'

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: data.password,
      options: {
        data: {
          full_name: displayName,
          phone: finalPhone,
          phone_verified: false,
          role: dbRole,
          city: data.city.trim(),
          shopName: data.shopName,
          companyName: data.companyName,
          is_profile_complete: true,
        },
      },
    })

    if (authError) {
      const msg = authError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('unique')) {
        throw new Error('This email is already registered. Please sign in instead.')
      }
      if (
        (authError as any)?.status === 429 ||
        msg.includes('rate limit') ||
        msg.includes('over_email_send_rate_limit') ||
        msg.includes('too many')
      ) {
        throw new Error(
          'Email rate limit exceeded: Supabase free tier limits confirmation emails to 3 per hour. To fix permanently: Disable "Confirm email" in Supabase Dashboard (Authentication > Providers > Email), or sign in with Google below.'
        )
      }
      throw new Error(authError.message || 'Registration failed. Please check your details.')
    }

    if (!authData?.user) {
      throw new Error('Registration failed on authentication server.')
    }

    const authUser = authData.user

    // Upsert into public.profiles
    const createdProfile = await ensureProfile(authUser.id, {
      full_name: displayName,
      phone: finalPhone,
      phone_verified: false,
      role: dbRole,
      city: data.city.trim(),
      address: data.shopAddress || data.companyAddress || data.area || '',
      is_profile_complete: true,
    })

    try {
      await coinService.awardRegistrationBonus(authUser.id, dbRole)
    } catch {}

    const newUser = mapDbProfileToUser(createdProfile, authUser, dbRole === 'citizen' ? 50 : 100, 1)
    setUser(newUser)
    localStorage.setItem('gl_user', JSON.stringify(newUser))
    return newUser
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    role: Role = 'citizen',
    city: string = 'Coimbatore'
  ): Promise<User> => {
    return register({
      name,
      email,
      password,
      role,
      city,
    })
  }

  const completeProfile = async (role: Role, profileData: any): Promise<User> => {
    const dbRole = normalizeRole(role)
    if (dbRole === 'admin') {
      throw new Error('Administrator accounts cannot be registered.')
    }

    const currentUserId = user?.id || (await supabase.auth.getUser()).data.user?.id

    if (!currentUserId) {
      throw new Error('Authentication session required to complete profile.')
    }

    const name =
      profileData.name ||
      profileData.fullName ||
      profileData.shopName ||
      profileData.companyName ||
      user?.name ||
      'Green Loop Member'

    let formattedPhone = ''
    if (profileData.phone && profileData.phone.trim()) {
      const { isValid, e164 } = normalizePhone(profileData.phone)
      if (isValid) {
        formattedPhone = e164
      }
    }

    const address = profileData.shopAddress || profileData.companyAddress || profileData.area || profileData.address || ''
    const city = profileData.city?.trim() || 'Coimbatore'

    const updatePayload: any = {
      id: currentUserId,
      full_name: name,
      role: dbRole,
      city,
      address,
      is_profile_complete: true,
    }
    if (formattedPhone) {
      updatePayload.phone = formattedPhone
    }

    // Persist into public.profiles
    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .upsert(updatePayload, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    if (updateErr) {
      console.warn('[Green Loop] completeProfile warning:', updateErr.message)
    }

    // Award role-specific registration bonus
    try {
      await coinService.awardRegistrationBonus(currentUserId, dbRole)
    } catch {}

    const completed = mapDbProfileToUser(updatedProfile || updatePayload, { id: currentUserId, email: user?.email })
    completed.isProfileComplete = true
    setUser(completed)
    localStorage.setItem('gl_user', JSON.stringify(completed))
    clearRegistrationDraft()
    return completed
  }

  const logout = async () => {
    const currentUserId = user?.id
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('[Green Loop] SignOut error:', err)
    }

    if (currentUserId) {
      try {
        coinService.clearUserState(currentUserId)
      } catch {}
    }
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
        title,
        amount: amount >= 0 ? `+${amount}` : `${amount}`,
        time: 'Just now',
        status: 'Completed',
      }
      localStorage.setItem('gl_custom_coin_history', JSON.stringify([newTx, ...existing]))
    } catch {}
  }

  const setRole = (newRole: Role) => {
    const normalized = normalizeRole(newRole)
    if (normalized === 'admin') {
      console.warn('Role escalation to admin is blocked.')
      return
    }
    setUser(prev => {
      if (!prev) return prev
      return { ...prev, role: normalized }
    })

    if (user?.id) {
      updateUserRoleInDatabase(user.id, normalized).catch(err => {
        console.warn('[Green Loop] Unexpected role update notice:', err?.message)
      })
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
        sendOtp,
        verifyOtp,
        completeProfile,
        saveRegistrationDraft,
        getRegistrationDraft,
        clearRegistrationDraft,
        login,
        signInWithGoogle,
        signUpWithEmail,
        register,
        resetPassword,
        updatePassword,
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
