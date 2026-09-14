import { useState, useEffect, useRef } from 'react'
import Icon from '../Icon'
import { chatService } from '../../services/chat/chatService'

export interface ChatListingContext {
  id: string
  title: string
  askingPrice: number | null
  location: string
  category?: string
  condition?: string
  sellerName: string
  sellerId?: string
  imageUrl?: string | null
}

interface Message {
  id: string
  sender: 'me' | 'them'
  senderName: string
  text: string
  time: string
  timestamp: number
}

interface Props {
  isOpen: boolean
  listing: ChatListingContext | null
  onClose: () => void
  onViewListing?: () => void
}

export default function MarketplaceChatModal({
  isOpen,
  listing,
  onClose,
  onViewListing,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendCooldown, setSendCooldown] = useState(false)
  const [lastSentText, setLastSentText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize and load real messages from Supabase
  useEffect(() => {
    if (!isOpen || !listing?.id) return

    let isMounted = true

    chatService
      .getMessages(listing.id)
      .then((history) => {
        if (!isMounted) return
        if (history.length > 0) {
          setMessages(
            history.map((m) => ({
              id: m.id,
              sender: m.isMe ? 'me' : 'them',
              senderName: m.senderName,
              text: m.text,
              time: m.createdAt,
              timestamp: Date.now(),
            }))
          )
        } else {
          const seller = listing.sellerName || 'Seller'
          setMessages([
            {
              id: 'init-1',
              sender: 'them',
              senderName: seller,
              text: `Hello! I am ${seller}. Feel free to ask about the condition, pickup location, or pricing for "${listing.title}".`,
              time: 'Active',
              timestamp: Date.now(),
            },
          ])
        }
      })
      .catch((err) => {
        console.warn('[ChatModal] Error loading messages:', err)
      })

    const unsubscribe = chatService.subscribeToThread(listing.id, (newMsg) => {
      if (!isMounted) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id || (m.text === newMsg.text && m.sender === (newMsg.isMe ? 'me' : 'them')))) {
          return prev
        }
        return [
          ...prev,
          {
            id: newMsg.id,
            sender: newMsg.isMe ? 'me' : 'them',
            senderName: newMsg.senderName,
            text: newMsg.text,
            time: newMsg.createdAt,
            timestamp: Date.now(),
          },
        ]
      })
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [isOpen, listing?.id])

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  if (!isOpen || !listing) return null

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend !== undefined ? textToSend : inputText
    const trimmed = raw.trim()

    // 1. Validation: reject empty or oversized messages
    if (!trimmed || trimmed.length > 1000) return
    if (sendCooldown || isSending) return

    // 2. Spam protection: duplicate prevention within 10 seconds
    if (trimmed === lastSentText && Date.now() - (messages[messages.length - 1]?.timestamp || 0) < 10000) {
      return
    }

    setIsSending(true)
    setSendCooldown(true)
    setTimeout(() => setSendCooldown(false), 1000)

    try {
      const sent = await chatService.sendMessage(listing.id, trimmed)
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev
        return [
          ...prev,
          {
            id: sent.id,
            sender: 'me',
            senderName: sent.senderName,
            text: sent.text,
            time: sent.createdAt,
            timestamp: Date.now(),
          },
        ]
      })
      setLastSentText(trimmed)
      if (textToSend === undefined) setInputText('')
    } catch (err: any) {
      alert(err.message || 'Could not send message. Please make sure you are signed in.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickChips = [
    'Is this item still available?',
    'What is your best price?',
    'Can we arrange doorstep pickup?',
    'Are cables or accessories included?',
  ]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100dvh',
          maxHeight: '680px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Header: Participant Details */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to listings"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon name="arrow-left" size={18} color="var(--accent)" />
          </button>

          {/* Avatar with live status dot */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              {listing.sellerName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid var(--bg-surface)',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <h2
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {listing.sellerName}
              </h2>
              <Icon name="verified" size={14} color="#10b981" />
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Verified Seller</span>
              <span>•</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active now</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Chat"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon name="close" size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Listing Context Pill Card (Requirement 22) */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Icon name="laptop" size={20} color="var(--accent)" />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {listing.title}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--accent)',
                  fontWeight: 700,
                }}
              >
                {listing.askingPrice !== null ? `₹${listing.askingPrice.toLocaleString()}` : 'Free / Quote'}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 500, marginLeft: 6 }}>
                  • {listing.location}
                </span>
              </div>
            </div>
          </div>

          {onViewListing && (
            <button
              type="button"
              onClick={onViewListing}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              View Listing
            </button>
          )}
        </div>

        {/* Message Thread Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            backgroundColor: 'var(--bg-base)',
          }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender === 'me'

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    backgroundColor: isMe ? 'var(--accent)' : 'var(--bg-surface)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    borderBottomRightRadius: isMe ? '3px' : '14px',
                    borderBottomLeftRadius: isMe ? '14px' : '3px',
                    fontSize: '0.86rem',
                    lineHeight: 1.45,
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    wordBreak: 'break-word',
                  }}
                >
                  {/* XSS-safe text rendering */}
                  <span>{msg.text}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-tertiary)',
                    marginTop: 3,
                    padding: '0 4px',
                  }}
                >
                  {msg.time}
                </span>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiry Chips */}
        <div
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              disabled={isSending || sendCooldown}
              style={{
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 11px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Composer Area */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to the seller..."
            maxLength={1000}
            disabled={isSending}
            style={{
              flex: 1,
              height: 42,
              padding: '0 14px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-2)',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending || sendCooldown}
            aria-label="Send message"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: inputText.trim() && !sendCooldown ? 'var(--accent)' : 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: inputText.trim() && !sendCooldown ? '#ffffff' : 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() && !sendCooldown ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              boxShadow: inputText.trim() ? 'var(--shadow-accent)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Icon
              name="send"
              size={18}
              color={inputText.trim() && !sendCooldown ? '#ffffff' : 'var(--text-tertiary)'}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
