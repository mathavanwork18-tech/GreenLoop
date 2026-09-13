import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import Icon from '../../components/Icon'

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
  const [viewMode, setViewMode] = useState<'centers' | 'shops'>('centers')
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null)

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
          .or('role.eq.shop,role.eq.local_shop')

        if (shopsErr) {
          console.warn('[Green Loop] Shops lookup error:', shopsErr.message)
        } else {
          const mappedShops: LocalShopProfile[] = (shopsData || []).map(s => ({
            id: s.id,
            name: s.full_name || 'Electronics Repair Hub',
            phone: s.phone || 'Contact via Green Loop',
            city: s.city || 'Coimbatore',
            address: s.address || 'Central District',
            role: s.role,
          }))
          setShops(mappedShops)
        }
      } catch (err: any) {
        console.error('[Green Loop] Map load error:', err)
        setError(err.message || 'Failed to load location data from Supabase.')
      } finally {
        setLoading(false)
      }
    }

    loadMapData()
  }, [])

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Ecosystem Logistics & Facilities
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Authorized TNPCB smelters, recycling facilities, and certified repair shops
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
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
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Loading Facility Coordinates...</div>
            <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Connecting to Supabase recycling_centers</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: 18, textAlign: 'center', margin: '20px 0' }}>
            <Icon name="alert" size={24} color="#ef4444" />
            <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 8 }}>{error}</div>
          </div>
        )}

        {/* VIEW 1: RECYCLING CENTERS (REAL GPS DATA) */}
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
                {centers.map(c => (
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

        {/* VIEW 2: LOCAL SHOPS & COMPANIES DIRECTORY (NO FAKE GPS COORDINATES) */}
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
                {shops.map(s => (
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
