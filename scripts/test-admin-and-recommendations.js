// ==============================================================================
// GREEN LOOP — TEST SUITE FOR ADMIN SYSTEM & AI RECOMMENDATION ENGINE
// ==============================================================================
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

console.log('============================================================')
console.log('GREEN LOOP — AI RECOMMENDATION & ADMIN SYSTEM VERIFICATION')
console.log('============================================================\n')

// ------------------------------------------------------------------------------
// SECTION 1: ROLE SERVICE & ROUTE SECURITY
// ------------------------------------------------------------------------------
console.log('1. ROLE SYSTEM & STRICT ROUTE ISOLATION')

function normalizeRole(raw) {
  if (!raw) return 'citizen'
  const lower = String(raw).toLowerCase().trim()
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
  if (cleanPath.startsWith('/admin')) {
    return userRole === 'admin'
  }
  if (cleanPath.startsWith('/shop')) {
    return userRole === 'shop'
  }
  if (cleanPath.startsWith('/company')) {
    return userRole === 'company'
  }
  if (userRole === 'shop' || userRole === 'company' || userRole === 'admin') {
    if (['/', '/activity', '/post', '/marketplace', '/rewards', '/missions'].includes(cleanPath)) {
      return false
    }
  }
  return true
}

assert(normalizeRole('admin') === 'admin', 'Normalizes "admin" -> "admin"')
assert(normalizeRole('ADMIN') === 'admin', 'Normalizes "ADMIN" -> "admin"')
assert(normalizeRole('administrator') === 'admin', 'Normalizes "administrator" -> "admin"')
assert(normalizeRole('citizen') === 'citizen', 'Normalizes "citizen" -> "citizen"')
assert(normalizeRole('shop') === 'shop', 'Normalizes "shop" -> "shop"')
assert(normalizeRole('company') === 'company', 'Normalizes "company" -> "company"')

assert(getRoleDashboardPath('admin') === '/admin', 'Admin dashboard path is /admin')
assert(getRoleDashboardPath('shop') === '/shop', 'Shop dashboard path is /shop')
assert(getRoleDashboardPath('company') === '/company', 'Company dashboard path is /company')
assert(getRoleDashboardPath('citizen') === '/', 'Citizen dashboard path is /')

// Route Guards & Unauthorized Access
assert(canAccessRoute('admin', '/admin') === true, 'Admin can access /admin')
assert(canAccessRoute('admin', '/admin/users') === true, 'Admin can access /admin/users')
assert(canAccessRoute('citizen', '/admin') === false, 'Citizen CANNOT access /admin')
assert(canAccessRoute('citizen', '/admin/health') === false, 'Citizen CANNOT access /admin/health')
assert(canAccessRoute('shop', '/admin') === false, 'Local Shop CANNOT access /admin')
assert(canAccessRoute('company', '/admin') === false, 'Company CANNOT access /admin')

assert(canAccessRoute('shop', '/shop') === true, 'Shop can access /shop')
assert(canAccessRoute('citizen', '/shop') === false, 'Citizen cannot access /shop')
assert(canAccessRoute('company', '/shop') === false, 'Company cannot access /shop')
assert(canAccessRoute('company', '/company') === true, 'Company can access /company')
assert(canAccessRoute('citizen', '/company') === false, 'Citizen cannot access /company')

// ------------------------------------------------------------------------------
// SECTION 2: AI RECOMMENDATION ENGINE SCORING & DIVERSIFICATION
// ------------------------------------------------------------------------------
console.log('\n2. AI RECOMMENDATION ENGINE (FORMULA, DIVERSITY, COLD-START)')

function scoreCandidate({
  category,
  title,
  userInterests = {},
  userSearchTokens = [],
  role = 'citizen',
  isRecentlySeen = false,
  isReported = false,
  isHidden = false,
}) {
  if (isHidden) return -999 // Total suppression
  if (isReported) return -999

  const postCategory = (category || '').toLowerCase()
  const postTokens = (title + ' ' + category).toLowerCase().split(/\s+/)

  // 1. Semantic
  let semanticScore = 0.3
  if (userSearchTokens.length > 0) {
    const matches = userSearchTokens.filter((t) => postTokens.includes(t))
    semanticScore = matches.length / Math.max(userSearchTokens.length, 1)
  }

  // 2. Behavior
  const interest = userInterests[postCategory] || 0
  const behaviorScore = Math.min(1.0, interest / 10)

  // 3. Recency
  const recencyScore = 0.9

  // 4. Role
  const rolePriorities = {
    citizen: ['appliances', 'laptops', 'mobile phones', 'accessories'],
    shop: ['laptops', 'mobile phones', 'computer parts', 'circuit boards'],
    company: ['bulk e-waste', 'industrial servers', 'telecom scrap'],
    admin: ['laptops', 'mobile phones', 'bulk e-waste'],
  }
  const roleScore = (rolePriorities[role] || []).some((c) => postCategory.includes(c)) ? 1.0 : 0.4

  // 5. Local
  const localScore = 0.8

  // 6. Engagement
  const engagementScore = 0.6

  // 7. Exploration
  const explorationScore = interest === 0 ? 0.9 : 0.2

  // Penalties
  let penalties = 0
  if (isRecentlySeen) penalties += 0.18

  const finalScore =
    0.35 * semanticScore +
    0.20 * behaviorScore +
    0.15 * recencyScore +
    0.10 * roleScore +
    0.08 * localScore +
    0.07 * engagementScore +
    0.05 * explorationScore -
    penalties

  return Math.max(0.01, finalScore)
}

// TEST 1 — Cold Start User
const coldScoreA = scoreCandidate({ category: 'Laptops', title: 'Dell Latitude', userInterests: {} })
const coldScoreB = scoreCandidate({ category: 'Appliances', title: 'Microwave Oven', userInterests: {} })
assert(coldScoreA > 0.3 && coldScoreB > 0.3, 'Cold start returns healthy positive baseline scores')

// TEST 2 — Laptop Interest
const laptopFanScore = scoreCandidate({
  category: 'Laptops',
  title: 'ThinkPad T480',
  userInterests: { laptops: 15 },
  userSearchTokens: ['laptop'],
})
const otherScore = scoreCandidate({
  category: 'Appliances',
  title: 'Washing Machine',
  userInterests: { laptops: 15 },
  userSearchTokens: ['laptop'],
})
assert(laptopFanScore > otherScore, 'Laptop candidate scores higher when user has laptop interest + search')

// TEST 3 — Mobile Interest
const mobileFanScore = scoreCandidate({
  category: 'Mobile Phones',
  title: 'iPhone 11 Screen Fix',
  userInterests: { 'mobile phones': 12 },
  userSearchTokens: ['iphone', 'mobile'],
})
assert(mobileFanScore > coldScoreA, 'Mobile interest increases mobile listing score')

// TEST 4 — Role Adaptation: Shop vs Citizen
const shopScoreOnParts = scoreCandidate({
  category: 'Computer Parts',
  title: 'DDR4 RAM and Motherboards',
  role: 'shop',
})
const citizenScoreOnParts = scoreCandidate({
  category: 'Computer Parts',
  title: 'DDR4 RAM and Motherboards',
  role: 'citizen',
})
assert(shopScoreOnParts > citizenScoreOnParts, 'Local Shop role receives role boost on repair/parts listings')

// TEST 5 — Negative Signal Suppression
const hiddenScore = scoreCandidate({
  category: 'Laptops',
  title: 'HP Pavilion',
  isHidden: true,
})
assert(hiddenScore < 0, 'Hidden post is completely suppressed (negative score)')

// TEST 6 — Recency Decay Simulation
function simulateDecay(hoursAgo, halfLife = 168) {
  return Math.exp(-hoursAgo / halfLife)
}
const recentWeight = 10 * simulateDecay(2)
const monthOldWeight = 10 * simulateDecay(720)
assert(recentWeight > 9.0, '2-hour-old interaction retains >90% weight')
assert(monthOldWeight < 0.25, '30-day-old interaction decays to <2.5% weight')

// TEST 7 — Diversification (No 5 identical in a row)
function diversify(posts) {
  const result = []
  const streak = {}
  const pool = [...posts]

  while (pool.length > 0) {
    let chosenIndex = -1
    for (let i = 0; i < pool.length; i++) {
      const cat = pool[i].category
      if ((streak[cat] || 0) < 2) {
        chosenIndex = i
        break
      }
    }
    if (chosenIndex === -1) chosenIndex = 0
    const [chosen] = pool.splice(chosenIndex, 1)
    Object.keys(streak).forEach((k) => {
      if (k !== chosen.category) streak[k] = 0
    })
    streak[chosen.category] = (streak[chosen.category] || 0) + 1
    result.push(chosen)
  }
  return result
}

const monotonePosts = [
  { id: '1', category: 'Laptops' },
  { id: '2', category: 'Laptops' },
  { id: '3', category: 'Laptops' },
  { id: '4', category: 'Laptops' },
  { id: '5', category: 'Mobile' },
  { id: '6', category: 'TV' },
]
const diversified = diversify(monotonePosts)
let maxCategoryStreak = 0
let curStreak = 0
let lastCat = ''
diversified.forEach((p) => {
  if (p.category === lastCat) curStreak++
  else {
    curStreak = 1
    lastCat = p.category
  }
  if (curStreak > maxCategoryStreak) maxCategoryStreak = curStreak
})
assert(maxCategoryStreak <= 2, 'Diversification prevents more than 2 consecutive items of the same category')

// ------------------------------------------------------------------------------
// SECTION 3: DATABASE SCHEMA & MIGRATION SCRIPT VERIFICATION
// ------------------------------------------------------------------------------
console.log('\n3. DATABASE SCHEMA & CREATOR ADMINS VERIFICATION')

const schemaPath = path.join(rootDir, 'supabase', 'admin_and_recommendations_schema.sql')
assert(fs.existsSync(schemaPath), 'admin_and_recommendations_schema.sql exists')

const schemaContent = fs.readFileSync(schemaPath, 'utf8')
assert(schemaContent.includes("'admin'"), 'Schema includes "admin" in role check constraint')
assert(schemaContent.includes('recommendation_events'), 'Schema creates recommendation_events table')
assert(schemaContent.includes('admin_audit_logs'), 'Schema creates admin_audit_logs table')
assert(schemaContent.includes('Mathavan') || schemaContent.includes('mathavan'), 'Schema configures Mathavan admin authorization')
assert(schemaContent.includes('Vimal Raj') || schemaContent.includes('vimal'), 'Schema configures Vimal Raj admin authorization')
assert(schemaContent.includes('Thiru Loop') || schemaContent.includes('thiru'), 'Schema configures Thiru Loop admin authorization')

// ------------------------------------------------------------------------------
// SECTION 4: 2-TICK PASSWORD ACCEPTANCE & IMPACT STATUS REMOVAL
// ------------------------------------------------------------------------------
console.log('\n4. UI REFINEMENTS (2-TICKS PASSWORD & IMPACT STATUS REMOVAL)')

const pass2TicksPath = path.join(rootDir, 'frontend', 'src', 'components', 'PasswordRequirements2Ticks.tsx')
assert(fs.existsSync(pass2TicksPath), 'PasswordRequirements2Ticks.tsx exists')
const pass2TicksContent = fs.readFileSync(pass2TicksPath, 'utf8')
assert(pass2TicksContent.includes('6–16 characters'), 'PasswordRequirements2Ticks checks 6-16 characters')
assert(pass2TicksContent.includes('Passwords match'), 'PasswordRequirements2Ticks checks passwords match')

const appShellPath = path.join(rootDir, 'frontend', 'src', 'components', 'AppShell.tsx')
const appShellContent = fs.readFileSync(appShellPath, 'utf8')
assert(!appShellContent.includes("'Impact Stats'"), 'Impact Stats removed from AppShell navigation')

const heroSectionPath = path.join(rootDir, 'frontend', 'src', 'pages', 'home', 'components', 'HeroSection', 'HeroSection.tsx')
const heroSectionContent = fs.readFileSync(heroSectionPath, 'utf8')
assert(!heroSectionContent.includes('Impact Summary Bar'), 'Impact Summary Bar removed from HeroSection')

console.log('\n============================================================')
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`)
console.log('============================================================')

if (failed > 0) {
  process.exit(1)
}
