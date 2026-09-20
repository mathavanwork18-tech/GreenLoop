import Icon from '../Icon'
import type { MarketplacePurchase } from '../../types/payment.types'

interface TimelineStep {
  key: string
  label: string
  desc: string
  status: 'completed' | 'current' | 'upcoming'
}

export default function TransactionTimeline({ purchase }: { purchase: MarketplacePurchase }) {
  const isOnline = purchase.paymentMethod === 'ONLINE'
  const pStatus = purchase.purchaseStatus
  const payStatus = purchase.paymentStatus

  const getOnlineSteps = (): TimelineStep[] => {
    const isPaid = payStatus === 'PAID'
    const isCompleted = pStatus === 'COMPLETED'
    const isProcessing = payStatus === 'PROCESSING' || pStatus === 'PAYMENT_PROCESSING'

    return [
      {
        key: 'requested',
        label: 'Purchase Requested',
        desc: 'Buyer submitted order request',
        status: 'completed',
      },
      {
        key: 'accepted',
        label: 'Seller Accepted',
        desc: 'Seller confirmed device availability',
        status: 'completed',
      },
      {
        key: 'payment',
        label: isPaid ? 'Payment Verified' : 'Payment Processing',
        desc: isPaid ? '₹' + purchase.amount + ' verified securely' : 'Gateway processing verification',
        status: isPaid ? 'completed' : isProcessing ? 'current' : 'upcoming',
      },
      {
        key: 'handover',
        label: 'Ready for Handover',
        desc: 'Direct meetup / pickup coordination',
        status: isCompleted ? 'completed' : isPaid ? 'current' : 'upcoming',
      },
      {
        key: 'completed',
        label: 'Completed',
        desc: 'Device inspected and delivered',
        status: isCompleted ? 'completed' : 'upcoming',
      },
    ]
  }

  const getCashSteps = (): TimelineStep[] => {
    const isReceived = payStatus === 'CASH_RECEIVED' || pStatus === 'COMPLETED'
    const isCompleted = pStatus === 'COMPLETED'

    return [
      {
        key: 'requested',
        label: 'Purchase Requested',
        desc: 'Buyer selected Cash on Handover',
        status: 'completed',
      },
      {
        key: 'accepted',
        label: 'Seller Accepted',
        desc: 'Handover terms agreed in chat',
        status: 'completed',
      },
      {
        key: 'cash_pending',
        label: isReceived ? 'Cash Received' : 'Cash Pending Handover',
        desc: isReceived ? 'Seller confirmed ₹' + purchase.amount + ' cash' : 'Pay ₹' + purchase.amount + ' upon physical delivery',
        status: isReceived ? 'completed' : 'current',
      },
      {
        key: 'completed',
        label: 'Completed',
        desc: 'Receipt confirmed & device handed over',
        status: isCompleted ? 'completed' : 'upcoming',
      },
    ]
  }

  const steps = isOnline ? getOnlineSteps() : getCashSteps()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '4px 0' }}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1
        const isComp = step.status === 'completed'
        const isCurr = step.status === 'current'

        return (
          <div key={step.key} style={{ display: 'flex', gap: 14, position: 'relative' }}>
            {/* Left Node & Vertical Connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: isComp
                    ? '#00FF9C'
                    : isCurr
                    ? 'rgba(0, 194, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isComp
                    ? '2px solid #00FF9C'
                    : isCurr
                    ? '2px solid #00C2FF'
                    : '2px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isComp ? '#0D1117' : isCurr ? '#00C2FF' : '#8B949E',
                  fontSize: 11,
                  fontWeight: 900,
                  boxShadow: isCurr ? '0 0 12px rgba(0, 194, 255, 0.35)' : 'none',
                  zIndex: 2,
                }}
              >
                {isComp ? (
                  <Icon name="check" size={13} color="#0D1117" />
                ) : isCurr ? (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C2FF' }} />
                ) : (
                  <span style={{ fontSize: 10 }}>{idx + 1}</span>
                )}
              </div>

              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 32,
                    background: isComp ? 'rgba(0, 255, 156, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    margin: '4px 0',
                  }}
                />
              )}
            </div>

            {/* Right Step Info */}
            <div style={{ flex: 1, paddingBottom: isLast ? 4 : 20 }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: isCurr ? 800 : isComp ? 700 : 500,
                  color: isComp ? '#E6EDF3' : isCurr ? '#00C2FF' : '#8B949E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{step.label}</span>
                {isCurr && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(0, 194, 255, 0.12)',
                      color: '#00C2FF',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    IN PROGRESS
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#8B949E', marginTop: 2, lineHeight: 1.35 }}>
                {step.desc}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
