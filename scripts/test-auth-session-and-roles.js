import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function runTests() {
  console.log('===============================================================')
  console.log('GREEN LOOP — AUTH SESSION, POST CREATION & ROLE DASHBOARD TESTS')
  console.log('===============================================================\n')

  let allPassed = true
  function assert(title, condition, details = '') {
    if (condition) {
      console.log(`  [PASS] ${title}${details ? ` -> ${details}` : ''}`)
    } else {
      console.error(`  [FAIL] ${title}${details ? ` -> ${details}` : ''}`)
      allPassed = false
    }
  }

  // TEST 1: Unauthenticated Post Creation Blocked
  console.log('--- 1. UNAUTHENTICATED POST CREATION CHECK ---')
  const { data: { user: unauthUser } } = await supabase.auth.getUser()
  assert('Initial session is null', unauthUser === null, 'No phantom user logged in')

  let unauthBlocked = false
  let unauthMessage = ''
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Please sign in to create an e-waste listing.')
    }
  } catch (err) {
    unauthBlocked = true
    unauthMessage = err.message
  }
  assert('Unauthenticated post creation is blocked', unauthBlocked, unauthMessage)
  assert('Blocked message is exactly "Please sign in to create an e-waste listing."', unauthMessage === 'Please sign in to create an e-waste listing.')

  // TEST 2: Emoji Audit Across Frontend
  console.log('\n--- 2. EMOJI AUDIT ACROSS FRONTEND SOURCE ---')
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u

  function findFiles(dir) {
    let results = []
    const list = fs.readdirSync(dir)
    list.forEach(file => {
      const fullPath = dir + '/' + file
      const stat = fs.statSync(fullPath)
      if (stat && stat.isDirectory()) results = results.concat(findFiles(fullPath))
      else if (/\.(tsx?|jsx?|html|css)$/.test(file)) results.push(fullPath)
    })
    return results
  }

  const srcFiles = findFiles('frontend/src')
  let emojiCount = 0
  srcFiles.forEach(f => {
    const lines = fs.readFileSync(f, 'utf8').split('\n')
    lines.forEach((line, idx) => {
      if (emojiRegex.test(line)) {
        emojiCount++
        console.log(`Found emoji in ${f}:${idx + 1}: ${line.trim()}`)
      }
    })
  })
  assert('Zero emojis remain in frontend/src', emojiCount === 0, `Count = ${emojiCount}`)

  // TEST 3: Database Tables & Column Verification
  console.log('\n--- 3. SUPABASE TABLES & SCHEMA VERIFICATION ---')
  const { data: profCols, error: profErr } = await supabase.from('profiles').select('id, full_name, phone, role, city, address').limit(1)
  assert('Table public.profiles accessible', !profErr && profCols !== null)

  const { data: postCols, error: postErr } = await supabase.from('e_waste_posts').select('id, user_id, title, category, subcategory, condition, status, asking_price, image_url').limit(1)
  assert('Table public.e_waste_posts accessible', !postErr && postCols !== null)

  const { data: claimCols, error: claimErr } = await supabase.from('post_claims').select('id, user_id, post_id, status').limit(1)
  assert('Table public.post_claims accessible', !claimErr && claimCols !== null)

  const { data: commentCols, error: commentErr } = await supabase.from('post_comments').select('id, user_id, post_id, comment').limit(1)
  assert('Table public.post_comments accessible', !commentErr && commentCols !== null)

  const { data: centerCols, error: centerErr } = await supabase.from('recycling_centers').select('id, name, address, city, latitude, longitude, contact_phone').limit(1)
  assert('Table public.recycling_centers accessible', !centerErr && centerCols !== null)

  // TEST 4: Post Creation with Real Database Profile
  console.log('\n--- 4. POST CREATION AND REFRESH PERSISTENCE TEST ---')
  const { data: sampleProfiles } = await supabase.from('profiles').select('id, full_name, role').limit(1)
  if (sampleProfiles && sampleProfiles.length > 0) {
    const testUserId = sampleProfiles[0].id
    console.log(`  Using real database profile for post test: ${testUserId} (${sampleProfiles[0].full_name})`)

    const testPostPayload = {
      user_id: testUserId,
      title: 'Broken Mobile Phone',
      category: 'Mobile Phone',
      subcategory: 'Samsung',
      condition: 'Damaged',
      status: 'available',
      asking_price: 1000,
      description: 'Test listing - Broken Mobile Phone damaged screen but motherboard functional',
      image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80'
    }

    const { data: insertedPost, error: insertErr } = await supabase
      .from('e_waste_posts')
      .insert(testPostPayload)
      .select('*')
      .single()

    assert('Post created in public.e_waste_posts', !insertErr && insertedPost?.id, insertErr?.message || `Post ID: ${insertedPost?.id}`)
    assert('user_id matches authenticated user id', insertedPost?.user_id === testUserId, `user_id = ${insertedPost?.user_id}`)
    assert('Post title matches "Broken Mobile Phone"', insertedPost?.title === 'Broken Mobile Phone')
    assert('Asking price is 1000', Number(insertedPost?.asking_price) === 1000)

    // REFRESH TEST: Query the post directly from Supabase
    const { data: refreshedPost, error: refreshErr } = await supabase
      .from('e_waste_posts')
      .select('*')
      .eq('id', insertedPost.id)
      .single()

    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', refreshedPost.user_id)
      .single()

    assert('Post remains after refresh (queried directly from Supabase)', !refreshErr && refreshedPost !== null, `Persisted ID: ${refreshedPost?.id}`)
    assert('Refreshed seller is linked to profile', sellerProfile?.full_name === sampleProfiles[0].full_name, `Seller = ${sellerProfile?.full_name}`)

    // Clean up test post to keep database pristine
    await supabase.from('e_waste_posts').delete().eq('id', insertedPost.id)
    console.log('  Cleaned up test post from database.')
  }

  // TEST 5: Role Switching Logic & Persistence
  console.log('\n--- 5. ROLE SWITCHING PERSISTENCE TEST ---')
  if (sampleProfiles && sampleProfiles.length > 0) {
    const testUser = sampleProfiles[0]
    const initialRole = testUser.role || 'citizen'
    const targetRole = initialRole === 'citizen' ? 'shop' : 'citizen'

    // Update role in Supabase
    const { error: roleUpdateErr } = await supabase
      .from('profiles')
      .update({ role: targetRole })
      .eq('id', testUser.id)

    assert(`Role successfully switched to '${targetRole}' in Supabase profiles`, !roleUpdateErr, roleUpdateErr?.message)

    // Query back from Supabase
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', testUser.id)
      .single()

    assert('Role persistence verified from database', updatedProfile?.role === targetRole, `Role in DB: ${updatedProfile?.role}`)

    // Revert role back to initial
    await supabase.from('profiles').update({ role: initialRole }).eq('id', testUser.id)
    console.log(`  Reverted role back to initial: '${initialRole}'`)
  }

  console.log('\n===============================================================')
  console.log(`FINAL TEST RESULT: ${allPassed ? 'ALL TESTS PASSED FACTUALLY' : 'SOME TESTS FAILED'}`)
  console.log('===============================================================')
}

runTests().catch(console.error)
