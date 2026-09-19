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

function getStoredLikes(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem('gl_post_likes')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

function saveStoredLikes(likes: Record<string, string[]>) {
  try {
    localStorage.setItem('gl_post_likes', JSON.stringify(likes))
  } catch {}
}

function getStoredComments(): Record<string, PostCommentItem[]> {
  try {
    const raw = localStorage.getItem('gl_post_comments')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

function saveStoredComments(comments: Record<string, PostCommentItem[]>) {
  try {
    localStorage.setItem('gl_post_comments', JSON.stringify(comments))
  } catch {}
}

function getStoredNotifications(): NotificationRecord[] {
  try {
    const raw = localStorage.getItem('gl_notifications')
    if (raw) return JSON.parse(raw)
  } catch {}
  return [
    {
      id: 'notif-1',
      recipient_id: 'u-101',
      title: 'Welcome Bonus Credited!',
      message: 'You have received 100 Green Coins for joining Green Loop.',
      type: 'reward',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      recipient_id: 'u-101',
      title: 'E-Waste Drive Tomorrow',
      message: 'Neighborhood collection drive starts tomorrow at 10:00 AM.',
      type: 'event',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]
}

function saveStoredNotifications(notifs: NotificationRecord[]) {
  try {
    localStorage.setItem('gl_notifications', JSON.stringify(notifs))
  } catch {}
}

export const interactionsApi = {
  // --- LIKES ---

  async isPostLiked(postId: string, userId?: string): Promise<boolean> {
    if (!userId) return false
    const likes = getStoredLikes()
    const postLikes = likes[postId] || []
    return postLikes.includes(userId)
  },

  async getLikesCount(postId: string): Promise<number> {
    const likes = getStoredLikes()
    return (likes[postId] || []).length
  },

  async toggleLike(postId: string, suppliedUserId?: string): Promise<{ liked: boolean; count: number }> {
    const userId = suppliedUserId || 'u-local'
    const likes = getStoredLikes()
    const postLikes = likes[postId] || []

    let isNowLiked = false
    if (postLikes.includes(userId)) {
      likes[postId] = postLikes.filter(id => id !== userId)
      isNowLiked = false
    } else {
      likes[postId] = [...postLikes, userId]
      isNowLiked = true
    }

    saveStoredLikes(likes)
    return { liked: isNowLiked, count: likes[postId].length }
  },

  // --- COMMENTS ---

  async getComments(postId: string): Promise<PostCommentItem[]> {
    const allComments = getStoredComments()
    return allComments[postId] || [
      {
        id: 'c1',
        userId: 'u-102',
        user: 'CircuitFix Repair Hub',
        text: 'Available for immediate pickup and evaluation.',
        time: '1 hour ago',
      },
    ]
  },

  async addComment(postId: string, userId: string, comment: string): Promise<PostCommentItem> {
    if (!comment.trim()) {
      throw new Error('Comment cannot be empty.')
    }

    let userName = 'Community Member'
    try {
      const stored = localStorage.getItem('gl_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        userName = parsed.name || userName
      }
    } catch {}

    const newComment: PostCommentItem = {
      id: 'c_' + Date.now(),
      userId,
      user: userName,
      text: comment.trim(),
      time: 'Just now',
    }

    const allComments = getStoredComments()
    allComments[postId] = [...(allComments[postId] || []), newComment]
    saveStoredComments(allComments)

    return newComment
  },

  // --- CLAIMS ---

  async getPostClaim(postId: string, userId?: string) {
    if (!userId) return null
    try {
      const claims = JSON.parse(localStorage.getItem('gl_post_claims') || '{}')
      return claims[`${postId}_${userId}`] || null
    } catch {
      return null
    }
  },

  async claimPost(postId: string, userId: string): Promise<{ success: boolean; claim: any }> {
    const claim = {
      id: 'claim-' + Date.now(),
      post_id: postId,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    try {
      const claims = JSON.parse(localStorage.getItem('gl_post_claims') || '{}')
      claims[`${postId}_${userId}`] = claim
      localStorage.setItem('gl_post_claims', JSON.stringify(claims))
    } catch {}

    return { success: true, claim }
  },

  // --- NOTIFICATIONS ---

  async getUserNotifications(userId: string): Promise<NotificationRecord[]> {
    const notifs = getStoredNotifications()
    return notifs.filter(n => !userId || n.recipient_id === userId || n.recipient_id === 'all')
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notifs = getStoredNotifications()
    const updated = notifs.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    saveStoredNotifications(updated)
  },

  async markAllAsRead(userId: string): Promise<void> {
    const notifs = getStoredNotifications()
    const updated = notifs.map(n => (!userId || n.recipient_id === userId) ? { ...n, is_read: true } : n)
    saveStoredNotifications(updated)
  },
}
