import type { Post } from '../../types/post.types'
import { MOCK_POSTS } from '../../data/mockData'

export const postsApi = {
  async getPosts(): Promise<Post[]> {
    await new Promise(r => setTimeout(r, 200))
    const stored = localStorage.getItem('gl_posts')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {}
    }
    return MOCK_POSTS as unknown as Post[]
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'liked' | 'saved'>): Promise<Post> {
    await new Promise(r => setTimeout(r, 400))
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
    const updated = [newPost, ...existing]
    localStorage.setItem('gl_posts', JSON.stringify(updated))
    // Trigger cross-component sync event
    window.dispatchEvent(new Event('gl_posts_updated'))
    return newPost
  },

  async editPost(postId: string, updates: Partial<Post>, currentUserName?: string): Promise<Post> {
    await new Promise(r => setTimeout(r, 300))
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
    await new Promise(r => setTimeout(r, 200))
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
