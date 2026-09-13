import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const tables = [
  'disposal_logs', 'e_waste_posts', 'notifications', 'pickup_requests',
  'post_claims', 'post_comments', 'post_likes', 'posts',
  'profiles', 'recycling_centers', 'waste_categories', 'waste_items'
]

async function run() {
  for (const t of tables) {
    const rUuid = await supabase.from(t).select('id').eq('id', '00000000-0000-0000-0000-000000000000').limit(0)
    const rInt = await supabase.from(t).select('id').eq('id', 1).limit(0)

    let type = 'UNKNOWN'
    if (!rUuid.error) type = 'UUID'
    else if (!rInt.error) type = 'INTEGER / BIGINT'
    else type = 'Error: ' + (rUuid.error?.message || rInt.error?.message)

    console.log(`Table [${t.padEnd(18)}]: ID TYPE = ${type}`)
  }
}

run().catch(console.error)
