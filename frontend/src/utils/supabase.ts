import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzjczufhflhjcoorvubr.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Development test mode flag.
 * STRICT SECURITY: Only active in local development AND when explicitly enabled via env.
 * In production (import.meta.env.PROD), this is always strictly false.
 */
export const isAuthTestMode: boolean = Boolean(
  import.meta.env.DEV &&
  (import.meta.env.VITE_AUTH_TEST_MODE === 'true' || import.meta.env.VITE_AUTH_TEST_MODE === true)
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

const DEV_TEST_SESSION_KEY = 'gl_dev_test_session'

export function setDevTestSession(identity: typeof PREDEFINED_TEST_IDENTITIES[keyof typeof PREDEFINED_TEST_IDENTITIES]) {
  if (!isAuthTestMode) return
  const testSession = {
    access_token: 'dev_test_token_' + identity.id,
    token_type: 'bearer',
    user: {
      id: identity.id,
      aud: 'authenticated',
      role: 'authenticated',
      phone: identity.e164,
      user_metadata: {
        full_name: identity.name,
        role: identity.role,
        phone: identity.e164,
        city: identity.city,
      },
    },
  }
  localStorage.setItem(DEV_TEST_SESSION_KEY, JSON.stringify(testSession))
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

export function clearDevTestSession() {
  localStorage.removeItem(DEV_TEST_SESSION_KEY)
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
}

export default supabase
