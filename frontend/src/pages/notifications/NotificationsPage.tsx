import { useState } from 'react'
import Icon, { type IconName } from '../../components/Icon'
import { Card, Badge, EmptyState } from '../../components/ui'

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  icon: IconName
  read: boolean
  category: 'pickup' | 'rewards' | 'compliance' | 'general'
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'rewards' | 'pickup'>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Doorstep Pickup Completed',
      desc: 'Your 2 mobile phones were safely collected by GreenCycle logistics partner.',
      time: '20 mins ago',
      icon: 'check',
      read: false,
      category: 'pickup',
    },
    {
      id: '2',
      title: '+50 EcoPoints Credited',
      desc: 'Daily streak bonus credited to your wallet for recycling responsibly.',
      time: '2 hours ago',
      icon: 'coin',
      read: false,
      category: 'rewards',
    },
    {
      id: '3',
      title: 'TNPCB Recycling Certificate Ready',
      desc: 'Certificate #GL-REC-2025-0841 issued with verified state pollution control seal.',
      time: 'Yesterday',
      icon: 'certificate',
      read: true,
      category: 'compliance',
    },
    {
      id: '4',
      title: 'New Nearby Drop-Off Hub Added',
      desc: 'PSG Tech E-Waste Drop Box is now live within 1.4 km of your location.',
      time: '2 days ago',
      icon: 'map',
      read: true,
      category: 'general',
    },
  ])

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'rewards') return n.category === 'rewards'
    if (filter === 'pickup') return n.category === 'pickup'
    return true
  })

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Eco updates, custody timestamps & certificates
          </div>
        </div>

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
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: 'Unread' },
            { id: 'rewards', label: 'EcoPoints' },
            { id: 'pickup', label: 'Pickups' },
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
        {filtered.length === 0 ? (
          <EmptyState
            icon="bell"
            title="All Caught Up"
            description="You don't have any notifications under this filter."
            actionLabel="Show All Notifications"
            onAction={() => setFilter('all')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n) => (
              <Card
                key={n.id}
                hoverable
                style={{
                  padding: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: n.read ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                  borderColor: n.read ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.3)',
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
