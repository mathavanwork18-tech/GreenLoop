import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

// Collect candidate words from frontend src
function getCandidateWords() {
  const words = new Set([
    'id', 'user_id', 'author_id', 'creator_id', 'owner_id', 'recipient_id', 'sender_id', 'actor_id', 'claimant_id',
    'post_id', 'listing_id', 'item_id', 'category_id', 'center_id', 'facility_id', 'recycling_center_id', 'pickup_id', 'request_id',
    'title', 'name', 'full_name', 'username', 'email', 'phone', 'contact_phone', 'role', 'city', 'address', 'area', 'landmark',
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
    'source', 'destination', 'target', 'driver_id', 'agent_id', 'tracking_number', 'reference_id', 'code'
  ])

  // Walk frontend/src and extract snake_case and camelCase identifiers
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory() && e.name !== 'node_modules' && e.name !== 'dist') {
        walkDir(full)
      } else if (e.isFile() && (e.name.endsWith('.ts') || e.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(full, 'utf8')
        const matches = content.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []
        for (const m of matches) {
          if (m.length >= 2 && m.length <= 30) {
            // Add lower case
            words.add(m.toLowerCase())
            // Convert camelCase to snake_case
            const snake = m.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
            words.add(snake)
          }
        }
      }
    }
  }

  walkDir('./frontend/src')
  return Array.from(words)
}

async function probeTableColumns(table, candidates) {
  const confirmed = []
  // Test in batches or individually
  for (const col of candidates) {
    try {
      const { error } = await supabase.from(table).select(col).limit(1)
      if (!error) {
        confirmed.push(col)
      } else if (!error.message.includes('does not exist') && !error.message.includes('Could not find')) {
        // Some other error (e.g. permission or type error) means column exists!
        confirmed.push(col)
      }
    } catch (e) {
      // ignore
    }
  }
  return confirmed
}

async function main() {
  const candidates = getCandidateWords()
  console.log(`Total candidate words to probe: ${candidates.length}`)

  const result = {}

  for (const t of tables) {
    console.log(`\nProbing table: ${t}...`)
    // First, let's test with a small set of likely columns to quickly verify
    const found = await probeTableColumns(t, candidates)
    result[t] = found
    console.log(`>>> TABLE: ${t} -> COLUMNS (${found.length}):`, found)
  }

  fs.writeFileSync('./scripts/confirmed_schema.json', JSON.stringify(result, null, 2))
  console.log('\nSaved confirmed schema to ./scripts/confirmed_schema.json')
}

main().catch(console.error)
