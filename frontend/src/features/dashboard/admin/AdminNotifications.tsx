import { useState, type FormEvent } from 'react'
import { supabase } from '../../../utils/supabase'
import { adminService } from './services/adminService'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'

export default function AdminNotifications() {
  const { user: currentAdmin } = useAuth()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState('all')
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const handleBroadcast = async (e: FormEvent) => {
    e.preventDefault()
    if (!title || !message) return
    setSending(true)

    try {
      // 1. Get recipient user IDs based on target role
      let query = supabase.from('profiles').select('id')
      if (targetRole !== 'all') {
        query = query.eq('role', targetRole)
      }
      const { data: users } = await query

      if (users && users.length > 0) {
        const notifications = (users as Array<{ id: string }>).map((u) => ({
          recipient_id: u.id,
          title,
          message,
          type: 'announcement',
          is_read: false,
          created_at: new Date().toISOString(),
        }))

        await supabase.from('notifications').insert(notifications)
      }

      if (currentAdmin?.id) {
        await adminService.logAdminAction(
          currentAdmin.id,
          currentAdmin.name || 'Admin',
          'broadcast_notification',
          `Role: ${targetRole}`,
          { title, recipientsCount: users?.length || 0 }
        )
      }

      setSentSuccess(true)
      setTitle('')
      setMessage('')
      setTimeout(() => setSentSuccess(false), 4000)
    } catch (err: any) {
      alert('Failed to dispatch broadcast: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Broadcast Platform Announcements
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Send live system updates, TNPCB compliance alerts, and recycling mission notifications.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 24,
          maxWidth: 680,
        }}
      >
        {sentSuccess && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#34d399',
              fontSize: '0.86rem',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="check" size={16} color="#10b981" />
            <span>Broadcast sent successfully and written to database!</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: 6 }}>
              Target Audience
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                backgroundColor: '#16221c',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#ffffff',
                padding: '0 12px',
                fontSize: '0.88rem',
              }}
            >
              <option value="all">All Platform Members (Everyone)</option>
              <option value="citizen">General Users / Citizens Only</option>
              <option value="shop">Local Shops Only</option>
              <option value="company">Enterprise Recyclers Only</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: 6 }}>
              Notification Title
            </label>
            <input
              required
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Coimbatore Doorstep Collection Drive this Saturday!"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: 6 }}>
              Notification Message Body
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message details with guidance, drop-off incentives, or rewards..."
              style={{
                width: '100%',
                backgroundColor: '#16221c',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#ffffff',
                padding: '10px 12px',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn btn-primary btn-lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
          >
            <Icon name="bell" size={16} color="#ffffff" />
            <span>{sending ? 'Dispatching Broadcast...' : 'Send Broadcast to Database'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
