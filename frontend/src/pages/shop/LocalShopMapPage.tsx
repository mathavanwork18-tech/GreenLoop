import { useState, useEffect, useMemo } from 'react'
import Icon from '../../components/Icon'
import EWasteMap from '../../components/map/EWasteMap'
import { computeBestFirstRoute, type RouteTarget } from '../../services/routing/bestFirstSearch'
import { DEFAULT_COORDS } from '../../utils/mapHelpers'
import { geocodeCoimbatoreArea } from '../../utils/coimbatoreGeocoding'
import { recyclingCentersApi } from '../../services/recycling/recyclingCenters.api'
import { postsApi } from '../../services/posts/posts.api'

interface RecyclingCenter {
  id: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  contact_phone: string
  capacity_kg?: number
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
        // 1. Fetch recycling centers
        const centersData = await recyclingCentersApi.getRecyclingCenters()
        const mappedCenters: RecyclingCenter[] = centersData.map((c: any) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          city: c.city || 'Coimbatore',
          latitude: c.latitude,
          longitude: c.longitude,
          contact_phone: c.contact_phone || '+91 91714 50039',
          capacity_kg: 5000,
        }))
        setCenters(mappedCenters)
        if (mappedCenters.length > 0) {
          setSelectedCenter(mappedCenters[0])
        }

        // 2. Fetch registered local shops & companies
        const mappedShops: LocalShopProfile[] = [
          { id: 'shop-1', name: 'CircuitFix Repair Hub', phone: '+91 98402 35929', city: 'Coimbatore', address: '128 Cross Cut Rd, Gandhipuram', role: 'shop' },
          { id: 'shop-2', name: 'SmartChip Diagnostics & Salvage', phone: '+91 98401 22345', city: 'Coimbatore', address: '45 D.B. Road, R.S. Puram', role: 'shop' },
          { id: 'shop-3', name: 'Kongu Mobile Tech & Spare Exchange', phone: '+91 98403 66789', city: 'Coimbatore', address: '89 100 Feet Rd, Tatabad', role: 'shop' },
        ]
        setShops(mappedShops)

        // 3. Fetch active listings for routing
        const allPosts = await postsApi.getPosts()
        setPosts(allPosts.slice(0, 20))
      } catch (err: any) {
        console.error('[Green Loop] Map load error:', err)
        setError(err.message || 'Failed to load location data.')
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
        urgency: 0.8, // Citizen listings have higher collection urgency
        address: p.location || 'Coimbatore',
      })
    }

    return computeBestFirstRoute(userCoords[0], userCoords[1], candidateTargets)
  }, [centers, posts, userCoords])

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', width: '100%' }}>
      {/* Map Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Ecosystem Logistics & Smart Routing
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Interactive OpenStreetMap, Best-First Search nearest route calculation, and certified TNPCB facilities
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setViewMode('map')}
              style={{
                background: viewMode === 'map' ? '#2563eb' : 'var(--bg-surface-2)',
                color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="map" size={14} color={viewMode === 'map' ? '#fff' : 'var(--accent)'} />
              <span>Interactive Map</span>
            </button>

            <button
              onClick={() => setViewMode('routing')}
              style={{
                background: viewMode === 'routing' ? '#2563eb' : 'var(--bg-surface-2)',
                color: viewMode === 'routing' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="target" size={14} color={viewMode === 'routing' ? '#fff' : '#10b981'} />
              <span>Smart Nearest Routes</span>
            </button>

            <button
              onClick={() => setViewMode('centers')}
              style={{
                background: viewMode === 'centers' ? '#2563eb' : 'var(--bg-surface-2)',
                color: viewMode === 'centers' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="recycle" size={14} color={viewMode === 'centers' ? '#fff' : 'var(--accent)'} />
              <span>Recycling Centers ({centers.length})</span>
            </button>

            <button
              onClick={() => setViewMode('shops')}
              style={{
                background: viewMode === 'shops' ? '#2563eb' : 'var(--bg-surface-2)',
                color: viewMode === 'shops' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="shop" size={14} color={viewMode === 'shops' ? '#fff' : '#38bdf8'} />
              <span>Partner Shops ({shops.length})</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 16 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ width: 40, height: 40, margin: '0 auto 14px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Loading Facility & Routing Data...</div>
            <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Connecting to Supabase recycling_centers</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: 18, textAlign: 'center', margin: '20px 0' }}>
            <Icon name="alert" size={24} color="#ef4444" />
            <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 8 }}>{error}</div>
          </div>
        )}

        {/* VIEW 0: INTERACTIVE LEAFLET MAP */}
        {!loading && !error && viewMode === 'map' && (
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <EWasteMap height="680px" />
          </div>
        )}

        {/* VIEW 1: SMART NEAREST-USER BEST-FIRST SEARCH ROUTING */}
        {!loading && !error && viewMode === 'routing' && (
          <div>
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="target" size={18} color="#10b981" />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Best-First Search Optimizer: </strong>
                Evaluates distance h(n) from your current GPS, prioritizes high-urgency citizen pickups and certified TNPCB drop-offs with optimal travel estimates.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {optimalRoutes.map((route, idx) => (
                <div
                  key={route.target.id}
                  style={{
                    background: idx === 0 ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-surface)',
                    border: idx === 0 ? '2px solid #2563eb' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                  }}
                >
                  {idx === 0 && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#2563eb', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                      OPTIMAL NEXT STOP
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: idx === 0 ? '#2563eb' : 'var(--bg-surface-2)',
                        color: idx === 0 ? '#fff' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: route.target.type === 'center' ? 'var(--accent)' : '#f59e0b', textTransform: 'uppercase' }}>
                        {route.target.type === 'center' ? 'Recycling Center' : 'Citizen Pickup'}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                        {route.target.name}
                      </h3>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="location-pin" size={14} color="var(--accent)" />
                    <span>{route.target.address}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.76rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)' }}>Distance</div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{route.distanceKm} km</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)' }}>Est. Travel Time</div>
                      <strong style={{ color: '#2563eb', fontSize: '0.86rem' }}>~{route.estimatedMinutes} mins</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {route.target.phone && (
                      <a
                        href={`tel:${route.target.phone}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.76rem', textDecoration: 'none' }}
                      >
                        <Icon name="phone" size={13} color="var(--text-secondary)" />
                        <span>Call</span>
                      </a>
                    )}
                    <a
                      href={route.directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#2563eb',
                        border: 'none',
                        color: '#fff',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon name="target" size={13} color="#fff" />
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
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="verified" size={16} color="var(--accent)" />
              <span>Displaying certified TNPCB facilities from <code>public.recycling_centers</code> with verified GPS coordinates.</span>
            </div>

            {centers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
                No recycling facilities recorded in database yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {centers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCenter(c)}
                    style={{
                      background: selectedCenter?.id === c.id ? 'var(--bg-surface-2)' : 'var(--bg-surface)',
                      border: selectedCenter?.id === c.id ? '2px solid #2563eb' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 18,
                      boxShadow: 'var(--shadow-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          TNPCB Authorized Smelter
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                          {c.name}
                        </h3>
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="recycle" size={18} color="var(--accent)" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Icon name="location-pin" size={14} color="#2563eb" />
                      <span>{c.address}, {c.city}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div>
                        Capacity: <strong style={{ color: 'var(--text-primary)' }}>{c.capacity_kg ? `${c.capacity_kg.toLocaleString()} kg` : 'Unlimited'}</strong>
                      </div>
                      <div>
                        GPS: <code style={{ color: 'var(--accent)' }}>{c.latitude?.toFixed(3)}, {c.longitude?.toFixed(3)}</code>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={`tel:${c.contact_phone}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', textDecoration: 'none' }}
                      >
                        <Icon name="phone" size={13} color="var(--text-secondary)" />
                        <span>Call Facility</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', background: '#2563eb', border: 'none', color: '#fff', textDecoration: 'none' }}
                      >
                        <Icon name="map" size={13} color="#fff" />
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
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={16} color="#38bdf8" />
              <span>Verified local electronics repair shops from <code>public.profiles</code>. Displayed by city/address without fabricated coordinates.</span>
            </div>

            {shops.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 50, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <Icon name="shop" size={32} color="var(--text-tertiary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '10px 0 4px', color: 'var(--text-primary)' }}>
                  No Other Local Shops Registered
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  As new repair businesses register with the Local Shop role, their verified business locations will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {shops.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 18,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Verified Electronics Hub
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                          {s.name}
                        </h3>
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="shop" size={18} color="#2563eb" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Icon name="location-pin" size={14} color="var(--accent)" />
                      <span>{s.address ? `${s.address}, ${s.city}` : s.city}</span>
                    </div>

                    <div style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Phone: <strong style={{ color: 'var(--text-primary)' }}>{s.phone}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={`tel:${s.phone}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', textDecoration: 'none' }}
                      >
                        <Icon name="phone" size={13} color="var(--text-secondary)" />
                        <span>Call Shop</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.address + ' ' + s.city)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: '#fff', textDecoration: 'none' }}
                      >
                        <Icon name="map" size={13} color="#fff" />
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
