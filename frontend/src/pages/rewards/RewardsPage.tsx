import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'

// ─── Rewards Data ─────────────────────────────────────────────────────────
const REWARD_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'discount', label: 'Discounts' },
  { id: 'repair', label: 'Repair' },
  { id: 'eco', label: 'Eco' },
  { id: 'badges', label: 'Badges' },
]

const REWARDS = [
  {
    id: 'r1', category: 'discount', emoji: '\ud83d\udecb\ufe0f',
    title: '10% Off Laptop Repair',
    partner: 'TechFix Coimbatore',
    desc: 'Valid at 3 partner repair centers in Coimbatore. Use code at checkout.',
    cost: 200,
    badge: 'Popular',
    badgeColor: '#10b981',
  },
  {
    id: 'r2', category: 'eco', emoji: '\ud83c\udf31',
    title: 'Plant a Tree in Your Name',
    partner: 'GreenIndia NGO',
    desc: 'Verified tree plantation in Tamil Nadu. Certificate issued within 7 days.',
    cost: 350,
    badge: 'Eco',
    badgeColor: '#34d399',
  },
  {
    id: 'r3', category: 'discount', emoji: '\ud83d\udcf1',
    title: '\u20b9100 Off Mobile Screen Repair',
    partner: 'QuickFix Chennai',
    desc: 'Any mobile screen replacement at QuickFix stores, Chennai.',
    cost: 150,
    badge: 'Best Value',
    badgeColor: '#f59e0b',
  },
  {
    id: 'r4', category: 'repair', emoji: '\ud83d\udd0b',
    title: 'Free Battery Health Check',
    partner: 'EcoRepair Madurai',
    desc: 'Full battery health diagnostics for laptops and mobiles. Book online.',
    cost: 100,
    badge: null,
    badgeColor: '',
  },
  {
    id: 'r5', category: 'badges', emoji: '\ud83c\udfc5',
    title: 'Eco Champion Digital Badge',
    partner: 'Green Loop',
    desc: 'Unlock an exclusive Eco Champion badge displayed on your public profile.',
    cost: 500,
    badge: 'Exclusive',
    badgeColor: '#a78bfa',
  },
  {
    id: 'r6', category: 'eco', emoji: '\ud83d\ude9a',
    title: 'Free E-Waste Pickup',
    partner: 'TNPCB Partner Network',
    desc: 'Schedule one doorstep e-waste pickup within 5 km for free.',
    cost: 300,
    badge: null,
    badgeColor: '',
  },
  {
    id: 'r7', category: 'discount', emoji: '\ud83d\udcbb',
    title: '\u20b9250 Off Refurbished Laptop',
    partner: 'ReNewIT Bengaluru',
    desc: 'Redeem on any certified refurbished laptop over \u20b912,000.',
    cost: 600,
    badge: 'Premium',
    badgeColor: '#818cf8',
  },
  {
    id: 'r8', category: 'repair', emoji: '\ud83d\udee0\ufe0f',
    title: '20% Off Motherboard Repair',
    partner: 'CircuitAid Chennai',
    desc: 'Any motherboard or component-level repair at CircuitAid labs.',
    cost: 400,
    badge: null,
    badgeColor: '',
  },
]

const VOUCHER_CODES = [
  { code: 'ECO100', value: 100, color: '#10b981' },
  { code: 'CLEAN250', value: 250, color: '#38bdf8' },
  { code: 'GREEN500', value: 500, color: '#a78bfa' },
]

export default function RewardsPage() {
  const { user, updateCoins, redeemCoins } = useAuth()
  const [activeCategory, setActiveCategory] = useState('all')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherMsg, setVoucherMsg] = useState<string | null>(null)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set())
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const coins = user?.greenCoins || 0

  const filtered = activeCategory === 'all'
    ? REWARDS
    : REWARDS.filter(r => r.category === activeCategory)

  const handleRedeemReward = (reward: typeof REWARDS[0]) => {
    if (coins < reward.cost) return
    setConfirmId(reward.id)
  }

  const handleConfirm = () => {
    const reward = REWARDS.find(r => r.id === confirmId)
    if (!reward) return
    updateCoins(-reward.cost)
    setRedeemedIds(prev => new Set([...prev, reward.id]))
    setConfirmId(null)
  }

  const handleVoucherRedeem = () => {
    setVoucherError(null)
    setVoucherMsg(null)
    const upper = voucherCode.trim().toUpperCase()
    const found = VOUCHER_CODES.find(v => v.code === upper)
    if (!found) {
      setVoucherError('Invalid voucher code. Try ECO100, CLEAN250 or GREEN500.')
      return
    }
    redeemCoins(found.value, `Redeemed Voucher: ${upper}`)
    setVoucherMsg(`+${found.value} Green Coins credited for "${upper}"!`)
    setVoucherCode('')
    setTimeout(() => setVoucherMsg(null), 4000)
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '20px 20px 0',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
              {'\ud83e\ude99'} Rewards Store
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Redeem Green Coins for real eco-benefits
            </div>
          </div>
          <div style={{
            background: 'rgba(245,158,11,0.12)', borderRadius: 12,
            padding: '8px 14px', border: '1px solid rgba(245,158,11,0.25)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: '1rem' }}>{'\ud83e\ude99'}</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#f59e0b' }}>
              {coins.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 14 }}>
          {REWARD_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '5px 14px', borderRadius: 999, flexShrink: 0,
                background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
                border: activeCategory === cat.id ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* ── Voucher Redemption Box ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.2)',
          padding: '16px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="gift" size={16} color="var(--accent)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Redeem Voucher Code
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. ECO100)"
              onKeyDown={e => e.key === 'Enter' && handleVoucherRedeem()}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-base)', color: 'var(--text-primary)',
                fontSize: '0.88rem', fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700, letterSpacing: '0.05em',
                outline: 'none',
              }}
            />
            <button
              onClick={handleVoucherRedeem}
              style={{
                padding: '10px 18px', borderRadius: 10,
                background: 'var(--accent)', color: '#fff',
                border: 'none', fontSize: '0.82rem', fontWeight: 800,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              Apply
            </button>
          </div>
          {voucherMsg && (
            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
              {'\u2705'} {voucherMsg}
            </div>
          )}
          {voucherError && (
            <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
              {'\u26a0\ufe0f'} {voucherError}
            </div>
          )}
        </div>

        {/* ── Reward Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(reward => {
            const canAfford = coins >= reward.cost
            const isRedeemed = redeemedIds.has(reward.id)
            return (
              <div key={reward.id} style={{
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                border: isRedeemed ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color)',
                padding: '16px', opacity: isRedeemed ? 0.75 : 1,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'var(--bg-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {reward.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {reward.title}
                      </span>
                      {reward.badge && (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px',
                          borderRadius: 999, background: `${reward.badgeColor}22`,
                          color: reward.badgeColor, border: `1px solid ${reward.badgeColor}44`,
                        }}>
                          {reward.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>
                      {reward.partner}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {reward.desc}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: '1rem' }}>{'\ud83e\ude99'}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: canAfford ? '#f59e0b' : 'var(--text-tertiary)' }}>
                          {reward.cost.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Green Coins</span>
                      </div>
                      {isRedeemed ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 800 }}>
                          {'\u2705'} Redeemed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRedeemReward(reward)}
                          disabled={!canAfford}
                          style={{
                            padding: '8px 16px', borderRadius: 10,
                            background: canAfford ? 'var(--accent)' : 'var(--bg-surface-2)',
                            color: canAfford ? '#fff' : 'var(--text-tertiary)',
                            border: canAfford ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                            fontSize: '0.78rem', fontWeight: 800,
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s',
                          }}
                        >
                          {canAfford ? 'Redeem' : 'Need more coins'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── How coins are earned ── */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)', padding: '16px', marginTop: 24,
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
            {'\ud83e\ude99'} How to Earn More Green Coins
          </div>
          {[
            { action: 'Verified device recycling', coins: '+500', icon: '\u267b\ufe0f' },
            { action: 'Complete daily missions', coins: '+10–50', icon: '\u26a1' },
            { action: 'Sell a verified device', coins: '+50', icon: '\ud83d\udcb0' },
            { action: 'Donate to school/NGO', coins: '+100', icon: '\ud83e\udd1d' },
            { action: 'Refer a friend who signs up', coins: '+75', icon: '\ud83d\udc65' },
          ].map(item => (
            <div key={item.action} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {item.action}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent)' }}>
                {item.coins}
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.5 }}>
            {'\ud83d\udd12'} Major rewards are credited only after verified eco-actions. Green Coins are not equivalent to cash and cannot be transferred.
          </p>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {confirmId && (() => {
        const reward = REWARDS.find(r => r.id === confirmId)!
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end',
          }}
            onClick={() => setConfirmId(null)}
          >
            <div
              style={{
                background: 'var(--bg-surface)', borderRadius: '20px 20px 0 0',
                padding: '24px 20px 40px', width: '100%',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{reward.emoji}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Confirm Redemption
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {reward.title} from {reward.partner}
                </p>
              </div>
              <div style={{
                background: 'var(--bg-surface-2)', borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 18,
              }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cost</span>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#f59e0b' }}>
                  {'\ud83e\ude99'} {reward.cost} Green Coins
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleConfirm}
                  style={{
                    padding: '14px', borderRadius: 12, background: 'var(--accent)',
                    color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 800,
                    cursor: 'pointer', width: '100%',
                  }}
                >
                  Confirm & Redeem
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{
                    padding: '12px', borderRadius: 12, background: 'transparent',
                    color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                    fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', width: '100%',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
