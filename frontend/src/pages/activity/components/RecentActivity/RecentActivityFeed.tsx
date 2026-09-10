import type { ActivityFeedItem } from '../../../../types/activity.types'
import Icon from '../../../../components/Icon'

interface RecentActivityFeedProps {
  activityList: ActivityFeedItem[]
}

export default function RecentActivityFeed({ activityList }: RecentActivityFeedProps) {
  return (
    <div style={{ marginTop: 10, marginBottom: 20 }}>
      <div className="section-header">
        <span className="section-title">Recent Activity Stream</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activityList.map(act => (
          <div
            key={act.id}
            className="card"
            style={{
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--bg-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name={act.icon} size={16} color="var(--accent)" />
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{act.desc}</strong>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{act.time}</div>
              </div>
            </div>

            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}>
              +{act.coins} Coins
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
