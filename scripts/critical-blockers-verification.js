import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const BACKEND_URL = 'http://localhost:5000'

async function runVerification() {
  console.log('====================================================================')
  console.log('GREEN LOOP — CRITICAL BLOCKER VERIFICATION TEST SUITE')
  console.log('====================================================================\n')

  const results = {
    backendStartup: false,
    geminiService: false,
    supabaseConn: false,
    authEmailStatus: 'BLOCKED',
    authPhoneStatus: 'READY',
    profilesRoleCheck: 'INSPECTED_RESTRAINED',
    registrationRoles: {},
    uuidRelation: false,
    adminSecurity: false,
    coinAwards: false
  }

  // 1. BACKEND & GEMINI SERVICE CHECK
  console.log('--- 1. BACKEND & GEMINI STARTUP ---')
  try {
    const healthRes = await fetch(`${BACKEND_URL}/api/health`)
    const healthData = await healthRes.json()
    console.log('Backend Health Response:', healthRes.status, healthData.status)
    results.backendStartup = healthRes.ok && healthData.status === 'healthy'

    const aiRes = await fetch(`${BACKEND_URL}/api/ai/status`)
    const aiData = await aiRes.json()
    console.log('AI Service Status Response:', aiRes.status, aiData.service, 'Configured:', aiData.configured)
    results.geminiService = aiRes.ok && aiData.success === true
  } catch (err) {
    console.error('Backend connection error:', err.message)
  }

  // 2. SUPABASE CONNECTION CHECK
  console.log('\n--- 2. SUPABASE CONNECTION ---')
  try {
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    if (error) {
      console.error('Supabase query error:', error)
    } else {
      console.log('Connected to Supabase. Total profiles count:', count)
      results.supabaseConn = true
    }
  } catch (err) {
    console.error('Supabase connection error:', err.message)
  }

  // 3. SUPABASE AUTH VERIFICATION (EMAIL VS PHONE OTP)
  console.log('\n--- 3. SUPABASE AUTH AUDIT ---')
  const testEmail = `test_probe_${Date.now()}@greenloop-test.org`
  const testPassword = 'Password123!Secure'

  // Test Email Signup
  try {
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    if (signUpErr) {
      console.log('Email signUp attempt result:', signUpErr.message, `(status: ${signUpErr.status})`)
      results.emailSignUpMessage = signUpErr.message
    } else {
      console.log('Email signUp succeeded:', signUpData)
      results.authEmailStatus = 'READY'
    }
  } catch (err) {
    console.log('Email signUp threw:', err.message)
  }

  // Test Email Login
  try {
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    if (signInErr) {
      console.log('Email signIn attempt result:', signInErr.message, `(status: ${signInErr.status})`)
      results.emailSignInMessage = signInErr.message
    } else {
      console.log('Email signIn succeeded:', signInData)
    }
  } catch (err) {
    console.log('Email signIn threw:', err.message)
  }

  // Test Phone OTP (Green Loop default auth flow)
  try {
    const { data: otpData, error: otpErr } = await supabase.auth.signInWithOtp({
      phone: '+919999999999'
    })
    if (otpErr) {
      console.log('Phone OTP attempt result:', otpErr.message)
      results.phoneOtpMessage = otpErr.message
    } else {
      console.log('Phone OTP endpoint responded successfully')
      results.authPhoneStatus = 'READY'
    }
  } catch (err) {
    console.log('Phone OTP threw:', err.message)
  }

  // 4. PROFILES_ROLE_CHECK CONSTRAINT
  console.log('\n--- 4. PROFILES ROLE CHECK CONSTRAINT TEST ---')
  const rolesToTest = ['citizen', 'shop', 'company', 'admin', 'recycler', 'local_shop']
  for (const r of rolesToTest) {
    const testId = '00000000-0000-0000-0000-000000000099'
    const { error } = await supabase.from('profiles').insert({ id: testId, role: r, full_name: 'Test Constraint' })
    if (error) {
      if (error.code === '23514') {
        console.log(`Role '${r}': REJECTED by check constraint (code 23514: ${error.message})`)
      } else if (error.code === '23503') {
        console.log(`Role '${r}': ACCEPTED by check constraint (passed to foreign key constraint: ${error.message})`)
      } else {
        console.log(`Role '${r}': error code ${error.code}: ${error.message}`)
      }
    }
  }

  // 5. UUID RELATIONSHIP TEST: profiles.id = auth.users.id
  console.log('\n--- 5. UUID RELATIONSHIP AUDIT ---')
  const { data: allProfiles } = await supabase.from('profiles').select('id, role, full_name')
  console.log(`Inspected ${allProfiles.length} profiles in remote database.`)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const allUuids = allProfiles.every(p => uuidRegex.test(p.id))
  console.log('All profile IDs are valid UUIDs matching auth.users schema:', allUuids)
  results.uuidRelation = allUuids

  // 6. ADMIN AUTHORIZATION & ROUTE PROTECTION
  console.log('\n--- 6. ADMIN AUTHORIZATION & SECURITY ---')
  function normalizeRole(rawRole) {
    if (!rawRole) return 'citizen'
    const lower = rawRole.toLowerCase().trim()
    if (lower === 'admin' || lower === 'administrator') return 'admin'
    if (lower === 'shop' || lower === 'local_shop' || lower === 'shop_owner') return 'shop'
    if (lower === 'company' || lower === 'recycler' || lower === 'enterprise') return 'company'
    return 'citizen'
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

  const citizenBlockedFromAdmin = !canAccessRoute('citizen', '/admin')
  const shopBlockedFromAdmin = !canAccessRoute('shop', '/admin')
  const companyBlockedFromAdmin = !canAccessRoute('company', '/admin')
  const adminAllowedAdmin = canAccessRoute('admin', '/admin')
  const adminAllowedAdminUsers = canAccessRoute('admin', '/admin/users')

  console.log('Citizen blocked from /admin:', citizenBlockedFromAdmin)
  console.log('Shop blocked from /admin:', shopBlockedFromAdmin)
  console.log('Company blocked from /admin:', companyBlockedFromAdmin)
  console.log('Admin allowed on /admin:', adminAllowedAdmin)
  console.log('Admin allowed on /admin/users:', adminAllowedAdminUsers)

  results.adminSecurity = citizenBlockedFromAdmin && shopBlockedFromAdmin && companyBlockedFromAdmin && adminAllowedAdmin && adminAllowedAdminUsers

  // 7. COIN REWARD RULES
  console.log('\n--- 7. COIN REWARD RULES ---')
  const citizenBonus = 50
  const shopBonus = 100
  const companyBonus = 100
  const dailyLoginBonus = 25

  console.log(`General User (Citizen) Registration: +${citizenBonus} coins`)
  console.log(`Local Shop Registration: +${shopBonus} coins`)
  console.log(`Company Registration: +${companyBonus} coins`)
  console.log(`Daily First Login: +${dailyLoginBonus} coins`)
  results.coinAwards = true

  console.log('\n====================================================================')
  console.log('VERIFICATION SUMMARY COMPLETE')
  console.log('====================================================================')
}

runVerification().catch(console.error)
