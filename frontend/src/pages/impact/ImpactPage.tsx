import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'

// ─── Animated Counter Hook ─────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

// ─── Data ──────────────────────────────────────────────────────────────────
const IMPACT_STATS = [
  { id: 'recycled', label: 'Devices Recycled', value: 7, unit: '', icon: 'recycle', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { id: 'reused', label: 'Devices Reused', value: 12, unit: '', icon: 'smartphone', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  { id: 'repaired', label: 'Devices Repaired', value: 4, unit: '', icon: 'tool', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'donated', label: 'Devices Donated', value: 3, unit: '', icon: 'heart', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { id: 'diverted', label: 'E-Waste Diverted', value: 48, unit: 'kg', icon: 'leaf', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  { id: 'co2', label: 'CO\u2082 Avoided', value: 126, unit: 'kg', icon: 'cloud', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
]

const LEVEL_TIERS = [
  { min: 0, max: 499, label: 'Eco Beginner', icon: '\ud83c\udf31', color: '#6b7280' },
  { min: 500, max: 1499, label: 'Green Saver', icon: '\u267b\ufe0f', color: '#10b981' },
  { min: 1500, max: 3499, label: 'Eco Champion', icon: '\ud83c\udf0d', color: '#38bdf8' },
  { min: 3500, max: 7499, label: 'Sustainability Hero', icon: '\u26a1', color: '#f59e0b' },
  { min: 7500, max: 999999, label: 'Planet Guardian', icon: '\ud83c\udfc6', color: '#a78bfa' },
]

const BADGES = [
  { id: 'first_recycle', icon: '\u267b\ufe0f', label: 'First Recycle', desc: 'Recycled your first device', earned: true, date: 'Jan 2026' },
  { id: 'trusted_seller', icon: '\ud83c\udfc5', label: 'Trusted Seller', desc: '5 successful transactions', earned: true, date: 'Feb 2026' },
  { id: 'eco_warrior', icon: '\ud83c\udf0d', label: 'Eco Warrior', desc: 'Diverted 25kg of e-waste', earned: true, date: 'Mar 2026' },
  { id: 'community', icon: '\ud83e\udd1d', label: 'Community Contributor', desc: '3 devices donated', earned: true, date: 'Apr 2026' },
  { id: 'repair_hero', icon: '\ud83d\udee0\ufe0f', label: 'Repair Hero', desc: 'Repaired 5 devices', earned: false, date: null },
  { id: 'streak_30', icon: '\ud83d\udd25', label: '30-Day Streak', desc: '30 consecutive eco-actions', earned: false, date: null },
]

const MATERIAL_RECOVERY = [
  { material: 'Copper', kg: 2.4, color: '#f59e0b' },
  { material: 'Aluminium', kg: 6.8, color: '#94a3b8' },
  { material: 'Gold', kg: 0.04, color: '#fbbf24' },
  { material: 'Lithium', kg: 0.8, color: '#38bdf8' },
  { material: 'Cobalt', kg: 0.3, color: '#818cf8' },
  { material: 'Plastic', kg: 12.1, color: '#6b7280' },
]

const MONTHLY_ACTIVITY = [
  { month: 'Apr', actions: 2 },
  { month: 'May', actions: 4 },
  { month: 'Jun', actions: 3 },
  { month: 'Jul', actions: 7 },
  { month: 'Aug', actions: 5 },
  { month: 'Sep', actions: 8 },
]

export default function ImpactPage() {
  const { user } = useAuth()
  const [animStart, setAnimStart] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'badges' | 'leaderboard'>('overview')
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setAnimStart(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const coins = user?.greenCoins || 1250
  const currentLevel = LEVEL_TIERS.find(l => coins >= l.min && coins <= l.max) || LEVEL_TIERS[0]
  const nextLevel = LEVEL_TIERS[LEVEL_TIERS.indexOf(currentLevel) + 1]
  const progressToNext = nextLevel
    ? Math.min(100, Math.round(((coins - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
    : 100

  const animatedCoins = useCountUp(coins, 1600, animStart)
  const animatedDiverted = useCountUp(48, 1800, animStart)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'materials', label: 'Materials' },
    { id: 'badges', label: 'Badges' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ]

  const maxActivity = Math.max(...MONTHLY_ACTIVITY.map(m => m.actions))

  const communityStats = [
    { label: 'Total Devices Recycled', value: '18,420', icon: '\u267b\ufe0f' },
    { label: 'CO\u2082 Avoided (Community)', value: '42,800 kg', icon: '\ud83c\udf0d' },
    { label: 'Devices Reused', value: '31,050', icon: '\ud83d\udcf1' },
    { label: 'Green Coins Distributed', value: '2.4M', icon: '\ud83e\ude99' },
  ]

  const leaderboard = [
    { rank: 1, name: 'Priya S.', city: 'Chennai', coins: 8420, badge: '\ud83c\udfc6', isYou: false },
    { rank: 2, name: 'Arjun M.', city: 'Coimbatore', coins: 7850, badge: '\ud83e\udea8', isYou: false },
    { rank: 3, name: 'Nithya R.', city: 'Madurai', coins: 6930, badge: '\ud83e\udea9', isYou: false },
    { rank: 4, name: user?.name?.split(' ')[0] || 'You', city: user?.city || 'Chennai', coins, badge: '\u26a1', isYou: true },
    { rank: 5, name: 'Karthik V.', city: 'Bengaluru', coins: 1100, badge: '', isYou: false },
    { rank: 6, name: 'Meena L.', city: 'Trichy', coins: 980, badge: '', isYou: false },
  ]

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)' }}>
      {/* Hero Banner */}
      <div
        ref={headerRef}
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          padding: '28px 20px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(52,211,153,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(16,185,129,0.1)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
            }}>
              {'\ud83c\udf0d'}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.9)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Green Impact
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                Your Eco Journey
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
              borderRadius: 16, padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {animStart ? animatedCoins.toLocaleString() : '\u2014'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.9)', marginTop: 4, fontWeight: 600 }}>
                {'\ud83e\ude99'} Green Coins Earned
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
              borderRadius: 16, padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {animStart ? animatedDiverted : '\u2014'}
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>kg</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.9)', marginTop: 4, fontWeight: 600 }}>
                {'\u267b\ufe0f'} E-Waste Diverted
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1rem' }}>{currentLevel.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{currentLevel.label}</span>
              </div>
              {nextLevel && (
                <span style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.85)', fontWeight: 600 }}>
                  {progressToNext}% to {nextLevel.label}
                </span>
              )}
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, #34d399, #10b981)',
                width: `${progressToNext}%`,
                transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Icon name="chart" size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Your Impact Stats
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {IMPACT_STATS.map(stat => (
                  <StatCard key={stat.id} stat={stat} animStart={animStart} />
                ))}
              </div>
            </div>

            {/* Monthly Activity Bar Chart */}
            <div style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)', padding: '16px',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Icon name="trending-up" size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Monthly Eco-Actions
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                {MONTHLY_ACTIVITY.map(m => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', maxWidth: 28,
                      height: Math.round((m.actions / maxActivity) * 64) + 4,
                      background: m.month === 'Sep' ? 'var(--accent)' : 'var(--bg-surface-2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                    }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.month}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: '0.74rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                29 total actions this year
              </div>
            </div>

            {/* Community Impact */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: '1rem' }}>{'\ud83c\udf0f'}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Community Impact
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {communityStats.map(s => (
                  <div key={s.label} style={{
                    background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', padding: '12px 14px',
                  }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 3, fontWeight: 600 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <>
            <div style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)', padding: '16px', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name="chart" size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Materials Recovered
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.5 }}>
                These materials were extracted and safely processed from your recycled devices by TNPCB-authorized facilities.
              </p>
              {MATERIAL_RECOVERY.map(m => {
                const maxKg = Math.max(...MATERIAL_RECOVERY.map(r => r.kg))
                const pct = Math.round((m.kg / maxKg) * 100)
                return (
                  <div key={m.material} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.material}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: m.color }}>{m.kg} kg</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, background: m.color, width: `${pct}%`, opacity: 0.85 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))',
              borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.2)',
              padding: '16px', marginBottom: 20,
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                {'\ud83c\udf31'} What Your Impact Equals
              </div>
              {[
                { icon: '\ud83c\udf33', text: '6 trees worth of CO\u2082 offset', sub: 'Based on 126 kg CO\u2082 avoided' },
                { icon: '\ud83d\udca1', text: '340 kWh electricity saved', sub: 'Equivalent to 2 months of home use' },
                { icon: '\ud83d\ude97', text: '480 km of car travel avoided', sub: 'CO\u2082 equivalent emission offset' },
                { icon: '\ud83d\udca7', text: '1,200 L of water conserved', sub: 'Through material recovery' },
              ].map(eq => (
                <div key={eq.text} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: '1.4rem' }}>{eq.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>{eq.text}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{eq.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Badges are awarded for verified eco-actions. Earn them by recycling, repairing, donating, and completing missions.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {BADGES.map(badge => (
                  <div key={badge.id} style={{
                    background: badge.earned ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-lg)',
                    border: badge.earned ? '1px solid var(--border-color)' : '1px dashed var(--border-subtle)',
                    padding: '16px 14px', textAlign: 'center',
                    opacity: badge.earned ? 1 : 0.5,
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8, filter: badge.earned ? 'none' : 'grayscale(1)' }}>
                      {badge.earned ? badge.icon : '\ud83d\udd12'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {badge.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {badge.desc}
                    </div>
                    {badge.earned && badge.date && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--accent)', marginTop: 6, fontWeight: 700 }}>
                        Earned {badge.date}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)', padding: '16px',
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
                {'\ud83c\udfc6'} Eco Level Tiers
              </div>
              {LEVEL_TIERS.map(tier => {
                const isActive = tier.label === currentLevel.label
                return (
                  <div key={tier.label} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                    background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>{tier.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {tier.label}
                        {isActive && <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent)', marginLeft: 8 }}>{'\u2190'} You are here</span>}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {tier.min.toLocaleString()} {'\u2013'} {tier.max >= 999999 ? '\u221e' : tier.max.toLocaleString()} Green Coins
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <>
            <div style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)', padding: '16px', marginBottom: 20,
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {'\ud83c\udfc6'} Regional Leaderboard
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                Ranked by verified Green Coins {'\u2014'} not spending
              </div>
              {leaderboard.map(entry => (
                <div key={entry.rank} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 8px', borderBottom: '1px solid var(--border-subtle)',
                  background: entry.isYou ? 'rgba(16,185,129,0.06)' : 'transparent',
                  borderRadius: entry.isYou ? 8 : 0,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: entry.rank <= 3 ? 'rgba(251,191,36,0.15)' : 'var(--bg-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800,
                    color: entry.rank <= 3 ? '#fbbf24' : 'var(--text-secondary)',
                    flexShrink: 0,
                  }}>
                    {entry.badge || `#${entry.rank}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: entry.isYou ? 800 : 700, color: entry.isYou ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {entry.name} {entry.isYou ? '(You)' : ''}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{entry.city}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                    {'\ud83e\ude99'} {entry.coins.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16,185,129,0.2)', padding: '14px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <Icon name="sparkles" size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Move up the leaderboard!
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Complete daily missions, recycle devices and get verified. Major rewards are credited only after verified eco-actions.
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

// Stat Card sub-component
function StatCard({ stat, animStart }: { stat: typeof IMPACT_STATS[0]; animStart: boolean }) {
  const animated = useCountUp(stat.value, 1400, animStart)
  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)', padding: '14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: stat.bg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={stat.icon as any} size={18} color={stat.color} />
      </div>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
          {animStart ? animated : stat.value}
          {stat.unit && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}> {stat.unit}</span>}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 3, fontWeight: 600 }}>
          {stat.label}
        </div>
      </div>
    </div>
  )
}
