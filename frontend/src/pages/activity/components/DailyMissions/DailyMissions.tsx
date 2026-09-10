import type { DailyMission } from '../../../../types/activity.types'
import Icon from '../../../../components/Icon'

interface DailyMissionsProps {
  missions: DailyMission[]
  onClaim: (id: string, reward: number, title: string) => void
  onOpenTip: () => void
}

export default function DailyMissions({ missions, onClaim, onOpenTip }: DailyMissionsProps) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Today's Missions (Reset in 7h 45m)</span>
        <span className="section-link" onClick={onOpenTip}>
          Read Eco Tip
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {missions.map(mission => (
          <div
            key={mission.id}
            className="card"
            style={{
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              border: mission.completed ? '1px solid var(--border-color)' : '1.5px solid var(--accent)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: mission.completed ? 'var(--bg-surface-2)' : 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon name={mission.icon} size={22} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {mission.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Reward: <strong style={{ color: 'var(--accent)' }}>+{mission.reward} Green Coins</strong>
                </div>
              </div>
            </div>

            {mission.completed ? (
              <span
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent-text)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Icon name="check" size={13} color="var(--accent-text)" />
                <span>Claimed</span>
              </span>
            ) : (
              <button
                onClick={() => onClaim(mission.id, mission.reward, mission.title)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              >
                Claim
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
