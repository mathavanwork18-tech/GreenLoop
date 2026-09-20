import { useState, useEffect, useRef } from 'react'
import Icon from '../Icon'
import { useAuth } from '../../context/AuthContext'
import { paymentService } from '../../services/payment/paymentService'
import type {
  MarketplacePurchase,
  PaymentMethod,
} from '../../types/payment.types'
import PaymentMethodCard from './PaymentMethodCard'
import PurchaseSummary from './PurchaseSummary'
import CashHandover from './CashHandover'
import { formatCurrency } from '../../utils/formatting'

type CheckoutView =
  | 'CONFIRM'
  | 'DEMO_PAYMENT'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'RECEIPT'
  | 'FAILED'
  | 'CASH_CONFIRM'
  | 'CASH_SUCCESS'

interface PurchaseCheckoutModalProps {
  isOpen: boolean
  post: {
    id: string
    title: string
    price: number | null
    images: string[]
    condition?: string
    seller: {
      id?: string
      name: string
      role?: string
      rating?: number
      verified?: boolean
    }
  } | null
  onClose: () => void
  onOpenChat?: (postId: string, listingContext: any) => void
  onViewTransactionDetails?: (purchase: MarketplacePurchase) => void
  onSuccess?: (result: any) => void
}

export default function PurchaseCheckoutModal({
  isOpen,
  post,
  onClose,
  onOpenChat,
  onViewTransactionDetails,
  onSuccess,
}: PurchaseCheckoutModalProps) {
  const { user } = useAuth()
  const [view, setView] = useState<CheckoutView>('CONFIRM')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('DEMO_QR')
  const [currentPurchase, setCurrentPurchase] = useState<MarketplacePurchase | null>(null)
  const [enteredAmount, setEnteredAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isMounted = useRef(true)

  // Compute normalized role labels for Buyer and Seller (supports all 4 combinations)
  const buyerRole = String(user?.role || '').toLowerCase()
  const buyerRoleLabel =
    buyerRole === 'local_shop' || buyerRole === 'shop'
      ? 'Local Shop'
      : buyerRole === 'company' || buyerRole === 'recycler'
      ? 'Recycler Company'
      : 'General'

  const sellerRole = String(post?.seller?.role || '').toLowerCase()
  const sellerRoleLabel =
    sellerRole === 'local_shop' || sellerRole === 'shop'
      ? 'Local Shop'
      : sellerRole === 'company' || sellerRole === 'recycler'
      ? 'Recycler Company'
      : 'General'

  // Check if buyer is the seller
  const isOwner = Boolean(
    user?.id && post?.seller?.id && user.id === post.seller.id
  )

  // Reset or initialize state when opening
  useEffect(() => {
    isMounted.current = true
    if (isOpen && post && user) {
      setErrorMessage(null)
      setIsSubmitting(false)
      setEnteredAmount('')
      // Check if there is already an active purchase for this post & buyer
      paymentService
        .getPurchaseByPostAndBuyer(post.id, user.id)
        .then((existing) => {
          if (!isMounted.current) return
          if (existing) {
            setCurrentPurchase(existing)
            setSelectedMethod(existing.paymentMethod)
            if (existing.paymentStatus === 'PAID' || existing.purchaseStatus === 'COMPLETED') {
              setView('SUCCESS')
            } else if (existing.paymentStatus === 'CASH_RECEIVED') {
              setView('CASH_SUCCESS')
            } else if (existing.paymentStatus === 'CASH_PENDING') {
              setView('CASH_CONFIRM')
            } else {
              setView('CONFIRM')
            }
          } else {
            setView('CONFIRM')
            setCurrentPurchase(null)
          }
        })
        .catch(() => {})
    }
    return () => {
      isMounted.current = false
    }
  }, [isOpen, post?.id, user?.id])

  if (!isOpen || !post) return null

  const askingPrice = Number(post.price || 0)
  const postImage = post.images?.[0] || 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80'

  // Step 1: Buyer clicks CONTINUE from Confirmation Screen
  const handleProceedFromConfirm = () => {
    if (!user) {
      setErrorMessage('Please sign in to proceed with purchase.')
      return
    }
    if (isOwner) {
      setErrorMessage('You cannot buy your own item.')
      return
    }

    if (selectedMethod === 'CASH') {
      setView('CASH_CONFIRM')
    } else {
      setView('DEMO_PAYMENT')
    }
  }

  // Step 2: Buyer submits Demo Payment with entered amount
  const handleExecuteDemoPayment = async () => {
    if (isSubmitting) return // Double-click prevention
    if (!user) {
      setErrorMessage('Please sign in to proceed with payment.')
      return
    }
    if (isOwner) {
      setErrorMessage('You cannot buy your own item.')
      return
    }

    const numericAmount = parseFloat(enteredAmount.trim())
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage(`Please enter a valid amount (e.g. ₹${askingPrice}).`)
      return
    }

    // Frontend validation check
    if (numericAmount !== askingPrice) {
      setErrorMessage(`Incorrect amount. Please enter exactly ₹${askingPrice}.`)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setView('PROCESSING')

    try {
      // Execute atomic purchase through backend RPC / service
      const res = await paymentService.processDemoPurchase(
        post.id,
        numericAmount,
        {
          id: user.id,
          name: user.name,
          phone: user.phone,
        }
      )

      if (res.success && res.purchase) {
        setCurrentPurchase(res.purchase)
        setView('SUCCESS')
        onSuccess?.(res)
      } else {
        throw new Error('Could not verify purchase with the database.')
      }
    } catch (err: any) {
      const msg = err?.message || 'Database error processing demo purchase. Please try again.'
      setErrorMessage(msg)
      setView('FAILED')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cash Handover submission
  const handleConfirmCashOrder = async () => {
    if (!user) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const purchase = await paymentService.createPurchaseRequest(
        {
          postId: post.id,
          postTitle: post.title,
          postImage,
          postCondition: post.condition,
          sellerId: post.seller.id || 'seller_default',
          sellerName: post.seller.name,
          sellerRating: post.seller.rating || 4.9,
          sellerVerified: post.seller.verified ?? true,
          amount: askingPrice,
          paymentMethod: 'CASH',
        },
        {
          id: user.id,
          name: user.name,
          phone: user.phone,
        }
      )
      setCurrentPurchase(purchase)
      setView('CASH_SUCCESS')
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not place Cash on Handover request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(5, 8, 12, 0.82)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && view !== 'PROCESSING') {
          onClose()
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '92vh',
          background: '#161B22',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Handle / Drag Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#00FF9C',
                background: 'rgba(0, 255, 156, 0.12)',
                border: '1px solid rgba(0, 255, 156, 0.25)',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
              }}
            >
              DEMO PAYMENT
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#E6EDF3' }}>
              {view === 'CONFIRM' && 'Confirm Purchase'}
              {view === 'DEMO_PAYMENT' && 'Demo Payment Screen'}
              {view === 'PROCESSING' && 'Processing Demo Payment'}
              {view === 'SUCCESS' && 'Purchase Successful'}
              {view === 'RECEIPT' && 'Purchase Receipt'}
              {view === 'FAILED' && 'Payment Failed'}
              {view === 'CASH_CONFIRM' && 'Cash on Handover'}
              {view === 'CASH_SUCCESS' && 'Handover Scheduled'}
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting || view === 'PROCESSING'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8B949E',
              cursor: isSubmitting || view === 'PROCESSING' ? 'not-allowed' : 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
            }}
          >
            <Icon name="close" size={18} color="#8B949E" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {/* OWNER WARNING BANNER */}
          {isOwner && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Icon name="shield" size={16} color="#ef4444" />
              <span>You cannot buy your own item.</span>
            </div>
          )}

          {/* SCREEN 1: PURCHASE CONFIRMATION */}
          {view === 'CONFIRM' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Product Price Summary */}
              <PurchaseSummary
                title={post.title}
                image={postImage}
                condition={post.condition}
                sellerName={post.seller.name}
                sellerRating={post.seller.rating}
                sellerVerified={post.seller.verified}
                amount={askingPrice}
                platformFee={0}
              />

              {/* Participant & Role Details Card (Supports all 4 role combinations) */}
              <div
                style={{
                  background: 'rgba(22, 27, 34, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: '0.84rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B949E' }}>Product</span>
                  <strong style={{ color: '#E6EDF3' }}>{post.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B949E' }}>Seller</span>
                  <strong style={{ color: '#E6EDF3' }}>{post.seller.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B949E' }}>Seller Role</span>
                  <span
                    style={{
                      background: sellerRoleLabel === 'Local Shop' ? 'rgba(0, 194, 255, 0.15)' : 'rgba(0, 255, 156, 0.15)',
                      color: sellerRoleLabel === 'Local Shop' ? '#00C2FF' : '#00FF9C',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                    }}
                  >
                    {sellerRoleLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B949E' }}>Buyer</span>
                  <strong style={{ color: '#E6EDF3' }}>{user?.name || 'Current User'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B949E' }}>Buyer Role</span>
                  <span
                    style={{
                      background: buyerRoleLabel === 'Local Shop' ? 'rgba(0, 194, 255, 0.15)' : 'rgba(0, 255, 156, 0.15)',
                      color: buyerRoleLabel === 'Local Shop' ? '#00C2FF' : '#00FF9C',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                    }}
                  >
                    {buyerRoleLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: 8 }}>
                  <span style={{ color: '#8B949E', fontWeight: 700 }}>Price to Pay</span>
                  <strong style={{ color: '#00FF9C', fontSize: '1.1rem' }}>{formatCurrency(askingPrice)}</strong>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#8B949E',
                    marginBottom: 10,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Select Payment Option
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PaymentMethodCard
                    method="DEMO_QR"
                    title="DEMO ONLINE PAYMENT"
                    subtitle="Simulated QR • Free"
                    desc="Enter amount and simulate instant purchase with demo QR code. No real money required."
                    icon="coin"
                    selected={selectedMethod === 'DEMO_QR' || selectedMethod === 'ONLINE'}
                    onSelect={() => setSelectedMethod('DEMO_QR')}
                  />

                  <PaymentMethodCard
                    method="CASH"
                    title="Cash on Handover"
                    subtitle="In-Person Payment"
                    desc="Inspect device in person and pay physical cash directly to the seller."
                    icon="pickup"
                    selected={selectedMethod === 'CASH'}
                    onSelect={() => setSelectedMethod('CASH')}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#E6EDF3',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isOwner}
                  onClick={handleProceedFromConfirm}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isOwner ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #00FF9C 0%, #00C2FF 100%)',
                    color: isOwner ? '#8B949E' : '#0D1117',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: isOwner ? 'not-allowed' : 'pointer',
                    boxShadow: isOwner ? 'none' : '0 4px 18px rgba(0, 255, 156, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>Continue to Payment</span>
                  <Icon name="arrow-right" size={16} color={isOwner ? '#8B949E' : '#0D1117'} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: DEMO PAYMENT SCREEN (QR + MANUAL AMOUNT ENTRY) */}
          {view === 'DEMO_PAYMENT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {/* Prominent Demo Notice Banner */}
              <div
                style={{
                  width: '100%',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="shield" size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.01em' }}>
                  DEMO ONLY — NO REAL MONEY WILL BE TRANSFERRED
                </span>
              </div>

              {/* Product Info Card */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(22, 27, 34, 0.75)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#8B949E' }}>Product</div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#E6EDF3' }}>{post.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.76rem', color: '#8B949E' }}>Amount Due</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00FF9C' }}>
                    {formatCurrency(askingPrice)}
                  </div>
                </div>
              </div>

              {/* Visual Demo QR Code */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: '#0D1117',
                  border: '2px solid rgba(0, 255, 156, 0.3)',
                  borderRadius: '16px',
                  padding: '18px',
                  position: 'relative',
                  width: 220,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Target Corners */}
                <div style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderTop: '2px solid #00FF9C', borderLeft: '2px solid #00FF9C' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderTop: '2px solid #00FF9C', borderRight: '2px solid #00FF9C' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8, width: 14, height: 14, borderBottom: '2px solid #00FF9C', borderLeft: '2px solid #00FF9C' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, width: 14, height: 14, borderBottom: '2px solid #00FF9C', borderRight: '2px solid #00FF9C' }} />

                {/* SVG Visual Demo QR Pattern */}
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" style={{ borderRadius: 8 }}>
                  {/* Position detection markers */}
                  <rect x="5" y="5" width="26" height="26" fill="#00FF9C" rx="4" />
                  <rect x="9" y="9" width="18" height="18" fill="#0D1117" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="#00FF9C" rx="1" />

                  <rect x="69" y="5" width="26" height="26" fill="#00FF9C" rx="4" />
                  <rect x="73" y="9" width="18" height="18" fill="#0D1117" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="#00FF9C" rx="1" />

                  <rect x="5" y="69" width="26" height="26" fill="#00FF9C" rx="4" />
                  <rect x="9" y="73" width="18" height="18" fill="#0D1117" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="#00FF9C" rx="1" />

                  {/* Demo Matrix Data Dots */}
                  <circle cx="42" cy="12" r="3" fill="#00C2FF" />
                  <circle cx="54" cy="12" r="3" fill="#00FF9C" />
                  <circle cx="48" cy="24" r="3" fill="#00C2FF" />
                  <circle cx="40" cy="36" r="3" fill="#00FF9C" />
                  <circle cx="58" cy="36" r="3" fill="#00C2FF" />
                  <circle cx="20" cy="46" r="3" fill="#00FF9C" />
                  <circle cx="34" cy="48" r="3" fill="#00C2FF" />
                  <circle cx="66" cy="48" r="3" fill="#00FF9C" />
                  <circle cx="82" cy="46" r="3" fill="#00C2FF" />
                  <circle cx="48" cy="58" r="4" fill="#00FF9C" />
                  <circle cx="42" cy="74" r="3" fill="#00C2FF" />
                  <circle cx="56" cy="74" r="3" fill="#00FF9C" />
                  <circle cx="70" cy="74" r="3" fill="#00C2FF" />
                  <circle cx="84" cy="80" r="3" fill="#00FF9C" />
                  <circle cx="50" cy="88" r="3" fill="#00C2FF" />
                </svg>

                <div style={{ marginTop: 8, fontSize: '0.68rem', fontWeight: 700, color: '#8B949E', textAlign: 'center' }}>
                  Demo QR Visual • Not a UPI QR
                </div>
              </div>

              {/* Amount Entry Input with Validation Feedback */}
              <div style={{ width: '100%' }}>
                <label
                  htmlFor="payment-amount-input"
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#E6EDF3',
                    marginBottom: 8,
                  }}
                >
                  Enter Payment Amount:
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0D1117',
                    border: errorMessage ? '2px solid #ef4444' : '2px solid rgba(0, 255, 156, 0.3)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00FF9C', marginRight: 8 }}>
                    ₹
                  </span>
                  <input
                    id="payment-amount-input"
                    type="number"
                    value={enteredAmount}
                    onChange={(e) => {
                      setEnteredAmount(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    placeholder={`Enter ${askingPrice}`}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#E6EDF3',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setEnteredAmount(String(askingPrice))}
                    style={{
                      background: 'rgba(0, 255, 156, 0.15)',
                      border: '1px solid rgba(0, 255, 156, 0.3)',
                      color: '#00FF9C',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Exact ₹{askingPrice}
                  </button>
                </div>

                {/* Error Banner if Amount Mismatch */}
                {errorMessage && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: '0.78rem',
                      color: '#ef4444',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon name="shield" size={14} color="#ef4444" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons with Double-Click Protection */}
              <div style={{ width: '100%', display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setView('CONFIRM')}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#E6EDF3',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleExecuteDemoPayment}
                  disabled={isSubmitting || !enteredAmount}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isSubmitting
                      ? 'rgba(0, 255, 156, 0.4)'
                      : 'linear-gradient(135deg, #00FF9C 0%, #00C2FF 100%)',
                    color: '#0D1117',
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    cursor: isSubmitting || !enteredAmount ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 18px rgba(0, 255, 156, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: '2px solid #0D1117',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                        }}
                      />
                      <span>Processing Demo Payment...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={16} color="#0D1117" />
                      <span>PAY NOW • {formatCurrency(parseFloat(enteredAmount) || askingPrice)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: PROCESSING LOADER */}
          {view === 'PROCESSING' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 10px',
                textAlign: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '4px solid rgba(0, 255, 156, 0.2)',
                  borderTopColor: '#00FF9C',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E6EDF3', margin: '0 0 6px 0' }}>
                  Processing Demo Purchase...
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8B949E', margin: 0 }}>
                  Validating item price with PostgreSQL and marking listing as SOLD.
                </p>
                <p style={{ fontSize: '0.74rem', color: '#00C2FF', marginTop: 8 }}>
                  Please don't close this window.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 4: SUCCESS STATE */}
          {view === 'SUCCESS' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '8px 0' }}>
              {/* Checkmark Icon */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 156, 0.15)',
                  border: '2px solid #00FF9C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={32} color="#00FF9C" />
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#00FF9C',
                    background: 'rgba(0, 255, 156, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ✓ DEMO PAYMENT COMPLETED
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#E6EDF3', margin: '8px 0 4px 0' }}>
                  Payment Successful!
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#8B949E', margin: 0 }}>
                  The item has been marked as sold and removed from the public marketplace.
                </p>
              </div>

              {/* Transaction Highlight Box */}
              <div
                style={{
                  width: '100%',
                  background: '#0D1117',
                  border: '1px solid rgba(0, 255, 156, 0.25)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8B949E' }}>
                  <span>Product</span>
                  <span style={{ color: '#E6EDF3', fontWeight: 700 }}>{post.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8B949E' }}>
                  <span>Amount Paid</span>
                  <span style={{ color: '#00FF9C', fontWeight: 800 }}>{formatCurrency(askingPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8B949E' }}>
                  <span>Transaction ID</span>
                  <span style={{ color: '#00C2FF', fontFamily: 'monospace', fontWeight: 700 }}>
                    {currentPurchase?.id || `GL-DEMO-${Date.now().toString().slice(-6)}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8B949E' }}>
                  <span>Green Coins Awarded</span>
                  <span style={{ color: '#00FF9C', fontWeight: 800 }}>+10 Green Coins</span>
                </div>
              </div>

              {/* Demo Disclaimer */}
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  width: '100%',
                }}
              >
                DEMO TRANSACTION — NO REAL MONEY WAS TRANSFERRED
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (currentPurchase && onViewTransactionDetails) {
                      onViewTransactionDetails(currentPurchase)
                    } else {
                      setView('RECEIPT')
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 194, 255, 0.3)',
                    background: 'rgba(0, 194, 255, 0.1)',
                    color: '#00C2FF',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="certificate" size={16} color="#00C2FF" />
                  <span>View Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChat?.(post.id, {})}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#E6EDF3',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="comment" size={16} color="#00FF9C" />
                  <span>Chat Seller</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00FF9C 0%, #059669 100%)',
                    color: '#0D1117',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: DUMMY BILL RECEIPT */}
          {view === 'RECEIPT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: '#0D1117',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  padding: '20px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: '#E6EDF3',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#00FF9C', letterSpacing: '0.08em' }}>
                    GREEN LOOP
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '0.72rem' }}>────────────────────────</div>
                  <div style={{ fontWeight: 800, color: '#E6EDF3', letterSpacing: '0.04em' }}>PURCHASE RECEIPT</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <span style={{ color: '#8B949E' }}>Transaction ID: </span>
                    <strong style={{ color: '#00C2FF' }}>
                      {currentPurchase?.id || `GL-DEMO-${Date.now().toString().slice(-6)}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Item: </span>
                    <strong>{post.title}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Seller: </span>
                    <strong>{post.seller.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Seller Role: </span>
                    <span style={{ color: '#00C2FF', fontWeight: 700 }}>{sellerRoleLabel}</span>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Buyer: </span>
                    <strong>{user?.name || 'Current User'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Buyer Role: </span>
                    <span style={{ color: '#00FF9C', fontWeight: 700 }}>{buyerRoleLabel}</span>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Amount: </span>
                    <strong style={{ color: '#00FF9C' }}>{formatCurrency(askingPrice)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Payment Method: </span>
                    <span>Demo QR Payment</span>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Payment Status: </span>
                    <span style={{ color: '#00FF9C', fontWeight: 700 }}>✓ Successful</span>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Green Coins: </span>
                    <span style={{ color: '#00FF9C', fontWeight: 700 }}>+10</span>
                  </div>
                  <div>
                    <span style={{ color: '#8B949E' }}>Date: </span>
                    <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <div style={{ color: '#8B949E', fontSize: '0.72rem' }}>────────────────────────</div>
                  <div style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 800, marginTop: 4 }}>
                    DEMO TRANSACTION
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '0.68rem' }}>
                    No real money was transferred.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setView('SUCCESS')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#E6EDF3',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#00FF9C',
                    color: '#0D1117',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 6: FAILED STATE */}
          {view === 'FAILED' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '12px 0' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '2px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="close" size={28} color="#ef4444" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', margin: '0 0 4px 0' }}>
                  Payment Failed
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#E6EDF3', margin: '0 0 6px 0', fontWeight: 600 }}>
                  {errorMessage || 'Unable to complete demo payment.'}
                </p>
                <p style={{ fontSize: '0.74rem', color: '#8B949E', margin: 0 }}>
                  The item remains available in the marketplace.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null)
                    setView('DEMO_PAYMENT')
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00FF9C 0%, #00C2FF 100%)',
                    color: '#0D1117',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#E6EDF3',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* CASH ON HANDOVER FLOW */}
          {view === 'CASH_CONFIRM' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <CashHandover
                purchase={
                  currentPurchase || {
                    id: `GL-CASH-${post.id.slice(0, 4).toUpperCase()}`,
                    postId: post.id,
                    postTitle: post.title,
                    postImage,
                    buyerId: user?.id || 'buyer',
                    buyerName: user?.name || 'Green Loop Member',
                    sellerId: post.seller.id || 'seller',
                    sellerName: post.seller.name,
                    amount: askingPrice,
                    platformFee: 0,
                    total: askingPrice,
                    paymentMethod: 'CASH',
                    paymentStatus: 'CASH_PENDING',
                    purchaseStatus: 'CASH_PENDING',
                    createdAt: new Date().toISOString(),
                  }
                }
                isSeller={false}
                onConfirmCashPurchase={handleConfirmCashOrder}
                onOpenChat={() => onOpenChat?.(post.id, {})}
                onViewTransaction={() => {
                  if (currentPurchase) onViewTransactionDetails?.(currentPurchase)
                }}
                isSubmitting={isSubmitting}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setView('CONFIRM')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#E6EDF3',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmCashOrder}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#00FF9C',
                    color: '#0D1117',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Placing Request...' : 'Confirm Cash Handover'}
                </button>
              </div>
            </div>
          )}

          {view === 'CASH_SUCCESS' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 156, 0.15)',
                  border: '2px solid #00FF9C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={28} color="#00FF9C" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E6EDF3', margin: '0 0 4px 0' }}>
                  Handover Order Placed!
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8B949E', margin: 0 }}>
                  Meet the seller, verify the device, and pay ₹{askingPrice} in cash.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#00FF9C',
                  color: '#0D1117',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
