import { useState, useEffect, useCallback } from 'react'
import { homeApi } from '../services/home.api'
import { subscribeToNewPosts } from '../../../services/posts/supabasePosts'
import { supabase } from '../../../utils/supabase'
import type { Post } from '../../../types/post.types'
import type { EcosystemPartner } from '../../../types/map.types'

export function useHomeFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [recommended, setRecommended] = useState<Post[]>([])
  const [nearby, setNearby] = useState<EcosystemPartner[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeed = useCallback(async () => {
    try {
      const data = await homeApi.getHomeFeed()
      setPosts(data.posts)
      setRecommended(data.recommended)
      setNearby(data.nearby)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFeed()

    // Realtime — new posts appear instantly on everyone's screen
    const channel = subscribeToNewPosts((newPost: any) => {
      const mappedPost: Post = {
        id: String(newPost.id || 'p_' + Date.now()),
        title: newPost.title || 'New E-Waste Listing',
        category: newPost.category || 'Other Electronics',
        brand: newPost.brand || 'Electronics',
        model: newPost.model || '',
        condition: newPost.condition || 'Good',
        purpose: newPost.purpose || (newPost.price ? 'Sell' : 'Donate'),
        price: newPost.price ?? null,
        negotiable: false,
        description: newPost.description || '',
        location: newPost.location || 'Coimbatore',
        locationName: newPost.location || 'Coimbatore',
        latitude: 11.0168,
        longitude: 76.9558,
        distance: 0.8,
        status: 'available',
        seller: {
          name: newPost.profiles?.full_name || 'Community Member',
          rating: 4.9,
          verified: true,
          avatar: null,
        },
        images: newPost.image_url ? [newPost.image_url] : ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80'],
        createdAt: 'Just now',
        likes: 0,
        comments: 0,
        liked: false,
        saved: false,
      }
      setPosts((prev) => [mappedPost, ...prev])
    })

    // Real-time synchronization across Post, Marketplace, and Map (in-tab / cross-tab)
    const handleSync = () => loadFeed()
    window.addEventListener('gl_posts_updated', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      window.removeEventListener('gl_posts_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [loadFeed])

  const handleToggleLike = async (postId: string) => {
    const updated = await homeApi.toggleLike(postId)
    setPosts(updated)
    setRecommended(updated.filter(p => p.recommended || p.likes > 8))
  }

  const handleToggleSave = async (postId: string) => {
    const updated = await homeApi.toggleSave(postId)
    setPosts(updated)
  }

  return {
    posts,
    setPosts,
    recommended,
    nearby,
    loading,
    refreshFeed: loadFeed,
    handleToggleLike,
    handleToggleSave,
  }
}
