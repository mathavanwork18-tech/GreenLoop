import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'

interface PurchaseSummaryProps {
  title: string
  image: string
  condition?: string
  sellerName: string
  sellerRating?: number
  sellerVerified?: boolean
  amount: number
  platformFee?: number
}

export default function PurchaseSummary({
  title,
  image,
  condition,
  sellerName,
  sellerRating = 4.9,
  sellerVerified = true,
  amount,
  platformFee = 0,
}: PurchaseSummaryProps) {
  const total = amount + platformFee

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Product & Seller Header */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          padding: '14px',
          borderRadius: '14px',
          background: 'rgba(22, 27, 34, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '10px',
            overflow: 'hidden',
            background: '#0D1117',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <img
            src={image || 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80'}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80'
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span
              style={{
                fontSize: '0.96rem',
                fontWeight: 800,
                color: '#E6EDF3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          </div>

          {condition && (
            <div style={{ marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#8B949E',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '1px 7px',
                  borderRadius: '6px',
                }}
              >
                Condition: {condition}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#8B949E' }}>
            <span>Seller:</span>
            <span style={{ fontWeight: 700, color: '#E6EDF3' }}>{sellerName}</span>
            {sellerVerified && <Icon name="verified" size={12} color="#00FF9C" />}
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 2 }}>
              <Icon name="star" size={11} color="#f59e0b" />
              <span>{sellerRating}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Price Breakdown */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '14px',
          background: 'rgba(22, 27, 34, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#8B949E' }}>
          <span>Item Price</span>
          <span style={{ color: '#E6EDF3', fontWeight: 600 }}>{formatCurrency(amount)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#8B949E' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Platform Fee</span>
            <span style={{ fontSize: '0.68rem', color: '#00FF9C', background: 'rgba(0,255,156,0.1)', padding: '1px 5px', borderRadius: 4 }}>
              FREE
            </span>
          </span>
          <span style={{ color: '#00FF9C', fontWeight: 600 }}>₹0</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#8B949E' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Green Coins Reward</span>
          </span>
          <span style={{ color: '#00FF9C', fontWeight: 700 }}>+10 Coins</span>
        </div>

        <div
          style={{
            borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
            paddingTop: 10,
            marginTop: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#E6EDF3' }}>Total Amount</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00FF9C' }}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
