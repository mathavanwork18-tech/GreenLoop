import type { Post } from '../../types/post.types'
import { supabase } from '../../utils/supabase'
import {
  fetchPosts as fetchSupabasePosts,
  createPost as createSupabasePost,
  subscribeToNewPosts,
} from './supabasePosts'
import { interactionsApi } from '../interactions/interactions.api'

export { createSupabasePost, fetchSupabasePosts, subscribeToNewPosts }
export * from './supabasePosts'

function mapSupabasePostToAppPost(sbPost: any, _currentUserId?: string, likesCount: number = 0, liked: boolean = false): Post {
  const sellerName =
    sbPost.profiles?.full_name ||
    'Green Loop Citizen'

  const location =
    sbPost.profiles?.city ||
    sbPost.location ||
    'Coimbatore'

  return {
    id: String(sbPost.id),
    title: sbPost.title || 'Untitled Device',
    category: sbPost.category || 'Other Electronics',
    brand: sbPost.subcategory || 'Electronics',
    model: '',
    condition: sbPost.condition || 'Good',
    purpose: sbPost.asking_price ? 'Sell' : 'Recycle',
    price: sbPost.asking_price !== null && sbPost.asking_price !== undefined ? Number(sbPost.asking_price) : null,
    negotiable: false,
    description: sbPost.description || '',
    location,
    locationName: location,
    latitude: 11.0168,
    longitude: 76.9558,
    distance: 0.8,
    status: sbPost.status || 'available',
    seller: {
      id: sbPost.user_id,
      name: sellerName,
      role: sbPost.profiles?.role || 'citizen',
      phone: sbPost.profiles?.phone || '',
      rating: 4.9,
      verified: true,
      avatar: null,
    },
    images: sbPost.image_url
      ? [sbPost.image_url]
      : ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80'],
    createdAt: sbPost.created_at ? new Date(sbPost.created_at).toLocaleDateString() : 'Just now',
    likes: likesCount,
    comments: 0,
    liked,
    saved: false,
  }
}

export const postsApi = {
  async getPosts(): Promise<Post[]> {
    let currentUserId: string | undefined
    try {
      const { data } = await supabase.auth.getUser()
      currentUserId = data?.user?.id
    } catch {}

    try {
      const rawPosts = await fetchSupabasePosts(0, 50)
      if (rawPosts && rawPosts.length > 0) {
        // Fetch like statuses and counts in parallel
        const postIds = rawPosts.map((p: any) => p.id)

        // Likes query
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id, user_id')
          .in('post_id', postIds)

        const likesByPost = new Map<string, number>()
        const userLikedPosts = new Set<string>()

        ;(likesData || []).forEach((l: any) => {
          likesByPost.set(l.post_id, (likesByPost.get(l.post_id) || 0) + 1)
          if (currentUserId && l.user_id === currentUserId) {
            userLikedPosts.add(l.post_id)
          }
        })

        const mapped = rawPosts.map((sbPost: any) =>
          mapSupabasePostToAppPost(
            sbPost,
            currentUserId,
            likesByPost.get(sbPost.id) || 0,
            userLikedPosts.has(sbPost.id)
          )
        )

        localStorage.setItem('gl_posts', JSON.stringify(mapped))
        return mapped
      }
    } catch (e) {
      console.warn('[Green Loop] Supabase fetch failed, falling back to cached posts:', e)
    }

    // Cache fallback
    const stored = localStorage.getItem('gl_posts')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }

    // Honest empty state: no mock data returned
    return []
  },

  async createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'liked' | 'saved'>
  ): Promise<Post> {
    // 1. Create real database listing in public.e_waste_posts
    const inserted = await createSupabasePost({
      title: post.title,
      description: post.description,
      category: post.category,
      subcategory: post.brand,
      condition: post.condition,
      price: post.price,
      asking_price: post.price,
      image_url: post.images?.[0] || null,
      status: 'available',
    })

    const newPost: Post = {
      ...post,
      id: String(inserted.id),
      createdAt: 'Just now',
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      seller: {
        name: inserted.profiles?.full_name || post.seller?.name || 'You',
        rating: 4.9,
        verified: true,
        avatar: null,
      },
    }

    // Sync cached storage
    try {
      const existing = await this.getPosts()
      const updated = [newPost, ...existing.filter(p => p.id !== newPost.id)]
      localStorage.setItem('gl_posts', JSON.stringify(updated))
    } catch {}

    // Trigger cross-component sync event
    window.dispatchEvent(new Event('gl_posts_updated'))
    return newPost
  },

  async editPost(postId: string, updates: Partial<Post>, currentUserName?: string): Promise<Post> {
    const existing = await this.getPosts()
    const targetPost = existing.find(p => p.id === postId)
    if (!targetPost) {
      throw new Error('Post not found (404)')
    }

    if (currentUserName && targetPost.seller?.name && targetPost.seller.name !== currentUserName) {
      throw new Error('Unauthorized to edit this post (403)')
    }

    // Update in Supabase e_waste_posts
    await supabase
      .from('e_waste_posts')
      .update({
        title: updates.title,
        description: updates.description,
        category: updates.category,
        condition: updates.condition,
        asking_price: updates.price,
      })
      .eq('id', postId)

    let modifiedPost: Post = targetPost
    const updated = existing.map(p => {
      if (p.id === postId) {
        modifiedPost = { ...p, ...updates }
        return modifiedPost
      }
      return p
    })

    localStorage.setItem('gl_posts', JSON.stringify(updated))
    window.dispatchEvent(new Event('gl_posts_updated'))
    return modifiedPost
  },

  async toggleLike(postId: string): Promise<Post[]> {
    let currentUserId: string | undefined
    try {
      const { data } = await supabase.auth.getUser()
      currentUserId = data?.user?.id
    } catch {}

    let dbResult: { liked: boolean; count: number } | null = null
    if (currentUserId) {
      try {
        dbResult = await interactionsApi.toggleLike(postId, currentUserId)
      } catch (err) {
        console.warn('[Green Loop] DB toggleLike error:', err)
      }
    }

    const existing = await this.getPosts()
    const updated = existing.map(p => {
      if (p.id === postId) {
        const liked = dbResult ? dbResult.liked : !p.liked
        const likes = dbResult ? dbResult.count : (liked ? p.likes + 1 : Math.max(0, p.likes - 1))
        return {
          ...p,
          liked,
          likes,
        }
      }
      return p
    })
    localStorage.setItem('gl_posts', JSON.stringify(updated))
    window.dispatchEvent(new Event('gl_posts_updated'))
    return updated
  },

  async toggleSave(postId: string): Promise<Post[]> {
    const existing = await this.getPosts()
    const updated = existing.map(p => {
      if (p.id === postId) {
        return { ...p, saved: !p.saved }
      }
      return p
    })
    localStorage.setItem('gl_posts', JSON.stringify(updated))
    return updated
  },

  async deletePost(postId: string, currentUserName?: string): Promise<Post[]> {
    const existing = await this.getPosts()
    const targetPost = existing.find(p => p.id === postId)

    if (targetPost && currentUserName && targetPost.seller?.name && targetPost.seller.name !== currentUserName) {
      throw new Error('Unauthorized to delete this post (403)')
    }

    // Delete from Supabase e_waste_posts
    const { error } = await supabase
      .from('e_waste_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('[Green Loop] Delete e_waste_posts error:', error)
      throw new Error(error.message || 'Failed to delete listing from database.')
    }

    const updated = existing.filter(p => p.id !== postId)
    localStorage.setItem('gl_posts', JSON.stringify(updated))
    window.dispatchEvent(new Event('gl_posts_updated'))
    return updated
  },
}
