import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon, { type IconName } from '../../components/Icon'
import { Button } from '../../components/ui'
import { chatService } from '../../services/chat/chatService'

interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  time: string
  isMe: boolean
}

interface ConversationItem {
  id: string
  name: string
  role: string
  type: 'dispatch' | 'marketplace'
  avatarIcon: IconName
  lastMessage: string
  time: string
  unreadCount?: number
  verified?: boolean
  listing?: {
    id: string
    title: string
    price: number | null
    location: string
    category: string
    imageUrl?: string | null
  }
  messages: Message[]
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-dispatch',
    name: 'GreenCycle Hub • Logistics & Collector',
    role: 'Authorized TNPCB Collector #TN-2025-412',
    type: 'dispatch',
    avatarIcon: 'recycle',
    lastMessage: 'Collector vehicle is equipped with TNPCB thermal bins.',
    time: '10:06 AM',
    verified: true,
    messages: [
      {
        id: 'd1',
        senderId: 'dispatch',
        senderName: 'GreenCycle Hub',
        text: 'Hello! Your pickup request for e-waste has been confirmed for 11:30 AM today.',
        time: '10:02 AM',
        isMe: false,
      },
      {
        id: 'd2',
        senderId: 'me',
        senderName: 'You',
        text: 'Thank you! Will the driver bring a battery fire safety container?',
        time: '10:05 AM',
        isMe: true,
      },
      {
        id: 'd3',
        senderId: 'dispatch',
        senderName: 'GreenCycle Hub',
        text: 'Yes, our collector vehicle is equipped with TNPCB fire-safe thermal bins. You can hand over the device safely.',
        time: '10:06 AM',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-market-1',
    name: 'Kavitha S.',
    role: 'Citizen Seller • 14 items recycled',
    type: 'marketplace',
    avatarIcon: 'user',
    lastMessage: 'Yes, the motherboard is intact. Available for inspection.',
    time: '09:42 AM',
    verified: true,
    unreadCount: 1,
    listing: {
      id: 'lst-1',
      title: 'Dell XPS 15 9570 (Parts / Scrap)',
      price: 1800,
      location: 'RS Puram, Coimbatore',
      category: 'Laptops',
    },
    messages: [
      {
        id: 'm1',
        senderId: 'me',
        senderName: 'You',
        text: 'Hello Kavitha! Is this Dell XPS 15 still available for pickup or inspection?',
        time: '09:30 AM',
        isMe: true,
      },
      {
        id: 'm2',
        senderId: 'kavitha',
        senderName: 'Kavitha S.',
        text: 'Yes, the motherboard is intact. Available for inspection.',
        time: '09:42 AM',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-market-2',
    name: 'Apex Tech Diagnostics',
    role: 'Certified Repair Shop Partner',
    type: 'marketplace',
    avatarIcon: 'shop',
    lastMessage: 'We can test the battery cells and offer ₹500 store credit.',
    time: 'Yesterday',
    verified: true,
    listing: {
      id: 'lst-2',
      title: 'MacBook Pro Battery Pack A1398',
      price: 600,
      location: 'Gandhipuram, Coimbatore',
      category: 'Batteries',
    },
    messages: [
      {
        id: 'a1',
        senderId: 'apex',
        senderName: 'Apex Tech Diagnostics',
        text: 'Greetings! We noticed your battery listing. We can test the battery cells and offer ₹500 store credit.',
        time: 'Yesterday',
        isMe: false,
      },
    ],
  },
]

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS)
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv-dispatch')
  const [inputText, setInputText] = useState('')
  const [cooldown, setCooldown] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'marketplace' | 'dispatch'>('all')

  // Load real active conversations from Supabase
  useEffect(() => {
    chatService.getUserConversations().then((threads) => {
      if (threads && threads.length > 0) {
        const liveConvs: ConversationItem[] = threads.map((t) => ({
          id: `conv-listing-${t.postId}`,
          name: t.sellerName || 'Listing Seller',
          role: t.isBulk ? 'Bulk Seller • Verified' : 'Community Seller',
          type: 'marketplace',
          avatarIcon: t.isBulk ? 'building' : 'user',
          lastMessage: t.lastMessage,
          time: t.lastMessageTime,
          verified: true,
          listing: {
            id: t.postId,
            title: t.title,
            price: t.price,
            location: t.location,
            category: t.category,
          },
          messages: [],
        }))

        setConversations((prev) => {
          const dispatchOnly = prev.filter((c) => c.type === 'dispatch')
          return [...dispatchOnly, ...liveConvs]
        })
      }
    })
  }, [])

  // Check if URL search params specify a listing or seller
  useEffect(() => {
    const listingId = searchParams.get('listingId')
    const title = searchParams.get('title')
    const seller = searchParams.get('seller')

    if (listingId && title) {
      // Check if conversation already exists
      const existing = conversations.find((c) => c.listing?.id === listingId)
      if (existing) {
        setActiveConvId(existing.id)
      } else {
        const newConv: ConversationItem = {
          id: `conv-listing-${listingId}`,
          name: seller || 'Item Seller',
          role: 'Citizen Seller',
          type: 'marketplace',
          avatarIcon: 'user',
          lastMessage: 'Inquiry started',
          time: 'Just now',
          verified: true,
          listing: {
            id: listingId,
            title: decodeURIComponent(title),
            price: searchParams.get('price') ? Number(searchParams.get('price')) : null,
            location: searchParams.get('location') ? decodeURIComponent(searchParams.get('location')!) : 'Coimbatore',
            category: searchParams.get('category') || 'Electronics',
          },
          messages: [
            {
              id: String(Date.now()),
              senderId: 'me',
              senderName: 'You',
              text: `Hello, I'm inquiring about "${decodeURIComponent(title)}". Is it still available?`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: true,
            },
          ],
        }
        setConversations((prev) => [newConv, ...prev])
        setActiveConvId(newConv.id)
      }
    }
  }, [searchParams, conversations])

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || conversations[0],
    [conversations, activeConvId]
  )

  // Sync real-time messages for active listing conversation
  useEffect(() => {
    if (!activeConv?.listing?.id) return

    const listingId = activeConv.listing.id

    // 1. Fetch existing comments
    chatService.getMessages(listingId).then((msgs) => {
      if (msgs.length > 0) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConv.id) {
              return {
                ...c,
                messages: msgs.map((m) => ({
                  id: m.id,
                  senderId: m.senderId,
                  senderName: m.senderName,
                  text: m.text,
                  time: m.createdAt,
                  isMe: m.isMe,
                })),
              }
            }
            return c
          })
        )
      }
    })

    // 2. Subscribe to realtime comments
    const unsubscribe = chatService.subscribeToThread(listingId, (newMsg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            const alreadyExists = c.messages.some((m) => m.id === newMsg.id)
            if (alreadyExists) return c
            return {
              ...c,
              lastMessage: newMsg.text,
              time: newMsg.createdAt,
              messages: [
                ...c.messages,
                {
                  id: newMsg.id,
                  senderId: newMsg.senderId,
                  senderName: newMsg.senderName,
                  text: newMsg.text,
                  time: newMsg.createdAt,
                  isMe: newMsg.isMe,
                },
              ],
            }
          }
          return c
        })
      )
    })

    return () => {
      unsubscribe()
    }
  }, [activeConv?.id, activeConv?.listing?.id])

  const filteredConversations = useMemo(() => {
    if (filterType === 'all') return conversations
    return conversations.filter((c) => c.type === filterType)
  }, [conversations, filterType])

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim()
    if (!content || cooldown || !activeConv) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      text: content,
      time: timeStr,
      isMe: true,
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: content,
            time: timeStr,
            messages: [...c.messages, newMsg],
          }
        }
        return c
      })
    )

    setInputText('')
    setCooldown(true)
    setTimeout(() => setCooldown(false), 800)

    // Persist to Supabase if it's a listing conversation
    if (activeConv.listing?.id) {
      try {
        await chatService.sendMessage(activeConv.listing.id, content)
      } catch (err) {
        console.warn('[ChatPage] Message persistence note:', err)
      }
    }
  }

  const dispatchChips = [
    'Share Live GPS Coordinates',
    'Confirm 11:30 AM Slot',
    'Request Thermal Box',
    'TNPCB Receipt Copy',
  ]

  const marketChips = [
    'Is this item still available?',
    'Can we meet for physical inspection?',
    'What is the final price?',
    'Are all internal boards intact?',
  ]

  const chips = activeConv?.type === 'dispatch' ? dispatchChips : marketChips

  return (
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 12px)',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 60px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Icon name="comment" size={18} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Green Loop Messages
            </h1>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Direct marketplace communications & authorized logistics dispatch
            </div>
          </div>
        </div>

        {/* Channel Filter Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'marketplace', 'dispatch'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                background: filterType === t ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: filterType === t ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {t === 'all' ? 'All Channels' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Body */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          minHeight: 0,
          background: 'var(--bg-base)',
        }}
      >
        {/* Left: Conversation List */}
        <div
          style={{
            borderRight: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-tertiary)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            Conversations ({filteredConversations.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredConversations.map((c) => {
              const isSelected = c.id === activeConv?.id
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-full)',
                      background: c.type === 'dispatch' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      name={c.avatarIcon}
                      size={18}
                      color={c.type === 'dispatch' ? 'var(--accent)' : '#2563eb'}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                      <div
                        style={{
                          fontWeight: isSelected ? 800 : 700,
                          fontSize: '0.84rem',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 150,
                        }}
                      >
                        {c.name}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{c.time}</span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: 4,
                      }}
                    >
                      {c.lastMessage}
                    </div>

                    {c.listing && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.68rem',
                          background: 'var(--bg-base)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--accent)',
                          fontWeight: 700,
                        }}
                      >
                        <Icon name="package" size={11} color="var(--accent)" />
                        <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.listing.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--bg-base)',
          }}
        >
          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-full)',
                      background: activeConv.type === 'dispatch' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      name={activeConv.avatarIcon}
                      size={20}
                      color={activeConv.type === 'dispatch' ? 'var(--accent)' : '#2563eb'}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                        {activeConv.name}
                      </span>
                      {activeConv.verified && <Icon name="verified" size={15} color="var(--accent)" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {activeConv.role}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.72rem',
                    color: '#10b981',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span>Active Now</span>
                </div>
              </div>

              {/* Listing Context Pill / Banner (if this is a marketplace inquiry) */}
              {activeConv.listing && (
                <div
                  style={{
                    background: 'var(--bg-surface-2)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '8px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-light)',
                        color: 'var(--accent)',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Listing Context
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activeConv.listing.title}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{activeConv.listing.location}</span>
                  </div>

                  <div style={{ fontWeight: 800, color: '#2563eb', flexShrink: 0 }}>
                    {activeConv.listing.price !== null ? `₹${activeConv.listing.price.toLocaleString()}` : 'Free'}
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {activeConv.messages.map((m) => {
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          background: m.isMe ? 'var(--accent)' : 'var(--bg-surface)',
                          color: m.isMe ? '#ffffff' : 'var(--text-primary)',
                          padding: '10px 14px',
                          borderRadius: m.isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          fontSize: '0.84rem',
                          lineHeight: 1.45,
                          boxShadow: 'var(--shadow-sm)',
                          border: m.isMe ? 'none' : '1px solid var(--border-color)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {m.text}
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-tertiary)',
                          marginTop: 3,
                          padding: '0 4px',
                          fontWeight: 600,
                        }}
                      >
                        {!m.isMe && `${m.senderName} • `}
                        {m.time}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Negotiation Chips */}
              <div
                style={{
                  padding: '8px 18px',
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  background: 'var(--bg-surface)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    style={{
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                style={{
                  padding: '12px 18px',
                  background: 'var(--bg-surface)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <input
                  className="input"
                  placeholder={
                    activeConv.type === 'dispatch'
                      ? 'Message authorized collector or logistics...'
                      : 'Type a message to the seller...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={1000}
                  style={{ flex: 1, minHeight: 42, fontSize: '0.84rem' }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon="send"
                  disabled={!inputText.trim() || cooldown}
                  style={{ padding: '0 16px', height: 42 }}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              Select a conversation to begin messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
