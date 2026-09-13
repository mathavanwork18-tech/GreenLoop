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

const candidateCols = [
  'id', 'user_id', 'author_id', 'creator_id', 'profile_id', 'recipient_id', 'sender_id', 'post_id', 'claim_id', 'request_id', 'center_id', 'category_id',
  'title', 'name', 'full_name', 'username', 'email', 'phone', 'contact_phone', 'contact_email', 'role', 'status', 'type', 'category', 'subcategory',
  'condition', 'city', 'address', 'area', 'landmark', 'location', 'latitude', 'longitude', 'lat', 'lng',
  'price', 'asking_price', 'green_coins', 'coins', 'quantity', 'weight', 'weight_kg', 'capacity_kg',
  'description', 'details', 'notes', 'comment', 'content', 'text', 'message', 'reason',
  'image_url', 'images', 'photo_url', 'avatar_url', 'avatar',
  'is_read', 'read', 'verified', 'is_verified', 'completed', 'is_completed', 'active', 'is_active',
  'pickup_date', 'scheduled_date', 'date', 'action', 'action_type',
  'metadata', 'data', 'meta', 'payload',
  'created_at', 'updated_at', 'completed_at', 'claimed_at', 'scheduled_at'
]

async function probeTable(table) {
  let activeCols = [...candidateCols]
  const validCols = []

  while (activeCols.length > 0) {
    const { error } = await supabase.from(table).select(activeCols.join(',')).limit(0)
    if (!error) {
      validCols.push(...activeCols)
      break
    }

    // Match "column table.col does not exist" or "Could not find..."
    const match = error.message.match(/column\s+[^.]+\.([a-zA-Z0-9_]+)\s+does not exist/i) ||
                  error.message.match(/Could not find the '([^']+)' column/i)
    if (match && match[1]) {
      const missing = match[1]
      activeCols = activeCols.filter(c => c !== missing)
    } else {
      console.log(`[${table}] Unhandled error:`, error.message)
      break
    }
  }

  return validCols
}

async function run() {
  console.log('====================================================')
  console.log('FAST SCHEMA PROBE ACROSS ALL 12 SUPABASE TABLES')
  console.log('====================================================\n')

  const results = {}
  for (const t of tables) {
    const cols = await probeTable(t)
    results[t] = cols
    console.log(`📌 Table [${t.padEnd(18)}]: ${cols.join(', ')}`)
  }

  console.log('\nComplete Table Column Map:')
  console.log(JSON.stringify(results, null, 2))
}

run().catch(console.error)
