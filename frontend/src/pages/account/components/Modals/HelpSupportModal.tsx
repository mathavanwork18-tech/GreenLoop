import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Icon from '../../../../components/Icon'

interface HelpSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
  const [category, setCategory] = useState('Pickup Problem')
  const [description, setDescription] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setDescription('')
      onClose()
    }, 1800)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Green Loop Help & Grievance Redressal">
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
            Support Ticket Raised
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Ticket #TK-9821 logged. TNPCB / Green Loop resolution officer will respond within 4 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Issue Category
            </label>
            <select
              className="input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Pickup Problem">Pickup Delay / Driver Issue</option>
              <option value="Certificate Query">Recycling Certificate Missing</option>
              <option value="Coin Dispute">Green Coins Not Credited</option>
              <option value="Swollen Battery Emergency">Swollen Battery Urgent Neutralization</option>
              <option value="Seller Issue">Marketplace Dispute</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Describe the Issue
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Provide details and reference numbers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          <div
            style={{
              padding: '8px 12px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.74rem',
              color: 'var(--accent-text)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Icon name="phone-call" size={12} color="var(--accent-text)" />
            <span>Emergency TNPCB Helpline: 1800-425-1100 (Toll Free 24/7)</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-full">
              Submit Ticket
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
