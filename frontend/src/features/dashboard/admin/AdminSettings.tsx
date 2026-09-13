import { useState } from 'react'

export default function AdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [autoVerifyShops, setAutoVerifyShops] = useState(true)
  const [aiRecFilterStrictness, setAiRecFilterStrictness] = useState('balanced')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          System & Platform Settings
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Security parameters, authorized creators, and AI recommendation controls.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 24,
          maxWidth: 680,
        }}
      >
        {saved && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Authorized Creator Identities */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Authorized Platform Creators
            </label>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8 }}>
              Accounts granted root admin privileges in Supabase:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Mathavan', 'Vimal Raj', 'Thiru Loop'].map((c) => (
                <span
                  key={c}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Maintenance Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Maintenance Mode</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Temporarily pause new marketplace listings while performing database migrations.
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* Shop Auto-Verification */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Automatic Shop Verification</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Grant initial verified status upon GST/Trade license submission.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoVerifyShops}
              onChange={(e) => setAutoVerifyShops(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* AI Recommendation Strictness */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', marginBottom: 4 }}>
              AI Recommendation Diversity Profile
            </label>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 8 }}>
              Balances exploitation of user's past clicks vs. introducing fresh unexplored categories.
            </div>
            <select
              value={aiRecFilterStrictness}
              onChange={(e) => setAiRecFilterStrictness(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                backgroundColor: '#16221c',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#ffffff',
                padding: '0 12px',
                fontSize: '0.85rem',
              }}
            >
              <option value="high_relevance">High Exploitation (90% Preferred, 10% Explore)</option>
              <option value="balanced">Balanced Instagram Standard (85% Preferred, 15% Explore)</option>
              <option value="high_discovery">High Discovery (75% Preferred, 25% Explore)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            Save Settings
          </button>
        </form>
      </div>
    </div>
  )
}
