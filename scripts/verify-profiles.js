import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pzjczufhflhjcoorvubr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkProfiles() {
  console.log('=====================================================')
  console.log('GREEN LOOP — SUPABASE PUBLIC.PROFILES VERIFICATION')
  console.log('=====================================================\n')

  const { data, count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })

  if (error) {
    console.error('Error querying public.profiles:', error.message)
    return
  }

  console.log(`Total records in public.profiles: ${data?.length || 0}`)
  console.log('-----------------------------------------------------')

  if (!data || data.length === 0) {
    console.log('Table public.profiles currently contains 0 records.\n')
    console.log('Action needed: Please run supabase/fix_profiles_and_trigger.sql in the Supabase SQL Editor.')
  } else {
    data.forEach((p, idx) => {
      console.log(`[${idx + 1}] ID: ${p.id}`)
      console.log(`    Name   : ${p.full_name}`)
      console.log(`    Role   : ${p.role}`)
      console.log(`    City   : ${p.city}`)
      console.log(`    Phone  : ${p.phone || '(none)'}`)
      console.log(`    Created: ${p.created_at}`)
      console.log('-----------------------------------------------------')
    })
  }
}

checkProfiles()
