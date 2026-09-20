import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzjczufhflhjcoorvubr.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Development test mode flag.
 * STRICT SECURITY: Only active in local development (import.meta.env.DEV)
 * and when VITE_AUTH_TEST_MODE is explicitly set to 'true'.
 * In production builds (e.g. Netlify), this is ALWAYS false.
 */
export const isAuthTestMode: boolean = Boolean(
  import.meta.env.DEV &&
  (import.meta.env.VITE_AUTH_TEST_MODE === 'true')
)

/**
 * Standard development dummy OTP code for local phone authentication testing.
 * Strictly rejected in production.
 */
export const DEV_DUMMY_OTP = '123456'

/**
 * Safe demo session accessor for dev-mode backward compatibility.
 * Returns null in production.
 */
export function getDevDemoSession(): any | null {
  if (!isAuthTestMode) return null
  try {
    const raw = localStorage.getItem('gl_demo_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default supabase
