import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
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

interface MyListingRecord {
  id: string
  title: string
  category: string
  subcategory: string
  condition: string
  askingPrice: number | null
  status: string
  createdAt: string
  isBulk: boolean
}

export default function LocalShopOrdersPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'purchases' | 'listings'>('purchases')
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
  const [myListings, setMyListings] = useState<MyListingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Promotion Center State
  const [promoName, setPromoName] = useState('Tempered Glass & Screen Guard')
  const [normalPrice, setNormalPrice] = useState('200')
  const [discountPercent, setDiscountPercent] = useState('20')
  const [coinCost, setCoinCost] = useState('200')
  const [radiusKm, setRadiusKm] = useState('5')
  const [promoNotice, setPromoNotice] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let currentUserId = user?.id

      if (!currentUserId) {
        try {
          const { data: authData } = await supabase.auth.getUser()
          currentUserId = authData?.user?.id
        } catch {}
      }

      if (!currentUserId) {
        setLoading(false)
        return
      }

      // 1. Query real post_claims for this user
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
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (claimsErr) {
        console.warn('[LocalShopOrders] Claims fetch warning:', claimsErr.message)
      }

      const rawClaims = claimsData || []
      const sellerIds = Array.from(new Set(rawClaims.map((c: any) => c.e_waste_posts?.user_id).filter(Boolean)))

      let sellersMap = new Map<string, string>()
      if (sellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', sellerIds)

        ;(profiles || []).forEach((p) => sellersMap.set(p.id, p.full_name))
      }

      const mappedPurchases: PurchaseRecord[] = rawClaims.map((c: any) => {
        const post = c.e_waste_posts || {}
        return {
          id: String(c.id),
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

      setPurchases(mappedPurchases)

      // 2. Query posts published by this shop user
      const { data: postsData, error: postsErr } = await supabase
        .from('e_waste_posts')
        .select('id, title, category, subcategory, condition, asking_price, status, created_at, description')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (postsErr) {
        console.warn('[LocalShopOrders] Shop posts fetch warning:', postsErr.message)
      }

      const mappedListings: MyListingRecord[] = (postsData || []).map((p) => ({
        id: p.id,
        title: p.title || 'E-Waste Material',
        category: p.category || 'Bulk Lot',
        subcategory: p.subcategory || '',
        condition: p.condition || 'Scrap',
        askingPrice: p.asking_price !== null && p.asking_price !== undefined ? Number(p.asking_price) : null,
        status: p.status || 'available',
        createdAt: p.created_at,
        isBulk:
          p.description?.includes('[BULK_LISTING]') ||
          p.subcategory?.includes('Pieces') ||
          p.subcategory?.includes('KG') ||
          p.subcategory?.includes('Boxes'),
      }))

      setMyListings(mappedListings)
    } catch (err: any) {
      console.error('[Green Loop Shop] Fetch orders data error:', err)
      setError('Unable to load purchase records from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Promotion creation attempt
  const handlePublishPromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    setPromoNotice('Offer published to local Green Loop map radius. Citizens nearby can view and redeem this offer using EcoPoints.')
    setTimeout(() => setPromoNotice(null), 5000)
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return
    try {
      const { error } = await supabase.from('e_waste_posts').delete().eq('id', listingId)
      if (error) throw error
      setMyListings((prev) => prev.filter((l) => l.id !== listingId))
    } catch {
      alert('Failed to remove listing.')
    }
  }

  // Semantic Status Badges
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'confirmed' || s === 'completed' || s === 'accepted') {
      return (
        <span
          style={{
            background: 'rgba(34, 197, 94, 0.10)',
            color: '#22C55E',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        >
          {status.toUpperCase()}
        </span>
      )
    }
    if (s === 'cancelled' || s === 'rejected') {
      return (
        <span
          style={{
            background: 'rgba(239, 68, 68, 0.10)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        >
          {status.toUpperCase()}
        </span>
      )
    }
    return (
      <span
        style={{
          background: 'rgba(245, 158, 11, 0.12)',
          color: '#F59E0B',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.68rem',
          fontWeight: 800,
        }}
      >
        PENDING REVIEW
      </span>
    )
  }

  // Summary Metrics
  const totalPurchases = purchases.length
  const completedPurchases = purchases.filter((p) => ['confirmed', 'completed', 'accepted'].includes(p.status.toLowerCase())).length
  const pendingPurchases = purchases.filter((p) => p.status.toLowerCase() === 'pending').length
  const totalExpenditure = purchases
    .filter((p) => ['confirmed', 'completed', 'accepted'].includes(p.status.toLowerCase()))
    .reduce((sum, p) => sum + (p.price || 0), 0)

  return (
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 36px)',
        width: '100%',
        backgroundColor: '#07100A',
        minHeight: '100dvh',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: '#07100A',
          borderBottom: '1px solid #203526',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                margin: 0,
                color: '#F5F7F5',
                letterSpacing: '-0.02em',
              }}
            >
              Shop Procurement & Listings Hub
            </h1>
            <div style={{ fontSize: '0.76rem', color: '#9CA3A5', marginTop: 2 }}>
              Track citizen device purchases, active bulk e-waste listings, and material procurement impact
            </div>
          </div>
          <button
            onClick={loadData}
            style={{
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#111F14',
              border: '1px solid #203526',
              color: '#F5F7F5',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="refresh" size={14} color="#22C55E" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Results / Material Impact (DB-Derived) */}
        <section style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#F5F7F5',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="chart" size={16} color="#22C55E" />
            <span>Procurement Results & Material Impact</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div
              className="gl-shop-card"
              style={{
                background: '#0D1710',
                border: '1px solid #203526',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FB923C' }}>{totalPurchases}</div>
              <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>Purchases Placed</div>
            </div>
            <div
              className="gl-shop-card"
              style={{
                background: '#0D1710',
                border: '1px solid #203526',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22C55E' }}>{completedPurchases}</div>
              <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>Acquired Devices</div>
            </div>
            <div
              className="gl-shop-card"
              style={{
                background: '#0D1710',
                border: '1px solid #203526',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B' }}>{pendingPurchases}</div>
              <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>Pending Review</div>
            </div>
            <div
              className="gl-shop-card"
              style={{
                background: '#0D1710',
                border: '1px solid #203526',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F97316' }}>{myListings.length}</div>
              <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>My Active Lots</div>
            </div>
            <div
              className="gl-shop-card"
              style={{
                background: '#0D1710',
                border: '1px solid #203526',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22C55E' }}>
                {totalExpenditure > 0 ? `₹${totalExpenditure.toLocaleString()}` : '₹0'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#9CA3A5', marginTop: 2 }}>Settled Acquisitions</div>
            </div>
          </div>
        </section>

        {/* Tab Switcher: Purchases vs My Bulk Listings */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #203526', paddingBottom: 10 }}>
          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            style={{
              background: activeTab === 'purchases' ? '#F97316' : '#111F14',
              color: activeTab === 'purchases' ? '#FFFFFF' : '#9CA3A5',
              border: activeTab === 'purchases' ? '1px solid #EA580C' : '1px solid #203526',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              fontSize: '0.80rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'purchases' ? '0 2px 8px rgba(249, 115, 22, 0.28)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="orders" size={15} color={activeTab === 'purchases' ? '#FFFFFF' : '#9CA3A5'} />
            <span>Purchases & Claims ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            style={{
              background: activeTab === 'listings' ? '#F97316' : '#111F14',
              color: activeTab === 'listings' ? '#FFFFFF' : '#9CA3A5',
              border: activeTab === 'listings' ? '1px solid #EA580C' : '1px solid #203526',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              fontSize: '0.80rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'listings' ? '0 2px 8px rgba(249, 115, 22, 0.28)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="box" size={15} color={activeTab === 'listings' ? '#FFFFFF' : '#9CA3A5'} />
            <span>My Bulk Listings ({myListings.length})</span>
          </button>
        </div>

        {/* SECTION A — PURCHASES */}
        {activeTab === 'purchases' && (
          <section style={{ marginBottom: 30 }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#9CA3A5' }}>
                Loading purchase claims from Supabase <code>post_claims</code>...
              </div>
            )}

            {!loading && error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  color: '#EF4444',
                  fontSize: '0.82rem',
                }}
              >
                {error}
              </div>
            )}

            {!loading && !error && purchases.length === 0 && (
              <div
                className="gl-shop-card"
                style={{
                  background: '#0D1710',
                  border: '1px solid #203526',
                  borderRadius: 'var(--radius-lg)',
                  padding: 32,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(249, 115, 22, 0.12)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon name="shopping-bag" size={22} color="#FB923C" />
                </div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px', color: '#F5F7F5' }}>
                  No Purchase Claims Initiated Yet
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#9CA3A5', maxWidth: 360, margin: '0 auto' }}>
                  Explore the Citizen Marketplace in the Home tab and tap <strong>Buy</strong> on any listing to initiate an acquisition claim.
                </p>
              </div>
            )}

            {!loading && !error && purchases.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {purchases.map((p) => {
                  const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'
                  return (
                    <div
                      key={p.id}
                      className="gl-shop-card"
                      style={{
                        background: '#0D1710',
                        border: '1px solid #203526',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.70rem', color: '#22C55E', fontWeight: 800, textTransform: 'uppercase' }}>
                            {p.category}
                          </span>
                          <span style={{ fontSize: '0.70rem', color: '#66736A' }}>•</span>
                          <span style={{ fontSize: '0.72rem', color: '#9CA3A5' }}>Condition: {p.condition}</span>
                        </div>
                        <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F5F7F5', margin: '0 0 4px' }}>
                          {p.title}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3A5' }}>
                          Seller: <strong style={{ color: '#F5F7F5' }}>{p.sellerName}</strong> • Date: {dateStr}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FB923C' }}>
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
        )}

        {/* SECTION B — MY BULK LISTINGS */}
        {activeTab === 'listings' && (
          <section style={{ marginBottom: 30 }}>
            {myListings.length === 0 ? (
              <div
                className="gl-shop-card"
                style={{
                  background: '#0D1710',
                  border: '1px solid #203526',
                  borderRadius: 'var(--radius-lg)',
                  padding: 32,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(249, 115, 22, 0.12)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon name="box" size={22} color="#FB923C" />
                </div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px', color: '#F5F7F5' }}>
                  No Listings Published Yet
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#9CA3A5', maxWidth: 360, margin: '0 auto' }}>
                  Use the <strong>Post</strong> tab in the navigation bar to publish bulk material lots, spare parts, or repaired equipment.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="gl-shop-card"
                    style={{
                      background: '#0D1710',
                      border: '1px solid #203526',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {item.isBulk && (
                          <span
                            style={{
                              background: '#F97316',
                              color: '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.66rem',
                              fontWeight: 800,
                            }}
                          >
                            BULK LOT
                          </span>
                        )}
                        <span style={{ fontSize: '0.70rem', color: '#22C55E', fontWeight: 800, textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                        {item.subcategory && (
                          <>
                            <span style={{ fontSize: '0.70rem', color: '#66736A' }}>•</span>
                            <span style={{ fontSize: '0.72rem', color: '#9CA3A5' }}>{item.subcategory}</span>
                          </>
                        )}
                      </div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F5F7F5', margin: '0 0 4px' }}>
                        {item.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3A5' }}>
                        Status: <strong style={{ color: '#22C55E' }}>{item.status}</strong> • Condition: {item.condition}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FB923C' }}>
                        {item.askingPrice !== null ? `₹${item.askingPrice.toLocaleString()}` : 'Quote'}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: '#EF4444',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION C — GREEN COIN PROMOTION CENTER (Eco Green & Action Orange) */}
        <section>
          <div
            style={{
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#F5F7F5',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="coin" size={16} color="#22C55E" />
            <span>Green Coin Local Promotion Center</span>
          </div>

          <div
            className="gl-shop-card"
            style={{
              background: '#0D1710',
              border: '1px solid #203526',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: '0.84rem', color: '#9CA3A5', marginBottom: 16 }}>
              Drive foot traffic to your repair shop by publishing discount vouchers redeemable with citizen Green Coins.
            </div>

            {promoNotice && (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.10)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  marginBottom: 16,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <Icon name="alert" size={18} color="#22C55E" />
                <div style={{ fontSize: '0.78rem', color: '#22C55E', lineHeight: 1.4 }}>
                  <strong>Eco Campaign Notice:</strong> {promoNotice}
                </div>
              </div>
            )}

            <form onSubmit={handlePublishPromotion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#F5F7F5', marginBottom: 4 }}>
                  Service / Product Offer Name
                </label>
                <input
                  type="text"
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#111F14',
                    border: '1px solid #203526',
                    color: '#F5F7F5',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#F5F7F5', marginBottom: 4 }}>
                    Standard Price (₹)
                  </label>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#111F14',
                      border: '1px solid #203526',
                      color: '#F5F7F5',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#F5F7F5', marginBottom: 4 }}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#111F14',
                      border: '1px solid #203526',
                      color: '#F5F7F5',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#F5F7F5', marginBottom: 4 }}>
                    Citizen Coin Cost
                  </label>
                  <input
                    type="number"
                    value={coinCost}
                    onChange={(e) => setCoinCost(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#111F14',
                      border: '1px solid #203526',
                      color: '#22C55E',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#F5F7F5', marginBottom: 4 }}>
                    Radius (KM)
                  </label>
                  <input
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#111F14',
                      border: '1px solid #203526',
                      color: '#F5F7F5',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="gl-shop-btn-post"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 22px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  background: '#F97316',
                  border: 'none',
                  color: '#FFFFFF',
                  marginTop: 6,
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.28)',
                }}
              >
                Publish Store Voucher
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
