
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
  // Admin role is disabled for current build — defaults safely to citizen
  if (lower === 'admin' || lower === 'administrator') {
    return 'citizen'
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

  // 1. Admin routes are disabled in this build
  if (cleanPath.startsWith('/admin')) {
    return false
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
 * Resolves the user's role from local session.
 */
export async function fetchUserRoleFromDatabase(userId: string): Promise<AppRole> {
  if (!userId) return 'citizen'
  try {
    const raw = localStorage.getItem('gl_user')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.role) return normalizeRole(parsed.role)
    }
  } catch {}
  return 'citizen'
}

/**
 * Persists the updated role to local user storage.
 */
export async function updateUserRoleInDatabase(userId: string, newRole: AppRole): Promise<boolean> {
  if (!userId) return false
  try {
    const raw = localStorage.getItem('gl_user')
    if (raw) {
      const parsed = JSON.parse(raw)
      parsed.role = newRole
      localStorage.setItem('gl_user', JSON.stringify(parsed))
    }
    return true
  } catch {
    return false
  }
}
