import React, { useEffect, useState } from 'react'
import { adminService } from './services/adminService'
import { useAuth } from '../../../context/AuthContext'
import Icon from '../../../components/Icon'

export default function AdminRecyclingCenters() {
  const { user: currentAdmin } = useAuth()
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    city: 'Coimbatore',
    address: '',
    contact_phone: '',
    latitude: 11.0168,
    longitude: 76.9558,
    capacity_kg: 2500,
  })

  const loadCenters = async () => {
    setLoading(true)
    const list = await adminService.getRecyclingCenters()
    setCenters(list)
    setLoading(false)
  }

  useEffect(() => {
    loadCenters()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAdmin?.id) return
    const ok = await adminService.createRecyclingCenter(
      { id: currentAdmin.id, name: currentAdmin.name },
      formData
    )
    if (ok) {
      setShowModal(false)
      loadCenters()
      setFormData({
        name: '',
        city: 'Coimbatore',
        address: '',
        contact_phone: '',
        latitude: 11.0168,
        longitude: 76.9558,
        capacity_kg: 2500,
      })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Official Recycling Facilities
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
            Verified e-waste hubs, certified processing capacities, and drop-off points.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={14} color="#ffffff" />
          <span>Add Recycling Facility</span>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            Loading facilities from Supabase...
          </div>
        ) : centers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#64748b' }}>
            No recycling centers found.
          </div>
        ) : (
          centers.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: '#0f1713',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="recycle" size={20} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981' }}>TNPCB Certified</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>📍 Address: <strong>{c.address}, {c.city}</strong></div>
                <div>📞 Contact: <strong>{c.contact_phone || 'Official Desk'}</strong></div>
                <div>⚖️ Capacity: <strong>{(c.capacity_kg || 1000).toLocaleString()} kg / mo</strong></div>
                <div>🌐 GPS: <strong>{c.latitude}, {c.longitude}</strong></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Center Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: '#0f1713',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              padding: 24,
              width: '100%',
              maxWidth: 480,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem' }}>Add Recycling Center</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                  Facility Name
                </label>
                <input
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Coimbatore E-Waste Circular Hub"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                    City
                  </label>
                  <input
                    required
                    className="input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                    Contact Phone
                  </label>
                  <input
                    className="input"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                  Full Street Address
                </label>
                <input
                  required
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Industrial Estate, Pincode"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    className="input"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    className="input"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
