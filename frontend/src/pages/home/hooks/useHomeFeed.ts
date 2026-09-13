import { useState, useEffect, useCallback } from 'react'
import { homeApi } from '../services/home.api'
import { subscribeToNewPosts } from '../../../services/posts/supabasePosts'
import { supabase } from '../../../utils/supabase'
import { useAuth } from '../../../context/AuthContext'
import { normalizeRole } from '../../../services/role/roleService'
import { recommendationTracker } from '../../../services/ai/recommendationTracker'
import type { Post } from '../../../types/post.types'
import type { EcosystemPartner } from '../../../types/map.types'
import type { CandidatePostScore } from '../../../types/recommendation.types'

export function useHomeFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [recommended, setRecommended] = useState<Post[]>([])
  const [nearby, setNearby] = useState<EcosystemPartner[]>([])
  const [debugScores, setDebugScores] = useState<CandidatePostScore[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = normalizeRole(user?.role)

  const loadFeed = useCallback(async () => {
    try {
      const data = await homeApi.getHomeFeed({
        userId: user?.id,
        role: userRole,
      })
      setPosts(data.posts)
      setRecommended(data.recommended)
      setNearby(data.nearby)
      if (data.debugScores) {
        setDebugScores(data.debugScores)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, userRole])

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
        recommendationReason: 'Freshly listed in your area',
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
    const post = posts.find((p) => p.id === postId)
    const updated = await homeApi.toggleLike(postId, user?.id, post?.category)
    setPosts(updated)
    setRecommended(updated.filter((p) => p.recommended || p.likes > 8))
  }

  const handleToggleSave = async (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    const updated = await homeApi.toggleSave(postId, user?.id, post?.category)
    setPosts(updated)
  }

  const handleTrackPostOpen = (post: Post) => {
    recommendationTracker.trackPostOpen(user?.id, post.id, post.category)
  }

  const handleTrackSearch = (query: string) => {
    recommendationTracker.trackSearch(user?.id, query)
  }

  return {
    posts,
    setPosts,
    recommended,
    nearby,
    debugScores,
    loading,
    refreshFeed: loadFeed,
    handleToggleLike,
    handleToggleSave,
    handleTrackPostOpen,
    handleTrackSearch,
  }
}
