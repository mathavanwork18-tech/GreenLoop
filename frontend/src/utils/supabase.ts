import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzjczufhflhjcoorvubr.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

export const supabase = createClient(supabaseUrl, supabaseKey)

// DEMO AUTH ONLY — Temporary dummy authentication for testing. Replace with real Supabase Phone OTP before production.
/**
 * Development test mode flag.
 * STRICT SECURITY: Only active in local development (import.meta.env.DEV)
 * and enabled unless explicitly set to 'false'. In production, this is always false.
 */
export const isAuthTestMode: boolean = Boolean(
  import.meta.env.DEV &&
  (import.meta.env.VITE_AUTH_TEST_MODE !== 'false')
)

export const PREDEFINED_TEST_IDENTITIES = {
  GENERAL_USER: {
    id: '74181ed5-0486-43d2-bedd-7afe34e83859',
    name: 'mathavan .s (Dev Citizen)',
    phone: '9876500001',
    e164: '+919876500001',
    role: 'citizen' as const,
    city: 'Chennai',
    label: 'TEST GENERAL USER',
  },
  LOCAL_SHOP: {
    id: 'b0879f51-1ef1-493c-88c4-e8e6c1e55de3',
    name: 'Vimal raj (Dev Shop)',
    phone: '9876543210',
    e164: '+919876543210',
    role: 'shop' as const,
    city: 'Nagapattinam',
    label: 'TEST LOCAL SHOP',
  },
} as const

// DEMO AUTH ONLY — Temporary dummy authentication for testing. Replace with real Supabase Phone OTP before production.
export interface DevSessionIdentity {
  id: string
  name?: string
  phone?: string
  e164?: string
  role: string
  city?: string
  language?: string
  isProfileComplete?: boolean
  registration_status?: 'completed' | 'pending'
}

export interface DemoSessionData {
  profile_id: string
  id: string
  phone: string
  role: string
  language: string
  registration_status: 'completed' | 'pending'
  isProfileComplete: boolean
  name?: string
  city?: string
  updatedAt: number
}

const DEV_TEST_SESSION_KEY = 'gl_dev_test_session'
const DEMO_SESSION_KEY = 'gl_demo_session'

export function setDevTestSession(identity: DevSessionIdentity) {
  if (!isAuthTestMode) return
  const phoneVal = identity.e164 || (identity.phone ? (identity.phone.startsWith('+91') ? identity.phone : '+91' + identity.phone) : '+919999999999')
  const langVal = identity.language || (typeof window !== 'undefined' ? localStorage.getItem('gl_language') : null) || 'EN'
  const isComplete = identity.isProfileComplete ?? true
  const regStatus = identity.registration_status || (isComplete ? 'completed' : 'pending')

  const testSession = {
    access_token: 'dev_test_token_' + identity.id,
    token_type: 'bearer',
    user: {
      id: identity.id,
      aud: 'authenticated',
      role: 'authenticated',
      phone: phoneVal,
      user_metadata: {
        profile_id: identity.id,
        full_name: identity.name || 'Green Loop Member',
        role: identity.role,
        phone: phoneVal,
        city: identity.city || 'Coimbatore',
        language: langVal,
        isProfileComplete: isComplete,
        registration_status: regStatus,
      },
    },
  }
  localStorage.setItem(DEV_TEST_SESSION_KEY, JSON.stringify(testSession))

  const demoData: DemoSessionData = {
    profile_id: identity.id,
    id: identity.id,
    phone: phoneVal,
    role: identity.role,
    language: langVal,
    registration_status: regStatus,
    isProfileComplete: isComplete,
    name: identity.name || 'Green Loop Member',
    city: identity.city || 'Coimbatore',
    updatedAt: Date.now(),
  }
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoData))
}

export function getDevTestSession() {
  if (!isAuthTestMode) return null
  try {
    const raw = localStorage.getItem(DEV_TEST_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getDevDemoSession(): DemoSessionData | null {
  if (!isAuthTestMode) return null
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY)
    if (raw) return JSON.parse(raw)

    const devTest = getDevTestSession()
    if (devTest?.user) {
      const meta = devTest.user.user_metadata || {}
      return {
        profile_id: devTest.user.id,
        id: devTest.user.id,
        phone: devTest.user.phone || meta.phone || '',
        role: meta.role || 'citizen',
        language: meta.language || 'EN',
        registration_status: meta.registration_status || 'completed',
        isProfileComplete: meta.isProfileComplete ?? true,
        name: meta.full_name || 'Green Loop Member',
        city: meta.city || 'Coimbatore',
        updatedAt: Date.now(),
      }
    }
    return null
  } catch {
    return null
  }
}

export function clearDevTestSession() {
  localStorage.removeItem(DEV_TEST_SESSION_KEY)
  localStorage.removeItem(DEMO_SESSION_KEY)
}

// Intercept getSession and getUser ONLY in development test mode if GoTrue has no live session
if (isAuthTestMode) {
  const originalGetSession = supabase.auth.getSession.bind(supabase.auth)
  supabase.auth.getSession = async () => {
    const res = await originalGetSession()
    if (!res.error && res.data?.session) {
      return res
    }
    const testSession = getDevTestSession()
    if (testSession) {
      return { data: { session: testSession as any }, error: null }
    }
    return res
  }

  const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
  supabase.auth.getUser = async (jwt?: string) => {
    const res = await originalGetUser(jwt)
    if (!res.error && res.data?.user) {
      return res
    }
    const testSession = getDevTestSession()
    if (testSession?.user) {
      return { data: { user: testSession.user as any }, error: null }
    }
    return res
  }

  const originalSignOut = supabase.auth.signOut.bind(supabase.auth)
  supabase.auth.signOut = async (options?: any) => {
    clearDevTestSession()
    try {
      return await originalSignOut(options)
    } catch {
      return { error: null }
    }
  }
}

export default supabase
