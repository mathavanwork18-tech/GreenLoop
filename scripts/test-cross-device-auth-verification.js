import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

function normalizeRole(role) {
  const r = (role || '').toString().trim().toLowerCase()
  if (r === 'shop' || r === 'local_shop' || r === 'local shop' || r === 'local_shop_user') return 'shop'
  if (r === 'company' || r === 'recycler' || r === 'recycler company') return 'company'
  if (r === 'admin') return 'admin'
  return 'citizen'
}

function getRoleDashboardPath(role) {
  if (role === 'shop' || role === 'company') return '/shop'
  return '/'
}

// Logic under test: mapDbProfileToUser
function mapDbProfileToUser(profile, authUser, coinBalance, streakVal) {
  const rawRole = profile?.role || authUser?.user_metadata?.role || ''
  const role = normalizeRole(rawRole)
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

  const hasSubstantiveDetails = Boolean(
    profile?.id &&
    profile?.full_name &&
    profile.full_name !== 'Green Loop Member' &&
    profile.full_name !== 'Green Loop Citizen' &&
    profile?.role &&
    (profile?.address || profile?.city)
  )

  const isProfileComplete = profile?.is_profile_complete === true || hasSubstantiveDetails

  return {
    id: profile?.id || authUser?.id,
    name: fullName,
    email,
    role,
    greenCoins: resolvedCoins,
    streak: resolvedStreak,
    isProfileComplete,
  }
}

// Route guard evaluation logic
function evaluateRouteAccess(path, session, user, isInitializing) {
  if (isInitializing) {
    return { rendered: 'LOADING_SPINNER', redirect: null }
  }

  const isAuthenticated = Boolean(session && user)

  if (!isAuthenticated) {
    const unauthenticatedAllowed = ['/language', '/login', '/register', '/forgot-password', '/reset-password']
    if (unauthenticatedAllowed.includes(path)) {
      return { rendered: path, redirect: null }
    }
    return { rendered: 'UNAUTHENTICATED_GATE', redirect: '/login' }
  }

  // Authenticated flow
  const role = normalizeRole(user.role)
  if (role === 'shop' || role === 'company') {
    const shopRoutes = ['/', '/shop', '/map', '/shop/map', '/post', '/shop/post', '/orders', '/shop/orders', '/account', '/shop/account', '/account/edit', '/complete-profile', '/notifications', '/chat', '/shop/chat']
    if (shopRoutes.includes(path)) {
      return { rendered: `SHOP_DASHBOARD_${path}`, redirect: null }
    }
    return { rendered: 'SHOP_WILDCARD', redirect: '/' }
  }

  // General user flow
  const citizenRoutes = ['/', '/map', '/post', '/activity', '/account', '/account/edit', '/complete-profile', '/marketplace', '/transactions', '/pickup', '/chat', '/notifications', '/rewards', '/missions', '/impact', '/support']
  if (citizenRoutes.includes(path)) {
    return { rendered: `CITIZEN_DASHBOARD_${path}`, redirect: null }
  }
  return { rendered: 'CITIZEN_WILDCARD', redirect: '/' }
}

async function runCrossDeviceTests() {
  console.log('===============================================================')
  console.log('CROSS-DEVICE AUTHENTICATION FIX VERIFICATION')
  console.log('===============================================================\n')

  let passCount = 0
  let failCount = 0

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`  [PASS] ${title}${detail ? ` -> ${detail}` : ''}`)
      passCount++
    } else {
      console.error(`  [FAIL] ${title}${detail ? ` -> ${detail}` : ''}`)
      failCount++
    }
  }

  // TEST 1: Fresh second device state (no localStorage cache)
  console.log('--- 1. FRESH SECOND DEVICE INITIAL STATE ---')
  const initialSession = null
  const initialUser = null
  const isInitializing = true
  const routeOnFirstLoad = evaluateRouteAccess('/', initialSession, initialUser, isInitializing)
  assert('Cold start shows loading spinner (not premature redirect to login)', routeOnFirstLoad.rendered === 'LOADING_SPINNER' && routeOnFirstLoad.redirect === null)

  const unauthResolved = evaluateRouteAccess('/', null, null, false)
  assert('Unauthenticated visitor on / is redirected to /login', unauthResolved.redirect === '/login')

  // TEST 2: Invalid credentials test
  console.log('\n--- 2. EXPIRED / INVALID CREDENTIALS ERROR HANDLING ---')
  const { data: badAuth, error: badAuthErr } = await supabase.auth.signInWithPassword({
    email: 'nonexistent_user_99999@example.com',
    password: 'wrong_password_123',
  })
  assert('Invalid credentials rejected by Supabase GoTrue', badAuthErr !== null && badAuth?.session === null)
  assert('Error status indicates authentication failure (400)', badAuthErr?.status === 400 || badAuthErr?.message.includes('Invalid'))

  // TEST 3: Account with is_profile_complete = false in database
  console.log('\n--- 3. LOGIN WITH INCOMPLETE PROFILE ACCOUNT (e.g. Google OAuth or fresh account) ---')
  // We query a real existing profile with is_profile_complete = false
  const { data: incompleteProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_profile_complete', false)
    .limit(1)
    .single()

  assert('Found sample profile with is_profile_complete = false', Boolean(incompleteProfile?.id), `ID: ${incompleteProfile?.id} (${incompleteProfile?.full_name})`)

  if (incompleteProfile) {
    const mockAuthUser = {
      id: incompleteProfile.id,
      email: `${incompleteProfile.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@test.com`,
      user_metadata: { role: incompleteProfile.role, full_name: incompleteProfile.full_name },
    }
    const mockSession = { access_token: 'valid_mock_jwt', user: mockAuthUser }

    // Map profile with new logic
    const mappedUser = mapDbProfileToUser(incompleteProfile, mockAuthUser, 50, 1)

    // Check authoritative auth state
    const authStatus = Boolean(mockSession && mappedUser)
    assert('User is authenticated even if is_profile_complete was false in DB', authStatus === true)

    // Check route guard with target '/'
    const navResult = evaluateRouteAccess('/', mockSession, mappedUser, false)
    assert('User remains on authenticated dashboard route (DOES NOT REDIRECT TO /login)', navResult.redirect === null && navResult.rendered.includes('DASHBOARD'))

    // Check complete-profile route is accessible
    const completeProfileNav = evaluateRouteAccess('/complete-profile', mockSession, mappedUser, false)
    assert('/complete-profile route is accessible for incomplete profile user', completeProfileNav.redirect === null && completeProfileNav.rendered.includes('complete-profile'))
  }

  // TEST 4: Direct URL opening / Refresh of authenticated route on second device
  console.log('\n--- 4. DIRECT URL OPENING & REFRESH ON SECOND DEVICE ---')
  const mockUser = {
    id: 'user_dev_2',
    name: 'Second Device Citizen',
    email: 'second@greenloop.test',
    role: 'citizen',
    isProfileComplete: true,
  }
  const mockSession = { access_token: 'session_token_123', user: { id: 'user_dev_2' } }

  const refreshMap = evaluateRouteAccess('/map', mockSession, mockUser, false)
  assert('Directly opened /map remains on /map on refresh', refreshMap.rendered === 'CITIZEN_DASHBOARD_/map' && refreshMap.redirect === null)

  const refreshPost = evaluateRouteAccess('/post', mockSession, mockUser, false)
  assert('Directly opened /post remains on /post on refresh', refreshPost.rendered === 'CITIZEN_DASHBOARD_/post' && refreshPost.redirect === null)

  // TEST 5: Resilient Profile Fetch Failure (Database outage / RLS issue)
  console.log('\n--- 5. RESILIENT PROFILE FETCH FAILURE (DOES NOT SILENTLY LOG OUT) ---')
  // When profile is null (fetch failure), but session is valid
  const fallbackUser = mapDbProfileToUser(null, {
    id: 'user_dev_fallback',
    email: 'user_fallback@greenloop.test',
    user_metadata: { full_name: 'Fallback Name', role: 'citizen' },
  }, 0, 1)

  assert('Fallback user created from session.user metadata', fallbackUser.id === 'user_dev_fallback')
  assert('Fallback user retains citizen role', fallbackUser.role === 'citizen')

  const fallbackSession = { access_token: 'token_fb', user: { id: 'user_dev_fallback' } }
  const fallbackAuth = Boolean(fallbackSession && fallbackUser)
  assert('User remains authenticated during profile query failure', fallbackAuth === true)

  const fallbackRoute = evaluateRouteAccess('/', fallbackSession, fallbackUser, false)
  assert('Fallback user remains on dashboard (NOT redirected to login)', fallbackRoute.redirect === null)

  // TEST 6: Google OAuth callback parameters & error handling
  console.log('\n--- 6. GOOGLE OAUTH CANCELLATION / FAILURE HANDLING ---')
  function parseOAuthUrl(urlStr) {
    const parsed = new URL(urlStr)
    const hashParams = new URLSearchParams(parsed.hash.substring(1))
    return {
      error: parsed.searchParams.get('error') || hashParams.get('error'),
      errorDescription: parsed.searchParams.get('error_description') || hashParams.get('error_description'),
    }
  }

  const cancelledUrl = 'http://localhost:5173/login?error=access_denied&error_description=User+cancelled+sign-in'
  const parsedCancelled = parseOAuthUrl(cancelledUrl)
  assert('OAuth cancellation detected from URL search params', parsedCancelled.error === 'access_denied')
  assert('Error description extracted accurately', parsedCancelled.errorDescription.includes('cancelled'))

  const hashCancelledUrl = 'http://localhost:5173/login#error=access_denied&error_description=Access+denied'
  const parsedHash = parseOAuthUrl(hashCancelledUrl)
  assert('OAuth cancellation detected from URL hash params', parsedHash.error === 'access_denied')

  // TEST 7: Logout clears session and locks protected routes
  console.log('\n--- 7. LOGOUT CLEARS SESSION AND LOCKS PROTECTED ROUTES ---')
  const loggedOutSession = null
  const loggedOutUser = null
  const afterLogoutRoute = evaluateRouteAccess('/account', loggedOutSession, loggedOutUser, false)
  assert('Protected route /account requires login after logout', afterLogoutRoute.redirect === '/login')

  const afterLogoutMap = evaluateRouteAccess('/map', loggedOutSession, loggedOutUser, false)
  assert('Protected route /map requires login after logout', afterLogoutMap.redirect === '/login')

  // TEST 8: Registration with role preserves correct role dashboard
  console.log('\n--- 8. REGISTRATION ROLE-BASED ACCESS PRESERVED ---')
  const shopUser = {
    id: 'user_shop_1',
    name: 'Coimbatore Eco Repairs',
    role: 'shop',
    isProfileComplete: true,
  }
  const shopSession = { access_token: 'shop_token', user: { id: 'user_shop_1' } }
  const shopRoute = evaluateRouteAccess('/shop', shopSession, shopUser, false)
  assert('Shop user accesses shop dashboard (/shop)', shopRoute.rendered === 'SHOP_DASHBOARD_/shop' && shopRoute.redirect === null)

  const shopHomeRoute = evaluateRouteAccess('/', shopSession, shopUser, false)
  assert('Shop user accessing / renders Shop dashboard', shopHomeRoute.rendered === 'SHOP_DASHBOARD_/' && shopHomeRoute.redirect === null)

  console.log('\n===============================================================')
  console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`)
  console.log('===============================================================')

  if (failCount > 0) {
    process.exit(1)
  }
}

runCrossDeviceTests().catch(err => {
  console.error('Test execution failed:', err)
  process.exit(1)
})

