import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import { aiApi } from '../services/ai/ai.api'
import type { AIMessage, AIConversationState, AIActionChip } from '../types/ai.types'

interface GreenAiDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function GreenAiDrawer({ isOpen, onClose }: GreenAiDrawerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedRadius, setSelectedRadius] = useState<number>(10)
  const [conversationState, setConversationState] = useState<AIConversationState>({
    radiusKm: 10,
    userLat: 11.0168,
    userLng: 76.9558
  })

  // Initial welcome message
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I'm **Green Loop AI** — your verified circular e-waste assistant.\n\nI can help you find nearby electronics, check spare parts in stock, find authorized TNPCB recyclers, inspect battery safety, and estimate fair marketplace value.`,
      timestamp: 'Just now',
      actionChips: [
        { label: '📍 Find E-Waste Near Me', actionType: 'query', payload: 'Find e-waste near me' },
        { label: '⚡ Find Laptop Parts', actionType: 'query', payload: 'Find laptop parts within 10 km' },
        { label: '🔋 Swollen Battery Safety', actionType: 'query', payload: 'How do I recycle a swollen battery?' },
        { label: '💰 Price of Old Laptop', actionType: 'query', payload: 'How much is my old laptop worth?' }
      ]
    }
  ])

  // Contextual prompts based on active path
  const getContextPrompts = useCallback(() => {
    const path = location.pathname
    if (path.includes('map')) {
      return [
        { label: '📍 Nearby Drop-offs', query: 'Find recycling centers near me' },
        { label: '🔧 Local Repair Hubs', query: 'Find repair shops near me' },
        { label: '📏 Radius: 5 km', query: 'Show items within 5 km' },
        { label: '📏 Radius: 25 km', query: 'Show items within 25 km' }
      ]
    }
    if (path.includes('post')) {
      return [
        { label: '🔋 Battery Safety Protocol', query: 'How do I recycle a swollen battery?' },
        { label: '💰 Check Market Value', query: 'How much is my old laptop worth?' },
        { label: '📋 Data Wiping Steps', query: 'Steps to wipe an old laptop before selling' },
        { label: '🏷️ Best Category for Device', query: 'What category for old circuit boards?' }
      ]
    }
    if (path.includes('activity') || path.includes('account')) {
      return [
        { label: '🪙 My Green Coins & Rank', query: 'How do I earn more Green Coins?' },
        { label: '📋 View My Active Posts', query: 'Show my posts' },
        { label: '📜 TNPCB Certificates', query: 'How do TNPCB recycling certificates work?' },
        { label: '🗑️ Delete a Listing', query: 'Delete my post' }
      ]
    }
    // Home / Marketplace default
    return [
      { label: '🔍 Laptops Under ₹5,000', query: 'Find a laptop under ₹5000' },
      { label: '⚡ 16GB RAM & SSDs', query: 'Find laptop parts within 10 km' },
      { label: '🔋 Swollen Battery Hazard', query: 'How do I recycle a swollen battery?' },
      { label: '📦 Post an Electronic Item', query: 'I want to sell my old phone' }
    ]
  }, [location.pathname])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }
  }, [messages, isOpen])

  // Handle sending a user message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || isTyping) return

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    try {
      const result = await aiApi.processAssistantQuery({
        query,
        user,
        currentPath: location.pathname,
        conversationState: {
          ...conversationState,
          radiusKm: selectedRadius
        },
        userCoords: { lat: 11.0168, lng: 76.9558 }
      })

      setMessages(prev => [...prev, result.message])
      setConversationState(result.updatedState)
      if (result.message.radiusUsed) {
        setSelectedRadius(result.message.radiusUsed)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: "I couldn't verify that from Green Loop's current data. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle action chips
  const handleChipClick = async (chip: AIActionChip) => {
    if (chip.actionType === 'navigate' && typeof chip.payload === 'string') {
      onClose()
      navigate(chip.payload)
    } else if (chip.actionType === 'query' && typeof chip.payload === 'string') {
      await handleSendMessage(chip.payload)
    } else if (chip.actionType === 'set_radius' && typeof chip.payload === 'number') {
      setSelectedRadius(chip.payload)
      await handleSendMessage(`Increase search radius to ${chip.payload} km`)
    } else if (chip.actionType === 'cancel_delete') {
      setMessages(prev => [
        ...prev,
        {
          id: `cancel-${Date.now()}`,
          sender: 'ai',
          text: 'Deletion cancelled. Your listing remains active on the Green Loop marketplace.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } else if (chip.actionType === 'confirm_delete' && typeof chip.payload === 'string') {
      setIsTyping(true)
      const success = await aiApi.tools.deleteUserPost(chip.payload, user?.name || 'Mathavan')
      setIsTyping(false)
      if (success) {
        setMessages(prev => [
          ...prev,
          {
            id: `del-succ-${Date.now()}`,
            sender: 'ai',
            text: '✅ Your listing has been successfully deleted from Green Loop.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionChips: [
              { label: '📦 Post Another Item', actionType: 'navigate', payload: '/post' },
              { label: '🔍 Browse Marketplace', actionType: 'navigate', payload: '/' }
            ]
          }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `del-err-${Date.now()}`,
            sender: 'ai',
            text: "I couldn't complete the deletion. Please verify that the post belongs to your account.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }
    }
  }

  // Formatter for markdown-like text (bolding, lists)
  const formatAiText = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, idx) => {
      // Bold parser
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <div key={idx} style={{ minHeight: line.trim() === '' ? 8 : undefined, marginBottom: 3 }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
            }
            return <span key={pIdx}>{p}</span>
          })}
        </div>
      )
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }} />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '100%',
          maxWidth: 520,
          height: '88vh',
          maxHeight: 740,
          background: 'var(--bg-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          zIndex: 120,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-up 0.25s ease',
          overflow: 'hidden'
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #064e3b, #047857)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo.png"
              alt="Green Loop Logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                padding: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Ask Green Loop AI</span>
                <span
                  style={{
                    background: 'rgba(52, 211, 153, 0.25)',
                    color: '#a7f3d0',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 10,
                    border: '1px solid rgba(52, 211, 153, 0.4)'
                  }}
                >
                  VERIFIED DATA
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                Your smart e-waste & marketplace assistant
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Radius pill selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(0,0,0,0.2)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#d1fae5',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
              title="Search radius for nearby calculation"
            >
              <Icon name="location-pin" size={12} color="#34d399" />
              <span>{selectedRadius} km</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Assistant"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Icon name="close" size={18} color="#fff" />
            </button>
          </div>
        </div>

        {/* ================= MESSAGES CONTAINER ================= */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg-base)'
          }}
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '92%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background:
                    msg.sender === 'user'
                      ? 'linear-gradient(135deg, var(--accent), #059669)'
                      : 'var(--bg-surface-2)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-secondary)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: '0.88rem',
                  lineHeight: 1.5
                }}
              >
                {formatAiText(msg.text)}

                {/* Delete Confirmation Box */}
                {msg.deleteConfirmation && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ color: 'var(--color-danger, #ef4444)', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon name="trash" size={14} color="#ef4444" />
                      <span>Destructive Action Confirmation</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Item: <strong>{msg.deleteConfirmation.postTitle}</strong> (ID: {msg.deleteConfirmation.postId})
                    </div>
                  </div>
                )}

                {/* Product Cards (Grounding in actual data) */}
                {msg.productCards && msg.productCards.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msg.productCards.map(prod => (
                      <div
                        key={prod.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                background: 'var(--accent-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Icon name="package" size={20} color="var(--accent-text)" />
                            </div>
                          )}

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                                {prod.price !== null ? `₹${prod.price.toLocaleString('en-IN')}` : 'Free / Recycle'}
                              </span>
                              <span>•</span>
                              <span>{prod.distanceKm !== undefined ? `${prod.distanceKm} km` : prod.locationName}</span>
                              <span>•</span>
                              <span>{prod.condition}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose()
                            navigate(`/`)
                          }}
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Partner Cards (Verified Recyclers & Shops) */}
                {msg.partnerCards && msg.partnerCards.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msg.partnerCards.map(partner => (
                      <div
                        key={partner.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{partner.name}</span>
                            {partner.verified && (
                              <Icon name="verified" size={14} color="var(--accent)" />
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                            <span>📍 {partner.address}</span>
                            <span style={{ marginLeft: 6, color: 'var(--accent)', fontWeight: 700 }}>
                              ({partner.distanceKm} km away)
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            {partner.services.slice(0, 2).map((s, sIdx) => (
                              <span
                                key={sIdx}
                                style={{
                                  background: 'var(--bg-surface-2)',
                                  fontSize: '0.65rem',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose()
                            navigate('/map')
                          }}
                          style={{
                            background: 'var(--bg-surface-2)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Map
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Chips */}
              {msg.actionChips && msg.actionChips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, maxWidth: '92%' }}>
                  {msg.actionChips.map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleChipClick(chip)}
                      style={{
                        background:
                          chip.actionType === 'confirm_delete'
                            ? '#ef4444'
                            : 'var(--bg-surface-2)',
                        color:
                          chip.actionType === 'confirm_delete'
                            ? '#ffffff'
                            : chip.actionType === 'cancel_delete'
                            ? 'var(--text-secondary)'
                            : 'var(--accent-text)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        padding: '6px 12px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4, padding: '0 4px' }}>
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s infinite' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s infinite 0.2s' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s infinite 0.4s' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>Checking Green Loop verified data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= CONTEXTUAL SUGGESTION CHIPS ================= */}
        <div
          style={{
            padding: '8px 16px',
            background: 'var(--bg-surface-2)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none'
          }}
        >
          {getContextPrompts().map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ================= INPUT BAR ================= */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about e-waste, products or Green Loop..."
            disabled={isTyping}
            style={{
              flex: 1,
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '10px 16px',
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            aria-label="Send query"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: input.trim() && !isTyping ? 'var(--accent)' : 'var(--bg-surface-2)',
              color: input.trim() && !isTyping ? '#fff' : 'var(--text-tertiary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <Icon name="arrow-right" size={18} color={input.trim() && !isTyping ? '#fff' : 'var(--text-tertiary)'} />
          </button>
        </div>
      </div>
    </>
  )
}
