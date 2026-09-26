import { supabase } from '../../utils/supabase'

export interface ChatMessage {
  id: string
  senderId: string
  receiverId?: string
  text: string
  time: string
  createdAt: string
  timestamp: string
  isMe: boolean
  isRead?: boolean
  status?: 'sent' | 'read' | 'sending' | 'failed'
  senderName: string
  postId?: string | null
}

export interface ChatUser {
  id: string
  name: string
  role?: string
  city?: string
  avatar?: string | null
  isVerified?: boolean
}

export interface ConversationThread {
  id: string // partner's user ID acts as the unique 1-on-1 thread identifier
  partner: ChatUser
  lastMessage: string
  lastMessageTime: string
  lastMessageAt: string
  lastMessageStatus?: 'sent' | 'read' | null
  unreadCount: number
  postId?: string | null
}

export interface ConversationSummary {
  id: string
  postId: string
  title: string
  price: number | null
  location: string
  category: string
  sellerName: string
  sellerId?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
  isBulk?: boolean
}

export const chatService = {
  /**
   * Fetch all 1-on-1 direct conversation threads for the authenticated user from direct_messages.
   */
  async getConversations(currentUserId: string): Promise<ConversationThread[]> {
    if (!currentUserId) return []

    // Fetch messages where user is either sender or receiver, ordered by recency
    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select('id, sender_id, receiver_id, message, is_read, created_at, post_id')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[chatService] getConversations error:', error.message)
      return []
    }

    if (!messages || messages.length === 0) {
      return []
    }

    // Group by partnerId
    const threadMap = new Map<string, {
      latestMessage: any
      unreadCount: number
    }>()

    for (const msg of messages) {
      const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id
      if (!threadMap.has(partnerId)) {
        threadMap.set(partnerId, {
          latestMessage: msg,
          unreadCount: 0,
        })
      }

      if (msg.receiver_id === currentUserId && !msg.is_read) {
        const item = threadMap.get(partnerId)!
        item.unreadCount += 1
      }
    }

    // Fetch user profiles for all partner IDs
    const partnerIds = Array.from(threadMap.keys())
    const profileMap = new Map<string, ChatUser>()

    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role, city, is_verified')
        .in('id', partnerIds)

      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap.set(p.id, {
            id: p.id,
            name: p.full_name || 'Green Loop Member',
            role: p.role || 'citizen',
            city: p.city || 'Coimbatore',
            isVerified: Boolean(p.is_verified),
          })
        })
      }
    }

    const conversations: ConversationThread[] = []

    threadMap.forEach(({ latestMessage, unreadCount }, partnerId) => {
      const partner = profileMap.get(partnerId) || {
        id: partnerId,
        name: 'Green Loop Member',
        role: 'citizen',
        city: 'Coimbatore',
      }

      const isMe = latestMessage.sender_id === currentUserId
      const status: 'sent' | 'read' | null = isMe
        ? (latestMessage.is_read ? 'read' : 'sent')
        : null

      const timeFormatted = formatMessageTime(latestMessage.created_at)

      conversations.push({
        id: partnerId,
        partner,
        lastMessage: latestMessage.message,
        lastMessageTime: timeFormatted,
        lastMessageAt: latestMessage.created_at,
        lastMessageStatus: status,
        unreadCount,
        postId: latestMessage.post_id,
      })
    })

    // Sort by latest message timestamp descending
    return conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  /**
   * Fetch paginated message history.
   * Can be called as:
   * 1. getMessages(currentUserId, partnerId, limit?, beforeTimestamp?) -> 1-on-1 direct user messages
   * 2. getMessages(postId) -> marketplace listing comments/thread
   */
  async getMessages(
    arg1: string,
    arg2?: string,
    limit = 50,
    beforeTimestamp?: string
  ): Promise<ChatMessage[]> {
    if (arg2) {
      return this.getDirectMessages(arg1, arg2, limit, beforeTimestamp)
    } else {
      return this.getPostComments(arg1)
    }
  },

  /**
   * Fetch paginated 1-on-1 direct messages between current user and partner.
   */
  async getDirectMessages(
    currentUserId: string,
    partnerId: string,
    limit = 50,
    beforeTimestamp?: string
  ): Promise<ChatMessage[]> {
    if (!currentUserId || !partnerId) return []

    let query = supabase
      .from('direct_messages')
      .select('id, sender_id, receiver_id, message, is_read, created_at, post_id')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (beforeTimestamp) {
      query = query.lt('created_at', beforeTimestamp)
    }

    const { data, error } = await query

    if (error) {
      console.error('[chatService] getDirectMessages error:', error.message)
      return []
    }

    if (!data) return []

    // Reverse to chronological order (oldest to newest)
    const chronological = [...data].reverse()

    return chronological.map((m: any) => {
      const isMe = m.sender_id === currentUserId
      const timeStr = formatMessageTime(m.created_at)
      return {
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.message,
        time: timeStr,
        createdAt: timeStr,
        timestamp: m.created_at,
        isMe,
        isRead: Boolean(m.is_read),
        status: isMe ? (m.is_read ? 'read' : 'sent') : 'sent',
        senderName: isMe ? 'You' : 'Member',
        postId: m.post_id,
      }
    })
  },

  /**
   * Fetch comments/messages for a marketplace post (backward compatibility).
   */
  async getPostComments(postId: string): Promise<ChatMessage[]> {
    if (!postId) return []

    const { data: authData } = await supabase.auth.getUser()
    const currentUserId = authData?.user?.id

    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, comment, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('[chatService] Fetch comments error:', error.message)
      return []
    }

    if (!comments || comments.length === 0) return []

    // Fetch author profile names
    const userIds = Array.from(new Set(comments.map((c: any) => c.user_id).filter(Boolean)))
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

    return comments.map((c: any) => {
      const isMe = Boolean(currentUserId && c.user_id === currentUserId)
      const senderName = isMe ? 'You' : (profMap.get(c.user_id) || 'Community Member')
      const timeStr = formatMessageTime(c.created_at)

      return {
        id: String(c.id),
        postId: c.post_id,
        senderId: c.user_id,
        senderName,
        text: c.comment,
        time: timeStr,
        createdAt: timeStr,
        timestamp: c.created_at,
        isMe,
        isRead: true,
        status: 'sent',
      }
    })
  },

  /**
   * Send a message.
   * Can be called as:
   * 1. sendMessage(senderId, receiverId, content, postId?) -> 1-on-1 direct user message
   * 2. sendMessage(postId, text) -> post comment (backward compatibility)
   */
  async sendMessage(
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string | null
  ): Promise<ChatMessage> {
    if (arg3 !== undefined) {
      return this.sendDirectMessage(arg1, arg2, arg3, arg4)
    } else {
      return this.sendPostComment(arg1, arg2)
    }
  },

  /**
   * Send a real persistent 1-on-1 message into Supabase direct_messages table.
   */
  async sendDirectMessage(
    senderId: string,
    receiverId: string,
    content: string,
    postId?: string | null
  ): Promise<ChatMessage> {
    const trimmed = content.trim()
    if (!trimmed) {
      throw new Error('Message cannot be empty.')
    }
    if (!senderId || !receiverId) {
      throw new Error('Sender and recipient are required.')
    }
    if (senderId === receiverId) {
      throw new Error('Cannot send a message to yourself.')
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message: trimmed,
        is_read: false,
        post_id: postId || null,
      })
      .select('id, sender_id, receiver_id, message, is_read, created_at, post_id')
      .single()

    if (error) {
      console.error('[chatService] sendDirectMessage error:', error.message)
      throw new Error(error.message || 'Failed to send message.')
    }

    const timeStr = formatMessageTime(data.created_at)

    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      text: data.message,
      time: timeStr,
      createdAt: timeStr,
      timestamp: data.created_at,
      isMe: true,
      isRead: false,
      status: 'sent',
      senderName: 'You',
      postId: data.post_id,
    }
  },

  /**
   * Send a comment into post_comments for marketplace listings.
   */
  async sendPostComment(postId: string, text: string): Promise<ChatMessage> {
    const trimmed = text.trim()
    if (!trimmed) {
      throw new Error('Message cannot be empty.')
    }

    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user?.id) {
      throw new Error('You must be signed in to send a message.')
    }

    const currentUserId = authData.user.id

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: currentUserId,
        comment: trimmed,
      })
      .select('id, post_id, user_id, comment, created_at')
      .single()

    if (error) {
      console.error('[chatService] Send comment error:', error)
      throw new Error(error.message || 'Failed to send message.')
    }

    // Get sender name
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUserId)
      .maybeSingle()

    const senderName = prof?.full_name || 'You'
    const timeStr = formatMessageTime(data.created_at)

    return {
      id: String(data.id),
      postId: data.post_id,
      senderId: data.user_id,
      senderName,
      text: data.comment,
      time: timeStr,
      createdAt: timeStr,
      timestamp: data.created_at,
      isMe: true,
      isRead: true,
      status: 'sent',
    }
  },

  /**
   * Subscribe to real-time incoming comments for a specific listing.
   */
  subscribeToThread(postId: string, onNewMessage: (msg: ChatMessage) => void) {
    const channelName = `realtime_chat_${postId}_${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const newRow = payload.new as any
          if (!newRow) return

          const { data: authData } = await supabase.auth.getUser()
          const currentUserId = authData?.user?.id
          const isMe = Boolean(currentUserId && newRow.user_id === currentUserId)

          let senderName = isMe ? 'You' : 'Community Member'
          if (!isMe && newRow.user_id) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newRow.user_id)
              .maybeSingle()
            if (prof?.full_name) {
              senderName = prof.full_name
            }
          }

          const timeStr = formatMessageTime(newRow.created_at)

          onNewMessage({
            id: String(newRow.id),
            postId: newRow.post_id,
            senderId: newRow.user_id,
            senderName,
            text: newRow.comment,
            time: timeStr,
            createdAt: timeStr,
            timestamp: newRow.created_at,
            isMe,
            isRead: true,
            status: 'sent',
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  /**
   * Load active marketplace listing threads for current user (from posts with comments).
   */
  async getUserConversations(): Promise<ConversationSummary[]> {
    const { data: posts, error: postErr } = await supabase
      .from('e_waste_posts')
      .select('id, title, asking_price, location, category, user_id, description, profiles:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (postErr || !posts) {
      console.warn('[chatService] Fetch posts for conversations error:', postErr?.message)
      return []
    }

    const postIds = posts.map(p => p.id)
    const { data: comments } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, comment, created_at')
      .in('post_id', postIds)
      .order('created_at', { ascending: false })

    const lastCommentByPost = new Map<string, any>()
    if (comments) {
      for (const c of comments) {
        if (!lastCommentByPost.has(c.post_id)) {
          lastCommentByPost.set(c.post_id, c)
        }
      }
    }

    return posts.map(p => {
      const lastComment = lastCommentByPost.get(p.id)
      const sellerProfile = (p as any).profiles
      const sellerName = sellerProfile?.full_name || 'Verified Member'
      const timeStr = lastComment?.created_at ? formatMessageTime(lastComment.created_at) : 'Active'

      return {
        id: p.id,
        postId: p.id,
        title: p.title || 'E-Waste Item',
        price: p.asking_price ?? null,
        location: p.location || 'Coimbatore',
        category: p.category || 'General',
        sellerName,
        sellerId: p.user_id,
        lastMessage: lastComment?.comment || `Discussion thread for ${p.title}`,
        lastMessageTime: timeStr,
        isBulk: Boolean(p.description?.includes('[BULK_LISTING]') || (p as any).is_bulk),
      }
    })
  },

  /**
   * Mark all unread incoming messages from partner as read.
   */
  async markAsRead(currentUserId: string, partnerId: string): Promise<void> {
    if (!currentUserId || !partnerId) return

    const { error } = await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', partnerId)
      .eq('is_read', false)

    if (error) {
      console.warn('[chatService] markAsRead error:', error.message)
    }
  },

  /**
   * Subscribe to Supabase Realtime for instant user-to-user message delivery and read receipt updates.
   */
  subscribeToChat(
    currentUserId: string,
    onMessageChange: (event: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) => void
  ) {
    if (!currentUserId) return null

    const channelName = `public:direct_messages:${currentUserId}:${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload: any) => {
          const row = payload.new || payload.old
          // Only trigger if current user is participant
          if (row && (row.sender_id === currentUserId || row.receiver_id === currentUserId)) {
            onMessageChange(payload.eventType, payload)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected
        }
      })

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
      },
    }
  },

  /**
   * Search registered Green Loop users in public.profiles to start a new chat.
   */
  async searchUsers(query: string, excludeUserId: string): Promise<ChatUser[]> {
    let q = supabase
      .from('profiles')
      .select('id, full_name, role, city, is_verified')
      .neq('id', excludeUserId)
      .limit(30)

    const clean = query.trim()
    if (clean) {
      q = q.ilike('full_name', `%${clean}%`)
    }

    const { data, error } = await q

    if (error) {
      console.error('[chatService] searchUsers error:', error.message)
      return []
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.full_name || 'Green Loop Member',
      role: p.role || 'citizen',
      city: p.city || 'Coimbatore',
      isVerified: Boolean(p.is_verified),
    }))
  },

  /**
   * Get total unread count for current user across all conversations.
   */
  async getTotalUnreadCount(currentUserId: string): Promise<number> {
    if (!currentUserId) return 0

    const { count, error } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', currentUserId)
      .eq('is_read', false)

    if (error) {
      console.warn('[chatService] getTotalUnreadCount error:', error.message)
      return 0
    }

    return count || 0
  },

  /**
   * Get specific user profile by ID.
   */
  async getUserProfile(userId: string): Promise<ChatUser | null> {
    if (!userId) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, city, is_verified')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: data.id,
      name: data.full_name || 'Green Loop Member',
      role: data.role || 'citizen',
      city: data.city || 'Coimbatore',
      isVerified: Boolean(data.is_verified),
    }
  },
}

function formatMessageTime(isoString: string): string {
  if (!isoString) return 'Just now'
  try {
    const d = new Date(isoString)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    
    // Yesterday check
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()

    if (isToday) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    }
    if (isYesterday) {
      return 'Yesterday'
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'Just now'
  }
}
