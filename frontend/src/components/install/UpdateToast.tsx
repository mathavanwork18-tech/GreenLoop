import React, { useState } from 'react'
import { usePwaInstall } from '../../context/PwaInstallContext'
import Icon from '../Icon'

export const UpdateToast: React.FC = () => {
  const { hasUpdate, applyUpdate } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!hasUpdate || dismissed) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--bg-surface, #122319)',
        border: '1px solid var(--accent, #10b981)',
        borderRadius: 'var(--radius-full, 9999px)',
        padding: '8px 16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 16px rgba(16, 185, 129, 0.3)',
        animation: 'slideDownToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      role="alert"
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--accent-light, rgba(16, 185, 129, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="refresh" size={15} color="var(--accent, #10b981)" />
      </div>

      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
        New Green Loop version available
      </div>

      <button
        type="button"
        onClick={applyUpdate}
        style={{
          background: 'var(--accent, #10b981)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-full, 9999px)',
          padding: '6px 14px',
          fontSize: '0.78rem',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        Update Now
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update alert"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-tertiary, #94a3b8)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="close" size={14} color="var(--text-tertiary, #94a3b8)" />
      </button>

      <style>{`
        @keyframes slideDownToast {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  )
}

export default UpdateToast
