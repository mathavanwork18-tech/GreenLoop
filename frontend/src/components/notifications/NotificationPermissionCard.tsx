import { useState } from 'react'
import Icon from '../Icon'
import { useDeviceNotifications } from '../../hooks/useDeviceNotifications'

interface NotificationPermissionCardProps {
  compact?: boolean
}

export default function NotificationPermissionCard({ compact = false }: NotificationPermissionCardProps) {
  const {
    isSupported,
    isGranted,
    isDenied,
    requestPermission,
    unsubscribe,
    sendTest,
  } = useDeviceNotifications()

  const [loading, setLoading] = useState(false)
  const [testSent, setTestSent] = useState(false)

  if (!isSupported) {
    return null
  }

  const handleEnable = async () => {
    setLoading(true)
    try {
      await requestPermission()
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    await sendTest()
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      await unsubscribe()
    } finally {
      setLoading(false)
    }
  }

  // --- STATE 1: PERMISSION GRANTED ---
  if (isGranted) {
    return (
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '16px',
          padding: compact ? '12px 14px' : '16px 18px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <Icon name="check" size={16} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Device Notifications Active
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                System alerts enabled for sales, purchases, and messages.
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              background: '#10B981',
              color: '#0D1117',
              padding: '2px 8px',
              borderRadius: '20px',
            }}
          >
            ACTIVE
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testSent}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              background: testSent ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Icon name="bell" size={14} color="#10B981" />
            <span>{testSent ? '✓ Notification Dispatched!' : 'Send Test Notification'}</span>
          </button>

          <button
            type="button"
            onClick={handleDisable}
            disabled={loading}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? '...' : 'Disable'}
          </button>
        </div>
      </div>
    )
  }

  // --- STATE 2: PERMISSION BLOCKED / DENIED ---
  if (isDenied) {
    return (
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: compact ? '12px 14px' : '16px 18px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <Icon name="close" size={16} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ef4444' }}>
              Notifications Blocked by Browser
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Notifications are blocked in your browser. Enable them from your browser/site settings.
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', paddingLeft: 42 }}>
          Tip: Click the padlock/tune icon in your browser address bar → set Notifications to <strong>Allow</strong>.
        </div>
      </div>
    )
  }

  // --- STATE 3: DEFAULT (PROMPT TO ENABLE) ---
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: compact ? '14px 16px' : '18px 20px',
        marginBottom: 16,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'rgba(0, 255, 156, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="bell" size={20} color="var(--accent)" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Enable Device Notifications
          </h3>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Receive real-time system alerts outside the webpage
          </div>
        </div>
      </div>

      {!compact && (
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: 14,
            lineHeight: 1.6,
          }}
        >
          <div>Get notified about:</div>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            <li>Successful purchases & demo payments</li>
            <li>Products sold on marketplace</li>
            <li>New buyer/seller direct messages</li>
            <li>Important circular e-waste updates</li>
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="btn btn-primary btn-full"
        style={{
          height: 40,
          fontSize: '0.86rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
          color: '#0D1117',
          border: 'none',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 255, 156, 0.25)',
          cursor: 'pointer',
        }}
      >
        <Icon name="bell" size={16} color="#0D1117" />
        <span>{loading ? 'Requesting Permission...' : 'Enable Notifications'}</span>
      </button>
    </div>
  )
}
