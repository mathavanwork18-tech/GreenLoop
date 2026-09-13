import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function probe() {
  const commonCols = ['id', 'user_id', 'title', 'name', 'status', 'created_at', 'category', 'category_id', 'quantity', 'weight', 'address', 'phone', 'date', 'center_id']
  const tables = ['waste_categories', 'waste_items', 'disposal_logs', 'pickup_requests']

  for (const t of tables) {
    const valid = []
    for (const c of commonCols) {
      const { error } = await supabase.from(t).select(c).limit(1)
      if (!error) valid.push(c)
    }
    console.log(`Table ${t} matched columns:`, valid)
  }
}

probe().catch(console.error)
