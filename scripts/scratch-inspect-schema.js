import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function inspectSchema() {
  console.log('--- TABLES & COLUMNS INSPECTION ---')
  const tables = [
    'profiles',
    'e_waste_posts',
    'post_likes',
    'post_comments',
    'post_claims',
    'notifications',
    'recycling_centers',
    'waste_categories',
    'waste_items',
    'disposal_logs',
    'pickup_requests'
  ]

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`Table ${table}: ERROR -> ${error.message} (code: ${error.code})`)
    } else {
      const sample = data && data[0] ? Object.keys(data[0]) : 'empty table'
      console.log(`Table ${table}: OK -> ${JSON.stringify(sample)}`)
    }
  }
}

inspectSchema().catch(console.error)
