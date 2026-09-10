import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import { Card, Badge, Button } from '../../components/ui'

export default function ImpactPage() {
  const { user } = useAuth()
  const coins = user?.greenCoins || 1250
  const ewasteKg = (coins * 0.12).toFixed(1)
  const co2Kg = (coins * 0.08).toFixed(1)
  const treesEquivalent = Math.max(1, Math.round(Number(co2Kg) / 20))
  const waterSavedLiters = Math.round(Number(ewasteKg) * 85)

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', width: '100%' }}>
      {/* Environmental Header Banner */}
      <section
        style={{
          background: 'linear-gradient(160deg, #0e1612 0%, #080d0a 100%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '28px 20px',
        }}
      >
        <div className="container">
          <Badge variant="green" size="sm" style={{ marginBottom: 8 }}>
            Certified TNPCB Circular Ledger
          </Badge>
          <h1
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 1.75rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 6px',
            }}
          >
            Environmental Impact & Material Recovery
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 580 }}>
            Real-time verified carbon offset, toxic landfill prevention, and critical raw materials diverted back into circular manufacturing.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 18 }}>
        {/* Core Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          <Card style={{ textAlign: 'center', padding: '18px 14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <Icon name="recycle" size={24} color="var(--accent)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1.1 }}>
              {ewasteKg} kg
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              E-Waste Diverted
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Zero Landfill Certified</div>
          </Card>

          <Card style={{ textAlign: 'center', padding: '18px 14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <Icon name="tree" size={24} color="#60a5fa" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa', lineHeight: 1.1 }}>
              {co2Kg} kg
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              CO₂e Neutralized
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>≈ {treesEquivalent} Trees Planted</div>
          </Card>

          <Card style={{ textAlign: 'center', padding: '18px 14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <Icon name="coin" size={24} color="var(--coin-color)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coin-color)', lineHeight: 1.1 }}>
              {coins.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              EcoPoints Earned
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Redeemable in Shop</div>
          </Card>
        </div>

        {/* Precious Materials Circular Recovery */}
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Critical Raw Material Recovery
              </h3>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Harvested by authorized Tamil Nadu smelters & recyclers
              </div>
            </div>
            <Badge variant="green" size="sm">
              98.4% Efficiency
            </Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Electrolytic Copper', qty: '340 g', pct: 78, color: '#f59e0b' },
              { label: 'Structural Aluminum', qty: '820 g', pct: 92, color: '#10b981' },
              { label: 'Gold & Palladium Traces', qty: '0.45 g', pct: 45, color: '#eab308' },
              { label: 'Lithium & Cobalt Oxides', qty: '180 g', pct: 64, color: '#3b82f6' },
            ].map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.label}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{m.qty}</strong>
                </div>
                <div style={{ height: 6, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${m.pct}%`,
                      background: m.color,
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Equivalency Highlights */}
        <Card style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', marginBottom: 18 }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Circular Equivalency Equivalents
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>💧</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>{waterSavedLiters.toLocaleString()} Liters</strong> groundwater protected from toxic leachate
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>142 kWh</strong> grid electricity saved vs primary bauxite/copper mining
              </div>
            </div>
          </div>
        </Card>

        <Button
          variant="secondary"
          fullWidth
          size="md"
          icon="certificate"
          onClick={() => alert('Official TNPCB Verified Eco-Impact Statement exported to PDF.')}
        >
          Download Verified Eco-Certificate (PDF)
        </Button>
      </div>
    </div>
  )
}
