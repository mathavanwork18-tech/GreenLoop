import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testRelations() {
  console.log('Testing PostgREST foreign key relations...\n')

  const relations = [
    { from: 'e_waste_posts', to: 'profiles', query: '*, profiles:user_id(id, full_name)' },
    { from: 'post_likes', to: 'e_waste_posts', query: '*, e_waste_posts(id, title)' },
    { from: 'post_likes', to: 'posts', query: '*, posts(id, title)' },
    { from: 'post_likes', to: 'profiles', query: '*, profiles:user_id(id, full_name)' },
    { from: 'post_comments', to: 'e_waste_posts', query: '*, e_waste_posts(id, title)' },
    { from: 'post_comments', to: 'posts', query: '*, posts(id, title)' },
    { from: 'post_comments', to: 'profiles', query: '*, profiles:user_id(id, full_name)' },
    { from: 'post_claims', to: 'e_waste_posts', query: '*, e_waste_posts(id, title)' },
    { from: 'post_claims', to: 'posts', query: '*, posts(id, title)' },
    { from: 'post_claims', to: 'profiles', query: '*, profiles:user_id(id, full_name)' },
    { from: 'notifications', to: 'e_waste_posts', query: '*, e_waste_posts(id, title)' },
    { from: 'notifications', to: 'posts', query: '*, posts(id, title)' },
    { from: 'notifications', to: 'profiles', query: '*, profiles:recipient_id(id, full_name)' },
    { from: 'pickup_requests', to: 'profiles', query: '*, profiles:user_id(id, full_name)' },
    { from: 'pickup_requests', to: 'waste_categories', query: '*, waste_categories(id, name)' },
    { from: 'waste_items', to: 'pickup_requests', query: '*, pickup_requests(id, status)' },
    { from: 'waste_items', to: 'waste_categories', query: '*, waste_categories(id, name)' },
    { from: 'disposal_logs', to: 'pickup_requests', query: '*, pickup_requests(id, status)' },
    { from: 'posts', to: 'waste_categories', query: '*, waste_categories(id, name)' }
  ]

  for (const r of relations) {
    const { error } = await supabase.from(r.from).select(r.query).limit(0)
    const status = error ? `FAIL (${error.message})` : 'VALID RELATION'
    console.log(`${(r.from + ' -> ' + r.to).padEnd(35)}: ${status}`)
  }
}

testRelations().catch(console.error)
