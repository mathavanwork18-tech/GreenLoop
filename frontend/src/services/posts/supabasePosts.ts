import { supabase } from '../../utils/supabase'

export interface CreatePostParams {
  title: string
  description?: string
  category?: string
  subcategory?: string
  condition?: string
  status?: string
  price?: number | null
  asking_price?: number | null
  imageUrl?: string | null
  image_url?: string | null
  brand?: string
  model?: string
  [key: string]: any
}

/**
 * 1. Create a post in public.e_waste_posts
 * Inserts a new e-waste listing associated with the authenticated Supabase user.
 */
export async function createPost(params: CreatePostParams) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be signed in to create an e-waste listing.')
  }

  const newRow = {
    user_id: user.id,
    title: params.title,
    description: params.description || '',
    category: params.category || 'Other Electronics',
    subcategory: params.subcategory || params.brand || '',
    condition: params.condition || 'Good',
    status: params.status || 'available',
    asking_price:
      params.asking_price !== undefined && params.asking_price !== null
        ? Number(params.asking_price)
        : params.price !== undefined && params.price !== null
        ? Number(params.price)
        : null,
    image_url: params.image_url || params.imageUrl || (params.images && params.images[0]) || null,
  }

  const { data, error } = await supabase
    .from('e_waste_posts')
    .insert(newRow)
    .select('*, profiles:user_id ( full_name, phone, city )')
    .single()

  if (error) {
    console.error('[Green Loop] Post failed on e_waste_posts:', error)
    throw new Error(error.message || 'Database error: unable to save e-waste listing.')
  }

  return data
}

/**
 * 2. Fetch all e-waste listings for the home feed (with pagination)
 * Fetches listings ordered by creation date with profiles relation.
 */
export async function fetchPosts(page = 0, pageSize = 30) {
  const from = page * pageSize
  const to = from + pageSize - 1

  // Primary attempt: relational select joined with public.profiles
  const resWithProfile = await supabase
    .from('e_waste_posts')
    .select(`
      id, user_id, title, description, category, subcategory, condition, status, asking_price, image_url, created_at, updated_at,
      profiles:user_id ( full_name, phone, city )
    `)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!resWithProfile.error && resWithProfile.data) {
    return resWithProfile.data
  }

  // Resilient fallback if PostgREST cache has not built explicit foreign key relation
  const directRes = await supabase
    .from('e_waste_posts')
    .select('id, user_id, title, description, category, subcategory, condition, status, asking_price, image_url, created_at, updated_at')
    .order('created_at', { ascending: false })
    .range(from, to)

  const data = directRes.data || []
  if (data.length > 0) {
    const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)))
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, phone, city').in('id', userIds)
      const profMap = new Map((profs || []).map((pr: any) => [pr.id, pr]))
      data.forEach((p: any) => {
        p.profiles = profMap.get(p.user_id) || { full_name: 'Green Loop Member' }
      })
    }
  }

  if (directRes.error) {
    console.error('[Green Loop] Fetching e_waste_posts failed:', directRes.error.message)
    return []
  }

  return data
}

/**
 * 3. Realtime — new posts appear instantly on everyone's screen
 * Subscribes to Postgres INSERT events on the public:e_waste_posts table.
 */
export function subscribeToNewPosts(onNewPost: (newPost: any) => void) {
  const channel = supabase
    .channel('public:e_waste_posts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'e_waste_posts' },
      (payload) => {
        onNewPost(payload.new)
      }
    )
    .subscribe()

  return channel
}
