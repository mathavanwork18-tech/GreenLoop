import { useState, useEffect } from 'react'
import { supabase, isAuthTestMode, getDevDemoSession } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import MarketplaceChatModal, { type ChatListingContext } from '../../components/chat/MarketplaceChatModal'
import PurchaseCheckoutModal from '../../components/payment/PurchaseCheckoutModal'
import TransactionDetailsModal from '../../components/payment/TransactionDetailsModal'
import type { MarketplacePurchase } from '../../types/payment.types'

interface GeneralUserPost {
  id: string
  userId: string
  title: string
  description: string
  category: string
  subcategory?: string
  condition: string
  status: string
  askingPrice: number | null
  imageUrl: string | null
  createdAt: string
  sellerName: string
  location: string
  sellerPhone?: string
  sellerRole?: string
}

export default function LocalShopHomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<GeneralUserPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Marketplace Chat state
  const [chatListing, setChatListing] = useState<ChatListingContext | null>(null)

  // Modals state
  const [enquiryPost, setEnquiryPost] = useState<GeneralUserPost | null>(null)
  const [enquiryMessage, setEnquiryMessage] = useState('')
  const [isEnquiring, setIsEnquiring] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [enquiryError, setEnquiryError] = useState<string | null>(null)

  const [checkoutPost, setCheckoutPost] = useState<any | null>(null)
  const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState<MarketplacePurchase | null>(null)

  // Fetch real posts from Supabase public.e_waste_posts
  const loadPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Query real available e-waste posts (exclude sold items)
      const { data: postsData, error: postsErr } = await supabase
        .from('e_waste_posts')
        .select(`
          id,
          user_id,
          title,
          description,
          category,
          subcategory,
          condition,
          status,
          asking_price,
          image_url,
          created_at
        `)
        .neq('status', 'sold')
        .order('created_at', { ascending: false })

      if (postsErr) {
        throw new Error(postsErr.message || 'Failed to load community e-waste posts.')
      }

      const rawPosts = postsData || []
      const userIds = Array.from(new Set(rawPosts.map(p => p.user_id).filter(Boolean)))

      // 2. Fetch associated seller profiles (including role)
      let profilesMap = new Map<string, any>()
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, city, address, phone, role')
          .in('id', userIds)

        ;(profilesData || []).forEach(pr => profilesMap.set(pr.id, pr))
      }

      // 3. Map into clean UI objects
      const mapped: GeneralUserPost[] = rawPosts.map(p => {
        const profile = profilesMap.get(p.user_id) || {}
        return {
          id: p.id,
          userId: p.user_id,
          title: p.title || 'Untitled E-Waste',
          description: p.description || 'No detailed description provided.',
          category: p.category || 'Electronics',
          subcategory: p.subcategory || '',
          condition: p.condition || 'Used',
          status: p.status || 'available',
          askingPrice: p.asking_price !== null && p.asking_price !== undefined ? Number(p.asking_price) : null,
          imageUrl: p.image_url || null,
          createdAt: p.created_at,
          sellerName: profile.full_name || 'Community Citizen',
          location: profile.city || profile.address || 'Coimbatore',
          sellerPhone: profile.phone || '',
          sellerRole: profile.role || 'citizen',
        }
      })

      setPosts(mapped)
    } catch (err: any) {
      console.error('[Green Loop Shop] Fetch posts error:', err)
      setError(err.message || 'Unable to load marketplace listings from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  // Handle Enquiry Submission (routes through post_comments with trigger to notifications)
  const handleSendEnquiry = async () => {
    if (!enquiryPost) return
    setIsEnquiring(true)
    setEnquiryError(null)

    const commentText = enquiryMessage.trim() || `[Shop Enquiry] Hello, our repair shop is interested in your listing "${enquiryPost.title}". Please let us know if it is available for inspection.`

    try {
      const demoSession = isAuthTestMode ? getDevDemoSession() : null
      let authUserId: string | undefined = user?.id || demoSession?.profile_id || demoSession?.id

      if (!authUserId) {
        try {
          const { data: authData } = await supabase.auth.getUser()
          authUserId = authData?.user?.id
        } catch {}
      }

      if (!authUserId) {
        throw new Error('You must be signed in to send an enquiry. Please sign in with a shop account.')
      }

      const { error: commentErr } = await supabase
        .from('post_comments')
        .insert({
          post_id: enquiryPost.id,
          user_id: authUserId,
          content: commentText,
        })

      if (commentErr) {
        throw new Error(commentErr.message || 'Failed to submit shop enquiry.')
      }

      setEnquirySuccess(true)
      setTimeout(() => {
        setEnquirySuccess(false)
        setEnquiryPost(null)
        setEnquiryMessage('')
      }, 1800)
    } catch (err: any) {
      console.error('[Green Loop Shop] Send enquiry error:', err)
      setEnquiryError(err.message || 'Failed to transmit enquiry.')
    } finally {
      setIsEnquiring(false)
    }
  }

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'bulk', label: '📦 Bulk Lots' },
    { id: 'mobile', label: 'Mobile Phones' },
    { id: 'laptop', label: 'Laptops / PCs' },
    { id: 'parts', label: 'PCBs & Parts' },
    { id: 'battery', label: 'Batteries' },
  ]

  const filteredPosts = posts.filter(p => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'bulk') {
      return (
        p.description?.includes('[BULK_LISTING]') ||
        p.subcategory?.includes('Pieces') ||
        p.subcategory?.includes('KG') ||
        p.subcategory?.includes('Boxes') ||
        p.subcategory?.includes('Bags') ||
        p.subcategory?.includes('Units')
      )
    }
    const cat = (p.category || '').toLowerCase()
    if (activeCategory === 'mobile') return cat.includes('mobile') || cat.includes('phone')
    if (activeCategory === 'laptop') return cat.includes('laptop') || cat.includes('computer')
    if (activeCategory === 'parts') return cat.includes('part') || cat.includes('component')
    if (activeCategory === 'battery') return cat.includes('battery')
    return true
  })

  return (
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 32px)',
        width: '100%',
        backgroundColor: '#07100A',
        minHeight: '100dvh',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Marketplace Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
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
              Citizen E-Waste Marketplace
            </h1>
            <div style={{ fontSize: '0.76rem', color: '#9CA3A5', marginTop: 2 }}>
              Verified listings available for shop diagnostics, component harvesting & purchase
            </div>
          </div>
          <button
            onClick={loadPosts}
            title="Refresh Feed"
            style={{
              background: '#111F14',
              border: '1px solid #203526',
              color: '#9CA3A5',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.18s ease',
            }}
          >
            <Icon name="refresh" size={15} color="#22C55E" />
            <span className="hide-mobile" style={{ color: '#F5F7F5' }}>Refresh</span>
          </button>
        </div>

        {/* Category Pills (Orange Action / Dark Card) */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(c => {
            const isActive = activeCategory === c.id
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  background: isActive ? '#F97316' : '#111F14',
                  color: isActive ? '#FFFFFF' : '#9CA3A5',
                  border: isActive ? '1px solid #EA580C' : '1px solid #203526',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 8px rgba(249, 115, 22, 0.28)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Content Feed */}
      <div className="container" style={{ paddingTop: 16 }}>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9CA3A5' }}>
            <div
              style={{
                width: 44,
                height: 44,
                margin: '0 auto 16px',
                borderRadius: '50%',
                border: '3px solid #203526',
                borderTopColor: '#F97316',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F5F7F5' }}>
              Loading Citizen E-Waste Listings...
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: 4, color: '#66736A' }}>
              Querying live database from Supabase
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: 18,
              textAlign: 'center',
              margin: '20px 0',
            }}
          >
            <Icon name="alert" size={24} color="#EF4444" />
            <div style={{ fontWeight: 700, color: '#EF4444', marginTop: 8, fontSize: '0.9rem' }}>
              {error}
            </div>
            <button
              onClick={loadPosts}
              style={{
                marginTop: 12,
                padding: '6px 16px',
                fontSize: '0.8rem',
                background: '#111F14',
                border: '1px solid #203526',
                color: '#F5F7F5',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Retry Database Query
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div
            className="gl-shop-card"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#0D1710',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #203526',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.12)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="package" size={28} color="#FB923C" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: '#F5F7F5' }}>
              No E-Waste Listings Available
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#9CA3A5', maxWidth: 360, margin: '0 auto 16px' }}>
              Citizens have not posted items in this category yet. When new items are posted, they will appear here in real time.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '8px 18px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: '#F97316',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              View All Categories
            </button>
          </div>
        )}

        {/* Real Marketplace Cards Grid */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
            {filteredPosts.map(post => {
              const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'
              const isBulk =
                post.description?.includes('[BULK_LISTING]') ||
                post.subcategory?.includes('Pieces') ||
                post.subcategory?.includes('KG') ||
                post.subcategory?.includes('Boxes') ||
                post.subcategory?.includes('Bags') ||
                post.subcategory?.includes('Units')

              return (
                <div
                  key={post.id}
                  className="gl-shop-card"
                  style={{
                    background: '#0D1710',
                    border: isBulk ? '1.5px solid rgba(249, 115, 22, 0.45)' : '1px solid #203526',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  }}
                >
                  {/* Card Image Banner */}
                  <div
                    style={{
                      height: 160,
                      background: '#111F14',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderBottom: '1px solid #203526',
                    }}
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#66736A' }}>
                        <Icon name="laptop" size={40} color="#66736A" />
                        <div style={{ fontSize: '0.72rem', marginTop: 6, color: '#9CA3A5' }}>Device Photo</div>
                      </div>
                    )}

                    {/* Condition Pill (Eco Status: Green) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(7, 16, 10, 0.88)',
                        backdropFilter: 'blur(6px)',
                        color: '#22C55E',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                      }}
                    >
                      Condition: {post.condition}
                    </div>

                    {/* Bulk Badge (E-Waste Orange) */}
                    {isBulk && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: '#F97316',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                        }}
                      >
                        BULK LOT
                      </div>
                    )}

                    {/* Price Pill (Orange Marketplace Badge) */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        background: 'rgba(7, 16, 10, 0.90)',
                        backdropFilter: 'blur(6px)',
                        color: '#FB923C',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        border: '1px solid rgba(249, 115, 22, 0.45)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      {post.askingPrice !== null ? `₹${post.askingPrice.toLocaleString()}` : 'Free / Quote'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#22C55E',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: 4,
                      }}
                    >
                      {post.category} {post.subcategory ? `• ${post.subcategory}` : ''}
                    </div>
                    <h3
                      style={{
                        fontSize: '1.02rem',
                        fontWeight: 800,
                        color: '#F5F7F5',
                        margin: '0 0 8px',
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#9CA3A5',
                        margin: '0 0 12px',
                        flex: 1,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.description}
                    </p>

                    {/* Metadata Specs Bar (Blue location only) */}
                    <div
                      style={{
                        background: '#111F14',
                        border: '1px solid #203526',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: '#9CA3A5',
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="location-pin" size={14} color="#38BDF8" />
                        <span style={{ color: '#38BDF8' }}>{post.location}</span>
                      </div>
                      <div style={{ color: '#66736A' }}>Posted: {formattedDate}</div>
                    </div>

                    {/* Seller attribution */}
                    <div style={{ fontSize: '0.74rem', color: '#66736A', marginBottom: 14 }}>
                      Seller: <strong style={{ color: '#F5F7F5' }}>{post.sellerName}</strong>
                    </div>

                    {/* Action Buttons: Message Seller & Buy */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10, marginTop: 'auto' }}>
                      <button
                        onClick={() => {
                          setChatListing({
                            id: post.id,
                            title: post.title,
                            askingPrice: post.askingPrice,
                            location: post.location,
                            sellerName: post.sellerName,
                            sellerId: post.userId,
                            imageUrl: post.imageUrl,
                            category: post.category,
                          })
                        }}
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.80rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-md)',
                          background: '#111F14',
                          border: '1px solid #203526',
                          color: '#F5F7F5',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#22C55E'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#203526'
                        }}
                      >
                        <Icon name="comment" size={15} color="#22C55E" />
                        <span>Message Seller</span>
                      </button>

                      {/* Primary Business CTA: Orange Buy Button */}
                      <button
                        onClick={() => {
                          const currentBuyerId = user?.id || (isAuthTestMode ? getDevDemoSession()?.id : null)
                          if (currentBuyerId && post.userId === currentBuyerId) {
                            alert('You cannot buy your own item.')
                            return
                          }
                          setCheckoutPost({
                            id: post.id,
                            title: post.title,
                            description: post.description,
                            category: post.category,
                            condition: post.condition,
                            status: post.status,
                            price: post.askingPrice,
                            imageUrl: post.imageUrl,
                            seller: {
                              id: post.userId,
                              name: post.sellerName,
                              city: post.location,
                              phone: post.sellerPhone,
                              role: post.sellerRole || 'citizen',
                            },
                          })
                        }}
                        className="gl-shop-btn-post"
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          borderRadius: 'var(--radius-md)',
                          background: '#F97316',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(249, 115, 22, 0.28)',
                        }}
                      >
                        <Icon name="shopping-bag" size={15} color="#FFFFFF" />
                        <span>Buy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ENQUIRY MODAL */}
      {enquiryPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0D1710', border: '1px solid #203526', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440, padding: 22, boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="comment" size={18} color="#FB923C" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#F5F7F5' }}>
                    Send Enquiry
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#9CA3A5' }}>
                    {enquiryPost.title}
                  </div>
                </div>
              </div>
              <button onClick={() => setEnquiryPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="close" size={18} color="#9CA3A5" />
              </button>
            </div>

            {enquirySuccess ? (
              <div style={{ padding: '24px 10px', textAlign: 'center' }}>
                <Icon name="check-circle" size={36} color="#22C55E" />
                <div style={{ fontWeight: 800, color: '#F5F7F5', marginTop: 8 }}>Enquiry Sent Successfully!</div>
                <div style={{ fontSize: '0.78rem', color: '#9CA3A5', marginTop: 4 }}>
                  The seller has been notified via Supabase database notification.
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.82rem', color: '#9CA3A5', margin: '0 0 12px' }}>
                  Ask the seller about device condition, battery health, accessories, or quote negotiations.
                </p>

                <textarea
                  rows={3}
                  placeholder="e.g. Hello, does this smartphone power on? Is the original charger included?"
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: '#111F14', border: '1px solid #203526', color: '#F5F7F5', fontSize: '0.82rem', resize: 'none', boxSizing: 'border-box' }}
                />

                {enquiryError && (
                  <div style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: 8, fontWeight: 600 }}>
                    {enquiryError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    onClick={() => setEnquiryPost(null)}
                    style={{
                      flex: 1,
                      height: 40,
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      background: '#111F14',
                      border: '1px solid #203526',
                      color: '#F5F7F5',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEnquiry}
                    disabled={isEnquiring}
                    style={{
                      flex: 1,
                      height: 40,
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      background: '#F97316',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(249, 115, 22, 0.28)',
                    }}
                  >
                    {isEnquiring ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* NEW DEMO PURCHASE CHECKOUT MODAL */}
      {checkoutPost && (
        <PurchaseCheckoutModal
          isOpen={Boolean(checkoutPost)}
          post={{
            id: checkoutPost.id,
            title: checkoutPost.title,
            price: checkoutPost.price,
            images: checkoutPost.imageUrl ? [checkoutPost.imageUrl] : [],
            condition: checkoutPost.condition,
            seller: {
              id: checkoutPost.seller.id,
              name: checkoutPost.seller.name,
              role: checkoutPost.seller.role,
            },
          }}
          onClose={() => setCheckoutPost(null)}
          onSuccess={(_result: any) => {
            loadPosts()
          }}
        />
      )}

      {selectedPurchaseDetails && (
        <TransactionDetailsModal
          isOpen={Boolean(selectedPurchaseDetails)}
          purchase={selectedPurchaseDetails}
          onClose={() => setSelectedPurchaseDetails(null)}
        />
      )}

      {/* Live Marketplace 1-on-1 Chat Modal */}
      {chatListing && (
        <MarketplaceChatModal
          isOpen={Boolean(chatListing)}
          onClose={() => setChatListing(null)}
          listing={chatListing}
        />
      )}
    </div>
  )
}
