import type { Post } from '../../types/post.types'
import type {
  CandidatePostScore,
  RecommendationEngineOptions,
  RecommendationResult,
  UserInterestProfile,
} from '../../types/recommendation.types'
import { recommendationTracker } from './recommendationTracker'
import type { AppRole } from '../role/roleService'

// Tunable Scoring Weights
const WEIGHTS = {
  SEMANTIC: 0.35,
  BEHAVIOR: 0.2,
  RECENCY: 0.15,
  ROLE: 0.1,
  LOCAL: 0.08,
  ENGAGEMENT: 0.07,
  EXPLORATION: 0.05,
}

// Penalties
const PENALTIES = {
  RECENTLY_SEEN: 0.18,
  REPEATED_CATEGORY: 0.15,
  HIDDEN_POST: 10.0, // Absolute suppression
  REPORTED_POST: 20.0,
}

// Role Specific Priority Categories
const ROLE_PRIORITIES: Record<AppRole, string[]> = {
  citizen: ['appliances', 'laptops', 'mobile phones', 'accessories', 'batteries', 'televisions'],
  shop: ['laptops', 'mobile phones', 'computer parts', 'circuit boards', 'chargers', 'tablets'],
  company: ['bulk e-waste', 'industrial servers', 'telecom scrap', 'lead batteries', 'network equipment', 'pcb boards'],
  admin: ['laptops', 'mobile phones', 'appliances', 'bulk e-waste', 'computer parts'],
}

/**
 * Tokenizes text into normalized feature terms for resilient semantic vector comparison.
 */
function extractFeatureTokens(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['and', 'for', 'the', 'with', 'this', 'that', 'from'].includes(w))
}

/**
 * Calculates cosine similarity between two word-frequency vectors.
 */
function calculateCosineSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0

  const freqA: Record<string, number> = {}
  const freqB: Record<string, number> = {}

  tokensA.forEach((t) => (freqA[t] = (freqA[t] || 0) + 1))
  tokensB.forEach((t) => (freqB[t] = (freqB[t] || 0) + 1))

  const uniqueTerms = new Set([...Object.keys(freqA), ...Object.keys(freqB)])
  let dotProduct = 0
  let normA = 0
  let normB = 0

  uniqueTerms.forEach((term) => {
    const a = freqA[term] || 0
    const b = freqB[term] || 0
    dotProduct += a * b
    normA += a * a
    normB += b * b
  })

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

class RecommendationEngineService {
  /**
   * Main recommendation entry point.
   * Generates candidates, calculates relevance scores, applies diversification,
   * and returns the ranked personalized feed.
   */
  public async getPersonalizedFeed(options: RecommendationEngineOptions): Promise<RecommendationResult> {
    const {
      userId,
      role = 'citizen',
      posts = [],
      limit = 30,
      searchQuery = '',
      activeCategory = 'all',
      explorationRatio = 0.15,
      userLocation = { city: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    } = options

    if (!posts || posts.length === 0) {
      return { rankedPosts: [], scores: [], explanationMap: {} }
    }

    // 1. Fetch live user interest profile with recency decay
    const profile = await recommendationTracker.getUserInterestProfile(userId, role)

    // 2. Extract user query / search tokens for semantic matching
    const searchTokens = searchQuery ? extractFeatureTokens(searchQuery) : []
    const recentSearchTokens = profile.recentSearches.flatMap((s) => extractFeatureTokens(s.query))
    const userSemanticTokens = [...searchTokens, ...recentSearchTokens]

    // 3. Filter completely suppressed posts (hidden / reported)
    let validCandidatePool = posts.filter(
      (p) => !profile.hiddenPostIds.has(p.id) && !profile.reportedPostIds.has(p.id)
    )

    if (activeCategory && activeCategory !== 'all') {
      validCandidatePool = validCandidatePool.filter(
        (p) => (p.category || '').toLowerCase() === activeCategory.toLowerCase()
      )
    }

    // 4. Candidate Scoring
    const scoredCandidates: CandidatePostScore[] = validCandidatePool.map((post) => {
      return this.scorePost(post, profile, userSemanticTokens, role, userLocation)
    })

    // 5. Separate Exploitation vs. Exploration
    // Sort descending by final score
    scoredCandidates.sort((a, b) => b.finalScore - a.finalScore)

    // Check cold-start status (user has no significant category interactions)
    const isColdStart = Object.keys(profile.categoryInterests).length === 0 && profile.recentSearches.length === 0
    const effectiveExplorationRatio = isColdStart ? 0.35 : explorationRatio

    // 6. Diversification & Interleaving Algorithm
    // Prevents category exhaustion (e.g. not showing 5 laptops in a row)
    const diversifiedPosts: Post[] = []
    const explanationMap: Record<string, string> = {}
    const categoryStreak: Record<string, number> = {}
    const sellerCount: Record<string, number> = {}

    const maxPerSeller = Math.max(2, Math.floor(limit * 0.25)) // Max 25% from same seller

    const candidateQueue = [...scoredCandidates]
    const explorationPool: CandidatePostScore[] = []
    const exploitationPool: CandidatePostScore[] = []

    // Partition into pools
    candidateQueue.forEach((candidate) => {
      const catKey = (candidate.post.category || '').toLowerCase()
      const userInterest = profile.categoryInterests[catKey]?.score || 0
      if (userInterest < 0.5) {
        candidate.isExploration = true
        explorationPool.push(candidate)
      } else {
        exploitationPool.push(candidate)
      }
    })

    let selectedCount = 0
    while ((exploitationPool.length > 0 || explorationPool.length > 0) && selectedCount < limit) {
      // Determine if this slot should be an exploration item
      const shouldExplore = Math.random() < effectiveExplorationRatio && explorationPool.length > 0
      const sourcePool = shouldExplore || exploitationPool.length === 0 ? explorationPool : exploitationPool

      // Find best candidate from source pool that doesn't violate category streak or seller cap
      let pickIndex = -1
      for (let i = 0; i < sourcePool.length; i++) {
        const item = sourcePool[i]
        const cat = (item.post.category || 'other').toLowerCase()
        const seller = item.post.seller?.name || 'unknown'

        const currentCatStreak = categoryStreak[cat] || 0
        const currentSellerCount = sellerCount[seller] || 0

        // Allow item if streak < 2 and seller under quota
        if (currentCatStreak < 2 && currentSellerCount < maxPerSeller) {
          pickIndex = i
          break
        }
      }

      // If all candidates violate streak, fall back to the highest scoring available
      if (pickIndex === -1 && sourcePool.length > 0) {
        pickIndex = 0
      }

      if (pickIndex !== -1) {
        const [chosen] = sourcePool.splice(pickIndex, 1)
        const chosenCat = (chosen.post.category || 'other').toLowerCase()
        const chosenSeller = chosen.post.seller?.name || 'unknown'

        // Reset streak for other categories, increment for chosen
        Object.keys(categoryStreak).forEach((k) => {
          if (k !== chosenCat) categoryStreak[k] = 0
        })
        categoryStreak[chosenCat] = (categoryStreak[chosenCat] || 0) + 1
        sellerCount[chosenSeller] = (sellerCount[chosenSeller] || 0) + 1

        diversifiedPosts.push(chosen.post)
        explanationMap[chosen.post.id] = chosen.reason
        selectedCount++
      } else {
        break
      }
    }

    return {
      rankedPosts: diversifiedPosts,
      scores: scoredCandidates,
      explanationMap,
    }
  }

  /**
   * Evaluates and scores an individual post across 7 dimensions + penalties.
   */
  private scorePost(
    post: Post,
    profile: UserInterestProfile,
    userSemanticTokens: string[],
    role: AppRole,
    userLocation: { city?: string; lat?: number; lng?: number }
  ): CandidatePostScore {
    const postCategory = (post.category || '').toLowerCase().trim()
    const postTokens = extractFeatureTokens(`${post.title} ${post.description || ''} ${post.brand || ''} ${post.category || ''}`)

    // 1. Semantic Relevance (0.0 to 1.0)
    let semanticScore = 0.3 // baseline neutral
    if (userSemanticTokens.length > 0) {
      semanticScore = calculateCosineSimilarity(userSemanticTokens, postTokens)
    }

    // 2. Behavior Interest (0.0 to 1.0)
    const categoryInterest = profile.categoryInterests[postCategory]?.score || 0
    // Normalize using sigmoid-like curve
    const behaviorScore = Math.min(1.0, categoryInterest / 10)

    // 3. Recency Score (0.0 to 1.0)
    // Newer posts receive higher freshness
    let recencyScore = 0.5
    if (post.createdAt) {
      const isJustNow = post.createdAt.toLowerCase().includes('just') || post.createdAt.toLowerCase().includes('m')
      recencyScore = isJustNow ? 1.0 : 0.7
    }

    // 4. Role Relevance (0.0 to 1.0)
    const rolePreferredCategories = ROLE_PRIORITIES[role] || ROLE_PRIORITIES.citizen
    const roleScore = rolePreferredCategories.some((c) => postCategory.includes(c) || c.includes(postCategory))
      ? 1.0
      : 0.4

    // 5. Local Relevance (0.0 to 1.0)
    let localScore = 0.5
    if (userLocation.city && post.location) {
      if (post.location.toLowerCase().includes(userLocation.city.toLowerCase())) {
        localScore = 0.95
      }
    }
    if (post.distance !== undefined && post.distance <= 5) {
      localScore = Math.max(localScore, 1.0 - post.distance * 0.1)
    }

    // 6. Engagement Quality (0.0 to 1.0)
    const likes = post.likes || 0
    const engagementScore = Math.min(1.0, (likes * 0.1) + (post.seller?.verified ? 0.3 : 0.1))

    // 7. Exploration Score (0.0 to 1.0)
    // Reward categories the user hasn't seen much to encourage discovering new recycling options
    const explorationScore = categoryInterest === 0 ? 0.9 : Math.max(0.1, 1.0 - behaviorScore)

    // Penalties
    let penalties = 0
    // Has user recently seen this post?
    const recentlySeen = profile.recentlySeenPostIds.some((p) => p.postId === post.id)
    if (recentlySeen) {
      penalties += PENALTIES.RECENTLY_SEEN
    }

    // Combine into final weighted formula
    const finalScore = Math.max(
      0.01,
      WEIGHTS.SEMANTIC * semanticScore +
      WEIGHTS.BEHAVIOR * behaviorScore +
      WEIGHTS.RECENCY * recencyScore +
      WEIGHTS.ROLE * roleScore +
      WEIGHTS.LOCAL * localScore +
      WEIGHTS.ENGAGEMENT * engagementScore +
      WEIGHTS.EXPLORATION * explorationScore -
      penalties
    )

    // Determine user-friendly explanation label
    let reason = 'Recommended for you'
    if (behaviorScore > 0.6) {
      reason = `Based on your interest in ${post.category}`
    } else if (semanticScore > 0.5) {
      reason = 'Matches what you searched'
    } else if (localScore > 0.8) {
      reason = 'Popular near you'
    } else if (role === 'shop' && roleScore > 0.8) {
      reason = 'High-demand shop collection opportunity'
    } else if (role === 'company' && roleScore > 0.8) {
      reason = 'Enterprise circular recovery stream'
    } else if (recencyScore > 0.8) {
      reason = 'Freshly listed in your area'
    }

    return {
      post,
      semanticScore: Number(semanticScore.toFixed(3)),
      behaviorScore: Number(behaviorScore.toFixed(3)),
      recencyScore: Number(recencyScore.toFixed(3)),
      roleScore: Number(roleScore.toFixed(3)),
      localScore: Number(localScore.toFixed(3)),
      engagementScore: Number(engagementScore.toFixed(3)),
      explorationScore: Number(explorationScore.toFixed(3)),
      penalties: Number(penalties.toFixed(3)),
      finalScore: Number(finalScore.toFixed(3)),
      reason,
      isExploration: false,
    }
  }
}

export const recommendationEngine = new RecommendationEngineService()
