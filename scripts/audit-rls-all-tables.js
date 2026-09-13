import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const tables = [
  'disposal_logs',
  'e_waste_posts',
  'notifications',
  'pickup_requests',
  'post_claims',
  'post_comments',
  'post_likes',
  'posts',
  'profiles',
  'recycling_centers',
  'waste_categories',
  'waste_items'
]

async function testRls() {
  console.log('========================================================')
  console.log('PHASE 15: COMPREHENSIVE RLS AUDIT (ANONYMOUS & READ/WRITE)')
  console.log('========================================================\n')

  for (const t of tables) {
    // 1. SELECT test
    const { data: selData, error: selErr } = await supabase.from(t).select('*').limit(1)
    const selectStatus = selErr ? `DENIED (${selErr.code}: ${selErr.message})` : `ALLOWED (${selData?.length} rows)`

    // 2. INSERT test (dry attempt with dummy id to see if blocked by RLS 42501 or allowed/fkey)
    const { error: insErr } = await supabase.from(t).insert({ id: '00000000-0000-0000-0000-000000000000' })
    const insertStatus = insErr?.code === '42501' 
      ? 'BLOCKED BY RLS (42501)' 
      : (insErr ? `ALLOWED BY RLS, rejected by constraint (${insErr.code}: ${insErr.message})` : 'INSERT SUCCEEDED')

    console.log(`Table [${t.padEnd(18)}]:`)
    console.log(`  SELECT: ${selectStatus}`)
    console.log(`  INSERT: ${insertStatus}`)
  }
}

testRls().catch(console.error)
