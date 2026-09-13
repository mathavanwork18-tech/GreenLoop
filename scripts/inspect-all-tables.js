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

async function inspect() {
  console.log('===============================================================')
  console.log('PHASE 1: DEEP SUPABASE SCHEMA & LIVE ACCESS AUDIT')
  console.log('===============================================================\n')

  for (const t of tables) {
    const { count, data, error } = await supabase.from(t).select('*', { count: 'exact' }).limit(3)
    if (error) {
      console.log(`❌ Table [${t}]: Error ${error.code} - ${error.message}`)
    } else {
      console.log(`✅ Table [${t}]: Count = ${count} | Retrieved = ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log(`   Columns (from data): ${Object.keys(data[0]).join(', ')}`)
        console.log(`   Sample record:`, JSON.stringify(data[0], null, 2))
      }
    }
  }
}

inspect().catch(console.error)
