import { supabase } from '../../utils/supabase'

export type AppRole = 'citizen' | 'shop' | 'company' | 'admin'

/**
 * Normalizes any role representation into one of the 4 supported Green Loop roles:
 * - 'citizen' (General User)
 * - 'shop' (Local Shop)
 * - 'company' (Enterprise / Recycler)
 * - 'admin' (Green Loop Administrator - Mathavan, Vimal Raj, Thiru Loop)
 */
export function normalizeRole(rawRole?: string | null): AppRole {
  if (!rawRole) return 'citizen'
  const lower = rawRole.toLowerCase().trim()
  if (lower === 'admin' || lower === 'administrator') {
    return 'admin'
  }
  if (lower === 'shop' || lower === 'local_shop' || lower === 'shop_owner') {
    return 'shop'
  }
  if (lower === 'company' || lower === 'recycler' || lower === 'enterprise') {
    return 'company'
  }
  return 'citizen'
}

/**
 * Returns the default dashboard home path for a given role.
 */
export function getRoleDashboardPath(role: AppRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'shop':
      return '/shop'
    case 'company':
      return '/company'
    case 'citizen':
    default:
      return '/'
  }
}

/**
 * Determines whether a given user role is permitted to navigate to the specified path.
 * Strictly isolates role dashboards and prevents unauthorized cross-role views.
 */
export function canAccessRoute(userRole: AppRole, pathname: string): boolean {
  const cleanPath = pathname.toLowerCase()

  // 1. Admin routes isolation: ONLY admin can access
  if (cleanPath.startsWith('/admin')) {
    return userRole === 'admin'
  }

  // 2. Local Shop routes isolation
  if (cleanPath.startsWith('/shop')) {
    return userRole === 'shop'
  }

  // 3. Company routes isolation
  if (cleanPath.startsWith('/company')) {
    return userRole === 'company'
  }

  // 4. Non-citizen roles cannot access citizen-specific routes
  if (userRole === 'shop' || userRole === 'company' || userRole === 'admin') {
    if (
      cleanPath === '/' ||
      cleanPath === '/activity' ||
      cleanPath === '/post' ||
      cleanPath === '/marketplace' ||
      cleanPath === '/rewards' ||
      cleanPath === '/missions'
    ) {
      return false
    }
  }

  return true
}

/**
 * Directly queries the live Supabase `public.profiles` table to resolve the user's role.
 * Ensures the database remains the single source of truth.
 */
export async function fetchUserRoleFromDatabase(userId: string): Promise<AppRole> {
  if (!userId) return 'citizen'
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data?.role) {
      return 'citizen'
    }
    return normalizeRole(data.role)
  } catch {
    return 'citizen'
  }
}

/**
 * Securely persists the updated role to Supabase `public.profiles`.
 */
export async function updateUserRoleInDatabase(userId: string, newRole: AppRole): Promise<boolean> {
  if (!userId) return false
  try {
    let { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error && (error.code === '23514' || error.message?.includes('profiles_role_check')) && newRole === 'company') {
      const fb = await supabase.from('profiles').update({ role: 'recycler' }).eq('id', userId)
      error = fb.error
    }

    if (error) {
      console.error('[Green Loop] Failed to update role in Supabase:', error.message)
      return false
    }
    return true
  } catch (err: any) {
    console.error('[Green Loop] Unexpected role update error:', err?.message)
    return false
  }
}
