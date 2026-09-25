import { supabase } from '../../utils/supabase'
import { detectLanguage } from '../translation/translationService'
import { normalizeLanguage } from '../../i18n/languages'

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
  original_title?: string
  original_description?: string
  original_language?: string
  [key: string]: any
}

/**
 * 1. Create a post in public.e_waste_posts
 * Inserts a new e-waste listing associated with the authenticated Supabase user.
 * Preserves the pristine original title, description, and original language.
 */
export async function createPost(params: CreatePostParams) {
  let user: { id: string; [key: string]: any } | null = null

  try {
    const { data: authData } = await supabase.auth.getUser()
    if (authData?.user?.id) {
      user = authData.user
    }
  } catch {}

  if (!user) {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('gl_user') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.id) user = { id: parsed.id }
      } catch {}
    }
  }

  if (!user) {
    throw new Error('Please sign in to create an e-waste listing.')
  }

  const detectedLang = normalizeLanguage(
    params.original_language ||
    detectLanguage((params.title || '') + ' ' + (params.description || ''))
  )

  const rawTitle = params.original_title || params.title
  const rawDesc = params.original_description !== undefined ? params.original_description : (params.description || '')

  const fullPayload: any = {
    user_id: user.id,
    title: rawTitle,
    description: rawDesc,
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
    original_title: rawTitle,
    original_description: rawDesc,
    original_language: detectedLang,
  }

  let data: any = null
  let insertErr: any = null

  // First try inserting with multilingual columns
  const res = await supabase.from('e_waste_posts').insert(fullPayload).select('*').single()
  data = res.data
  insertErr = res.error

  // If column doesn't exist on remote table yet, retry with base columns
  if (insertErr && (insertErr.message?.includes('column') || insertErr.code === '42703')) {
    console.warn('[Green Loop] Retrying insert without optional multilingual columns:', insertErr.message)
    const fallbackRow = {
      user_id: user.id,
      title: rawTitle,
      description: rawDesc,
      category: params.category || 'Other Electronics',
      subcategory: params.subcategory || params.brand || '',
      condition: params.condition || 'Good',
      status: params.status || 'available',
      asking_price: fullPayload.asking_price,
      image_url: fullPayload.image_url,
    }
    const fallbackRes = await supabase.from('e_waste_posts').insert(fallbackRow).select('*').single()
    data = fallbackRes.data
    insertErr = fallbackRes.error
  }

  if (insertErr || !data) {
    console.error('[Green Loop] Post failed on e_waste_posts:', insertErr)
    throw new Error(insertErr?.message || 'Database error: unable to save e-waste listing.')
  }

  // Ensure returned object has original fields populated
  data.original_title = data.original_title || rawTitle
  data.original_description = data.original_description || rawDesc
  data.original_language = data.original_language || detectedLang

  // Attach seller profile metadata cleanly
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, city')
      .eq('id', user.id)
      .maybeSingle()
    if (profile && data) {
      data.profiles = profile
    }
  } catch {}

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
    .neq('status', 'sold')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!resWithProfile.error && resWithProfile.data) {
    return resWithProfile.data
      .filter((p: any) => p.status !== 'sold')
      .map((p: any) => ({
        ...p,
        original_title: p.original_title || p.title,
        original_description: p.original_description !== undefined ? p.original_description : (p.description || ''),
        original_language: p.original_language || detectLanguage((p.title || '') + ' ' + (p.description || '')),
      }))
  }

  // Resilient fallback if PostgREST cache has not built explicit foreign key relation
  const directRes = await supabase
    .from('e_waste_posts')
    .select('id, user_id, title, description, category, subcategory, condition, status, asking_price, image_url, created_at, updated_at')
    .neq('status', 'sold')
    .order('created_at', { ascending: false })
    .range(from, to)

  const data = (directRes.data || []).filter((p: any) => p.status !== 'sold')
  if (data.length > 0) {
    const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)))
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, phone, city').in('id', userIds)
      const profMap = new Map((profs || []).map((pr: any) => [pr.id, pr]))
      data.forEach((p: any) => {
        p.profiles = profMap.get(p.user_id) || { full_name: 'Green Loop Member' }
        p.original_title = p.original_title || p.title
        p.original_description = p.original_description !== undefined ? p.original_description : (p.description || '')
        p.original_language = p.original_language || detectLanguage((p.title || '') + ' ' + (p.description || ''))
      })
    }
  }

  if (directRes.error) {
    console.error('[Green Loop] Fetching e_waste_posts failed:', directRes.error.message)
    return []
  }

  return data.map((p: any) => ({
    ...p,
    original_title: p.original_title || p.title,
    original_description: p.original_description !== undefined ? p.original_description : (p.description || ''),
    original_language: p.original_language || detectLanguage((p.title || '') + ' ' + (p.description || '')),
  }))
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
