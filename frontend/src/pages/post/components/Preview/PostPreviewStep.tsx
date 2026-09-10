import Icon from '../../../../components/Icon'
import { formatCurrency } from '../../../../utils/formatting'

interface PostPreviewStepProps {
  title: string
  category: string
  purpose: string
  price: number | ''
  location: string
  description: string
  image: string
  condition: string
  onPublish: () => void
  onBack: () => void
}

export default function PostPreviewStep({
  title,
  category,
  purpose,
  price,
  location,
  description,
  image,
  condition,
  onPublish,
  onBack
}: PostPreviewStepProps) {
  return (
    <div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ position: 'relative', width: '100%', height: 210, background: '#111' }}>
          <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              color: '#34d399',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800
            }}
          >
            {purpose}
          </span>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
              {price !== '' && price > 0 ? formatCurrency(price) : 'Free Drop-Off'}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
            {category} • {condition} • {location}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 14px' }}>
            {description}
          </p>

          <div
            style={{
              padding: '10px 14px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-text)' }}>
              <Icon name="coin" size={15} color="var(--accent)" />
              <span>Reward Upon Publishing:</span>
            </div>
            <strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>+10 Green Coins</strong>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onBack} className="btn btn-ghost btn-full">
          Back
        </button>
        <button type="button" onClick={onPublish} className="btn btn-primary btn-full">
          Publish Now
        </button>
      </div>
    </div>
  )
}
