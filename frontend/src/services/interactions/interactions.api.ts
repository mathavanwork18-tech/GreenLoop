import { supabase, getDevDemoSession } from '../../utils/supabase'

export interface PostCommentItem {
  id: string
  userId: string
  user: string
  text: string
  time: string
}

export interface NotificationRecord {
  id: string
  recipient_id: string
  title: string
  message: string
  type: string
  post_id?: string | null
  is_read: boolean
  created_at: string
}

// In-flight mutex to prevent duplicate clicks per post
const inFlightLikeMutex = new Set<string>()

export const interactionsApi = {
  // --- LIKES ---

  async isPostLiked(postId: string, userId?: string): Promise<boolean> {
    if (!userId) {
      try {
        const { data } = await supabase.auth.getUser()
        userId = data?.user?.id
      } catch {}
    }
    if (!userId) return false

    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .match({ post_id: postId, user_id: userId })
      .maybeSingle()

    if (error) {
      console.warn('[Green Loop] isPostLiked error:', error.message)
      return false
    }
    return Boolean(data)
  },

  async getLikesCount(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error) {
      console.warn('[Green Loop] getLikesCount error:', error.message)
      return 0
    }
    return count || 0
  },

  async toggleLike(postId: string, suppliedUserId?: string): Promise<{ liked: boolean; count: number }> {
    // 1. Double-click concurrency protection
    if (inFlightLikeMutex.has(postId)) {
      const count = await this.getLikesCount(postId)
      const liked = await this.isPostLiked(postId, suppliedUserId)
      return { liked, count }
    }

    inFlightLikeMutex.add(postId)

    try {
      // 2. Authoritative identity verification from Supabase Auth
      let authUserId = suppliedUserId
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user?.id) {
        authUserId = authData.user.id
      }

      if (!authUserId) {
        throw new Error('You must be signed in to like a post.')
      }

      // 3. Check existing database record
      const { data: existingLike, error: fetchErr } = await supabase
        .from('post_likes')
        .select('id')
        .match({ post_id: postId, user_id: authUserId })
        .maybeSingle()

      if (fetchErr) {
        throw new Error(fetchErr.message || 'Database error while checking like status.')
      }

      let isNowLiked = false

      if (existingLike) {
        // Unlike: delete database record
        const { error: deleteErr } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: authUserId })

        if (deleteErr) {
          throw new Error(deleteErr.message || 'Failed to remove like from database.')
        }
        isNowLiked = false
      } else {
        // Like: insert database record
        const { error: insertErr } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: authUserId })

        if (insertErr) {
          // If code is 23505, unique constraint caught duplicate concurrent insert
          if (insertErr.code === '23505') {
            isNowLiked = true
          } else {
            throw new Error(insertErr.message || 'Failed to record like in database.')
          }
        } else {
          isNowLiked = true
        }
      }

      // 4. Return database count and state
      const count = await this.getLikesCount(postId)
      return { liked: isNowLiked, count }
    } finally {
      inFlightLikeMutex.delete(postId)
    }
  },

  // --- COMMENTS ---

  async getComments(postId: string): Promise<PostCommentItem[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, comment, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('[Green Loop] Fetch comments error:', error.message)
      return []
    }

    if (!data || data.length === 0) return []

    // Fetch author profile names
    const userIds = Array.from(new Set(data.map((c: any) => c.user_id).filter(Boolean)))
    let profMap = new Map<string, string>()

    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      if (profs) {
        profMap = new Map(profs.map((p: any) => [p.id, p.full_name || 'Community Member']))
      }
    }

    return data.map((c: any) => ({
      id: String(c.id),
      userId: c.user_id,
      user: profMap.get(c.user_id) || 'Community Member',
      text: c.comment,
      time: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    }))
  },

  async addComment(postId: string, userId: string, comment: string): Promise<PostCommentItem> {
    if (!userId) {
      throw new Error('You must be logged in to comment.')
    }
    if (!comment.trim()) {
      throw new Error('Comment cannot be empty.')
    }

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        comment: comment.trim(),
      })
      .select('id, post_id, user_id, comment, created_at')
      .single()

    if (error) {
      console.error('[Green Loop] Add comment error:', error)
      throw new Error(error.message || 'Failed to post comment.')
    }

    // Lookup commenter profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()

    return {
      id: String(data.id),
      userId: data.user_id,
      user: profile?.full_name || 'You',
      text: data.comment,
      time: 'Just now',
    }
  },

  // --- CLAIMS ---

  async getPostClaim(postId: string, userId?: string) {
    if (!userId) return null
    const { data, error } = await supabase
      .from('post_claims')
      .select('*')
      .match({ post_id: postId, user_id: userId })
      .maybeSingle()

    if (error) {
      console.warn('[Green Loop] getPostClaim error:', error.message)
      return null
    }
    return data
  },

  // DEMO AUTH ONLY — Temporary dummy authentication for testing. Replace with real Supabase Phone OTP before production.
  async claimPost(postId: string, userId?: string): Promise<{ success: boolean; claim: any }> {
    let resolvedUserId = userId
    if (!resolvedUserId) {
      const demoSession = getDevDemoSession()
      resolvedUserId = demoSession?.profile_id || demoSession?.id
    }
    if (!resolvedUserId && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gl_user')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.id) resolvedUserId = parsed.id
        }
      } catch {}
    }

    if (!resolvedUserId) {
      throw new Error('You must be signed in to claim an e-waste listing.')
    }

    // 1. Verify listing exists and is available
    const { data: post, error: postErr } = await supabase
      .from('e_waste_posts')
      .select('id, user_id, status')
      .eq('id', postId)
      .maybeSingle()

    if (postErr || !post) {
      throw new Error('This listing could not be found or has been removed.')
    }

    if (post.status && post.status !== 'available') {
      throw new Error(`This listing is no longer available (Status: ${post.status}).`)
    }

    if (post.user_id && post.user_id === resolvedUserId) {
      throw new Error('You cannot purchase your own listing.')
    }

    // 2. Duplicate check
    const existing = await this.getPostClaim(postId, resolvedUserId)
    if (existing) {
      return { success: true, claim: existing }
    }

    // 3. Insert claim
    const { data, error } = await supabase
      .from('post_claims')
      .insert({
        post_id: postId,
        user_id: resolvedUserId,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) {
      console.error('[Green Loop] Claim post error:', error)
      throw new Error(error.message || 'Failed to claim listing.')
    }

    return { success: true, claim: data }
  },

  // --- NOTIFICATIONS ---

  async getUserNotifications(userId: string): Promise<NotificationRecord[]> {
    if (!userId) return []
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Green Loop] Fetch notifications error:', error.message)
      return []
    }
    return data || []
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.warn('[Green Loop] markAsRead error:', error.message)
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!userId) return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)

    if (error) {
      console.warn('[Green Loop] markAllAsRead error:', error.message)
    }
  },
}
