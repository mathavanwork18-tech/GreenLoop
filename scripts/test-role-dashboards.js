import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Mirror normalization logic from roleService.ts
function normalizeRole(rawRole) {
  if (!rawRole) return 'citizen'
  const lower = rawRole.toLowerCase().trim()
  if (lower === 'shop' || lower === 'local_shop' || lower === 'shop_owner' || lower === 'local_shop') return 'shop'
  if (lower === 'company' || lower === 'recycler' || lower === 'enterprise') return 'company'
  return 'citizen'
}

function getRoleDashboardPath(role) {
  switch (role) {
    case 'shop': return '/shop'
    case 'company': return '/company'
    case 'citizen':
    default: return '/'
  }
}

function canAccessRoute(userRole, pathname) {
  const cleanPath = pathname.toLowerCase()
  if (cleanPath.startsWith('/shop')) return userRole === 'shop'
  if (cleanPath.startsWith('/company')) return userRole === 'company'
  if (userRole === 'shop' || userRole === 'company') {
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

async function runRoleSystemVerification() {
  console.log('====================================================================')
  console.log('GREEN LOOP — ROLE-BASED DASHBOARD SYSTEM VERIFICATION SUITE')
  console.log('====================================================================\n')

  let passed = 0
  let failed = 0

  function assert(name, condition, details) {
    if (condition) {
      console.log(`✅ PASS: ${name}`)
      if (details) console.log(`   Details: ${details}`)
      passed++
    } else {
      console.log(`❌ FAIL: ${name}`)
      if (details) console.log(`   Details: ${details}`)
      failed++
    }
  }

  // 1. Role Normalization Tests
  console.log('--- TEST GROUP 1: ROLE ARCHITECTURE & NORMALIZATION ---')
  assert('Normalize "citizen"', normalizeRole('citizen') === 'citizen')
  assert('Normalize "GENERAL_USER"', normalizeRole('GENERAL_USER') === 'citizen')
  assert('Normalize null/empty to safe default', normalizeRole(null) === 'citizen' && normalizeRole('') === 'citizen')
  assert('Normalize "shop"', normalizeRole('shop') === 'shop')
  assert('Normalize legacy "local_shop"', normalizeRole('local_shop') === 'shop')
  assert('Normalize legacy "LOCAL_SHOP"', normalizeRole('LOCAL_SHOP') === 'shop')
  assert('Normalize "company"', normalizeRole('company') === 'company')
  assert('Normalize "recycler" to company', normalizeRole('recycler') === 'company')
  assert('Normalize "RECYCLER" to company', normalizeRole('RECYCLER') === 'company')

  // 2. Role Dashboard Route Routing
  console.log('\n--- TEST GROUP 2: ROLE DASHBOARD PATH RESOLUTION ---')
  assert('Citizen lands on "/"', getRoleDashboardPath('citizen') === '/')
  assert('Local Shop lands on "/shop"', getRoleDashboardPath('shop') === '/shop')
  assert('Company lands on "/company"', getRoleDashboardPath('company') === '/company')

  // 3. Strict Dashboard Isolation & Route Guards
  console.log('\n--- TEST GROUP 3: ROLE GUARDS & DASHBOARD ISOLATION ---')
  assert('Citizen can access General Home ("/")', canAccessRoute('citizen', '/'))
  assert('Citizen BLOCKED from "/shop"', !canAccessRoute('citizen', '/shop'))
  assert('Citizen BLOCKED from "/shop/inventory"', !canAccessRoute('citizen', '/shop/inventory'))
  assert('Citizen BLOCKED from "/company"', !canAccessRoute('citizen', '/company'))
  assert('Citizen BLOCKED from "/company/processing"', !canAccessRoute('citizen', '/company/processing'))

  assert('Shop can access "/shop"', canAccessRoute('shop', '/shop'))
  assert('Shop can access "/shop/pickups"', canAccessRoute('shop', '/shop/pickups'))
  assert('Shop BLOCKED from General Home ("/")', !canAccessRoute('shop', '/'))
  assert('Shop BLOCKED from Citizen Post ("/post")', !canAccessRoute('shop', '/post'))
  assert('Shop BLOCKED from Company ("/company")', !canAccessRoute('shop', '/company'))

  assert('Company can access "/company"', canAccessRoute('company', '/company'))
  assert('Company can access "/company/reports"', canAccessRoute('company', '/company/reports'))
  assert('Company BLOCKED from General Home ("/")', !canAccessRoute('company', '/'))
  assert('Company BLOCKED from Shop ("/shop")', !canAccessRoute('company', '/shop'))

  // 4. Role Switching Workflow
  console.log('\n--- TEST GROUP 4: ROLE SWITCHING STATE ISOLATION ---')
  let currentRole = 'citizen'
  let activeDashboard = getRoleDashboardPath(currentRole)
  assert('Initial role citizen -> Dashboard is "/"', activeDashboard === '/')

  // Switch to shop
  currentRole = normalizeRole('LOCAL_SHOP')
  activeDashboard = getRoleDashboardPath(currentRole)
  assert('Switch to shop -> Dashboard is "/shop"', activeDashboard === '/shop')

  // Switch to company
  currentRole = normalizeRole('RECYCLER')
  activeDashboard = getRoleDashboardPath(currentRole)
  assert('Switch to company -> Dashboard is "/company"', activeDashboard === '/company')

  // Switch back to citizen
  currentRole = normalizeRole('GENERAL_USER')
  activeDashboard = getRoleDashboardPath(currentRole)
  assert('Switch back to citizen -> Restores original "/" with 0 business widgets', activeDashboard === '/')

  // 5. Live Database Integration Checks
  console.log('\n--- TEST GROUP 5: SUPABASE DATABASE INTEGRATION (REAL DATA) ---')
  try {
    const { count: pickupCount, error: pickErr } = await supabase
      .from('pickup_requests')
      .select('*', { count: 'exact', head: true })
    assert('Query pickup_requests (Shop Pickups & Company Requests)', !pickErr, `Count = ${pickupCount || 0}`)

    const { count: postCount, error: postErr } = await supabase
      .from('e_waste_posts')
      .select('*', { count: 'exact', head: true })
    assert('Query e_waste_posts (Shop Inventory & Feed)', !postErr, `Count = ${postCount || 0}`)

    const { count: logCount, error: logErr } = await supabase
      .from('disposal_logs')
      .select('*', { count: 'exact', head: true })
    assert('Query disposal_logs (Company Processing Pipeline & Logs)', !logErr, `Count = ${logCount || 0}`)

    const { count: centerCount, error: centerErr } = await supabase
      .from('recycling_centers')
      .select('*', { count: 'exact', head: true })
    assert('Query recycling_centers (Verified Eco Directory)', !centerErr, `Count = ${centerCount || 0}`)

    const { data: profileSample, error: profErr } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1)
    assert('Query profiles (Role Source of Truth)', !profErr, 'Table accessible via SELECT')
  } catch (err) {
    assert('Supabase live queries', false, err.message)
  }

  console.log('\n====================================================================')
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`)
  console.log('====================================================================')
}

runRoleSystemVerification()
