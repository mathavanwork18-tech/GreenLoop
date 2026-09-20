import Icon from '../Icon'
import { formatCurrency } from '../../utils/formatting'
import TransactionTimeline from './TransactionTimeline'
import type { MarketplacePurchase } from '../../types/payment.types'

interface TransactionDetailsModalProps {
  isOpen: boolean
  purchase: MarketplacePurchase | null
  currentUserId?: string
  onClose: () => void
  onOpenChat?: () => void
  onConfirmCashReceived?: (purchaseId: string) => void
}

export default function TransactionDetailsModal({
  isOpen,
  purchase,
  currentUserId,
  onClose,
  onOpenChat,
  onConfirmCashReceived,
}: TransactionDetailsModalProps) {
  if (!isOpen || !purchase) return null

  const isSeller = currentUserId && purchase.sellerId === currentUserId
  const isOnline = purchase.paymentMethod === 'ONLINE'
  const isPaid = purchase.paymentStatus === 'PAID'
  const isCashReceived = purchase.paymentStatus === 'CASH_RECEIVED'
  const isCashPending = purchase.paymentStatus === 'CASH_PENDING'
  const isCompleted = purchase.purchaseStatus === 'COMPLETED'

  const getStatusBadge = () => {
    if (isPaid || isCashReceived || isCompleted) {
      return {
        label: isOnline ? 'PAID' : 'CASH RECEIVED',
        color: '#00FF9C',
        bg: 'rgba(0, 255, 156, 0.12)',
      }
    }
    if (isCashPending) {
      return {
        label: 'CASH PENDING',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.12)',
      }
    }
    return {
      label: 'PROCESSING',
      color: '#00C2FF',
      bg: 'rgba(0, 194, 255, 0.12)',
    }
  }

  const badge = getStatusBadge()

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{ zIndex: 120, background: 'rgba(5, 10, 8, 0.85)', backdropFilter: 'blur(8px)' }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '94%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#161B22',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
          zIndex: 125,
          padding: '0 0 24px',
          color: '#E6EDF3',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: '#161B22',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'rgba(0, 255, 156, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="certificate" size={16} color="#00FF9C" />
            </div>
            <div>
              <span style={{ fontSize: '0.94rem', fontWeight: 800 }}>Transaction Receipt</span>
              <div style={{ fontSize: '0.72rem', color: '#8B949E', fontFamily: 'monospace' }}>
                ID: {purchase.id}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#8B949E',
            }}
          >
            <Icon name="close" size={13} color="#8B949E" />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Main Total & Title banner */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Transacted
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#00FF9C' }}>
                {formatCurrency(purchase.total)}
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#E6EDF3', marginTop: 2 }}>
                {purchase.postTitle}
              </div>
            </div>

            <span
              style={{
                background: badge.bg,
                color: badge.color,
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '20px',
                border: `1px solid ${badge.color}40`,
              }}
            >
              {badge.label}
            </span>
          </div>

          {/* Details Table */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: 20,
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8B949E' }}>Payment Method</span>
              <span style={{ fontWeight: 700, color: purchase.paymentMethod === 'DEMO_QR' || isOnline ? '#00FF9C' : '#fbbf24' }}>
                {purchase.paymentMethod === 'DEMO_QR' ? 'Demo QR Payment' : isOnline ? 'Demo Online Payment' : 'Cash on Handover'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8B949E' }}>Green Coins</span>
              <span style={{ fontWeight: 800, color: '#00FF9C' }}>+10 Coins</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8B949E' }}>Buyer</span>
              <span style={{ fontWeight: 600, color: '#E6EDF3' }}>
                {purchase.buyerName} {purchase.buyerRole ? `(${purchase.buyerRole === 'local_shop' || purchase.buyerRole === 'shop' ? 'Local Shop' : 'General'})` : ''}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8B949E' }}>Seller</span>
              <span style={{ fontWeight: 600, color: '#E6EDF3' }}>
                {purchase.sellerName} {purchase.sellerRole ? `(${purchase.sellerRole === 'local_shop' || purchase.sellerRole === 'shop' ? 'Local Shop' : 'General'})` : ''}
              </span>
            </div>

            {purchase.paymentMethod === 'DEMO_QR' && (
              <div
                style={{
                  background: 'rgba(0, 255, 156, 0.08)',
                  border: '1px solid rgba(0, 255, 156, 0.25)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  textAlign: 'center',
                  color: '#00FF9C',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  margin: '4px 0',
                }}
              >
                DEMO TRANSACTION — NO REAL MONEY WAS TRANSFERRED
              </div>
            )}

            {purchase.gatewayPaymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B949E' }}>Gateway Payment ID</span>
                <span style={{ fontFamily: 'monospace', color: '#00C2FF' }}>{purchase.gatewayPaymentId}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8B949E' }}>Created Date</span>
              <span style={{ color: '#E6EDF3' }}>
                {new Date(purchase.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {(purchase.paidAt || purchase.cashConfirmedAt) && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B949E' }}>Settled Date</span>
                <span style={{ color: '#00FF9C', fontWeight: 600 }}>
                  {new Date((purchase.paidAt || purchase.cashConfirmedAt)!).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8B949E', marginBottom: 12 }}>
              Transaction Milestones
            </div>
            <TransactionTimeline purchase={purchase} />
          </div>

          {/* Demo Disclaimer */}
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#fbbf24',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '8px 12px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            DEMO TRANSACTION — NO REAL MONEY WAS TRANSFERRED
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isSeller && isCashPending && onConfirmCashReceived && (
              <button
                onClick={() => onConfirmCashReceived(purchase.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
                  border: 'none',
                  color: '#0D1117',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icon name="check" size={16} color="#0D1117" />
                <span>Confirm Cash Received</span>
              </button>
            )}

            <button
              onClick={onOpenChat}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: isSeller && isCashPending ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
                border: isSeller && isCashPending ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                color: isSeller && isCashPending ? '#E6EDF3' : '#0D1117',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon name="comment" size={16} color={isSeller && isCashPending ? '#00C2FF' : '#0D1117'} />
              <span>Open Chat with {isSeller ? purchase.buyerName : purchase.sellerName}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
