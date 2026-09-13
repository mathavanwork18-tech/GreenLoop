import { postsApi } from '../../../services/posts/posts.api'
import { mapsApi } from '../../../services/maps/maps.api'
import { recommendationEngine } from '../../../services/ai/recommendationEngine'
import { recommendationTracker } from '../../../services/ai/recommendationTracker'
import type { Post } from '../../../types/post.types'
import type { EcosystemPartner } from '../../../types/map.types'
import type { AppRole } from '../../../services/role/roleService'
import type { CandidatePostScore } from '../../../types/recommendation.types'

export interface HomeFeedResult {
  posts: Post[]
  recommended: Post[]
  nearby: EcosystemPartner[]
  debugScores?: CandidatePostScore[]
}

export const homeApi = {
  async getHomeFeed(options?: { userId?: string; role?: AppRole }): Promise<HomeFeedResult> {
    const [allPosts, allPartners] = await Promise.all([
      postsApi.getPosts(),
      mapsApi.getPartners(),
    ])

    // Track home feed view
    recommendationTracker.trackEvent('HOME_VIEW', { userId: options?.userId })

    // Execute Personalized AI Recommendation Engine
    const recResult = await recommendationEngine.getPersonalizedFeed({
      userId: options?.userId,
      role: options?.role || 'citizen',
      posts: allPosts,
      limit: allPosts.length,
    })

    // Label posts with explanation tags
    const rankedWithReasons = recResult.rankedPosts.map((p) => {
      const reason = recResult.explanationMap[p.id]
      return {
        ...p,
        recommendationReason: reason || 'Recommended for you',
      }
    })

    // Top recommended slice
    const recommended = rankedWithReasons.slice(0, 6)

    return {
      posts: rankedWithReasons,
      recommended,
      nearby: allPartners.slice(0, 4),
      debugScores: recResult.scores,
    }
  },

  async toggleLike(postId: string, userId?: string, category?: string): Promise<Post[]> {
    const updated = await postsApi.toggleLike(postId)
    const isLikedNow = updated.find((p) => p.id === postId)?.liked
    if (isLikedNow) {
      recommendationTracker.trackPostLike(userId, postId, category)
    } else {
      recommendationTracker.trackPostUnlike(userId, postId, category)
    }
    return updated
  },

  async toggleSave(postId: string, userId?: string, category?: string): Promise<Post[]> {
    const updated = await postsApi.toggleSave(postId)
    const isSavedNow = updated.find((p) => p.id === postId)?.saved
    if (isSavedNow) {
      recommendationTracker.trackPostSave(userId, postId, category)
    }
    return updated
  },
}
