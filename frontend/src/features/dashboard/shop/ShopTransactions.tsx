import { useState, useEffect } from 'react'
import { shopService, type ShopTransactionItem } from '../../../services/shop/shopService'
import Icon from '../../../components/Icon'

export default function ShopTransactions() {
  const [transactions, setTransactions] = useState<ShopTransactionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await shopService.getTransactions()
      setTransactions(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load transactions from Supabase.')
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
            Business Transactions
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Certified electronics acquisition and refurbishment claim ledger
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

      {error && (
        <div style={{ padding: 14, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading transactions from Supabase...
        </div>
      ) : transactions.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="coin" size={24} color="#2563eb" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            0 Transactions
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            No purchase or collection transactions recorded yet. Completed claims and pickups will appear here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Item</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Est. Value</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Offered</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-tertiary)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>{tx.itemTitle}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{tx.customerName}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>₹{tx.estimatedValue.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>₹{tx.offeredValue.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background:
                            tx.status === 'Completed'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : tx.status === 'Pending'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            tx.status === 'Completed'
                              ? '#10b981'
                              : tx.status === 'Pending'
                              ? '#f59e0b'
                              : '#ef4444',
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
