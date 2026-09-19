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

function getStoredMessages(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem('gl_chat_messages')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    'post-1': [
      {
        id: 'm-1',
        postId: 'post-1',
        senderId: 'u-102',
        senderName: 'CircuitFix Repair Hub',
        text: 'Hello! Is the Samsung Galaxy S20 motherboard still available for inspection?',
        createdAt: '10:30 AM',
        isMe: false,
      },
      {
        id: 'm-2',
        postId: 'post-1',
        senderId: 'u-101',
        senderName: 'You',
        text: 'Yes, it is in good condition with battery intact. You can pickup in RS Puram.',
        createdAt: '10:32 AM',
        isMe: true,
      },
    ],
  }
}

function saveStoredMessages(msgs: Record<string, ChatMessage[]>) {
  try {
    localStorage.setItem('gl_chat_messages', JSON.stringify(msgs))
  } catch {}
}

export const chatService = {
  async getMessages(postId: string): Promise<ChatMessage[]> {
    if (!postId) return []
    const msgs = getStoredMessages()
    return msgs[postId] || []
  },

  async sendMessage(postId: string, text: string): Promise<ChatMessage> {
    const trimmed = text.trim()
    if (!trimmed) {
      throw new Error('Message cannot be empty.')
    }

    const timeStr = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date())
    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      postId,
      senderId: 'u-me',
      senderName: 'You',
      text: trimmed,
      createdAt: timeStr,
      isMe: true,
    }

    const all = getStoredMessages()
    all[postId] = [...(all[postId] || []), newMsg]
    saveStoredMessages(all)

    return newMsg
  },

  subscribeToThread(_postId: string, _onNewMessage: (msg: ChatMessage) => void) {
    return () => {}
  },

  async getUserConversations(): Promise<ConversationSummary[]> {
    return [
      {
        id: 'post-1',
        postId: 'post-1',
        title: 'Samsung Galaxy S20 (Faulty Display)',
        price: 2500,
        location: 'Coimbatore',
        category: 'Smartphones',
        sellerName: 'CircuitFix Repair Hub',
        sellerId: 'u-102',
        lastMessage: 'Yes, it is in good condition with battery intact.',
        lastMessageTime: '10:32 AM',
        isBulk: false,
      },
    ]
  },
}
