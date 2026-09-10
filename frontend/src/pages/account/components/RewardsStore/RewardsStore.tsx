import Icon from '../../../../components/Icon'
import type { IconName } from '../../../../components/Icon'

export const REWARDS_STORE: { id: string; title: string; partner: string; cost: number; icon: IconName }[] = [
  { id: 'r1', title: '₹250 Repair Discount Voucher', partner: 'TechFix Electronics', cost: 300, icon: 'repair' },
  { id: 'r2', title: 'Adopt a Native Tree Sapling', partner: 'Coimbatore Green Trust', cost: 500, icon: 'tree' },
  { id: 'r3', title: 'Free Fireproof Battery Safety Case', partner: 'GreenCycle Safety Hub', cost: 200, icon: 'battery' },
  { id: 'r4', title: '20% Off Refurbished Accessories', partner: 'Digital World Store', cost: 250, icon: 'headphones' },
]

interface RewardsStoreProps {
  userCoins: number
  onRedeem: (title: string, cost: number) => void
}

export default function RewardsStore({ userCoins, onRedeem }: RewardsStoreProps) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Green Rewards Store</span>
        <span className="section-link">Your Balance: {userCoins} Coins</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {REWARDS_STORE.map(reward => {
          const canAfford = userCoins >= reward.cost
          return (
            <div
              key={reward.id}
              className="card"
              style={{
                padding: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon name={reward.icon} size={20} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {reward.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {reward.partner}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRedeem(reward.title, reward.cost)}
                className="btn btn-primary btn-sm"
                disabled={!canAfford}
                style={{
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  opacity: canAfford ? 1 : 0.4
                }}
              >
                {reward.cost} Coins
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
