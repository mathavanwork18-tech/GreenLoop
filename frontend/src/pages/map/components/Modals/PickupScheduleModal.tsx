import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Icon from '../../../../components/Icon'
import type { EcosystemPartner } from '../../../../types/map.types'

interface PickupScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  partner: EcosystemPartner | null
  onScheduleSuccess: () => void
}

export default function PickupScheduleModal({
  isOpen,
  onClose,
  partner,
  onScheduleSuccess
}: PickupScheduleModalProps) {
  const [date, setDate] = useState('2025-09-03')
  const [timeSlot, setTimeSlot] = useState('10:00 AM – 1:00 PM')
  const [address, setAddress] = useState('45 Cross Cut Road, RS Puram, Coimbatore')
  const [items, setItems] = useState('1 Laptop, 2 Mobile Phones, 1 Battery')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSuccess(true)
    onScheduleSuccess()
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Doorstep E-Waste Pickup">
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
            Pickup Confirmed!
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            {partner?.name} will collect your items on {date} ({timeSlot}).
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
            <span>+25 Green Coins Credited</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Selected Recycling Partner
            </label>
            <div
              style={{
                padding: '10px 12px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}
            >
              {partner?.name} ({partner?.address})
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Pickup Date
              </label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Time Slot
              </label>
              <select
                className="input"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="9:00 AM – 12:00 PM">9:00 AM – 12:00 PM</option>
                <option value="12:00 PM – 3:00 PM">12:00 PM – 3:00 PM</option>
                <option value="3:00 PM – 6:00 PM">3:00 PM – 6:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Pickup Address
            </label>
            <input
              className="input"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Items for Disposal
            </label>
            <input
              className="input"
              value={items}
              onChange={e => setItems(e.target.value)}
              placeholder="e.g. 1 dead laptop, 2 phones"
              style={{ width: '100%' }}
              required
            />
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
            <Icon name="coin" size={14} color="var(--accent)" />
            <span>Earn +25 Green Coins upon driver collection scan</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-full">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-full">
              Confirm Pickup
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
