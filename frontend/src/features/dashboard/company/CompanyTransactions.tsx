import { useState, useEffect } from 'react'
import { shopService, type ShopTransactionItem } from '../../../services/shop/shopService'
import Icon from '../../../components/Icon'

export default function CompanyTransactions() {
  const [transactions, setTransactions] = useState<ShopTransactionItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await shopService.getTransactions()
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Enterprise B2B Transactions
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Bulk commodity settlements, recycled fraction off-take, and industrial client invoicing
          </p>
        </div>
        <button
          onClick={loadTransactions}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading enterprise ledger...
        </div>
      ) : transactions.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="coin" size={24} color="#059669" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            0 Enterprise Transactions
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            No bulk material settlement invoices recorded yet in Supabase.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Lot / Batch</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Client Entity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Gross Weight</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Value</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Settlement Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>{tx.itemTitle}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{tx.customerName}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>~35 kg bulk</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>₹{(tx.offeredValue * 2.5).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
