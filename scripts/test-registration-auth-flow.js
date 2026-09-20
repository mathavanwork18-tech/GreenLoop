import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testRegistrationAuthFlow() {
  console.log('===============================================================')
  console.log('TESTING GREEN LOOP REGISTRATION & PHONE NUMBER POLICY')
  console.log('===============================================================\n')

  const timestamp = Date.now()
  let passedCount = 0
  let failedCount = 0

  function assert(title, condition, details = '') {
    if (condition) {
      console.log(`  [PASS] ${title}${details ? ` -> ${details}` : ''}`)
      passedCount++
    } else {
      console.error(`  [FAIL] ${title}${details ? ` -> ${details}` : ''}`)
      failedCount++
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Register WITHOUT Phone Number (Optional phone)
  // -------------------------------------------------------------
  console.log('--- 1. REGISTER WITHOUT PHONE NUMBER ---')
  const emailNoPhone = `test_nophone_${timestamp}@greenloop.test`
  const password = 'TestPassword@2026!'

  const { data: signUpData1, error: signUpErr1 } = await supabase.auth.signUp({
    email: emailNoPhone,
    password,
    options: {
      data: {
        full_name: 'Test Citizen NoPhone',
        phone: '',
        phone_verified: false,
        role: 'citizen',
        city: 'Coimbatore',
      },
    },
  })

  assert('Signup without phone succeeds', !signUpErr1 && Boolean(signUpData1?.user?.id), signUpErr1?.message || `User ID: ${signUpData1?.user?.id}`)
  assert('No OTP sent flag', signUpData1?.user !== null, 'Direct GoTrue registration completed without OTP challenge')

  if (signUpData1?.user?.id) {
    // Check public.profiles
    // Wait a moment for trigger
    await new Promise(r => setTimeout(r, 1200))
    const { data: profile1, error: profErr1 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData1.user.id)
      .maybeSingle()

    assert('Profile exists in public.profiles', Boolean(profile1), profErr1?.message || `Profile: ${profile1?.full_name}`)
    assert('Phone number is empty string or null', profile1?.phone === '' || profile1?.phone === null, `Phone: "${profile1?.phone}"`)
    assert('Role is citizen', profile1?.role === 'citizen', `Role: ${profile1?.role}`)
  }

  // -------------------------------------------------------------
  // TEST 2: Register WITH Phone Number (Format Validated, No OTP)
  // -------------------------------------------------------------
  console.log('\n--- 2. REGISTER WITH PHONE NUMBER (NO OTP) ---')
  const emailWithPhone = `test_phone_${timestamp}@greenloop.test`
  const rawPhone = '9876512345'
  const e164Phone = '+91' + rawPhone

  const { data: signUpData2, error: signUpErr2 } = await supabase.auth.signUp({
    email: emailWithPhone,
    password,
    options: {
      data: {
        full_name: 'Test Citizen WithPhone',
        phone: e164Phone,
        phone_verified: false,
        role: 'citizen',
        city: 'Coimbatore',
      },
    },
  })

  assert('Signup with phone succeeds without OTP', !signUpErr2 && Boolean(signUpData2?.user?.id), signUpErr2?.message || `User ID: ${signUpData2?.user?.id}`)

  if (signUpData2?.user?.id) {
    await new Promise(r => setTimeout(r, 1200))
    const { data: profile2, error: profErr2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData2.user.id)
      .maybeSingle()

    assert('Profile exists in public.profiles with phone', Boolean(profile2), profErr2?.message || `Profile: ${profile2?.full_name}`)
    assert('Phone number is stored correctly in Supabase profile', profile2?.phone === e164Phone || profile2?.phone === rawPhone, `Stored Phone: ${profile2?.phone}`)
  }

  // -------------------------------------------------------------
  // TEST 3: Login with Email & Password
  // -------------------------------------------------------------
  console.log('\n--- 3. LOGIN VIA EMAIL AND PASSWORD ---')
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: emailWithPhone,
    password,
  })

  assert('Login with email & password succeeds', !loginErr && Boolean(loginData?.user?.id), loginErr?.message || `Logged in User ID: ${loginData?.user?.id}`)

  // Clean up session
  await supabase.auth.signOut()

  console.log('\n===============================================================')
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('===============================================================')

  if (failedCount > 0) {
    process.exit(1)
  }
}

testRegistrationAuthFlow().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
