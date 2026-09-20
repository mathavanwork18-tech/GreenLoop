import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useAuth } from '../../context/AuthContext'
import { paymentService } from '../../services/payment/paymentService'
import { formatCurrency } from '../../utils/formatting'
import { TransactionDetailsModal } from '../../components/payment'
import type { MarketplacePurchase } from '../../types/payment.types'

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'SALES'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([])
  const [sales, setSales] = useState<MarketplacePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<MarketplacePurchase | null>(null)

  const loadData = () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    paymentService
      .getUserPurchases(user.id)
      .then(({ purchases: p, sales: s }) => {
        setPurchases(p)
        setSales(s)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('gl_purchase_updated', handleUpdate)
    return () => {
      window.removeEventListener('gl_purchase_updated', handleUpdate)
    }
  }, [user?.id])

  const allTransactions = [...purchases, ...sales].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const filtered = allTransactions.filter((tx) => {
    if (activeTab === 'ACTIVE') {
      return tx.purchaseStatus !== 'COMPLETED' && tx.purchaseStatus !== 'CANCELLED'
    }
    if (activeTab === 'COMPLETED') {
      return tx.purchaseStatus === 'COMPLETED'
    }
    if (activeTab === 'SALES') {
      return tx.sellerId === user?.id
    }
    return true
  })

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0D1117',
        color: '#E6EDF3',
        padding: '20px 16px 80px',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#E6EDF3', margin: 0 }}>
              Transactions & Orders
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#8B949E', margin: '4px 0 0' }}>
              Track all your e-waste purchases, payments, and sales in one place.
            </p>
          </div>
          <Link
            to="/marketplace"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0, 255, 156, 0.1)',
              border: '1px solid rgba(0, 255, 156, 0.25)',
              color: '#00FF9C',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Icon name="shop" size={14} color="#00FF9C" />
            <span>Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 10,
          marginBottom: 16,
        }}
      >
        {(
          [
            { id: 'ALL', label: 'All Orders' },
            { id: 'ACTIVE', label: 'Active Handover' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'SALES', label: 'Sold Items (My Sales)' },
          ] as { id: FilterTab; label: string }[]
        ).map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: isSelected ? '#00FF9C' : 'rgba(255, 255, 255, 0.05)',
                border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isSelected ? '#0D1117' : '#8B949E',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Transaction List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B949E' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid rgba(0, 255, 156, 0.2)',
              borderTopColor: '#00FF9C',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <span>Loading verified transactions...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: 'rgba(22, 27, 34, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Icon name="package" size={24} color="#8B949E" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#E6EDF3', marginBottom: 4 }}>
            No Transactions Found
          </div>
          <p style={{ fontSize: '0.82rem', color: '#8B949E', maxWidth: 300, margin: '0 auto 18px' }}>
            {activeTab === 'ACTIVE'
              ? 'You have no active orders in handover progress.'
              : activeTab === 'SALES'
              ? 'You have not made any sales yet. Sold listings will automatically appear here.'
              : 'You have not made any purchases yet. Explore electronics and spare parts on the marketplace.'}
          </p>
          <Link
            to="/marketplace"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#00FF9C',
              color: '#0D1117',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.86rem',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            <span>Explore Marketplace</span>
            <Icon name="arrow-right" size={15} color="#0D1117" />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((tx) => {
            const isOnline = tx.paymentMethod === 'ONLINE'
            const isCompleted = tx.purchaseStatus === 'COMPLETED'
            const isPaid = tx.paymentStatus === 'PAID'
            const isCash = tx.paymentMethod === 'CASH'
            const isCashReceived = tx.paymentStatus === 'CASH_RECEIVED'

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                style={{
                  background: 'rgba(22, 27, 34, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '12px',
                    background: '#0D1117',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <img
                    src={tx.postImage || 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80'}
                    alt={tx.postTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '0.94rem',
                        fontWeight: 800,
                        color: '#E6EDF3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tx.postTitle}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#00FF9C', whiteSpace: 'nowrap' }}>
                      {formatCurrency(tx.total)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isCompleted || isPaid || isCashReceived ? '#00FF9C' : '#fbbf24',
                        background:
                          isCompleted || isPaid || isCashReceived
                            ? 'rgba(0, 255, 156, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {isCompleted
                        ? 'COMPLETED'
                        : isPaid
                        ? 'PAID • HANDOVER PENDING'
                        : isCashReceived
                        ? 'CASH RECEIVED'
                        : isCash
                        ? 'CASH PENDING'
                        : 'PAYMENT PENDING'}
                    </span>

                    <span style={{ fontSize: '0.72rem', color: '#8B949E' }}>
                      {tx.paymentMethod === 'DEMO_QR'
                        ? 'Demo Payment'
                        : isOnline
                        ? 'Online Payment'
                        : 'Cash on Handover'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#8B949E' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: '#8B949E', fontFamily: 'monospace' }}>
                      #{tx.id}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#8B949E', marginTop: 4 }}>
                    {tx.sellerId === user?.id
                      ? `Buyer: ${tx.buyerName}`
                      : `Seller: ${tx.sellerName}`}
                  </div>
                </div>

                <Icon name="arrow-right" size={16} color="#8B949E" />
              </div>
            )
          })}
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        purchase={selectedTransaction}
        currentUserId={user?.id}
        onClose={() => setSelectedTransaction(null)}
        onOpenChat={() => setSelectedTransaction(null)}
        onConfirmCashReceived={async (id) => {
          if (user?.id) {
            const confirmed = await paymentService.confirmCashReceived(id, user.id)
            setSelectedTransaction(confirmed)
            loadData()
          }
        }}
      />
    </div>
  )
}
