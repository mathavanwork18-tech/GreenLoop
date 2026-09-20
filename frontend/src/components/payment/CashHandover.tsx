import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'
import type { MarketplacePurchase } from '../../types/payment.types'

interface CashHandoverProps {
  purchase: MarketplacePurchase
  isSeller?: boolean
  onConfirmCashPurchase?: () => void
  onConfirmCashReceived?: () => void
  onOpenChat: () => void
  onViewTransaction: () => void
  isSubmitting?: boolean
}

export default function CashHandover({
  purchase,
  isSeller = false,
  onConfirmCashPurchase,
  onConfirmCashReceived,
  onOpenChat,
  onViewTransaction,
  isSubmitting = false,
}: CashHandoverProps) {
  const isReceived = purchase.paymentStatus === 'CASH_RECEIVED' || purchase.purchaseStatus === 'COMPLETED'
  const isPending = !isReceived

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 20px',
        textAlign: 'center',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: isReceived ? 'rgba(0, 255, 156, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `2px solid ${isReceived ? '#00FF9C' : '#f59e0b'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon name={isReceived ? 'check' : 'coin'} size={28} color={isReceived ? '#00FF9C' : '#f59e0b'} />
      </div>

      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#E6EDF3', marginBottom: 2 }}>
        {isReceived ? 'Cash Received' : 'Cash on Handover'}
      </div>

      <div
        style={{
          fontSize: '1.65rem',
          fontWeight: 900,
          color: isReceived ? '#00FF9C' : '#fbbf24',
          margin: '4px 0 6px',
        }}
      >
        {formatCurrency(purchase.total)}
      </div>

      <div
        style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          color: '#E6EDF3',
          maxWidth: 320,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 4,
        }}
      >
        {purchase.postTitle}
      </div>

      <div style={{ fontSize: '0.8rem', color: '#8B949E', marginBottom: 18 }}>
        {isReceived
          ? 'Transaction completed. Seller confirmed cash receipt.'
          : `Pay directly in cash when you inspect and receive the device from ${purchase.sellerName}.`}
      </div>

      {/* Cash Flow Progress Card */}
      <div
        style={{
          width: '100%',
          background: 'rgba(22, 27, 34, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: 20,
          textAlign: 'left',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E' }}>
          <span>Purchase ID</span>
          <span style={{ color: '#E6EDF3', fontWeight: 700, fontFamily: 'monospace' }}>{purchase.id}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E' }}>
          <span>Seller</span>
          <span style={{ color: '#E6EDF3', fontWeight: 600 }}>{purchase.sellerName}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E' }}>
          <span>Payment Method</span>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>Cash on Handover</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E' }}>
          <span>Payment Status</span>
          <span
            style={{
              color: isReceived ? '#00FF9C' : '#fbbf24',
              fontWeight: 800,
              fontSize: '0.74rem',
              background: isReceived ? 'rgba(0, 255, 156, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            {isReceived ? '✓ CASH RECEIVED' : '● CASH PENDING'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* If seller is viewing pending cash, allow them to confirm cash receipt */}
        {isSeller && isPending && onConfirmCashReceived && (
          <button
            onClick={onConfirmCashReceived}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
              border: 'none',
              color: '#0D1117',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0, 255, 156, 0.25)',
            }}
          >
            <Icon name="check" size={18} color="#0D1117" />
            <span>Confirm Cash Received</span>
          </button>
        )}

        {/* If buyer is creating cash order */}
        {!isSeller && isPending && onConfirmCashPurchase && (
          <button
            onClick={onConfirmCashPurchase}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
              border: 'none',
              color: '#0D1117',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0, 255, 156, 0.25)',
            }}
          >
            <Icon name="check" size={17} color="#0D1117" />
            <span>Confirm Cash Purchase</span>
          </button>
        )}

        <button
          onClick={onOpenChat}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: isPending && !onConfirmCashPurchase ? 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.06)',
            border: isPending && !onConfirmCashPurchase ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
            color: isPending && !onConfirmCashPurchase ? '#0D1117' : '#E6EDF3',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="comment" size={16} color={isPending && !onConfirmCashPurchase ? '#0D1117' : '#00C2FF'} />
          <span>Open Chat to Coordinate Handover</span>
        </button>

        <button
          onClick={onViewTransaction}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            color: '#8B949E',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View Full Transaction Details
        </button>
      </div>
    </div>
  )
}
