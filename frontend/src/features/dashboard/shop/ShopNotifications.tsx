import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'

export default function ShopNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      if (!error && data) {
        setNotifications(data)
      }
    } catch (e) {
      console.warn('[Green Loop] Notifications fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.id])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Business Notifications
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time alerts for customer requests, collection updates, and claims
          </p>
        </div>
        <button
          onClick={loadNotifications}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="bell" size={24} color="#2563eb" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            No new notifications
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            You are all caught up! New requests and activity will be delivered here in real time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                borderLeft: n.is_read ? '1px solid var(--border-color)' : '4px solid #2563eb',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="bell" size={18} color="#2563eb" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  {n.created_at ? new Date(n.created_at).toLocaleString() : 'Just now'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
