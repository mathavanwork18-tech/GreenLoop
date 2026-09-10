import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzjczufhflhjcoorvubr.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HJb_pksA76xI71dh3YFGJw_ZQcfrrYt'

export const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
