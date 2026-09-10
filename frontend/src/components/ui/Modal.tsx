import type { ReactNode } from 'react'
import Icon from '../Icon'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: number
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 500 }: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 120 }} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92%',
          maxWidth,
          maxHeight: '90vh',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 130,
          padding: 22,
          overflowY: 'auto',
          animation: 'scale-in 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              aria-label="Close modal"
            >
              <Icon name="close" size={16} color="var(--text-secondary)" />
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  )
}
