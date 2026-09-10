import { supabase } from '../../utils/supabase'

export interface CreatePostParams {
  title: string
  description?: string
  categoryId?: string | number | null
  imageUrl?: string | null
  [key: string]: any
}

/**
 * 1. Create a post (client script)
 * Inserts a new post associated with the authenticated Supabase user.
 */
export async function createPost({ title, description, categoryId, imageUrl, ...rest }: CreatePostParams) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (typeof window !== 'undefined') {
      alert('You must be logged in')
    }
    return null
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      description: description || '',
      category_id: categoryId || null,
      image_url: imageUrl || null,
      ...rest,
    })
    .select()

  if (error) {
    console.error('Post failed:', error.message)
    return null
  }
  return data ? data[0] : null
}

/**
 * 2. Fetch all posts for home page (with pagination)
 * Fetches active posts ordered by creation date with profiles relation.
 */
export async function fetchPosts(page = 0, pageSize = 20) {
  const from = page * pageSize
  const to = from + pageSize - 1

  let data: any = null
  let error: any = null

  const initialRes = await supabase
    .from('posts')
    .select(`
      id, title, description, image_url, status, created_at, user_id,
      profiles:user_id ( full_name )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  data = initialRes.data
  error = initialRes.error

  // Fallback if PostgREST schema cache does not have an explicit foreign key between posts and profiles
  if (error && (error as any).code === 'PGRST200') {
    const res = await supabase
      .from('posts')
      .select('id, title, description, image_url, status, created_at, user_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to)
    data = res.data
    error = res.error

    if (data && data.length > 0) {
      const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)))
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', userIds)
        const profMap = new Map((profs || []).map((pr: any) => [pr.id, pr]))
        data.forEach((p: any) => {
          p.profiles = profMap.get(p.user_id) || { full_name: 'Green Loop Member' }
        })
      }
    }
  }

  if (error) {
    console.error('Fetch failed:', error.message)
    return []
  }
  return data || []
}

/**
 * 3. Realtime — new posts appear instantly on everyone's screen
 * Subscribes to Postgres INSERT events on the public:posts table.
 */
export function subscribeToNewPosts(onNewPost: (newPost: any) => void) {
  const channel = supabase
    .channel('public:posts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts' },
      (payload) => {
        onNewPost(payload.new) // prepend to your home page list
      }
    )
    .subscribe()

  return channel // call supabase.removeChannel(channel) when leaving the page
}
