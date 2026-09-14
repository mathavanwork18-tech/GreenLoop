import { supabase } from '../../utils/supabase'

export interface ChatMessage {
  id: string
  postId: string
  senderId: string
  senderName: string
  text: string
  createdAt: string
  isMe: boolean
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
   * Fetch chronological messages for a specific listing/thread
   */
  async getMessages(postId: string): Promise<ChatMessage[]> {
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
      const timeStr = c.created_at
        ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(c.created_at))
        : 'Just now'

      return {
        id: String(c.id),
        postId: c.post_id,
        senderId: c.user_id,
        senderName,
        text: c.comment,
        createdAt: timeStr,
        isMe,
      }
    })
  },

  /**
   * Send a real message into post_comments
   */
  async sendMessage(postId: string, text: string): Promise<ChatMessage> {
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
      console.error('[chatService] Send message error:', error)
      throw new Error(error.message || 'Failed to send message.')
    }

    // Get sender name
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUserId)
      .maybeSingle()

    const senderName = prof?.full_name || 'You'
    const timeStr = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date())

    return {
      id: String(data.id),
      postId: data.post_id,
      senderId: data.user_id,
      senderName,
      text: data.comment,
      createdAt: timeStr,
      isMe: true,
    }
  },

  /**
   * Subscribe to real-time incoming messages for a specific listing
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

          const timeStr = newRow.created_at
            ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(newRow.created_at))
            : 'Just now'

          onNewMessage({
            id: String(newRow.id),
            postId: newRow.post_id,
            senderId: newRow.user_id,
            senderName,
            text: newRow.comment,
            createdAt: timeStr,
            isMe,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  /**
   * Load active conversation threads for current user (from posts with comments)
   */
  async getUserConversations(): Promise<ConversationSummary[]> {
    // Fetch recent posts from e_waste_posts
    const { data: posts, error: postErr } = await supabase
      .from('e_waste_posts')
      .select('id, title, asking_price, location, category, user_id, description, profiles:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (postErr || !posts) {
      console.warn('[chatService] Fetch posts for conversations error:', postErr?.message)
      return []
    }

    // Fetch recent comments
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
      const timeStr = lastComment?.created_at
        ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(lastComment.created_at))
        : 'Active'

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
  }
}
