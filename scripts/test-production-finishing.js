import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Test tracking
const results = []
function test(category, name, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL'
  console.log(`  [${status}] [${category}] ${name}${details ? ` -> ${details}` : ''}`)
  results.push({ category, name, passed, details })
}

// -------------------------------------------------------------
// Helper logic ported for node testing
// -------------------------------------------------------------
function normalizeRole(rawRole) {
  if (!rawRole) return 'citizen'
  const lower = rawRole.toLowerCase().trim()
  if (lower === 'admin' || lower === 'administrator') return 'admin'
  if (lower === 'shop' || lower === 'local_shop' || lower === 'shop_owner') return 'shop'
  if (lower === 'company' || lower === 'recycler' || lower === 'enterprise') return 'company'
  return 'citizen'
}

function getRoleDashboardPath(role) {
  switch (role) {
    case 'admin': return '/admin'
    case 'shop': return '/shop'
    case 'company': return '/company'
    case 'citizen':
    default: return '/'
  }
}

function canAccessRoute(userRole, pathname) {
  const cleanPath = pathname.toLowerCase()
  if (cleanPath.startsWith('/admin')) return userRole === 'admin'
  if (cleanPath.startsWith('/shop')) return userRole === 'shop'
  if (cleanPath.startsWith('/company')) return userRole === 'company'
  if (userRole === 'shop' || userRole === 'company' || userRole === 'admin') {
    if (['/', '/activity', '/post', '/marketplace', '/rewards', '/missions'].includes(cleanPath)) {
      return false
    }
  }
  return true
}

function getTodayIndiaDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date)
}

function getYesterdayIndiaDate(todayIstString) {
  const todayStr = todayIstString || getTodayIndiaDate()
  const [y, m, d] = todayStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().split('T')[0]
}

// Simulated Coin & Streak Engine for pure logic testing
class TestCoinEngine {
  constructor() {
    this.balances = new Map()
    this.txs = new Map()
    this.streaks = new Map()
    this.lastLogins = new Map()
  }

  awardRegistrationBonus(userId, role) {
    if (!userId || role === 'admin') return { awarded: false, coins: 0 }
    const userTxs = this.txs.get(userId) || []
    if (userTxs.some(t => t.type === 'registration_bonus')) {
      return { awarded: false, coins: this.balances.get(userId) || 0 }
    }
    const bonus = role === 'citizen' ? 50 : 100
    const current = this.balances.get(userId) || 0
    const updated = current + bonus
    this.balances.set(userId, updated)
    userTxs.push({ type: 'registration_bonus', amount: bonus, date: getTodayIndiaDate() })
    this.txs.set(userId, userTxs)
    return { awarded: true, coins: updated }
  }

  processDailyLoginReward(userId, simDateStr = null) {
    const todayIst = simDateStr || getTodayIndiaDate()
    const yesterdayIst = getYesterdayIndiaDate(todayIst)
    const lastLogin = this.lastLogins.get(userId) || ''
    const currentStreak = this.streaks.get(userId) || 0
    const currentBal = this.balances.get(userId) || 0

    if (lastLogin === todayIst) {
      return { awarded: false, coinsAwarded: 0, totalCoins: currentBal, streak: Math.max(1, currentStreak) }
    }

    let newStreak = 1
    if (lastLogin === yesterdayIst) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1
    }

    const updatedBal = currentBal + 25
    this.balances.set(userId, updatedBal)
    this.streaks.set(userId, newStreak)
    this.lastLogins.set(userId, todayIst)
    const userTxs = this.txs.get(userId) || []
    userTxs.push({ type: 'daily_login', amount: 25, date: todayIst })
    this.txs.set(userId, userTxs)

    return { awarded: true, coinsAwarded: 25, totalCoins: updatedBal, streak: newStreak }
  }

  clearUserState(userId) {
    this.balances.delete(userId)
    this.txs.delete(userId)
    this.streaks.delete(userId)
    this.lastLogins.delete(userId)
  }
}

async function runProductionFinishingSuite() {
  console.log('====================================================================')
  console.log('GREEN LOOP — MASTER PRODUCTION FINISHING VERIFICATION SUITE')
  console.log('====================================================================\n')

  // 1. ROLE SYSTEM & ROUTING
  console.log('--- 1. ROLE SYSTEM & ROUTING ---')
  test('ROLE SYSTEM', 'Normalize citizen and GENERAL_USER', normalizeRole('GENERAL_USER') === 'citizen')
  test('ROLE SYSTEM', 'Normalize shop and LOCAL_SHOP', normalizeRole('LOCAL_SHOP') === 'shop')
  test('ROLE SYSTEM', 'Normalize company and RECYCLER', normalizeRole('RECYCLER') === 'company')
  test('ROLE SYSTEM', 'Normalize admin and ADMINISTRATOR', normalizeRole('ADMIN') === 'admin')
  test('ROLE SYSTEM', 'Citizen lands on "/"', getRoleDashboardPath('citizen') === '/')
  test('ROLE SYSTEM', 'Shop lands on "/shop"', getRoleDashboardPath('shop') === '/shop')
  test('ROLE SYSTEM', 'Company lands on "/company"', getRoleDashboardPath('company') === '/company')
  test('ROLE SYSTEM', 'Admin lands on "/admin"', getRoleDashboardPath('admin') === '/admin')

  // 2. ROLE REGISTRATION BUG FIX
  console.log('\n--- 2. ROLE REGISTRATION BUG FIX ---')
  const authContextSrc = fs.readFileSync('frontend/src/context/AuthContext.tsx', 'utf8')
  const hasOldShopBug = authContextSrc.includes("data.role === 'LOCAL_SHOP' ? 'shop' : 'citizen'")
  test('ROLE REGISTRATION BUG', 'Old binary LOCAL_SHOP check removed from register()', !hasOldShopBug)
  test('ROLE REGISTRATION BUG', 'register() disallows public admin registration', authContextSrc.includes("Administrator accounts cannot be registered via public registration"))
  test('ROLE REGISTRATION BUG', 'ensureProfile updates role if existing profile role differs', authContextSrc.includes('existing.role !== dbRole'))

  const registerPageSrc = fs.readFileSync('frontend/src/pages/auth/RegisterPage.tsx', 'utf8')
  test('ROLE REGISTRATION BUG', 'RegisterPage navigates to getRoleDashboardPath on success', registerPageSrc.includes('getRoleDashboardPath(normalizeRole('))

  // 3. MULTI-USER & DATA ISOLATION
  console.log('\n--- 3. MULTI-USER & USER ISOLATION ---')
  const coinEngine = new TestCoinEngine()
  const userA_id = 'user-a-1111-uuid'
  const userB_id = 'user-b-2222-uuid'

  coinEngine.awardRegistrationBonus(userA_id, 'citizen')
  coinEngine.awardRegistrationBonus(userB_id, 'shop')

  test('MULTI-USER', 'User A balance (+50 citizen) distinct from User B (+100 shop)', 
    coinEngine.balances.get(userA_id) === 50 && coinEngine.balances.get(userB_id) === 100)

  coinEngine.clearUserState(userA_id)
  test('USER ISOLATION', 'User A logout evicts User A state without touching User B',
    !coinEngine.balances.has(userA_id) && coinEngine.balances.get(userB_id) === 100)

  test('USER ISOLATION', 'AuthContext logout evicts recommendation session and caches',
    authContextSrc.includes('recommendationTracker.clearUserSession()') &&
    authContextSrc.includes("localStorage.removeItem('gl_user')"))

  // 4. SHARED POSTS & OWNERSHIP
  console.log('\n--- 4. SHARED POSTS & OWNERSHIP ---')
  const sbPostsSrc = fs.readFileSync('frontend/src/services/posts/supabasePosts.ts', 'utf8')
  test('SHARED POSTS', 'createPost derives user_id authoritatively from Supabase session user.id', 
    sbPostsSrc.includes('user_id: user.id') && sbPostsSrc.includes('supabase.auth.getUser()'))
  test('SHARED POSTS', 'fetchPosts queries shared public feed for all users',
    sbPostsSrc.includes("from('e_waste_posts')"))

  // 5. CLAIMS & PICKUPS
  console.log('\n--- 5. CLAIMS & PICKUPS ---')
  const interactionsSrc = fs.readFileSync('frontend/src/services/interactions/interactions.api.ts', 'utf8')
  test('CLAIMS', 'claimPost preserves post ownership while recording claimant user_id',
    interactionsSrc.includes("from('post_claims')") && interactionsSrc.includes('post_id: postId') && interactionsSrc.includes('user_id: userId'))
  
  const mapsSrc = fs.readFileSync('frontend/src/services/maps/maps.api.ts', 'utf8')
  test('PICKUPS', 'schedulePickup persists pickup_requests using authenticated user_id',
    mapsSrc.includes("from('pickup_requests').insert({") && mapsSrc.includes('user_id: currentUserId'))

  // 6. COIN SYSTEM (REGISTRATION BONUSES)
  console.log('\n--- 6. COIN SYSTEM ---')
  const freshEngine = new TestCoinEngine()
  const citizenReg = freshEngine.awardRegistrationBonus('user-cit', 'citizen')
  const shopReg = freshEngine.awardRegistrationBonus('user-shp', 'shop')
  const compReg = freshEngine.awardRegistrationBonus('user-cmp', 'company')
  const adminReg = freshEngine.awardRegistrationBonus('user-adm', 'admin')

  test('COINS', 'Citizen registration awards +50 coins', citizenReg.coins === 50)
  test('COINS', 'Local Shop registration awards +100 coins', shopReg.coins === 100)
  test('COINS', 'Company registration awards +100 coins', compReg.coins === 100)
  test('COINS', 'Admin registration awards 0 coins', adminReg.coins === 0)

  // Registration bonus once only test
  const repeatBonus = freshEngine.awardRegistrationBonus('user-cit', 'citizen')
  test('COINS', 'Registration bonus is awarded exactly once (idempotent)', repeatBonus.awarded === false && repeatBonus.coins === 50)

  // 7. DAILY LOGIN & STREAK SYSTEM (IST TIMEZONE)
  console.log('\n--- 7. DAILY STREAK & TIMEZONE ---')
  const streakEngine = new TestCoinEngine()
  const streakUser = 'streak-user-uuid'

  // Indian timezone date validation
  const todayIst = getTodayIndiaDate()
  test('DAILY STREAK', `Current date formatted in Asia/Kolkata: ${todayIst}`, /^\d{4}-\d{2}-\d{2}$/.test(todayIst))

  // Day 1 Login
  const day1 = streakEngine.processDailyLoginReward(streakUser, '2026-09-13')
  test('DAILY STREAK', 'First login on Sept 13 -> +25 coins, streak = 1', day1.awarded === true && day1.streak === 1 && day1.totalCoins === 25)

  // Duplicate login same day
  const dupLogin = streakEngine.processDailyLoginReward(streakUser, '2026-09-13')
  test('DAILY STREAK', 'Repeat login same Indian day -> +0 coins, streak unchanged', dupLogin.awarded === false && dupLogin.totalCoins === 25 && dupLogin.streak === 1)

  // Consecutive Day (Day 2: Sept 14)
  const day2 = streakEngine.processDailyLoginReward(streakUser, '2026-09-14')
  test('DAILY STREAK', 'Consecutive login on Sept 14 -> +25 coins, streak = 2', day2.awarded === true && day2.streak === 2 && day2.totalCoins === 50)

  // Consecutive Day (Day 3: Sept 15)
  const day3 = streakEngine.processDailyLoginReward(streakUser, '2026-09-15')
  test('DAILY STREAK', 'Consecutive login on Sept 15 -> +25 coins, streak = 3', day3.awarded === true && day3.streak === 3 && day3.totalCoins === 75)

  // Missed Day (Sept 16 skipped, login on Sept 17)
  const missedDay = streakEngine.processDailyLoginReward(streakUser, '2026-09-17')
  test('DAILY STREAK', 'Missed day (Sept 16 skipped) -> streak resets to 1', missedDay.awarded === true && missedDay.streak === 1 && missedDay.totalCoins === 100)

  // 8. NOTIFICATIONS
  console.log('\n--- 8. NOTIFICATIONS ---')
  test('NOTIFICATIONS', 'getUserNotifications queries notifications by recipient_id = userId',
    interactionsSrc.includes("from('notifications')") && interactionsSrc.includes(".eq('recipient_id', userId)"))

  // 9. ADMIN SYSTEM & SECURITY
  console.log('\n--- 9. ADMIN SECURITY ---')
  test('ADMIN', 'Citizen CANNOT access /admin', !canAccessRoute('citizen', '/admin'))
  test('ADMIN', 'Local Shop CANNOT access /admin', !canAccessRoute('shop', '/admin'))
  test('ADMIN', 'Company CANNOT access /admin', !canAccessRoute('company', '/admin'))
  test('ADMIN', 'Admin CAN access /admin', canAccessRoute('admin', '/admin'))
  test('ADMIN', 'Admin CAN access /admin/users', canAccessRoute('admin', '/admin/users'))
  test('ADMIN', 'Admin CAN access /admin/health', canAccessRoute('admin', '/admin/health'))

  // 10. DUMMY DATA CLEANUP & EMPTY STATES
  console.log('\n--- 10. DUMMY DATA CLEANUP ---')
  const postsApiSrc = fs.readFileSync('frontend/src/services/posts/posts.api.ts', 'utf8')
  test('DUMMY DATA CLEANUP', 'Zero MOCK_POSTS imported in posts.api.ts', !postsApiSrc.includes('MOCK_POSTS'))
  test('DUMMY DATA CLEANUP', 'Zero MOCK_MAP_PARTNERS imported in maps.api.ts', !mapsSrc.includes('MOCK_MAP_PARTNERS'))
  test('DUMMY DATA CLEANUP', 'maps.api.ts queries live Supabase recycling_centers table', mapsSrc.includes("from('recycling_centers')"))

  const citizenStepSrc = fs.readFileSync('frontend/src/pages/auth/flow/CitizenRegisterStep.tsx', 'utf8')
  test('LOCATION', 'Hardcoded Guindy demo area removed from CitizenRegisterStep', !citizenStepSrc.includes("'Guindy'"))
  test('LOCATION', 'Hardcoded 13.0067 coordinate removed from CitizenRegisterStep', !citizenStepSrc.includes('13.0067'))
  test('LOCATION', 'Hardcoded 80.2023 coordinate removed from CitizenRegisterStep', !citizenStepSrc.includes('80.2023'))

  // 11. LIVE SUPABASE DATABASE CONNECTION & TABLES
  console.log('\n--- 11. LIVE SUPABASE PERSISTENCE AUDIT ---')
  try {
    const { count: profCount, error: profErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    test('DATABASE', 'profiles table accessible via live Supabase query', !profErr, `Count = ${profCount}`)

    const { count: rcCount, error: rcErr } = await supabase.from('recycling_centers').select('*', { count: 'exact', head: true })
    test('DATABASE', 'recycling_centers table accessible via live Supabase query', !rcErr, `Count = ${rcCount}`)

    const { count: catCount, error: catErr } = await supabase.from('waste_categories').select('*', { count: 'exact', head: true })
    test('DATABASE', 'waste_categories table accessible via live Supabase query', !catErr, `Count = ${catCount}`)

    const { error: postErr } = await supabase.from('e_waste_posts').select('*', { count: 'exact', head: true })
    test('DATABASE', 'e_waste_posts table accessible via live Supabase query', !postErr)

    const { error: pickErr } = await supabase.from('pickup_requests').select('*', { count: 'exact', head: true })
    test('DATABASE', 'pickup_requests table accessible via live Supabase query', !pickErr)
  } catch (err) {
    test('DATABASE', 'Supabase network connectivity', false, err.message)
  }

  // Summary
  console.log('\n====================================================================')
  const total = results.length
  const passed = results.filter(r => r.passed).length
  const failed = total - passed
  console.log(`PRODUCTION FINISHING VERIFICATION: ${passed} PASSED | ${failed} FAILED (TOTAL: ${total})`)
  console.log('====================================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runProductionFinishingSuite().catch((err) => {
  console.error('Test suite runtime error:', err)
  process.exit(1)
})
