import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, type AdminStats } from './services/adminService'
import Icon, { type IconName } from '../../../components/Icon'

export default function AdminOverview() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getAdminOverviewStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  const statCards: Array<{
    title: string
    value: number | string
    icon: IconName
    color: string
    bg: string
    subtitle: string
    path?: string
  }> = [
    {
      title: 'Total Platform Users',
      value: stats?.totalUsers ?? 0,
      icon: 'user',
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${stats?.citizenCount ?? 0} Citizens • ${stats?.shopCount ?? 0} Shops • ${stats?.companyCount ?? 0} Companies`,
      path: '/admin/users',
    },
    {
      title: 'E-Waste Listings',
      value: stats?.totalPosts ?? 0,
      icon: 'package',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      subtitle: `${stats?.availablePosts ?? 0} available for pickup/trade`,
      path: '/admin/posts',
    },
    {
      title: 'Doorstep Pickups',
      value: stats?.totalPickups ?? 0,
      icon: 'truck',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      subtitle: `${stats?.pendingPickups ?? 0} scheduled / pending dispatch`,
      path: '/admin/pickups',
    },
    {
      title: 'Official Centers',
      value: stats?.totalRecyclingCenters ?? 0,
      icon: 'recycle',
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.1)',
      subtitle: 'TNPCB compliant e-waste hubs',
      path: '/admin/centers',
    },
    {
      title: 'Material Claims',
      value: stats?.totalClaims ?? 0,
      icon: 'check',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      subtitle: 'Successful shop & enterprise claims',
      path: '/admin/posts',
    },
    {
      title: 'AI Rec Events Logged',
      value: stats?.recommendationEventsCount ?? 0,
      icon: 'sparkles',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      subtitle: 'Dynamic user behavior signals',
      path: '/admin/recommendations',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          System Overview & Operations
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: 4 }}>
          Live metrics and platform authority status pulled directly from Supabase tables.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statCards.map((c, i) => (
          <div
            key={i}
            onClick={() => c.path && navigate(c.path)}
            style={{
              backgroundColor: '#0f1713',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: 20,
              cursor: c.path ? 'pointer' : 'default',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{c.title}</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  {loading ? '...' : c.value}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: c.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={c.icon} size={20} color={c.color} />
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 12 }}>{c.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Operations */}
      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 22,
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 16px' }}>
          Administrative Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
            <Icon name="user" size={16} color="#ffffff" />
            <span>Manage User Directory</span>
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/posts')}>
            <Icon name="package" size={16} color="var(--accent)" />
            <span>Moderate Listings</span>
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/pickups')}>
            <Icon name="truck" size={16} color="var(--accent)" />
            <span>Dispatch Pickups</span>
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/recommendations')}>
            <Icon name="sparkles" size={16} color="var(--accent)" />
            <span>AI Recommendation Engine</span>
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/health')}>
            <Icon name="activity" size={16} color="var(--accent)" />
            <span>Check Database Health</span>
          </button>
        </div>
      </div>
    </div>
  )
}
