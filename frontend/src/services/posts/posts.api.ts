import type { Post } from '../../types/post.types'
import { MOCK_POSTS } from '../../data/mockData'
import { supabase } from '../../utils/supabase'
import { fetchPosts as fetchSupabasePosts, createPost as createSupabasePost, subscribeToNewPosts } from './supabasePosts'

export { createSupabasePost, fetchSupabasePosts, subscribeToNewPosts }
export * from './supabasePosts'

function mapSupabasePostToAppPost(sbPost: any): Post {
  return {
    id: String(sbPost.id),
    title: sbPost.title || 'Untitled Device',
    category: sbPost.category || 'Other Electronics',
    brand: sbPost.brand || 'Electronics',
    model: sbPost.model || '',
    condition: sbPost.condition || 'Good',
    purpose: sbPost.purpose || (sbPost.price ? 'Sell' : 'Donate'),
    price: sbPost.price ?? null,
    negotiable: sbPost.negotiable ?? false,
    description: sbPost.description || '',
    location: sbPost.location || 'Coimbatore',
    locationName: sbPost.location_name || sbPost.location || 'Coimbatore',
    latitude: sbPost.latitude || 11.0168,
    longitude: sbPost.longitude || 76.9558,
    distance: sbPost.distance || 0.8,
    status: sbPost.status || 'available',
    seller: {
      name: sbPost.profiles?.full_name || 'Community Member',
      rating: 4.9,
      verified: true,
      avatar: null,
    },
    images: sbPost.image_url ? [sbPost.image_url] : (sbPost.images || ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80']),
    createdAt: sbPost.created_at ? new Date(sbPost.created_at).toLocaleDateString() : 'Just now',
    likes: sbPost.likes || 0,
    comments: sbPost.comments || 0,
    liked: false,
    saved: false,
  }
}

export const postsApi = {
  async getPosts(): Promise<Post[]> {
    let supabaseItems: Post[] = []
    try {
      const rawPosts = await fetchSupabasePosts(0, 50)
      if (rawPosts && rawPosts.length > 0) {
        supabaseItems = rawPosts.map(mapSupabasePostToAppPost)
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local/cached posts:', e)
    }

    const stored = localStorage.getItem('gl_posts')
    let localItems: Post[] = []
    if (stored) {
      try {
        localItems = JSON.parse(stored)
      } catch {}
    } else {
      localItems = MOCK_POSTS as unknown as Post[]
    }

    if (supabaseItems.length > 0) {
      // Merge unique by ID
      const existingIds = new Set(supabaseItems.map(p => p.id))
      const combined = [...supabaseItems, ...localItems.filter(p => !existingIds.has(p.id))]
      return combined
    }

    return localItems
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'liked' | 'saved'>): Promise<Post> {
    const existing = await this.getPosts()
    const newPost: Post = {
      ...post,
      id: 'p_' + Date.now(),
      createdAt: 'Just now',
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
    }

    // Try syncing to Supabase if authenticated
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user) {
        await supabase.from('posts').insert({
          user_id: authData.user.id,
          title: post.title,
          description: post.description,
          image_url: post.images?.[0] || null,
          category: post.category,
          brand: post.brand,
          model: post.model,
          condition: post.condition,
          price: post.price,
          status: 'active'
        })
      }
    } catch (err) {
      console.warn('Supabase post insert skipped/failed:', err)
    }

    const updated = [newPost, ...existing]
    localStorage.setItem('gl_posts', JSON.stringify(updated))
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

    // Authorization check
    if (currentUserName && targetPost.seller?.name && targetPost.seller.name !== currentUserName) {
      throw new Error('Unauthorized to edit this post (403)')
    }

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
    const existing = await this.getPosts()
    const updated = existing.map(p => {
      if (p.id === postId) {
        const liked = !p.liked
        return {
          ...p,
          liked,
          likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1)
        }
      }
      return p
    })
    localStorage.setItem('gl_posts', JSON.stringify(updated))
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

    // Authorization check if username provided
    if (targetPost && currentUserName && targetPost.seller?.name && targetPost.seller.name !== currentUserName) {
      throw new Error('Unauthorized to delete this post (403)')
    }

    const updated = existing.filter(p => p.id !== postId)
    localStorage.setItem('gl_posts', JSON.stringify(updated))
    // Trigger cross-component sync event
    window.dispatchEvent(new Event('gl_posts_updated'))
    return updated
  }
}
