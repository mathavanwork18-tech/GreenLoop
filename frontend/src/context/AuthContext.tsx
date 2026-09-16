import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { LanguageCode } from '../types/common.types'
import { supabase, isAuthTestMode, PREDEFINED_TEST_IDENTITIES, setDevTestSession, clearDevTestSession } from '../utils/supabase'
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
  devLogin?: (role: 'citizen' | 'shop') => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  updateCoins: (amount: number) => void
  redeemCoins: (amount: number, title?: string) => void
  setRole: (role: Role) => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

interface RegisterData {
  name: string
  email?: string
  phone: string
  password: string
  role: Role
  city: string
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

  const resolvedCoins = coinBalance !== undefined
    ? coinBalance
    : (typeof profile?.coins === 'number' ? profile.coins : 0)

  const resolvedStreak = streakVal !== undefined
    ? streakVal
    : (typeof profile?.current_streak === 'number' ? profile.current_streak : 1)

  return {
    id: profile?.id || authUser?.id,
    name: fullName,
    username: fullName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'citizen',
    email,
    phone: profile?.phone || authUser?.user_metadata?.phone || '',
    city: profile?.city || 'Coimbatore',
    area: profile?.address || 'RS Puram',
    bio: 'Eco-conscious Green Loop community member',
    avatar: null,
    role,
    greenCoins: resolvedCoins,
    level: resolvedCoins >= 5000 ? 'Planet Guardian' : resolvedCoins >= 2000 ? 'Eco Master' : resolvedCoins >= 500 ? 'Eco Champion' : 'Eco Beginner',
    levelIcon: resolvedCoins >= 5000 ? 'verified' : resolvedCoins >= 2000 ? 'star' : resolvedCoins >= 500 ? 'sparkles' : 'leaf',
    levelMin: 0,
    levelMax: 499,
    streak: resolvedStreak,
    isVerified: true,
    isProfileComplete: true,
    rating: 4.9,
    transactions: 0,
    joinedAt: profile?.created_at || new Date().toISOString(),
    preferences: {
      language: 'EN',
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
  meta?: { full_name?: string; phone?: string; role?: string; city?: string; address?: string }
) {
  if (!userId) return null

  const dbRole = normalizeRole(meta?.role)

  const profilePayload = {
    id: userId,
    full_name: meta?.full_name || 'Green Loop Member',
    phone: meta?.phone || '',
    role: dbRole,
    city: meta?.city || 'Coimbatore',
    address: meta?.address || '',
  }

  // 1. Direct UPSERT into public.profiles
  try {
    const { data: upserted, error: upsertErr } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    if (!upsertErr && upserted) {
      return upserted
    }
    if (upsertErr && (upsertErr.code === '23514' || upsertErr.message?.includes('profiles_role_check')) && dbRole === 'company') {
      const fallbackPayload = { ...profilePayload, role: 'recycler' }
      const { data: fbUpserted, error: fbErr } = await supabase
        .from('profiles')
        .upsert(fallbackPayload, { onConflict: 'id' })
        .select('*')
        .maybeSingle()
      if (!fbErr && fbUpserted) {
        return fbUpserted
      }
    }
    if (upsertErr) {
      console.warn('[Green Loop] Direct upsert into public.profiles notice:', upsertErr.code, upsertErr.message)
    }
  } catch (err: any) {
    console.warn('[Green Loop] Profile upsert error:', err?.message)
  }

  // 2. Fallback: Check if database trigger (on_auth_user_created) created the row concurrently
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await new Promise(r => setTimeout(r, 400))
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (existing) {
        // If profile was auto-created or role/meta doesn't match selected dbRole, update with real meta
        if (
          existing.role !== dbRole ||
          (meta?.full_name && (existing.full_name === 'Green Loop Member' || existing.full_name === 'Green Loop Citizen'))
        ) {
          let { data: updated, error: updateErr } = await supabase
            .from('profiles')
            .update({
              full_name: meta?.full_name || existing.full_name,
              phone: meta?.phone || existing.phone,
              role: dbRole,
              city: meta?.city || existing.city,
              address: meta?.address || existing.address,
            })
            .eq('id', userId)
            .select('*')
            .maybeSingle()

          if (updateErr && (updateErr.code === '23514' || updateErr.message?.includes('profiles_role_check')) && dbRole === 'company') {
            const { data: fbUpdated } = await supabase
              .from('profiles')
              .update({
                full_name: meta?.full_name || existing.full_name,
                phone: meta?.phone || existing.phone,
                role: 'recycler',
                city: meta?.city || existing.city,
                address: meta?.address || existing.address,
              })
              .eq('id', userId)
              .select('*')
              .maybeSingle()
            updated = fbUpdated
          }

          return updated || { ...existing, role: dbRole }
        }
        return existing
      }
    } catch {
      // Continue retrying
    }
  }

  return profilePayload
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('gl_language') as LanguageCode) || 'EN'
  })

  const [isInitializing, setIsInitializing] = useState(true)
  const [user, setUser] = useState<User | null>(null)

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
          // Strictly query public.profiles using id = session.user.id
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
            })
          }

          const dailyReward = await coinService.processDailyLoginReward(session.user.id)

          if (profile && mounted) {
            const syncedUser = mapDbProfileToUser(profile, session.user, dailyReward.totalCoins, dailyReward.streak)
            setUser(syncedUser)
            localStorage.setItem('gl_user', JSON.stringify(syncedUser))
          }
        } else if (mounted) {
          // No active Supabase GoTrue session
          setUser(null)
          localStorage.removeItem('gl_user')
        }
      } catch (err) {
        console.warn('[Green Loop] Initial session sync error:', err)
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

      // Do NOT wipe or redirect on INITIAL_SESSION; syncAuthSession handles it explicitly
      if (event === 'INITIAL_SESSION') return

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!profile) {
          const meta = session.user.user_metadata || {}
          profile = await ensureProfile(session.user.id, {
            full_name: meta.full_name || meta.name,
            phone: meta.phone,
            role: meta.role,
            city: meta.city,
          })
        }

        const dailyReward = await coinService.processDailyLoginReward(session.user.id)

        if (profile && mounted) {
          const syncedUser = mapDbProfileToUser(profile, session.user, dailyReward.totalCoins, dailyReward.streak)
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
        clearDevTestSession()
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

  // --- Phone + OTP Authentication Flow (Native Supabase Auth with Strict Mode Separation) ---
  const sendOtp = async (rawPhone: string): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    const { e164, national, isValid, masked } = normalizePhone(rawPhone)
    if (!isValid) {
      throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6-9.')
    }

    // 1. Development Test Mode: Pure Dummy OTP Flow for ANY phone number
    if (isAuthTestMode) {
      const dummyOtp = '123456'
      sessionStorage.setItem('gl_demo_otp_' + national, dummyOtp)
      return {
        success: true,
        message: `[Dev Mode] Test OTP generated for ${masked}`,
        devOtp: dummyOtp,
      }
    }

    // 2. Production: Native Supabase Phone OTP Flow (Real SMS Provider)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('rate limit') || msg.includes('limit') || msg.includes('too many') || msg.includes('exceeded')) {
        throw new Error('Too many verification attempts. Please try again later.')
      }
      if (msg.includes('provider') || msg.includes('twilio') || msg.includes('unavailable') || msg.includes('gateway')) {
        throw new Error('SMS service is temporarily unavailable. Please try again later or sign in with password.')
      }
      if (msg.includes('invalid') || msg.includes('format')) {
        throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6-9.')
      }
      throw new Error(error.message || 'Failed to send OTP. Please try again.')
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

    // 1. Development Test Mode: Pure Dummy OTP Verification for ANY phone number
    if (isAuthTestMode) {
      const storedOtp = sessionStorage.getItem('gl_demo_otp_' + national) || '123456'
      // Accept standard DUMMY_OTP "123456" or any stored session OTP
      if (cleanOtp !== '123456' && cleanOtp !== storedOtp) {
        throw new Error('Verification code is invalid.')
      }

      // DO NOT call supabase.auth.verifyOtp()!

      // Check if this phone number already has a profile in public.profiles
      const { data: matchedProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .or(`phone.eq.${e164},phone.eq.${national},phone.eq.91${national},phone.eq.+91 ${national}`)

      if (profileErr) {
        console.warn('[Green Loop] Dev mode profile lookup notice:', profileErr.message)
      }

      // Existing profile found for this phone
      if (matchedProfiles && matchedProfiles.length > 0) {
        // Pick best match: prioritize profile with custom full_name (not generic 'Green Loop Member')
        const dbProfile =
          matchedProfiles.find(p => p.full_name && p.full_name !== 'Green Loop Member') ||
          matchedProfiles[0]

        const isComplete = Boolean(
          dbProfile.full_name &&
          dbProfile.full_name !== 'Green Loop Member' &&
          dbProfile.role
        )

        // Set dev test session with this existing profile's authentic ID
        setDevTestSession({
          id: dbProfile.id,
          name: dbProfile.full_name,
          phone: e164,
          e164,
          role: dbProfile.role,
          city: dbProfile.city,
        })

        const dailyReward = await coinService.processDailyLoginReward(dbProfile.id)
        const loggedIn = mapDbProfileToUser(
          dbProfile,
          {
            id: dbProfile.id,
            user_metadata: {
              full_name: dbProfile.full_name,
              role: dbProfile.role,
              phone: e164,
              city: dbProfile.city,
            },
          },
          dailyReward.totalCoins,
          dailyReward.streak
        )

        setUser(loggedIn)
        localStorage.setItem('gl_user', JSON.stringify(loggedIn))

        return {
          success: true,
          isExistingUser: true,
          isProfileComplete: isComplete,
          user: loggedIn,
          role: loggedIn.role,
        }
      }

      // Brand new phone number (no profile in public.profiles)
      // Establish an initial demo session identity for the new phone
      const newUserId = crypto.randomUUID()
      setDevTestSession({
        id: newUserId,
        name: 'New Member',
        phone: e164,
        e164,
        role: 'citizen',
        city: 'Coimbatore',
      })

      return {
        success: true,
        isExistingUser: false,
        isProfileComplete: false,
      }
    }

    // 2. Production: Native GoTrue SMS verification (Real provider)
    let authUser: any = null
    const { data: verifyData, error: authError } = await supabase.auth.verifyOtp({
      phone: e164,
      token: cleanOtp,
      type: 'sms',
    })
    if (authError || !verifyData?.user) {
      const msg = (authError?.message || '').toLowerCase()
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('token') || msg.includes('otp')) {
        throw new Error('Verification code is invalid or has expired. Please request a new code.')
      }
      if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('limit')) {
        throw new Error('Too many verification attempts. Please try again later.')
      }
      throw new Error(authError?.message || 'OTP could not be verified. Please try again.')
    }
    authUser = verifyData.user

    if (!authUser?.id) {
      throw new Error('Verification code is invalid or has expired.')
    }

    // 3. Locate existing profile in profiles table by ID (never by phone!)
    let { data: dbProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (profileErr) {
      console.warn('[Green Loop] Error retrieving profile after OTP verify:', profileErr)
    }

    if (dbProfile && dbProfile.id && dbProfile.full_name && dbProfile.full_name !== 'Green Loop Member') {
      const dailyReward = await coinService.processDailyLoginReward(authUser.id)
      const loggedIn = mapDbProfileToUser(dbProfile, authUser, dailyReward.totalCoins, dailyReward.streak)
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

    // Verified user, continue to complete profile
    return {
      success: true,
      isExistingUser: Boolean(dbProfile?.id),
      isProfileComplete: false,
    }
  }

  const devLogin = async (targetRole: 'citizen' | 'shop'): Promise<User> => {
    if (!isAuthTestMode) {
      throw new Error('Dev test login is only available in development test mode.')
    }
    const identity = targetRole === 'shop'
      ? PREDEFINED_TEST_IDENTITIES.LOCAL_SHOP
      : PREDEFINED_TEST_IDENTITIES.GENERAL_USER

    setDevTestSession(identity)

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', identity.id)
      .maybeSingle()

    if (!profile) {
      profile = await ensureProfile(identity.id, {
        full_name: identity.name,
        phone: identity.e164,
        role: identity.role,
        city: identity.city,
      })
    }

    const dailyReward = await coinService.processDailyLoginReward(identity.id)
    const loggedIn = mapDbProfileToUser(
      profile,
      { id: identity.id, user_metadata: { full_name: identity.name, role: identity.role } },
      dailyReward.totalCoins,
      dailyReward.streak
    )
    setUser(loggedIn)
    localStorage.setItem('gl_user', JSON.stringify(loggedIn))
    return loggedIn
  }

  const completeProfile = async (role: Role, profileData: any): Promise<User> => {
    const { e164, national, isValid } = normalizePhone(profileData.phone)
    if (!isValid) {
      throw new Error('A valid Indian mobile number is required to complete registration.')
    }

    const dbRole = normalizeRole(role)
    if (dbRole === 'admin') {
      throw new Error('Administrator accounts cannot be registered via public registration.')
    }
    const name = profileData.name || profileData.ownerName || (dbRole === 'shop' ? profileData.shopName : 'Eco Citizen')
    // Email is purely optional metadata and never used as primary auth credential
    const email = profileData.email?.trim() || ''

    // 1. Verify that this phone number is not already associated with another profile
    try {
      const { data: existingWithPhone, error: checkError } = await supabase
        .from('profiles')
        .select('id, phone')
        .or(`phone.eq.${e164},phone.eq.${national},phone.eq.+91 ${national}`)
        .maybeSingle()

      if (!checkError && existingWithPhone) {
        const { data: sessionData } = await supabase.auth.getSession()
        const currentAuthId = sessionData?.session?.user?.id
        if (currentAuthId && existingWithPhone.id !== currentAuthId) {
          throw new Error('This phone number is already registered to another Green Loop account.')
        }
      }
    } catch (e: any) {
      if (e.message?.includes('already registered')) throw e
    }

    // 2. Ensure Supabase Auth user exists using PHONE as primary identity (zero email rate limit)
    let authUserId: string | null = null
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session?.user) {
      authUserId = sessionData.session.user.id
    } else if (isAuthTestMode) {
      authUserId = crypto.randomUUID()
    } else {
      const defaultPassword = profileData.password || 'GreenLoop@2026!'
      try {
        const { data: phoneSignUpData, error: phoneSignUpError } = await supabase.auth.signUp({
          phone: e164,
          password: defaultPassword,
          options: {
            data: {
              full_name: name,
              phone: e164,
              role: dbRole,
              city: profileData.city || 'Coimbatore',
              email: email || undefined,
            },
          },
        })

        if (!phoneSignUpError && phoneSignUpData?.user) {
          authUserId = phoneSignUpData.user.id
        } else if (phoneSignUpError?.message?.toLowerCase().includes('already registered')) {
          try {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              phone: e164,
              password: defaultPassword,
            })
            if (signInData?.user) {
              authUserId = signInData.user.id
            }
          } catch {}
        }
      } catch (e: any) {
        console.warn('[Green Loop] completeProfile phone auth notice:', e?.message)
      }

      // If phone signup didn't return an ID, check if profile exists by phone
      if (!authUserId) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .or(`phone.eq.${e164},phone.eq.${national}`)
          .maybeSingle()
        if (existingProfile?.id) {
          authUserId = existingProfile.id
        }
      }
    }

    if (!authUserId) {
      throw new Error('Authentication required: Could not establish authenticated identity. Please verify your phone number first.')
    }

    // 3. Persist to public.profiles
    let totalCoins = dbRole === 'citizen' ? 50 : 100
    let streak = 1

    await ensureProfile(authUserId, {
      full_name: name,
      phone: e164,
      role: dbRole,
      city: profileData.city || 'Coimbatore',
      address: profileData.shopAddress || profileData.area || '',
    })

    // Award registration bonus and process first daily login reward
    await coinService.awardRegistrationBonus(authUserId, dbRole)
    const daily = await coinService.processDailyLoginReward(authUserId)
    totalCoins = daily.totalCoins
    streak = daily.streak

    const completedUser: User = {
      id: authUserId,
      name,
      username: (name || 'citizen').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      email,
      phone: e164,
      city: profileData.city || 'Coimbatore',
      area: profileData.area || 'RS Puram',
      bio: 'Eco-conscious Green Loop community member',
      role: dbRole,
      greenCoins: totalCoins,
      level: totalCoins >= 5000 ? 'Planet Guardian' : totalCoins >= 2000 ? 'Eco Master' : totalCoins >= 500 ? 'Eco Champion' : 'Eco Beginner',
      levelIcon: totalCoins >= 5000 ? 'verified' : totalCoins >= 2000 ? 'star' : totalCoins >= 500 ? 'sparkles' : 'leaf',
      levelMin: 0,
      levelMax: 499,
      streak,
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

    if (isAuthTestMode) {
      setDevTestSession({
        id: completedUser.id,
        name: completedUser.name,
        phone: e164,
        e164,
        role: completedUser.role,
        city: completedUser.city,
      })
    }

    setUser(completedUser)
    localStorage.setItem('gl_user', JSON.stringify(completedUser))

    clearRegistrationDraft()
    return completedUser
  }

  // --- Real Supabase Authentication: Login & Registration ---

  const login = async (identifier: string, password: string): Promise<User> => {
    const cleanId = identifier.trim()
    const isEmail = cleanId.includes('@')
    let authData: any = null
    let authError: any = null

    // 1. Authenticate with Supabase GoTrue Auth
    if (isEmail) {
      const res = await supabase.auth.signInWithPassword({
        email: cleanId,
        password,
      })
      authData = res.data
      authError = res.error
    } else {
      const { e164, national } = normalizePhone(cleanId)
      // Attempt phone login
      const phoneRes = await supabase.auth.signInWithPassword({
        phone: e164,
        password,
      })
      if (!phoneRes.error && phoneRes.data?.user) {
        authData = phoneRes.data
      } else {
        // Fallback: check if registered with email fallback pattern
        const emailFallback = `${national}@greenloop.internal`
        const fallbackRes = await supabase.auth.signInWithPassword({
          email: emailFallback,
          password,
        })
        if (!fallbackRes.error && fallbackRes.data?.user) {
          authData = fallbackRes.data
        } else {
          authError = phoneRes.error || fallbackRes.error
        }
      }
    }

    if (authError || !authData?.user) {
      console.error('[Green Loop] Login error:', authError)
      throw new Error(authError?.message || 'Invalid credentials. Please verify your mobile number/email and password.')
    }

    const authUser = authData.user

    // 2. Evict previous user-specific caches so User A never leaks into User B
    recommendationTracker.clearUserSession()

    // 3. Check whether the user's profile exists in public.profiles
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    let activeProfile = existingProfile

    // 4. If authenticated user exists but profile is missing, create it safely from user metadata
    if (!activeProfile && !profileFetchError) {
      const meta = authUser.user_metadata || {}
      activeProfile = await ensureProfile(authUser.id, {
        full_name: meta.full_name || meta.name || authUser.email?.split('@')[0],
        phone: meta.phone || (isEmail ? '' : cleanId),
        role: meta.role || 'citizen',
        city: meta.city || 'Coimbatore',
      })
    }

    // 5. Process daily login reward (+25 once per Indian calendar day)
    const dailyReward = await coinService.processDailyLoginReward(authUser.id)

    // 6. Hydrate React user state
    const loggedInUser = mapDbProfileToUser(activeProfile, authUser, dailyReward.totalCoins, dailyReward.streak)
    setUser(loggedInUser)
    localStorage.setItem('gl_user', JSON.stringify(loggedInUser))
    return loggedInUser
  }

  const register = async (data: RegisterData): Promise<User> => {
    // Determine database role: 'citizen', 'shop', or 'company'
    const dbRole = normalizeRole(data.role)
    if (dbRole === 'admin') {
      throw new Error('Administrator accounts cannot be registered via public registration.')
    }

    const { e164, national, isValid } = normalizePhone(data.phone)
    if (!isValid) {
      throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6-9.')
    }

    // Email is optional metadata; Phone is the primary identity
    const email = data.email?.trim() || ''
    const userPassword = data.password || 'GreenLoop@2026!'

    // 1. Register with Supabase Auth using PHONE as primary identity (avoids email rate limits)
    let authUser: any = null

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        phone: e164,
        password: userPassword,
        options: {
          data: {
            full_name: data.name.trim(),
            phone: e164,
            role: dbRole,
            city: data.city.trim(),
            email: email || undefined,
          },
        },
      })

      if (!authError && authData?.user) {
        authUser = authData.user
      } else if (authError?.message?.toLowerCase().includes('already registered')) {
        try {
          const { data: loginData } = await supabase.auth.signInWithPassword({
            phone: e164,
            password: userPassword,
          })
          if (loginData?.user) {
            authUser = loginData.user
          }
        } catch {}
      } else if (authError) {
        const msg = authError.message || ''
        if (msg.toLowerCase().includes('leaked') || msg.toLowerCase().includes('pwned') || msg.toLowerCase().includes('compromised')) {
          throw new Error('This password is known to be compromised in data breaches. Please choose a different, secure password.')
        }
        console.warn('[Green Loop] Primary phone signup notice:', msg)
      }
    } catch (err: any) {
      if (err.message?.includes('compromised')) throw err
      console.warn('[Green Loop] Supabase auth registration notice:', err?.message)
    }

    // If authUser is not set from signup, check if profile exists by phone or create safely
    let userId = authUser?.id
    if (!userId) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone.eq.${e164},phone.eq.${national}`)
        .maybeSingle()
      if (existingProfile?.id) {
        userId = existingProfile.id
      }
    }

    // 2. Automatically create corresponding row in public.profiles
    let createdProfile: any = null
    if (userId) {
      createdProfile = await ensureProfile(userId, {
        full_name: data.name.trim(),
        phone: e164,
        role: dbRole,
        city: data.city.trim(),
      })

      // 3. Award registration bonus (Citizen: +50, Shop/Company: +100) exactly once!
      await coinService.awardRegistrationBonus(userId, dbRole)

      // 4. Process daily login reward (+25 once per IST calendar day)
      const dailyReward = await coinService.processDailyLoginReward(userId)

      // 5. Populate current user
      const newUser = mapDbProfileToUser(createdProfile, authUser, dailyReward.totalCoins, dailyReward.streak)
      setUser(newUser)
      localStorage.setItem('gl_user', JSON.stringify(newUser))
      return newUser
    }

    throw new Error('Registration failed on authentication server. Please check your mobile number and try again.')
  }

  const logout = async () => {
    const currentUserId = user?.id
    clearDevTestSession()

    // 1. Terminate session on Supabase Auth server
    try {
      const { error } = await supabase.auth.signOut()
      if (error && !isAuthTestMode) {
        console.error('[Green Loop] Supabase signOut error:', error)
        throw new Error(error.message || 'Logout failed on authentication server. Please check connection.')
      }
    } catch (err: any) {
      if (!isAuthTestMode) {
        throw err
      }
      console.warn('[Green Loop] Test mode signOut notice:', err?.message)
    }

    // 2. Clear user state, local caches, and recommendation trackers to prevent data leakage
    if (currentUserId) {
      coinService.clearUserState(currentUserId)
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

  const setRole = (newRole: Role) => {
    const normalized = normalizeRole(newRole)
    setUser(prev => {
      if (!prev) return prev
      return { ...prev, role: normalized }
    })

    // State isolation: clear role-specific session storage caches
    try {
      sessionStorage.removeItem('greenloop_shop_cache')
      sessionStorage.removeItem('greenloop_company_cache')
    } catch (_) {}

    // Persist role update to Supabase profiles table
    if (user?.id) {
      updateUserRoleInDatabase(user.id, normalized).then(success => {
        if (success) {
          console.log(`[Green Loop] Successfully persisted role '${normalized}' in Supabase profiles`)
        }
      }).catch(err => {
        console.warn('[Green Loop] Unexpected role update error:', err?.message)
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
