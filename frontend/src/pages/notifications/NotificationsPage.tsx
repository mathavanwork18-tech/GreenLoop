import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '../../components/Icon'
import { Card, Badge, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { interactionsApi } from '../../services/interactions/interactions.api'

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  icon: IconName
  read: boolean
  category: 'pickup' | 'rewards' | 'compliance' | 'general'
}

function getIconForType(type: string): IconName {
  switch (type?.toLowerCase()) {
    case 'like':
      return 'heart'
    case 'comment':
      return 'comment'
    case 'claim':
    case 'claim_status':
      return 'pickup'
    case 'reward':
      return 'coin'
    default:
      return 'bell'
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 'unread' | 'rewards' | 'pickup'>('all')
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    async function loadNotifications() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const rows = await interactionsApi.getUserNotifications(user.id)
        if (rows && rows.length > 0) {
          const mapped: NotificationItem[] = rows.map((r: any) => ({
            id: String(r.id),
            title: r.title || 'Notification',
            desc: r.message || '',
            time: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            icon: getIconForType(r.type),
            read: Boolean(r.is_read),
            category: r.type === 'reward' ? 'rewards' : r.type === 'claim' || r.type === 'claim_status' ? 'pickup' : 'general',
          }))
          setNotifications(mapped)
        } else {
          setNotifications([])
        }
      } catch (err) {
        console.warn('[Green Loop] Fetch notifications error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [user?.id])

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'rewards') return n.category === 'rewards'
    if (filter === 'pickup') return n.category === 'pickup'
    return true
  })

  const markAllAsRead = async () => {
    if (user?.id) {
      await interactionsApi.markAllAsRead(user.id)
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.read) {
      await interactionsApi.markAsRead(n.id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      )
    }
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <Icon name="arrow-left" size={18} color="var(--text-primary)" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Notifications
            </h1>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Likes, comments, claims & circular events
            </div>
          </div>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: 'Unread' },
            { id: 'rewards', label: 'EcoPoints' },
            { id: 'pickup', label: 'Claims & Pickups' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: `1px solid ${filter === tab.id ? 'var(--accent)' : 'var(--border-color)'}`,
                background: filter === tab.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: filter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Loading notifications from database...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bell"
            title="All Caught Up"
            description="You don't have any notifications right now. Activity on your listings will appear here."
            actionLabel="Show All Notifications"
            onAction={() => setFilter('all')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n) => (
              <Card
                key={n.id}
                hoverable
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  cursor: 'pointer',
                  background: n.read ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                  borderColor: n.read ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.4)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: n.read ? 'var(--bg-surface)' : 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    name={n.icon}
                    size={20}
                    color={n.category === 'rewards' ? 'var(--coin-color)' : 'var(--accent)'}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {n.title}
                    </div>
                    {!n.read && (
                      <Badge variant="green" size="sm">
                        New
                      </Badge>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
                    {n.desc}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 6, fontWeight: 600 }}>
                    {n.time}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
