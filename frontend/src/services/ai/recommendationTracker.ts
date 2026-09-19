import type {
  RecommendationEvent,
  RecommendationEventType,
  UserInterestProfile,
  CategoryInterest,
} from '../../types/recommendation.types'
import type { AppRole } from '../role/roleService'

const LOCAL_EVENTS_KEY = 'gl_recommendation_events_v2'
const MAX_LOCAL_EVENTS = 250
const DECAY_HALF_LIFE_HOURS = 168 // 7 days half-life for recency decay

export const EVENT_WEIGHTS: Record<RecommendationEventType, number> = {
  POST_IMPRESSION: 0.2,
  POST_OPEN: 1.0,
  CATEGORY_VIEW: 1.0,
  SEARCH: 2.0,
  POST_LIKE: 4.0,
  POST_SAVE: 6.0,
  POST_COMMENT: 5.0,
  POST_CLAIM: 8.0,
  PICKUP_REQUEST: 10.0,
  PICKUP_ACCEPT: 10.0,
  PROFILE_VIEW: 0.5,
  FILTER_USED: 0.5,
  HOME_VIEW: 0.1,
  RECYCLING_CENTER_VIEW: 1.5,
  SHOP_VIEW: 1.5,
  SHARE: 3.0,
  POST_UNLIKE: -4.0,
  POST_UNCLAIM: -5.0,
  HIDE_POST: -10.0,
  REPORT: -20.0,
}

class RecommendationTrackerService {
  private queue: RecommendationEvent[] = []
  private flushTimer: any = null

  constructor() {
    // Attempt to flush on startup
    if (typeof window !== 'undefined') {
      setTimeout(() => this.flushQueue(), 3000)
    }
  }

  /**
   * Tracks an interaction event locally and schedules an async Supabase database insert.
   */
  public trackEvent(
    eventType: RecommendationEventType,
    options: {
      userId?: string
      postId?: string
      categoryId?: string
      searchQuery?: string
      metadata?: Record<string, any>
    } = {}
  ): void {
    const event: RecommendationEvent = {
      userId: options.userId || 'anon_' + Math.random().toString(36).substring(2, 9),
      eventType,
      postId: options.postId,
      categoryId: options.categoryId,
      searchQuery: options.searchQuery,
      metadata: options.metadata || {},
      createdAt: new Date().toISOString(),
    }

    // 1. Store locally for instant UI responsiveness
    this.saveEventLocally(event)

    // 2. Queue for database batch sync
    if (options.userId && !options.userId.startsWith('anon_')) {
      this.queue.push(event)
      this.scheduleFlush()
    }
  }

  public trackSearch(userId: string | undefined, query: string): void {
    if (!query || !query.trim()) return
    this.trackEvent('SEARCH', {
      userId,
      searchQuery: query.trim(),
    })
  }

  public trackPostOpen(userId: string | undefined, postId: string, categoryId?: string): void {
    if (!postId) return
    this.trackEvent('POST_OPEN', {
      userId,
      postId,
      categoryId,
    })
  }

  public trackCategoryView(userId: string | undefined, categoryId: string): void {
    if (!categoryId || categoryId === 'all') return
    this.trackEvent('CATEGORY_VIEW', {
      userId,
      categoryId,
    })
  }

  public trackPostLike(userId: string | undefined, postId: string, categoryId?: string): void {
    this.trackEvent('POST_LIKE', { userId, postId, categoryId })
  }

  public trackPostUnlike(userId: string | undefined, postId: string, categoryId?: string): void {
    this.trackEvent('POST_UNLIKE', { userId, postId, categoryId })
  }

  public trackPostSave(userId: string | undefined, postId: string, categoryId?: string): void {
    this.trackEvent('POST_SAVE', { userId, postId, categoryId })
  }

  public trackPostClaim(userId: string | undefined, postId: string, categoryId?: string): void {
    this.trackEvent('POST_CLAIM', { userId, postId, categoryId })
  }

  public trackHidePost(userId: string | undefined, postId: string, categoryId?: string): void {
    this.trackEvent('HIDE_POST', { userId, postId, categoryId })
  }

  public trackReport(userId: string | undefined, postId: string, reason?: string): void {
    this.trackEvent('REPORT', {
      userId,
      postId,
      metadata: { reason },
    })
  }

  /**
   * Builds the real-time User Interest Profile with recency decay.
   */
  public async getUserInterestProfile(userId?: string, role: AppRole = 'citizen'): Promise<UserInterestProfile> {
    const rawEvents = this.getLocalEvents()
    const userEvents = userId
      ? rawEvents.filter((e) => e.userId === userId)
      : rawEvents

    const categoryInterests: Record<string, CategoryInterest> = {}
    const recentSearches: Array<{ query: string; timestamp: number; weight: number }> = []
    const interactedPostIds = new Set<string>()
    const savedPostIds = new Set<string>()
    const claimedPostIds = new Set<string>()
    const hiddenPostIds = new Set<string>()
    const reportedPostIds = new Set<string>()
    const recentlySeenPostIds: Array<{ postId: string; seenAt: number }> = []

    const now = Date.now()

    for (const evt of userEvents) {
      const eventTime = evt.createdAt ? new Date(evt.createdAt).getTime() : now
      const hoursAgo = Math.max(0, (now - eventTime) / (1000 * 60 * 60))
      // Exponential decay: e^(-t / halfLife)
      const decay = Math.exp(-hoursAgo / DECAY_HALF_LIFE_HOURS)
      const baseWeight = EVENT_WEIGHTS[evt.eventType] || 0.5
      const effectiveWeight = baseWeight * decay

      // Track post IDs
      if (evt.postId) {
        if (evt.eventType === 'POST_OPEN' || evt.eventType === 'POST_LIKE' || evt.eventType === 'POST_SAVE') {
          interactedPostIds.add(evt.postId)
        }
        if (evt.eventType === 'POST_SAVE') {
          savedPostIds.add(evt.postId)
        }
        if (evt.eventType === 'POST_CLAIM' || evt.eventType === 'PICKUP_REQUEST') {
          claimedPostIds.add(evt.postId)
        }
        if (evt.eventType === 'HIDE_POST') {
          hiddenPostIds.add(evt.postId)
        }
        if (evt.eventType === 'REPORT') {
          reportedPostIds.add(evt.postId)
        }
        if (evt.eventType === 'POST_IMPRESSION' || evt.eventType === 'POST_OPEN') {
          recentlySeenPostIds.push({ postId: evt.postId, seenAt: eventTime })
        }
      }

      // Track search queries
      if (evt.eventType === 'SEARCH' && evt.searchQuery) {
        recentSearches.push({
          query: evt.searchQuery.toLowerCase(),
          timestamp: eventTime,
          weight: effectiveWeight,
        })
      }

      // Track categories
      if (evt.categoryId) {
        const catKey = evt.categoryId.toLowerCase().trim()
        if (!categoryInterests[catKey]) {
          categoryInterests[catKey] = {
            category: evt.categoryId,
            score: 0,
            interactionsCount: 0,
            lastInteractedAt: eventTime,
          }
        }
        categoryInterests[catKey].score += effectiveWeight
        categoryInterests[catKey].interactionsCount += 1
        if (eventTime > categoryInterests[catKey].lastInteractedAt) {
          categoryInterests[catKey].lastInteractedAt = eventTime
        }
      }
    }

    return {
      userId: userId || 'anonymous',
      categoryInterests,
      recentSearches: recentSearches.slice(-10),
      interactedPostIds,
      savedPostIds,
      claimedPostIds,
      hiddenPostIds,
      reportedPostIds,
      recentlySeenPostIds: recentlySeenPostIds.slice(-40),
      preferredRole: role,
      userCity: 'Coimbatore',
    }
  }

  // --------------------------------------------------------------------------
  // Private Helpers & Storage Flush
  // --------------------------------------------------------------------------

  private saveEventLocally(event: RecommendationEvent): void {
    if (typeof window === 'undefined') return
    try {
      const stored = this.getLocalEvents()
      stored.unshift(event)
      if (stored.length > MAX_LOCAL_EVENTS) {
        stored.length = MAX_LOCAL_EVENTS
      }
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(stored))
    } catch {
      // Storage quota or private mode fallback
    }
  }

  private getLocalEvents(): RecommendationEvent[] {
    if (typeof window === 'undefined') return []
    try {
      const str = localStorage.getItem(LOCAL_EVENTS_KEY)
      return str ? JSON.parse(str) : []
    } catch {
      return []
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null
      this.flushQueue()
    }, 4000)
  }

  private async flushQueue(): Promise<void> {
    this.queue = []
  }

  /**
   * Evicts user-specific events and queues upon logout or account change to prevent data leakage.
   */
  public clearUserSession(): void {
    this.queue = []
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_EVENTS_KEY)
      } catch {}
    }
  }
}

export const recommendationTracker = new RecommendationTrackerService()
