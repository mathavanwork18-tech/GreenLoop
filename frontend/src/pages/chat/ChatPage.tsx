import { useState } from 'react'
import Icon from '../../components/Icon'
import { Button } from '../../components/ui'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'GreenCycle Hub',
      text: 'Hello Mathavan! Your pickup request for the Dell laptop battery has been confirmed for 11:30 AM today.',
      time: '10:02 AM',
    },
    {
      id: '2',
      sender: 'You',
      text: 'Thank you! Will the driver bring a battery fire safety container?',
      time: '10:05 AM',
    },
    {
      id: '3',
      sender: 'GreenCycle Hub',
      text: 'Yes, our collector vehicle is equipped with TNPCB fire-safe thermal bins. You can hand over the device safely.',
      time: '10:06 AM',
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'You', text: input.trim(), time },
    ])
    setInput('')
  }

  const handleQuickChip = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'You', text, time },
    ])
  }

  return (
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 12px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Collector Chat Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            flexShrink: 0,
          }}
        >
          <Icon name="recycle" size={22} color="var(--accent)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            GreenCycle Hub • Dispatch & Collector
          </h2>
          <div style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
            <span>●</span>
            <span>Online & Active Dispatch (TNPCB #TN-2025-412)</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((m) => {
          const isMe = m.sender === 'You'
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  background: isMe ? 'var(--accent)' : 'var(--bg-surface)',
                  color: isMe ? '#ffffff' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  boxShadow: 'var(--shadow-sm)',
                  border: isMe ? 'none' : '1px solid var(--border-color)',
                  wordBreak: 'break-word',
                }}
              >
                {m.text}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-tertiary)',
                  marginTop: 4,
                  fontWeight: 600,
                  padding: '0 4px',
                }}
              >
                {m.sender !== 'You' && `${m.sender} • `}
                {m.time}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Action Chips */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          background: 'var(--bg-base)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {[
          '📍 Share Live GPS',
          '⏰ Confirm 11:30 AM Slot',
          '🔥 Request Thermal Safety Box',
          '📜 Ask for TNPCB Certificate',
        ].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleQuickChip(chip)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <input
          className="input"
          placeholder="Message collector or support..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, minHeight: 44 }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon="send"
          disabled={!input.trim()}
          style={{ padding: '0 18px' }}
        >
          Send
        </Button>
      </form>
    </div>
  )
}
