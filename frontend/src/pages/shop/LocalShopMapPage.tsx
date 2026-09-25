import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../utils/supabase'
import Icon from '../../components/Icon'
import EWasteMap from '../../components/map/EWasteMap'
import { computeBestFirstRoute, type RouteTarget } from '../../services/routing/bestFirstSearch'
import { DEFAULT_COORDS } from '../../utils/mapHelpers'
import { geocodeCoimbatoreArea } from '../../utils/coimbatoreGeocoding'

interface RecyclingCenter {
  id: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  contact_phone: string
  capacity_kg: number
}

interface LocalShopProfile {
  id: string
  name: string
  phone: string
  city: string
  address: string
  role: string
}

export default function LocalShopMapPage() {
  const [centers, setCenters] = useState<RecyclingCenter[]>([])
  const [shops, setShops] = useState<LocalShopProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'routing' | 'centers' | 'shops'>('map')
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null)
  const [userCoords, setUserCoords] = useState<[number, number]>(DEFAULT_COORDS)
  const [posts, setPosts] = useState<any[]>([])

  // Geolocation detection
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          setUserCoords(DEFAULT_COORDS)
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    }
  }, [])

  useEffect(() => {
    async function loadMapData() {
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch real recycling centers from public.recycling_centers
        const { data: centersData, error: centersErr } = await supabase
          .from('recycling_centers')
          .select('id, name, address, city, latitude, longitude, contact_phone, capacity_kg')

        if (centersErr) {
          throw new Error(centersErr.message || 'Failed to load recycling centers.')
        }

        setCenters(centersData || [])
        if (centersData && centersData.length > 0) {
          setSelectedCenter(centersData[0])
        }

        // 2. Fetch registered local shops & companies from public.profiles
        const { data: shopsData, error: shopsErr } = await supabase
          .from('profiles')
          .select('id, full_name, phone, city, address, role')
          .or('role.eq.shop,role.eq.local_shop,role.eq.company,role.eq.recycler')

        if (shopsErr) {
          console.warn('[Green Loop] Shops lookup error:', shopsErr.message)
        } else {
          const mappedShops: LocalShopProfile[] = (shopsData || []).map((s) => ({
            id: s.id,
            name: s.full_name || 'Electronics Repair Hub',
            phone: s.phone || 'Contact via Green Loop',
            city: s.city || 'Coimbatore',
            address: s.address || 'Central District',
            role: s.role,
          }))
          setShops(mappedShops)
        }

        // 3. Fetch active listings for routing
        const { data: postsData } = await supabase
          .from('e_waste_posts')
          .select('id, title, location, category, asking_price')
          .limit(20)

        setPosts(postsData || [])
      } catch (err: any) {
        console.error('[Green Loop] Map load error:', err)
        setError(err.message || 'Failed to load location data from Supabase.')
      } finally {
        setLoading(false)
      }
    }

    loadMapData()
  }, [])

  // Calculate Smart Nearest Routes via Best-First Search
  const optimalRoutes = useMemo(() => {
    const candidateTargets: RouteTarget[] = []

    // Add recycling centers
    for (const c of centers) {
      if (c.latitude && c.longitude) {
        candidateTargets.push({
          id: `center-${c.id}`,
          name: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
          type: 'center',
          isVerified: true,
          urgency: 0.2,
          address: `${c.address}, ${c.city}`,
          phone: c.contact_phone,
        })
      }
    }

    // Add posts / pickup requests with Coimbatore geocoding
    for (const p of posts) {
      const coords = geocodeCoimbatoreArea(p.location)
      candidateTargets.push({
        id: `post-${p.id}`,
        name: p.title,
        latitude: coords.lat,
        longitude: coords.lng,
        type: 'citizen_listing',
        isVerified: false,
        urgency: 0.8,
        address: p.location || 'Coimbatore',
      })
    }

    return computeBestFirstRoute(userCoords[0], userCoords[1], candidateTargets)
  }, [centers, posts, userCoords])

  return (
    <div
      className="page-content"
      style={{
        paddingBottom: 'calc(var(--nav-height) + 24px)',
        width: '100%',
        backgroundColor: '#07100A',
        minHeight: '100dvh',
        boxSizing: 'border-box',
      }}
    >
      {/* Map Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
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
              Ecosystem Logistics & Smart Routing
            </h1>
            <div style={{ fontSize: '0.76rem', color: '#9CA3A5', marginTop: 2 }}>
              Interactive OpenStreetMap, Best-First Search nearest route calculation, and certified TNPCB facilities
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setViewMode('map')}
              style={{
                background: viewMode === 'map' ? '#F97316' : '#111F14',
                color: viewMode === 'map' ? '#FFFFFF' : '#9CA3A5',
                border: viewMode === 'map' ? '1px solid #EA580C' : '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon name="map" size={14} color={viewMode === 'map' ? '#FFFFFF' : '#38BDF8'} />
              <span>Interactive Map</span>
            </button>

            <button
              onClick={() => setViewMode('routing')}
              style={{
                background: viewMode === 'routing' ? '#22C55E' : '#111F14',
                color: viewMode === 'routing' ? '#FFFFFF' : '#9CA3A5',
                border: viewMode === 'routing' ? '1px solid #16A34A' : '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon name="target" size={14} color={viewMode === 'routing' ? '#FFFFFF' : '#22C55E'} />
              <span>Smart Nearest Routes</span>
            </button>

            <button
              onClick={() => setViewMode('centers')}
              style={{
                background: viewMode === 'centers' ? '#22C55E' : '#111F14',
                color: viewMode === 'centers' ? '#FFFFFF' : '#9CA3A5',
                border: viewMode === 'centers' ? '1px solid #16A34A' : '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon name="recycle" size={14} color={viewMode === 'centers' ? '#FFFFFF' : '#22C55E'} />
              <span>Recycling Centers ({centers.length})</span>
            </button>

            <button
              onClick={() => setViewMode('shops')}
              style={{
                background: viewMode === 'shops' ? 'rgba(56, 189, 248, 0.2)' : '#111F14',
                color: viewMode === 'shops' ? '#38BDF8' : '#9CA3A5',
                border: viewMode === 'shops' ? '1px solid #38BDF8' : '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.18s ease',
              }}
            >
              <Icon name="shop" size={14} color={viewMode === 'shops' ? '#38BDF8' : '#66736A'} />
              <span>Partner Shops ({shops.length})</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 16 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3A5' }}>
            <div
              style={{
                width: 40,
                height: 40,
                margin: '0 auto 14px',
                borderRadius: '50%',
                border: '3px solid #203526',
                borderTopColor: '#F97316',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ fontWeight: 700, color: '#F5F7F5' }}>Loading Facility & Routing Data...</div>
            <div style={{ fontSize: '0.78rem', marginTop: 4, color: '#66736A' }}>
              Connecting to Supabase recycling_centers
            </div>
          </div>
        )}

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
            <div style={{ fontWeight: 700, color: '#EF4444', marginTop: 8 }}>{error}</div>
          </div>
        )}

        {/* VIEW 0: INTERACTIVE LEAFLET MAP */}
        {!loading && !error && viewMode === 'map' && (
          <div
            className="gl-shop-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid #203526',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <EWasteMap height="680px" />
          </div>
        )}

        {/* VIEW 1: SMART NEAREST-USER BEST-FIRST SEARCH ROUTING */}
        {!loading && !error && viewMode === 'routing' && (
          <div>
            <div
              className="gl-shop-card-secondary"
              style={{
                background: '#111F14',
                border: '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 16,
                fontSize: '0.80rem',
                color: '#9CA3A5',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Icon name="target" size={18} color="#22C55E" />
              <div>
                <strong style={{ color: '#F5F7F5' }}>Best-First Search Optimizer: </strong>
                Evaluates distance from your current GPS, prioritizes high-urgency citizen pickups and certified TNPCB drop-offs with optimal travel estimates.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {optimalRoutes.map((route, idx) => (
                <div
                  key={route.target.id}
                  className="gl-shop-card"
                  style={{
                    background: '#0D1710',
                    border: idx === 0 ? '2px solid #22C55E' : '1px solid #203526',
                    borderRadius: 'var(--radius-lg)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    position: 'relative',
                  }}
                >
                  {idx === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#22C55E',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      OPTIMAL NEXT STOP
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: idx === 0 ? '#22C55E' : '#111F14',
                        color: idx === 0 ? '#FFFFFF' : '#F5F7F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        border: idx === 0 ? 'none' : '1px solid #203526',
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          color: route.target.type === 'center' ? '#22C55E' : '#FB923C',
                          textTransform: 'uppercase',
                        }}
                      >
                        {route.target.type === 'center' ? 'Recycling Center' : 'Citizen Pickup'}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0 0', color: '#F5F7F5' }}>
                        {route.target.name}
                      </h3>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#9CA3A5', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="location-pin" size={14} color="#38BDF8" />
                    <span>{route.target.address}</span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      background: '#111F14',
                      border: '1px solid #203526',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.76rem',
                    }}
                  >
                    <div>
                      <div style={{ color: '#66736A' }}>Distance</div>
                      <strong style={{ color: '#F5F7F5', fontSize: '0.86rem' }}>{route.distanceKm} km</strong>
                    </div>
                    <div>
                      <div style={{ color: '#66736A' }}>Est. Travel Time</div>
                      <strong style={{ color: '#38BDF8', fontSize: '0.86rem' }}>~{route.estimatedMinutes} mins</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {route.target.phone && (
                      <a
                        href={`tel:${route.target.phone}`}
                        style={{
                          flex: 1,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          background: '#111F14',
                          border: '1px solid #203526',
                          color: '#F5F7F5',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Icon name="phone" size={13} color="#9CA3A5" />
                        <span>Call</span>
                      </a>
                    )}
                    <a
                      href={route.directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="gl-shop-btn-post"
                      style={{
                        flex: 1,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#F97316',
                        border: 'none',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.28)',
                      }}
                    >
                      <Icon name="target" size={13} color="#FFFFFF" />
                      <span>Start Navigation</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: RECYCLING CENTERS (REAL GPS DATA) */}
        {!loading && !error && viewMode === 'centers' && (
          <div>
            <div
              className="gl-shop-card-secondary"
              style={{
                background: '#111F14',
                border: '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 14,
                fontSize: '0.78rem',
                color: '#9CA3A5',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="verified" size={16} color="#22C55E" />
              <span>Displaying certified TNPCB facilities from <code>public.recycling_centers</code> with verified GPS coordinates.</span>
            </div>

            {centers.length === 0 ? (
              <div
                className="gl-shop-card"
                style={{ textAlign: 'center', padding: 40, background: '#0D1710', borderRadius: 'var(--radius-lg)' }}
              >
                No recycling facilities recorded in database yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {centers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCenter(c)}
                    className="gl-shop-card"
                    style={{
                      background: '#0D1710',
                      border: selectedCenter?.id === c.id ? '2px solid #22C55E' : '1px solid #203526',
                      borderRadius: 'var(--radius-lg)',
                      padding: 18,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div
                          style={{
                            fontSize: '0.70rem',
                            color: '#22C55E',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          TNPCB Authorized Smelter
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F5F7F5', margin: '2px 0 0' }}>
                          {c.name}
                        </h3>
                      </div>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="recycle" size={18} color="#22C55E" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.80rem', color: '#9CA3A5' }}>
                      <Icon name="location-pin" size={14} color="#38BDF8" />
                      <span>{c.address}, {c.city}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#111F14',
                        border: '1px solid #203526',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        color: '#9CA3A5',
                      }}
                    >
                      <div>
                        Capacity: <strong style={{ color: '#F5F7F5' }}>{c.capacity_kg ? `${c.capacity_kg.toLocaleString()} kg` : 'Unlimited'}</strong>
                      </div>
                      <div>
                        GPS: <code style={{ color: '#22C55E' }}>{c.latitude?.toFixed(3)}, {c.longitude?.toFixed(3)}</code>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={`tel:${c.contact_phone}`}
                        style={{
                          flex: 1,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          background: '#111F14',
                          border: '1px solid #203526',
                          color: '#F5F7F5',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Icon name="phone" size={13} color="#9CA3A5" />
                        <span>Call Facility</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="gl-shop-btn-post"
                        style={{
                          flex: 1,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: '#F97316',
                          border: 'none',
                          color: '#FFFFFF',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Icon name="map" size={13} color="#FFFFFF" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LOCAL SHOPS & COMPANIES DIRECTORY */}
        {!loading && !error && viewMode === 'shops' && (
          <div>
            <div
              className="gl-shop-card-secondary"
              style={{
                background: '#111F14',
                border: '1px solid #203526',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 14,
                fontSize: '0.78rem',
                color: '#9CA3A5',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="shield" size={16} color="#38BDF8" />
              <span>Verified local electronics repair shops from <code>public.profiles</code>. Displayed by city/address without fabricated coordinates.</span>
            </div>

            {shops.length === 0 ? (
              <div
                className="gl-shop-card"
                style={{ textAlign: 'center', padding: 50, background: '#0D1710', borderRadius: 'var(--radius-lg)' }}
              >
                <Icon name="shop" size={32} color="#66736A" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '10px 0 4px', color: '#F5F7F5' }}>
                  No Other Local Shops Registered
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#9CA3A5' }}>
                  As new repair businesses register with the Local Shop role, their verified business locations will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {shops.map((s) => (
                  <div
                    key={s.id}
                    className="gl-shop-card"
                    style={{
                      background: '#0D1710',
                      border: '1px solid #203526',
                      borderRadius: 'var(--radius-lg)',
                      padding: 18,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div
                          style={{
                            fontSize: '0.70rem',
                            color: '#22C55E',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Verified Electronics Hub
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F5F7F5', margin: '2px 0 0' }}>
                          {s.name}
                        </h3>
                      </div>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="shop" size={18} color="#22C55E" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.80rem', color: '#9CA3A5' }}>
                      <Icon name="location-pin" size={14} color="#38BDF8" />
                      <span>{s.address ? `${s.address}, ${s.city}` : s.city}</span>
                    </div>

                    <div
                      style={{
                        background: '#111F14',
                        border: '1px solid #203526',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        color: '#9CA3A5',
                      }}
                    >
                      Phone: <strong style={{ color: '#F5F7F5' }}>{s.phone}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={`tel:${s.phone}`}
                        style={{
                          flex: 1,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          background: '#111F14',
                          border: '1px solid #203526',
                          color: '#F5F7F5',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Icon name="phone" size={13} color="#9CA3A5" />
                        <span>Call Shop</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.address + ' ' + s.city)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="gl-shop-btn-post"
                        style={{
                          flex: 1,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: '#F97316',
                          border: 'none',
                          color: '#FFFFFF',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <Icon name="map" size={13} color="#FFFFFF" />
                        <span>Search Map</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
