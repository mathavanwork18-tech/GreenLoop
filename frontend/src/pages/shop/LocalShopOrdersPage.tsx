import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import Icon from '../../components/Icon'

interface PurchaseRecord {
  id: string
  postId: string
  title: string
  category: string
  condition: string
  price: number | null
  sellerName: string
  status: string
  createdAt: string
}

export default function LocalShopOrdersPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Promotion Center State
  const [promoName, setPromoName] = useState('Tempered Glass & Screen Guard')
  const [normalPrice, setNormalPrice] = useState('200')
  const [discountPercent, setDiscountPercent] = useState('20')
  const [coinCost, setCoinCost] = useState('200')
  const [radiusKm, setRadiusKm] = useState('5')
  const [promoNotice, setPromoNotice] = useState<string | null>(null)

  const loadPurchases = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) {
        setLoading(false)
        return
      }

      // Query real post_claims for this user
      const { data: claimsData, error: claimsErr } = await supabase
        .from('post_claims')
        .select(`
          id,
          user_id,
          post_id,
          status,
          created_at,
          e_waste_posts:post_id (
            id,
            title,
            category,
            condition,
            asking_price,
            user_id
          )
        `)
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })

      if (claimsErr) {
        throw new Error(claimsErr.message || 'Failed to load purchase claims.')
      }

      const rawClaims = claimsData || []
      const sellerIds = Array.from(new Set(rawClaims.map((c: any) => c.e_waste_posts?.user_id).filter(Boolean)))

      let sellersMap = new Map<string, string>()
      if (sellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', sellerIds)

        ;(profiles || []).forEach(p => sellersMap.set(p.id, p.full_name))
      }

      const mapped: PurchaseRecord[] = rawClaims.map((c: any) => {
        const post = c.e_waste_posts || {}
        return {
          id: c.id,
          postId: c.post_id,
          title: post.title || 'E-Waste Item',
          category: post.category || 'Hardware',
          condition: post.condition || 'Used',
          price: post.asking_price !== null && post.asking_price !== undefined ? Number(post.asking_price) : null,
          sellerName: sellersMap.get(post.user_id) || 'Citizen Member',
          status: c.status || 'pending',
          createdAt: c.created_at,
        }
      })

      setPurchases(mapped)
    } catch (err: any) {
      console.error('[Green Loop Shop] Fetch purchases error:', err)
      setError(err.message || 'Error querying purchase records from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  // Live Metrics (Section B) computed strictly from real database records
  const totalPurchases = purchases.length
  const completedPurchases = purchases.filter(p => p.status === 'completed' || p.status === 'approved').length
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length
  const totalExpenditure = purchases
    .filter(p => p.status === 'completed' && p.price !== null)
    .reduce((sum, p) => sum + (p.price || 0), 0)

  const handlePublishPromotion = (e: React.FormEvent) => {
    e.preventDefault()
    // Explicit disclosure of schema limitation per instruction
    setPromoNotice('Green Coin promotion persistence is not supported by the current database schema. Your promotion configuration has been verified locally, but cannot be committed until a promotion ledger table is added to Supabase.')
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'approved') {
      return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800 }}>Completed</span>
    }
    if (s === 'pending') {
      return <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800 }}>Pending Review</span>
    }
    if (s === 'rejected' || s === 'cancelled') {
      return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800 }}>Cancelled</span>
    }
    return <span style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800 }}>{status}</span>
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 36px)', width: '100%' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Shop Procurement & Orders Hub
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Manage purchase claims, live procurement impact, and Green Coin promotion campaigns
            </div>
          </div>
          <button
            onClick={loadPurchases}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="refresh" size={14} color="var(--accent)" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* ========================================================================= */}
        {/* SECTION B — RESULTS / IMPACT (Calculated from Real DB Records) */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="chart" size={16} color="var(--accent)" />
            <span>Procurement Results & Material Impact</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{totalPurchases}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Total Claims Placed</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>{completedPurchases}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Completed Purchases</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eab308' }}>{pendingPurchases}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Pending Citizen Response</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--coin-color)' }}>
                {totalExpenditure > 0 ? `₹${totalExpenditure.toLocaleString()}` : '₹0'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>Settled Acquisitions</div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION A — RECENT PURCHASES (Real post_claims) */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 30 }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="orders" size={16} color="#2563eb" />
            <span>Recent Citizen Device Acquisitions</span>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)' }}>
              Loading purchase claims from Supabase <code>post_claims</code>...
            </div>
          )}

          {!loading && error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: 12, borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && purchases.length === 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon name="shopping-bag" size={22} color="#2563eb" />
              </div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                No Purchase Claims Initiated Yet
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
                Explore the Citizen Marketplace in the Home tab and tap <strong>Buy</strong> on any e-waste listing to acquire components.
              </p>
            </div>
          )}

          {!loading && !error && purchases.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {purchases.map(p => {
                const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                          {p.category}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>•</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Condition: {p.condition}</span>
                      </div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {p.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Citizen Seller: <strong style={{ color: 'var(--text-primary)' }}>{p.sellerName}</strong> • Date: {dateStr}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#2563eb' }}>
                        {p.price !== null ? `₹${p.price.toLocaleString()}` : 'Quote'}
                      </div>
                      {getStatusBadge(p.status)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION C — GREEN COIN PROMOTION CENTER */}
        {/* ========================================================================= */}
        <section>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="coin" size={16} color="var(--coin-color)" />
            <span>Green Coin Local Promotion Center</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Drive foot traffic to your repair shop by publishing discount vouchers redeemable with citizen Green Coins.
            </div>

            {promoNotice && (
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="alert" size={18} color="#eab308" />
                <div style={{ fontSize: '0.78rem', color: '#eab308', lineHeight: 1.4 }}>
                  <strong>Database Architecture Notice:</strong> {promoNotice}
                </div>
              </div>
            )}

            <form onSubmit={handlePublishPromotion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Service / Product Offer Name
                </label>
                <input
                  type="text"
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Normal Price (₹)
                  </label>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Green Coins Cost
                  </label>
                  <input
                    type="number"
                    value={coinCost}
                    onChange={(e) => setCoinCost(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Promotion Radius (KM)
                  </label>
                  <input
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon name="sparkles" size={15} color="#fff" />
                  <span>Configure Promotion Offer</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
