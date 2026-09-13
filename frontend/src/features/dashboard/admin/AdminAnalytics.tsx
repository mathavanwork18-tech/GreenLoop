export default function AdminAnalytics() {
  const categoryBreakdown = [
    { category: 'Laptops & Computers', share: 34, weightKg: 1240 },
    { category: 'Mobile Phones & Tablets', share: 28, weightKg: 860 },
    { category: 'Home Appliances', share: 18, weightKg: 2100 },
    { category: 'Circuits & Batteries', share: 12, weightKg: 450 },
    { category: 'Other Peripherals', share: 8, weightKg: 310 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Platform Analytics & Circular Trade Metrics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Aggregate material recovery, category demand share, and citywide recycling velocity.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ backgroundColor: '#0f1713', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Landfill Diversion</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            4,960 kg
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>TNPCB Certified Tamil Nadu E-Waste</span>
        </div>

        <div style={{ backgroundColor: '#0f1713', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>CO₂e Net Offset</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            3,280 kg CO₂e
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Equivalent to 142 trees planted</span>
        </div>

        <div style={{ backgroundColor: '#0f1713', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Green Coins Minted</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
            48,250 🪙
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Circulated among active recyclers</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 22,
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 16px' }}>
          Material Volume by E-Waste Category
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categoryBreakdown.map((item) => (
            <div key={item.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{item.category}</span>
                <span style={{ color: '#94a3b8' }}>
                  {item.share}% ({item.weightKg.toLocaleString()} kg)
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${item.share}%`,
                    backgroundColor: '#10b981',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
