import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Icon from '../../../../components/Icon'

interface BulkDriveModalProps {
  isOpen: boolean
  onClose: () => void
  onDriveSuccess: () => void
}

export default function BulkDriveModal({ isOpen, onClose, onDriveSuccess }: BulkDriveModalProps) {
  const [org, setOrg] = useState('PSG College of Technology')
  const [qty, setBulkQty] = useState('50+ Devices (approx 120 kg)')
  const [date, setDate] = useState('2025-09-10')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSuccess(true)
    onDriveSuccess()
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Institutional Bulk E-Waste Drive">
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Icon name="check" size={24} color="var(--accent)" />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Drive Registered!
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            Collection drive scheduled for {org} on {date}.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--coin-bg)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--coin-color)',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            <Icon name="coin" size={16} color="var(--coin-color)" />
            <span>+100 Green Coins Credited</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              College / University / Corporate Name
            </label>
            <input className="input" value={org} onChange={e => setOrg(e.target.value)} style={{ width: '100%' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Estimated E-Waste Quantity
            </label>
            <input className="input" value={qty} onChange={e => setBulkQty(e.target.value)} style={{ width: '100%' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Proposed Drive Date
            </label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%' }} required />
          </div>

          <div
            style={{
              padding: '8px 12px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--accent-text)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Icon name="verified" size={14} color="var(--accent)" />
            <span>Includes official TNPCB Recovery Certificate + Campus Leaderboard Points</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-full">
              Register Drive
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
