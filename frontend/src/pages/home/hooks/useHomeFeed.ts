import { useState, useEffect, useCallback } from 'react'
import { homeApi } from '../services/home.api'
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

    // Real-time synchronization across Post, Marketplace, and Map
    const handleSync = () => loadFeed()
    window.addEventListener('gl_posts_updated', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
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
