import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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
  'waste_items'
]

const candidateColumns = [
  'id', 'user_id', 'author_id', 'creator_id', 'owner_id', 'recipient_id', 'sender_id', 'actor_id', 'claimant_id',
  'post_id', 'listing_id', 'item_id', 'category_id', 'center_id', 'facility_id', 'recycling_center_id', 'pickup_id', 'request_id',
  'title', 'name', 'full_name', 'username', 'email', 'phone', 'contact_phone', 'contact_name', 'role', 'city', 'address', 'area', 'landmark',
  'state', 'country', 'pincode', 'postal_code', 'zip', 'zipcode', 'latitude', 'longitude', 'lat', 'lng', 'coordinates',
  'description', 'details', 'notes', 'instructions', 'comments', 'comment', 'content', 'message', 'text', 'type', 'category',
  'condition', 'status', 'weight', 'weight_kg', 'quantity', 'qty', 'units', 'unit', 'brand', 'model', 'serial_number',
  'images', 'image_url', 'photos', 'photo_url', 'avatar', 'avatar_url', 'proof_url', 'certificate_url', 'receipt_url',
  'eco_points', 'points', 'green_coins', 'coins', 'reward', 'rewards', 'value', 'price', 'estimated_value',
  'date', 'scheduled_date', 'scheduled_time', 'pickup_date', 'pickup_time', 'time_slot', 'slot', 'preferred_slot', 'preferred_time',
  'action', 'method', 'disposal_method', 'disposal_date', 'completed_at', 'verified_at', 'verified_by', 'verified', 'is_verified',
  'is_read', 'read', 'is_completed', 'is_active', 'active', 'archived', 'deleted',
  'created_at', 'updated_at', 'timestamp', 'expires_at', 'expiry_date',
  'capacity_kg', 'capacity', 'operating_hours', 'timings', 'opening_hours', 'services', 'accepted_items',
  'material', 'hazard_level', 'handling_instructions', 'recyclable', 'toxicity', 'carbon_offset', 'co2_saved_kg',
  'metadata', 'data', 'props', 'payload', 'extra', 'specs', 'specifications',
  'source', 'destination', 'target', 'driver_id', 'agent_id', 'tracking_number', 'reference_id', 'code',
  'shop_name', 'owner_name', 'shop_address', 'bio', 'level', 'streak', 'transactions', 'preferences', 'role_profile'
]

async function probeTable(table) {
  const confirmed = []
  // Chunk candidates into batches of 15 concurrent requests
  const chunkSize = 15
  for (let i = 0; i < candidateColumns.length; i += chunkSize) {
    const chunk = candidateColumns.slice(i, i + chunkSize)
    await Promise.all(chunk.map(async (col) => {
      const { error } = await supabase.from(table).select(col).limit(1)
      if (!error) {
        confirmed.push(col)
      } else if (!error.message.includes('does not exist') && !error.message.includes('Could not find')) {
        confirmed.push(col)
      }
    }))
  }
  return confirmed
}

async function run() {
  console.log('--- PROBING DEPLOYED SCHEMA COLUMNS ---')
  for (const t of tables) {
    const cols = await probeTable(t)
    console.log(`\nTABLE [${t}] (${cols.length} cols):`)
    console.log(JSON.stringify(cols))
  }
}

run().catch(console.error)
