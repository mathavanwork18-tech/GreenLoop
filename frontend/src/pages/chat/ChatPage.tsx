import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import {
  chatService,
  type ChatMessage,
  type ChatUser,
  type ConversationThread,
} from '../../services/chat/chatService'

export default function ChatPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const targetUserId = searchParams.get('user')
  const targetPostId = searchParams.get('post')

  // State
  const [conversations, setConversations] = useState<ConversationThread[]>([])
  const [selectedPartner, setSelectedPartner] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [sendError, setSendError] = useState<string | null>(null)

  // User picker modal
  const [showUserModal, setShowUserModal] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // DOM Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // 1. Load Conversations on Mount
  const loadConversations = useCallback(async () => {
    if (!user?.id) return
    try {
      const convs = await chatService.getConversations(user.id)
      setConversations(convs)
    } catch (err) {
      console.error('[ChatPage] Load conversations error:', err)
    } finally {
      setLoadingConversations(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // 2. Handle Target User from URL Query (`/chat?user=UUID`)
  useEffect(() => {
    if (!targetUserId || !user?.id) return

    const openTargetUser = async () => {
      // Check if target user already exists in conversations
      const existing = conversations.find((c) => c.partner.id === targetUserId)
      if (existing) {
        setSelectedPartner(existing.partner)
      } else {
        // Fetch user profile from Supabase
        const profile = await chatService.getUserProfile(targetUserId)
        if (profile) {
          setSelectedPartner(profile)
        }
      }
    }

    openTargetUser()
  }, [targetUserId, user?.id, conversations])

  // 3. Load Messages when Selected Partner changes
  const loadMessages = useCallback(async (partnerId: string) => {
    if (!user?.id || !partnerId) return
    setLoadingMessages(true)
    setSendError(null)
    try {
      const msgs = await chatService.getMessages(user.id, partnerId, 50)
      setMessages(msgs)
      // Mark as read in Supabase
      await chatService.markAsRead(user.id, partnerId)
      // Update local unread badge count
      setConversations((prev) =>
        prev.map((c) => (c.partner.id === partnerId ? { ...c, unreadCount: 0 } : c))
      )
      setTimeout(() => scrollToBottom(false), 50)
    } catch (err) {
      console.error('[ChatPage] Load messages error:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [user?.id, scrollToBottom])

  useEffect(() => {
    if (selectedPartner) {
      loadMessages(selectedPartner.id)
      inputRef.current?.focus()
    } else {
      setMessages([])
    }
  }, [selectedPartner, loadMessages])

  // 4. Supabase Realtime Subscription
  useEffect(() => {
    if (!user?.id) return

    const sub = chatService.subscribeToChat(user.id, (eventType, payload) => {
      const row = payload.new || payload.old
      if (!row) return

      const partnerId = row.sender_id === user.id ? row.receiver_id : row.sender_id

      if (eventType === 'INSERT') {
        const isCurrentPartner = selectedPartner?.id === partnerId
        const isFromMe = row.sender_id === user.id

        const timeStr = new Date(row.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
        const newMsg: ChatMessage = {
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          senderName: isFromMe ? 'You' : (selectedPartner?.name || 'Member'),
          text: row.message,
          time: timeStr,
          createdAt: timeStr,
          timestamp: row.created_at,
          isMe: isFromMe,
          isRead: Boolean(row.is_read),
          status: isFromMe ? (row.is_read ? 'read' : 'sent') : 'sent',
          postId: row.post_id,
        }

        // If currently chatting with this partner, append message
        if (isCurrentPartner) {
          setMessages((prev) => {
            // Avoid duplicate if already optimistically added
            if (prev.some((m) => m.id === row.id)) return prev
            // Replace optimistic pending message if matching text
            const pendingIndex = prev.findIndex(
              (m) => m.status === 'sending' && m.text === row.message
            )
            if (pendingIndex !== -1) {
              const updated = [...prev]
              updated[pendingIndex] = newMsg
              return updated
            }
            return [...prev, newMsg]
          })

          // Mark incoming as read immediately since user is actively viewing thread
          if (!isFromMe) {
            chatService.markAsRead(user.id, partnerId)
          }
          setTimeout(() => scrollToBottom(true), 50)
        }

        // Re-sync conversation list
        loadConversations()
      } else if (eventType === 'UPDATE') {
        // Update read receipts in active thread
        if (selectedPartner?.id === partnerId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === row.id
                ? {
                    ...m,
                    isRead: Boolean(row.is_read),
                    status: m.isMe ? (row.is_read ? 'read' : 'sent') : m.status,
                  }
                : m
            )
          )
        }
      }
    })

    return () => {
      sub?.unsubscribe()
    }
  }, [user?.id, selectedPartner, scrollToBottom, loadConversations])

  // 5. Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || !user?.id || !selectedPartner || sending) return

    const trimmed = inputText.trim()
    setInputText('')
    setSending(true)
    setSendError(null)

    // Optimistic UI preview
    const tempId = `temp-${Date.now()}`
    const nowStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: user.id,
      receiverId: selectedPartner.id,
      senderName: 'You',
      text: trimmed,
      time: nowStr,
      createdAt: nowStr,
      timestamp: new Date().toISOString(),
      isMe: true,
      isRead: false,
      status: 'sending',
      postId: targetPostId || null,
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setTimeout(() => scrollToBottom(true), 20)

    try {
      const realMsg = await chatService.sendMessage(
        user.id,
        selectedPartner.id,
        trimmed,
        targetPostId || null
      )

      // Reconcile optimistic message with real database ID
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMsg : m))
      )

      // Refresh conversations list to update order and last message
      loadConversations()
    } catch (err: any) {
      console.error('[ChatPage] Send message failed:', err)
      setSendError(err?.message || 'Failed to send message.')
      // Mark optimistic message as failed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      )
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // Retry sending failed message
  const handleRetryMessage = async (failedMsg: ChatMessage) => {
    if (!user?.id || !selectedPartner) return
    setSendError(null)
    setMessages((prev) =>
      prev.map((m) => (m.id === failedMsg.id ? { ...m, status: 'sending' } : m))
    )

    try {
      const realMsg = await chatService.sendMessage(
        user.id,
        selectedPartner.id,
        failedMsg.text,
        failedMsg.postId
      )
      setMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? realMsg : m))
      )
      loadConversations()
    } catch (err: any) {
      setSendError('Retry failed: ' + (err?.message || 'Check network connection.'))
      setMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: 'failed' } : m))
      )
    }
  }

  // 6. User Selection Modal Handlers
  const handleOpenUserModal = async () => {
    setShowUserModal(true)
    setLoadingUsers(true)
    try {
      const users = await chatService.searchUsers('', user?.id || '')
      setAvailableUsers(users)
    } catch (err) {
      console.error('[ChatPage] Load users error:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSearchUsers = async (q: string) => {
    setUserSearchQuery(q)
    try {
      const users = await chatService.searchUsers(q, user?.id || '')
      setAvailableUsers(users)
    } catch (err) {
      console.error('[ChatPage] Search users error:', err)
    }
  }

  const handleSelectUser = (u: ChatUser) => {
    setSelectedPartner(u)
    setSearchParams({ user: u.id })
    setShowUserModal(false)
    setUserSearchQuery('')
  }

  // Filter conversations in sidebar
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.partner.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        (c.partner.city && c.partner.city.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = []
    let currentDate = ''
    let currentList: ChatMessage[] = []

    messages.forEach((m) => {
      const msgDate = new Date(m.timestamp).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

      if (msgDate !== currentDate) {
        if (currentList.length > 0) {
          groups.push({ date: currentDate, messages: currentList })
        }
        currentDate = msgDate
        currentList = [m]
      } else {
        currentList.push(m)
      }
    })

    if (currentList.length > 0) {
      groups.push({ date: currentDate, messages: currentList })
    }

    return groups
  }, [messages])

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100dvh - 64px)',
        backgroundColor: '#07100A',
        color: '#F5F7F5',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'rgba(239, 68, 68, 0.92)',
            color: '#ffffff',
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            zIndex: 100,
          }}
        >
          <Icon name="alert" size={14} color="#ffffff" />
          <span>You are currently offline. Messages will send once connection is restored.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEFT COLUMN: CONVERSATION LIST (Hidden on mobile if chat is active)        */}
      {/* ========================================================================= */}
      <div
        className={selectedPartner ? 'hide-mobile' : ''}
        style={{
          width: 360,
          minWidth: 320,
          maxWidth: 420,
          borderRight: '1px solid #162C1E',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0D1710',
          height: '100%',
        }}
      >
        {/* Conversations Header */}
        <div
          style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid #162C1E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#F5F7F5',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Messages
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3A5' }}>
              Real-time Green Loop conversations
            </p>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleOpenUserModal}
            className="btn btn-primary"
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#22C55E',
              color: '#07100A',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.25)',
            }}
          >
            <Icon name="plus" size={14} color="#07100A" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Conversations Bar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #162C1E' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#07100A',
              borderRadius: '12px',
              border: '1px solid #1F3D2A',
            }}
          >
            <span style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}>
              <Icon name="search" size={15} color="#9CA3A5" />
            </span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '9px 12px 9px 36px',
                color: '#F5F7F5',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  color: '#9CA3A5',
                }}
              >
                <Icon name="close" size={14} color="#9CA3A5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConversations ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9CA3A5', fontSize: '0.86rem' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: '2px solid rgba(34, 197, 94, 0.2)',
                  borderTopColor: '#22C55E',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <Icon name="comment" size={24} color="#22C55E" />
              </div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 6px', color: '#F5F7F5' }}>
                {searchQuery ? 'No matching chats' : 'No conversations yet'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#9CA3A5', margin: '0 0 16px' }}>
                {searchQuery
                  ? 'Try searching with a different name or city.'
                  : 'Start a direct chat with any Green Loop member, seller, or repair shop.'}
              </p>
              <button
                onClick={handleOpenUserModal}
                style={{
                  padding: '9px 16px',
                  background: '#22C55E',
                  color: '#07100A',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="plus" size={14} color="#07100A" />
                <span>Start a Conversation</span>
              </button>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = selectedPartner?.id === c.partner.id
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedPartner(c.partner)
                    setSearchParams({ user: c.partner.id })
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderBottom: '1px solid #14281E',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #22C55E' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* User Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #064e3b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1rem',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {c.partner.name.charAt(0).toUpperCase()}
                    {c.partner.isVerified && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          background: '#22C55E',
                          borderRadius: '50%',
                          width: 14,
                          height: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #0D1710',
                        }}
                      >
                        <Icon name="check" size={8} color="#07100A" />
                      </span>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                      <span
                        style={{
                          fontWeight: c.unreadCount > 0 ? 800 : 700,
                          fontSize: '0.88rem',
                          color: '#F5F7F5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 180,
                        }}
                      >
                        {c.partner.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: c.unreadCount > 0 ? '#22C55E' : '#9CA3A5', fontWeight: c.unreadCount > 0 ? 700 : 500 }}>
                        {c.lastMessageTime}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.78rem',
                          color: c.unreadCount > 0 ? '#F5F7F5' : '#9CA3A5',
                          fontWeight: c.unreadCount > 0 ? 700 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 220,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {c.lastMessageStatus && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', color: c.lastMessageStatus === 'read' ? '#22C55E' : '#9CA3A5' }}>
                            <Icon name="check" size={12} color={c.lastMessageStatus === 'read' ? '#22C55E' : '#9CA3A5'} />
                          </span>
                        )}
                        <span>{c.lastMessage}</span>
                      </p>

                      {c.unreadCount > 0 && (
                        <span
                          style={{
                            background: '#22C55E',
                            color: '#07100A',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            borderRadius: '10px',
                            padding: '2px 7px',
                            minWidth: 18,
                            textAlign: 'center',
                            marginLeft: 6,
                          }}
                        >
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: ACTIVE CHAT THREAD                                         */}
      {/* ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#07100A',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {selectedPartner ? (
          <>
            {/* Chat Thread Header */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #162C1E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0D1710',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Mobile Back Button */}
                <button
                  onClick={() => {
                    setSelectedPartner(null)
                    setSearchParams({})
                  }}
                  className="hide-desktop"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#22C55E',
                    cursor: 'pointer',
                    padding: '6px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Back to conversations"
                >
                  <Icon name="arrow-left" size={20} color="#22C55E" />
                </button>

                {/* Partner Avatar */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #064e3b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {selectedPartner.name.charAt(0).toUpperCase()}
                </div>

                {/* Partner Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#F5F7F5', margin: 0 }}>
                      {selectedPartner.name}
                    </h2>
                    {selectedPartner.isVerified && (
                      <span
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#22C55E',
                          borderRadius: '10px',
                          padding: '1px 6px',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                        }}
                      >
                        Verified
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#9CA3A5' }}>
                    {selectedPartner.role ? selectedPartner.role.toUpperCase() : 'MEMBER'} • {selectedPartner.city || 'Coimbatore'}
                  </p>
                </div>
              </div>

              {/* Context Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#22C55E',
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22C55E',
                      boxShadow: '0 0 8px #22C55E',
                    }}
                  />
                  <span>Active</span>
                </span>
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9CA3A5', fontSize: '0.84rem' }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      border: '2px solid rgba(34, 197, 94, 0.2)',
                      borderTopColor: '#22C55E',
                      borderRadius: '50%',
                      margin: '0 auto 10px',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3A5' }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.1)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}
                  >
                    <Icon name="send" size={22} color="#F97316" />
                  </div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 6px', color: '#F5F7F5' }}>
                    Start conversation with {selectedPartner.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3A5', maxWidth: 300, margin: '0 auto' }}>
                    Say hello or inquire about e-waste recycling, doorstep pickup, or spare parts.
                  </p>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Date Separator Pill */}
                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                      <span
                        style={{
                          background: '#0D1710',
                          border: '1px solid #162C1E',
                          borderRadius: '12px',
                          padding: '3px 12px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#9CA3A5',
                        }}
                      >
                        {group.date}
                      </span>
                    </div>

                    {/* Messages in Group */}
                    {group.messages.map((m) => {
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: m.isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '75%',
                              minWidth: 70,
                              borderRadius: m.isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              padding: '10px 14px',
                              backgroundColor: m.isMe ? '#F97316' : '#0D1710',
                              border: m.isMe ? 'none' : '1px solid #162C1E',
                              color: '#F5F7F5',
                              boxShadow: m.isMe
                                ? '0 2px 10px rgba(249, 115, 22, 0.25)'
                                : '0 2px 6px rgba(0, 0, 0, 0.2)',
                            }}
                          >
                            <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {m.text}
                            </p>

                            {/* Timestamp & Status */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 4,
                                marginTop: 4,
                                fontSize: '0.65rem',
                                color: m.isMe ? 'rgba(255, 255, 255, 0.75)' : '#9CA3A5',
                              }}
                            >
                              <span>{m.time}</span>
                              {m.isMe && (
                                <>
                                  {m.status === 'sending' && (
                                    <span style={{ fontSize: '0.65rem' }}>• sending</span>
                                  )}
                                  {m.status === 'sent' && (
                                    <span title="Sent">
                                      <Icon name="check" size={11} color="rgba(255,255,255,0.75)" />
                                    </span>
                                  )}
                                  {m.status === 'read' && (
                                    <span title="Read" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <Icon name="check" size={11} color="#22C55E" />
                                    </span>
                                  )}
                                  {m.status === 'failed' && (
                                    <span style={{ color: '#f87171', fontWeight: 700 }}>! Failed</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Retry action if failed */}
                          {m.status === 'failed' && (
                            <button
                              onClick={() => handleRetryMessage(m)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#f87171',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Icon name="refresh" size={12} color="#f87171" />
                              <span>Retry sending</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Notification Pill */}
            {sendError && (
              <div
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderTop: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{sendError}</span>
                <button
                  onClick={() => setSendError(null)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                >
                  <Icon name="close" size={12} color="#f87171" />
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '12px 18px',
                borderTop: '1px solid #162C1E',
                backgroundColor: '#0D1710',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={`Message ${selectedPartner.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending || !isOnline}
                style={{
                  flex: 1,
                  backgroundColor: '#07100A',
                  border: '1px solid #1F3D2A',
                  borderRadius: '24px',
                  padding: '11px 18px',
                  color: '#F5F7F5',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending || !isOnline}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: inputText.trim() ? '#F97316' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() && !sending ? 'pointer' : 'not-allowed',
                  opacity: inputText.trim() && !sending ? 1 : 0.5,
                  transition: 'all 0.18s ease',
                  flexShrink: 0,
                  boxShadow: inputText.trim() ? '0 2px 10px rgba(249, 115, 22, 0.35)' : 'none',
                }}
              >
                {sending ? (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                ) : (
                  <Icon name="send" size={17} color="#ffffff" />
                )}
              </button>
            </form>
          </>
        ) : (
          /* Empty State: No conversation selected */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              <Icon name="comment" size={32} color="#22C55E" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px', color: '#F5F7F5' }}>
              Select a conversation
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#9CA3A5', maxWidth: 360, margin: '0 0 20px' }}>
              Choose an existing chat from the left or search a registered member, recycler, or shop to start messaging.
            </p>
            <button
              onClick={handleOpenUserModal}
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                borderRadius: '14px',
                background: '#22C55E',
                color: '#07100A',
                fontWeight: 700,
                fontSize: '0.86rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
              }}
            >
              <Icon name="plus" size={16} color="#07100A" />
              <span>Start New Conversation</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* USER SELECTOR MODAL (Search & Start Chat with any Green Loop member)      */}
      {/* ========================================================================= */}
      {showUserModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 1000,
          }}
          onClick={() => setShowUserModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#0D1710',
              border: '1px solid #1F3D2A',
              borderRadius: '20px',
              padding: '22px 20px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#F5F7F5' }}>
                  Start a Conversation
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#9CA3A5' }}>
                  Select any registered member or business
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3A5', cursor: 'pointer', padding: 4 }}
              >
                <Icon name="close" size={18} color="#9CA3A5" />
              </button>
            </div>

            {/* User Search Input */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#07100A',
                borderRadius: '12px',
                border: '1px solid #1F3D2A',
                marginBottom: 14,
              }}
            >
              <span style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}>
                <Icon name="search" size={15} color="#9CA3A5" />
              </span>
              <input
                type="text"
                placeholder="Search by member name or city..."
                value={userSearchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 12px 10px 36px',
                  color: '#F5F7F5',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* User List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loadingUsers ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9CA3A5', fontSize: '0.84rem' }}>
                  Loading Green Loop members...
                </div>
              ) : availableUsers.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9CA3A5', fontSize: '0.84rem' }}>
                  No members found.
                </div>
              ) : (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #064e3b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F5F7F5' }}>
                          {u.name}
                        </span>
                        {u.isVerified && (
                          <span
                            style={{
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#22C55E',
                              borderRadius: '8px',
                              padding: '1px 5px',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                            }}
                          >
                            Verified
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#9CA3A5' }}>
                        {u.role ? u.role.toUpperCase() : 'CITIZEN'} • {u.city || 'Coimbatore'}
                      </p>
                    </div>

                    <button
                      type="button"
                      style={{
                        background: '#F97316',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
