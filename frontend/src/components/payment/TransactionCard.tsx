import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'
import type { MarketplacePurchase } from '../../types/payment.types'

interface TransactionCardProps {
  purchase: MarketplacePurchase
  isSeller?: boolean
  onViewDetails: () => void
  onConfirmCashReceived?: () => void
}

export default function TransactionCard({
  purchase,
  isSeller = false,
  onViewDetails,
  onConfirmCashReceived,
}: TransactionCardProps) {
  const isOnline = purchase.paymentMethod === 'ONLINE' || purchase.paymentMethod === 'DEMO_QR'
  const isPaid = purchase.paymentStatus === 'PAID'
  const isCashPending = purchase.paymentStatus === 'CASH_PENDING'
  const isCashReceived = purchase.paymentStatus === 'CASH_RECEIVED'
  const isCompleted = purchase.purchaseStatus === 'COMPLETED'

  const getStatusBadge = () => {
    if (isPaid || isCompleted || isCashReceived) {
      return {
        label: purchase.paymentMethod === 'DEMO_QR'
          ? '✓ Demo Payment Verified'
          : isOnline
          ? '✓ Payment Verified'
          : '✓ Cash Received',
        color: '#00FF9C',
        bg: 'rgba(0, 255, 156, 0.12)',
        border: 'rgba(0, 255, 156, 0.3)',
      }
    }
    if (isCashPending) {
      return {
        label: '● Cash on Handover (Pending)',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
      }
    }
    return {
      label: '● Payment Processing',
      color: '#00C2FF',
      bg: 'rgba(0, 194, 255, 0.12)',
      border: 'rgba(0, 194, 255, 0.3)',
    }
  }

  const badge = getStatusBadge()

  return (
    <div
      style={{
        background: 'rgba(22, 27, 34, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        padding: '12px 14px',
        margin: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Header Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#8B949E',
            }}
          >
            TRANSACTION
          </span>
          <span style={{ fontSize: '0.72rem', color: '#E6EDF3', fontFamily: 'monospace' }}>
            #{purchase.id}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px',
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Item & Price summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#E6EDF3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {purchase.postTitle}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#8B949E', marginTop: 2 }}>
            {purchase.paymentMethod === 'DEMO_QR'
              ? 'Demo QR Payment'
              : isOnline
              ? 'Demo Online Payment'
              : 'Cash on Handover'}
            {isSeller
              ? ` • Buyer: ${purchase.buyerName || 'Buyer'} (${purchase.buyerRole === 'local_shop' || purchase.buyerRole === 'shop' ? 'Local Shop' : 'General'})`
              : ` • Seller: ${purchase.sellerName || 'Seller'} (${purchase.sellerRole === 'local_shop' || purchase.sellerRole === 'shop' ? 'Local Shop' : 'General'})`}
          </div>
          {purchase.paymentMethod === 'DEMO_QR' && (
            <div style={{ fontSize: '0.66rem', color: '#00FF9C', fontWeight: 800, marginTop: 4 }}>
              DEMO TRANSACTION — NO REAL MONEY WAS TRANSFERRED
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#00FF9C', whiteSpace: 'nowrap' }}>
          {formatCurrency(purchase.total)}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
        <button
          onClick={onViewDetails}
          style={{
            flex: 1,
            padding: '7px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#E6EDF3',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Icon name="certificate" size={13} color="#00C2FF" />
          <span>View Transaction</span>
        </button>

        {isSeller && isCashPending && onConfirmCashReceived && (
          <button
            onClick={onConfirmCashReceived}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              background: '#00FF9C',
              border: 'none',
              color: '#0D1117',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Icon name="check" size={13} color="#0D1117" />
            <span>Confirm Cash</span>
          </button>
        )}
      </div>
    </div>
  )
}
