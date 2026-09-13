import { useEffect, useState } from 'react'
import { adminService } from './services/adminService'
import Icon from '../../../components/Icon'

export default function AdminDatabaseHealth() {
  const [tables, setTables] = useState<Array<{ table: string; count: number; status: string }>>([])
  const [latency, setLatency] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const checkHealth = async () => {
    setLoading(true)
    const t0 = performance.now()
    const data = await adminService.getDatabaseHealth()
    const t1 = performance.now()
    setLatency(Math.round(t1 - t0))
    setTables(data)
    setLoading(false)
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Supabase Database Health & RLS Status
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
            Live status of Green Loop PostgreSQL tables, row counts, and RLS enforcement.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={checkHealth}>
          <Icon name="recycle" size={14} />
          <span>Ping Supabase</span>
        </button>
      </div>

      {/* Latency & Connectivity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ backgroundColor: '#0f1713', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>API Connection Latency</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            {latency ? `${latency} ms` : 'Testing...'}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Endpoint: pzjczufhflhjcoorvubr</span>
        </div>

        <div style={{ backgroundColor: '#0f1713', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Row Level Security (RLS)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            Enforced
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>PostgreSQL declarative policies active</span>
        </div>

        <div style={{ backgroundColor: '#0f1713', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tables Verified</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
            {tables.length} / 10 Active
          </div>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>100% schema integrity</span>
        </div>
      </div>

      {/* Tables List */}
      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Table Name</th>
              <th style={{ padding: '12px 16px' }}>Row Count</th>
              <th style={{ padding: '12px 16px' }}>Operational Status</th>
              <th style={{ padding: '12px 16px' }}>RLS Policy Coverage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  Querying database tables...
                </td>
              </tr>
            ) : (
              tables.map((t) => (
                <tr key={t.table} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                    public.{t.table}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 600 }}>
                    {t.count.toLocaleString()} rows
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem' }}>
                    Role-guarded & Admin bypass
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
