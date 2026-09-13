import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Broad dictionary of candidate columns across typical schemas
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

async function probeAllColumns() {
  console.log('Probing exact columns on all 12 tables...\n')

  const results = {}

  for (const t of tables) {
    results[t] = []
    for (const col of candidateCols) {
      const { error } = await supabase.from(t).select(col).limit(0)
      if (!error) {
        results[t].push(col)
      }
    }
    console.log(`Table [${t}]: ${results[t].join(', ')}`)
  }

  console.log('\nJSON output of confirmed columns:')
  console.log(JSON.stringify(results, null, 2))
}

probeAllColumns().catch(console.error)
