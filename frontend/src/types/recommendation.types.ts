import type { Post } from './post.types'
import type { AppRole } from '../services/role/roleService'

export type RecommendationEventType =
  | 'HOME_VIEW'
  | 'SEARCH'
  | 'POST_IMPRESSION'
  | 'POST_OPEN'
  | 'POST_LIKE'
  | 'POST_UNLIKE'
  | 'POST_COMMENT'
  | 'POST_CLAIM'
  | 'POST_UNCLAIM'
  | 'POST_SAVE'
  | 'CATEGORY_VIEW'
  | 'RECYCLING_CENTER_VIEW'
  | 'SHOP_VIEW'
  | 'PICKUP_REQUEST'
  | 'PICKUP_ACCEPT'
  | 'PROFILE_VIEW'
  | 'FILTER_USED'
  | 'SHARE'
  | 'REPORT'
  | 'HIDE_POST'

export interface RecommendationEvent {
  id?: string
  userId: string
  eventType: RecommendationEventType
  postId?: string
  categoryId?: string
  searchQuery?: string
  metadata?: Record<string, any>
  createdAt?: string
}

export interface CategoryInterest {
  category: string
  score: number // Decayed cumulative weight
  interactionsCount: number
  lastInteractedAt: number
}

export interface UserInterestProfile {
  userId: string
  categoryInterests: Record<string, CategoryInterest>
  recentSearches: Array<{ query: string; timestamp: number; weight: number }>
  interactedPostIds: Set<string>
  savedPostIds: Set<string>
  claimedPostIds: Set<string>
  hiddenPostIds: Set<string>
  reportedPostIds: Set<string>
  recentlySeenPostIds: Array<{ postId: string; seenAt: number }>
  preferredRole: AppRole
  userCity: string
}

export interface CandidatePostScore {
  post: Post
  semanticScore: number
  behaviorScore: number
  recencyScore: number
  roleScore: number
  localScore: number
  engagementScore: number
  explorationScore: number
  penalties: number
  finalScore: number
  reason: string
  isExploration: boolean
}

export interface RecommendationEngineOptions {
  userId?: string
  role?: AppRole
  userLocation?: { city?: string; lat?: number; lng?: number }
  posts: Post[]
  limit?: number
  searchQuery?: string
  activeCategory?: string
  explorationRatio?: number // e.g. 0.15 (15% explore)
}

export interface RecommendationResult {
  rankedPosts: Post[]
  scores: CandidatePostScore[]
  explanationMap: Record<string, string>
}
