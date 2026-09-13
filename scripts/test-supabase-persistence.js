import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function runAudit() {
  console.log('======================================================')
  console.log('GREEN LOOP — SUPABASE PERSISTENCE & SCHEMA AUDIT')
  console.log('======================================================\n')

  const tables = [
    'profiles',
    'e_waste_posts',
    'posts',
    'post_likes',
    'post_comments',
    'post_claims',
    'notifications',
    'recycling_centers',
    'pickup_requests',
    'disposal_logs',
    'waste_categories',
    'waste_items',
  ]

  console.log('1. PROBING ROW COUNTS & RLS ON ALL 12 TABLES:')
  console.log('---------------------------------------------------------')
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`- ${t.padEnd(20)}: Error (${error.message})`)
    } else {
      console.log(`- ${t.padEnd(20)}: Count = ${count}`)
    }
  }

  console.log('\n2. VERIFYING FOREIGN KEYS & CORE POSTS TABLE RELATIONSHIPS:')
  console.log('---------------------------------------------------------')

  const rLikesEwaste = await supabase.from('post_likes').select('*, e_waste_posts(id, title)').limit(1)
  console.log('post_likes -> e_waste_posts   :', rLikesEwaste.error ? `Failed (${rLikesEwaste.error.message})` : 'VALID (Foreign Key Exists)')

  const rLikesPosts = await supabase.from('post_likes').select('*, posts(id, title)').limit(1)
  console.log('post_likes -> posts           :', rLikesPosts.error ? `NO RELATIONSHIP (${rLikesPosts.error.message})` : 'VALID')

  const rCommentsEwaste = await supabase.from('post_comments').select('*, e_waste_posts(id, title)').limit(1)
  console.log('post_comments -> e_waste_posts:', rCommentsEwaste.error ? `Failed (${rCommentsEwaste.error.message})` : 'VALID (Foreign Key Exists)')

  const rClaimsEwaste = await supabase.from('post_claims').select('*, e_waste_posts(id, title)').limit(1)
  console.log('post_claims -> e_waste_posts  :', rClaimsEwaste.error ? `Failed (${rClaimsEwaste.error.message})` : 'VALID (Foreign Key Exists)')

  const rNotifsEwaste = await supabase.from('notifications').select('*, e_waste_posts(id, title)').limit(1)
  console.log('notifications -> e_waste_posts:', rNotifsEwaste.error ? `Failed (${rNotifsEwaste.error.message})` : 'VALID (Foreign Key Exists)')

  console.log('\n3. VERIFYING RECYCLING CENTERS PERSISTENCE:')
  console.log('---------------------------------------------------------')
  const { data: centers, error: centersErr } = await supabase
    .from('recycling_centers')
    .select('id, name, city, latitude, longitude, contact_phone')
    .limit(5)

  if (centersErr) {
    console.log('Error fetching recycling_centers:', centersErr.message)
  } else {
    console.log(`Successfully fetched ${centers?.length} sample Coimbatore centers from public.recycling_centers:`)
    centers?.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.city}) - Tel: ${c.contact_phone} [${c.latitude}, ${c.longitude}]`)
    })
  }

  console.log('\n4. VERIFYING COLUMN COMPATIBILITY ON CORE TABLES:')
  console.log('---------------------------------------------------------')
  const checkColumns = async (table, cols) => {
    const passed = []
    for (const c of cols) {
      const { error } = await supabase.from(table).select(c).limit(1)
      if (!error) passed.push(c)
    }
    return passed
  }

  const profileCols = await checkColumns('profiles', ['id', 'full_name', 'phone', 'role', 'city', 'address', 'created_at', 'email'])
  console.log('profiles validated columns    :', profileCols.filter(c => c !== 'email').join(', '))
  console.log('profiles email column exists? :', profileCols.includes('email') ? 'YES' : 'NO (Correct: email is stored in auth.users)')

  const ewasteCols = await checkColumns('e_waste_posts', ['id', 'user_id', 'title', 'category', 'subcategory', 'condition', 'status', 'asking_price', 'image_url', 'created_at'])
  console.log('e_waste_posts columns         :', ewasteCols.join(', '))

  console.log('\nAudit complete.')
}

runAudit()
