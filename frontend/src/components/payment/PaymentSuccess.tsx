import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'
import type { MarketplacePurchase } from '../../types/payment.types'

interface PaymentSuccessProps {
  purchase: MarketplacePurchase
  onViewTransaction: () => void
  onOpenChat: () => void
}

export default function PaymentSuccess({
  purchase,
  onViewTransaction,
  onOpenChat,
}: PaymentSuccessProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 20px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Animated Self-Drawing Checkmark with Emerald Glow */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: 'rgba(0, 255, 156, 0.12)',
          border: '2px solid #00FF9C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          boxShadow: '0 0 24px rgba(0, 255, 156, 0.35)',
        }}
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00FF9C"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#E6EDF3', marginBottom: 2 }}>
        Payment Successful
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#00FF9C', margin: '4px 0' }}>
        {formatCurrency(purchase.total)}
      </div>

      <div
        style={{
          fontSize: '0.88rem',
          fontWeight: 700,
          color: '#E6EDF3',
          maxWidth: 320,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 2,
        }}
      >
        {purchase.postTitle}
      </div>

      <div style={{ fontSize: '0.78rem', color: '#8B949E', marginBottom: 18 }}>
        Transaction confirmed. Seller <span style={{ color: '#E6EDF3', fontWeight: 600 }}>{purchase.sellerName}</span> has been notified.
      </div>

      {/* Verified Details Card */}
      <div
        style={{
          width: '100%',
          background: 'rgba(22, 27, 34, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8B949E' }}>
          <span>Purchase ID</span>
          <span style={{ color: '#E6EDF3', fontWeight: 700, fontFamily: 'monospace' }}>{purchase.id}</span>
        </div>

        {purchase.gatewayPaymentId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8B949E' }}>
            <span>Payment ID</span>
            <span style={{ color: '#00C2FF', fontWeight: 600, fontFamily: 'monospace' }}>
              {purchase.gatewayPaymentId}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8B949E' }}>
          <span>Status</span>
          <span
            style={{
              color: '#00FF9C',
              fontWeight: 800,
              fontSize: '0.74rem',
              background: 'rgba(0, 255, 156, 0.12)',
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            ✓ PAID • READY FOR HANDOVER
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onOpenChat}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
            border: 'none',
            color: '#0D1117',
            fontSize: '0.92rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(0, 255, 156, 0.25)',
          }}
        >
          <Icon name="comment" size={17} color="#0D1117" />
          <span>Open Chat with Seller</span>
        </button>

        <button
          onClick={onViewTransaction}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#E6EDF3',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Icon name="certificate" size={16} color="#00C2FF" />
          <span>View Transaction Details</span>
        </button>
      </div>
    </div>
  )
}
