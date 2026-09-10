import { useState } from 'react'

export const LEADERBOARD_COLLEGES = [
  { rank: 1, name: 'PSG College of Technology', metric: '1,420 kg recycled', badge: '1st Place', score: 1420 },
  { rank: 2, name: 'Coimbatore Institute of Tech (CIT)', metric: '980 kg recycled', badge: '2nd Place', score: 980 },
  { rank: 3, name: 'Kumaraguru College of Tech', metric: '850 kg recycled', badge: '3rd Place', score: 850 },
  { rank: 4, name: 'Amrita Vishwa Vidyapeetham', metric: '620 kg recycled', badge: '#4', score: 620 },
]

export const LEADERBOARD_INDIVIDUALS = [
  { rank: 1, name: 'Prakash V.', metric: '4,850 Green Coins', badge: 'Top Recycler' },
  { rank: 2, name: 'Mathavan (You)', metric: '1,250 Green Coins', badge: 'Eco Explorer' },
  { rank: 3, name: 'Ananya S.', metric: '1,120 Green Coins', badge: 'Champion' },
  { rank: 4, name: 'Dinesh K.', metric: '940 Green Coins', badge: 'Contributor' },
]

export default function LeaderboardSection() {
  const [tab, setTab] = useState<'campus' | 'community'>('campus')

  const list = tab === 'campus' ? LEADERBOARD_COLLEGES : LEADERBOARD_INDIVIDUALS

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Green Loop Leaderboard</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setTab('campus')}
          className="btn btn-sm"
          style={{
            flex: 1,
            background: tab === 'campus' ? 'var(--accent)' : 'var(--bg-surface-2)',
            color: tab === 'campus' ? '#fff' : 'var(--text-primary)',
            fontSize: '0.78rem'
          }}
        >
          College Campus Drives
        </button>
        <button
          onClick={() => setTab('community')}
          className="btn btn-sm"
          style={{
            flex: 1,
            background: tab === 'community' ? 'var(--accent)' : 'var(--bg-surface-2)',
            color: tab === 'community' ? '#fff' : 'var(--text-primary)',
            fontSize: '0.78rem'
          }}
        >
          Top Recyclers
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(item => (
          <div
            key={item.rank}
            className="card"
            style={{
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: item.rank === 1 ? '1.5px solid #f59e0b' : '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: item.rank === 1 ? '#fef3c7' : item.rank === 2 ? '#e2e8f0' : '#ffedd5',
                  color: item.rank === 1 ? '#b45309' : item.rank === 2 ? '#475569' : '#c2410c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}
              >
                {item.rank}
              </div>
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{item.name}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.metric}</div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'var(--bg-surface-2)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)'
              }}
            >
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
