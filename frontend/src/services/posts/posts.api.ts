import type { Post } from '../../types/post.types'
import {
  fetchPosts as fetchSupabasePosts,
  createPost as createSupabasePost,
  subscribeToNewPosts,
} from './supabasePosts'

export { createSupabasePost, fetchSupabasePosts, subscribeToNewPosts }
export * from './supabasePosts'

function mapRawPostToAppPost(rawPost: any, likesCount: number = 0, liked: boolean = false): Post {
  const sellerName =
    rawPost.profiles?.full_name ||
    'Green Loop Citizen'

  const location =
    rawPost.profiles?.city ||
    rawPost.location ||
    'Coimbatore'

  return {
    id: String(rawPost.id),
    title: rawPost.title || 'Untitled Device',
    category: rawPost.category || 'Other Electronics',
    brand: rawPost.subcategory || 'Electronics',
    model: '',
    condition: rawPost.condition || 'Good',
    purpose: rawPost.asking_price ? 'Sell' : 'Recycle',
    price: rawPost.asking_price !== null && rawPost.asking_price !== undefined ? Number(rawPost.asking_price) : null,
    negotiable: false,
    description: rawPost.description || '',
    location,
    locationName: location,
    latitude: 11.0168,
    longitude: 76.9558,
    distance: 0.8,
    status: rawPost.status || 'available',
    seller: {
      name: sellerName,
      rating: 4.9,
      verified: true,
      avatar: null,
    },
    images: rawPost.image_url
      ? [rawPost.image_url]
      : ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80'],
    createdAt: rawPost.created_at ? new Date(rawPost.created_at).toLocaleDateString() : 'Just now',
    likes: likesCount,
    comments: 0,
    liked,
    saved: false,
  }
}

export const postsApi = {
  async getPosts(): Promise<Post[]> {
    // 1. Check local cache
    const stored = localStorage.getItem('gl_posts')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }

    // 2. Fetch raw posts and map
    const rawPosts = await fetchSupabasePosts(0, 50)
    const mapped = (rawPosts || []).map((p: any) => mapRawPostToAppPost(p))
    localStorage.setItem('gl_posts', JSON.stringify(mapped))
    return mapped
  },

  async createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'liked' | 'saved'>
  ): Promise<Post> {
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

    try {
      const existing = await this.getPosts()
      const updated = [newPost, ...existing.filter(p => p.id !== newPost.id)]
      localStorage.setItem('gl_posts', JSON.stringify(updated))
    } catch {}

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
        const likes = liked ? p.likes + 1 : Math.max(0, p.likes - 1)
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

    const updated = existing.filter(p => p.id !== postId)
    localStorage.setItem('gl_posts', JSON.stringify(updated))
    window.dispatchEvent(new Event('gl_posts_updated'))
    return updated
  },
}
