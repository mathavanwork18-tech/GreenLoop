import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import MarketplaceChatModal, { type ChatListingContext } from '../../components/chat/MarketplaceChatModal'

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

  const [buyPost, setBuyPost] = useState<GeneralUserPost | null>(null)
  const [isBuying, setIsBuying] = useState(false)
  const [buySuccess, setBuySuccess] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)

  // Fetch real posts from Supabase public.e_waste_posts
  const loadPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Query real available e-waste posts
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
        .order('created_at', { ascending: false })

      if (postsErr) {
        throw new Error(postsErr.message || 'Failed to load community e-waste posts.')
      }

      const rawPosts = postsData || []
      const userIds = Array.from(new Set(rawPosts.map(p => p.user_id).filter(Boolean)))

      // 2. Fetch associated seller profiles
      let profilesMap = new Map<string, any>()
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, city, address, phone')
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
      const { data: authData } = await supabase.auth.getUser()
      const authUserId = authData?.user?.id || user?.id
      if (!authUserId) {
        throw new Error('You must be signed in to send an enquiry.')
      }

      const { error: insertErr } = await supabase
        .from('post_comments')
        .insert({
          post_id: enquiryPost.id,
          user_id: authUserId,
          comment: commentText,
        })

      if (insertErr) {
        throw new Error(insertErr.message || 'Could not record enquiry in database.')
      }

      setEnquirySuccess(true)
      setTimeout(() => {
        setEnquiryPost(null)
        setEnquirySuccess(false)
        setEnquiryMessage('')
      }, 1600)
    } catch (err: any) {
      console.error('[Green Loop Shop] Enquiry error:', err)
      setEnquiryError(err.message || 'Enquiry failed on server. Please try again.')
    } finally {
      setIsEnquiring(false)
    }
  }

  // Handle Buy / Claim Submission (routes through post_claims with trigger to notifications)
  const handleSendBuy = async () => {
    if (!buyPost) return
    setIsBuying(true)
    setBuyError(null)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const authUserId = authData?.user?.id || user?.id
      if (!authUserId) {
        throw new Error('You must be signed in to purchase a listing. Please sign in with a shop account.')
      }

      if (buyPost.userId && buyPost.userId === authUserId) {
        throw new Error('You cannot purchase your own listing.')
      }

      // Concurrency duplicate prevention
      const { data: existingClaim } = await supabase
        .from('post_claims')
        .select('id, status')
        .eq('post_id', buyPost.id)
        .eq('user_id', authUserId)
        .maybeSingle()

      if (existingClaim) {
        throw new Error(`You have already submitted a purchase order for this listing (Status: ${existingClaim.status}).`)
      }

      // Insert purchase claim into post_claims
      const { data: createdClaim, error: claimErr } = await supabase
        .from('post_claims')
        .insert({
          post_id: buyPost.id,
          user_id: authUserId,
          status: 'pending',
        })
        .select('id, status, created_at')
        .maybeSingle()

      if (claimErr) {
        throw new Error(claimErr.message || 'Could not create purchase request in database.')
      }

      console.log('[Green Loop Shop] Purchase order created successfully:', createdClaim?.id)
      setBuySuccess(true)
      setTimeout(() => {
        setBuyPost(null)
        setBuySuccess(false)
      }, 1600)
    } catch (err: any) {
      console.error('[Green Loop Shop] Buy error:', err)
      setBuyError(err.message || 'Purchase request failed. Please try again.')
    } finally {
      setIsBuying(false)
    }
  }

  // Filter categories
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'bulk', label: 'Bulk Lots' },
    { id: 'mobile', label: 'Smartphones' },
    { id: 'laptop', label: 'Laptops' },
    { id: 'parts', label: 'Components' },
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
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)', width: '100%' }}>
      {/* Top Marketplace Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Citizen E-Waste Marketplace
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Verified listings available for shop diagnostics, component harvesting & purchase
            </div>
          </div>
          <button
            onClick={loadPosts}
            title="Refresh Feed"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Icon name="refresh" size={15} color="var(--accent)" />
            <span className="hide-mobile">Refresh</span>
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                background: activeCategory === c.id ? '#2563eb' : 'var(--bg-surface-2)',
                color: activeCategory === c.id ? '#ffffff' : 'var(--text-secondary)',
                border: activeCategory === c.id ? '1px solid #1d4ed8' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Feed */}
      <div className="container" style={{ paddingTop: 16 }}>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ width: 44, height: 44, margin: '0 auto 16px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Loading Citizen E-Waste Listings...</div>
            <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Querying live database from Supabase</div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: 18, textAlign: 'center', margin: '20px 0' }}>
            <Icon name="alert" size={24} color="#ef4444" />
            <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 8, fontSize: '0.9rem' }}>{error}</div>
            <button onClick={loadPosts} className="btn btn-secondary" style={{ marginTop: 12, padding: '6px 16px', fontSize: '0.8rem' }}>
              Retry Database Query
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="package" size={28} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              No E-Waste Listings Available
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 16px' }}>
              Citizens have not posted items in this category yet. When new items are posted, they will appear here in real time.
            </p>
            <button onClick={() => setActiveCategory('all')} className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
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
                  style={{
                    background: 'var(--bg-surface)',
                    border: isBulk ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                >
                  {/* Card Image Banner */}
                  <div
                    style={{
                      height: 160,
                      background: 'var(--bg-surface-2)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <Icon name="laptop" size={40} color="var(--text-tertiary)" />
                        <div style={{ fontSize: '0.72rem', marginTop: 6 }}>Device Photo</div>
                      </div>
                    )}
                    {/* Condition Pill */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      Condition: {post.condition}
                    </div>

                    {/* Bulk Badge */}
                    {isBulk && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: '#f59e0b',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                        }}
                      >
                        BULK
                      </div>
                    )}

                    {/* Price Pill */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        background: '#2563eb',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      {post.askingPrice !== null ? `₹${post.askingPrice.toLocaleString()}` : 'Free / Quote'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {post.category} {post.subcategory ? `• ${post.subcategory}` : ''}
                    </div>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.3 }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px', flex: 1, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.description}
                    </p>

                    {/* Metadata Specs */}
                    <div style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="location-pin" size={14} color="var(--accent)" />
                        <span>{post.location}</span>
                      </div>
                      <div>Posted: {formattedDate}</div>
                    </div>

                    {/* Seller attribution */}
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginBottom: 14 }}>
                      Seller: <strong style={{ color: 'var(--text-primary)' }}>{post.sellerName}</strong>
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
                        className="btn btn-secondary"
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Icon name="comment" size={15} color="var(--accent)" />
                        <span>Message Seller</span>
                      </button>

                      <button
                        onClick={() => {
                          setBuyPost(post)
                          setBuyError(null)
                          setBuySuccess(false)
                        }}
                        className="btn btn-primary"
                        style={{
                          height: 38,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          border: 'none',
                          color: '#ffffff',
                        }}
                      >
                        <Icon name="shopping-bag" size={15} color="#ffffff" />
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440, padding: 22, boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="comment" size={18} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Send Enquiry
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {enquiryPost.title}
                  </div>
                </div>
              </div>
              <button onClick={() => setEnquiryPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="close" size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {enquirySuccess ? (
              <div style={{ padding: '24px 10px', textAlign: 'center' }}>
                <Icon name="check-circle" size={36} color="var(--accent)" />
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>Enquiry Sent Successfully!</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  The seller has been notified via Supabase database notification.
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                  Ask the seller about device condition, battery health, accessories, or quote negotiations.
                </p>

                <textarea
                  rows={3}
                  placeholder="e.g. Hello, does this smartphone power on? Is the original charger included?"
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', resize: 'none', boxSizing: 'border-box' }}
                />

                {enquiryError && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 8, fontWeight: 600 }}>
                    {enquiryError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button onClick={() => setEnquiryPost(null)} className="btn btn-secondary btn-full" style={{ height: 40, fontSize: '0.84rem' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEnquiry}
                    disabled={isEnquiring}
                    className="btn btn-primary btn-full"
                    style={{ height: 40, fontSize: '0.84rem', fontWeight: 800, background: '#2563eb', border: 'none', color: '#fff' }}
                  >
                    {isEnquiring ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BUY / PURCHASE CLAIM MODAL */}
      {buyPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440, padding: 22, boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shopping-bag" size={18} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Initiate Purchase Claim
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {buyPost.title}
                  </div>
                </div>
              </div>
              <button onClick={() => setBuyPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="close" size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {buySuccess ? (
              <div style={{ padding: '24px 10px', textAlign: 'center' }}>
                <Icon name="check-circle" size={36} color="var(--accent)" />
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>Purchase Claim Submitted!</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Recorded in database. You can track this purchase anytime in the <strong>Orders</strong> tab.
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--bg-surface-2)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    <span>Price</span>
                    <span style={{ color: '#2563eb' }}>{buyPost.askingPrice !== null ? `₹${buyPost.askingPrice.toLocaleString()}` : 'Free Collection'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Seller: {buyPost.sellerName} • {buyPost.location}
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                  Submitting a purchase claim sends a formal acquisition request to the citizen. Once accepted, you can coordinate pickup or shop drop-off.
                </p>

                {buyError && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginBottom: 10, fontWeight: 600 }}>
                    {buyError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setBuyPost(null)} className="btn btn-secondary btn-full" style={{ height: 40, fontSize: '0.84rem' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBuy}
                    disabled={isBuying}
                    className="btn btn-primary btn-full"
                    style={{ height: 40, fontSize: '0.84rem', fontWeight: 800, background: '#2563eb', border: 'none', color: '#fff' }}
                  >
                    {isBuying ? 'Confirming...' : 'Confirm Purchase'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
