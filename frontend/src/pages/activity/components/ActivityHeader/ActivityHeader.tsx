import Icon from '../../../../components/Icon'
import { STREAK_DAYS } from '../../../../data/mockData'

interface ActivityHeaderProps {
  coins: number | undefined
  streak: number | undefined
}

export default function ActivityHeader({ coins = 0, streak = 1 }: ActivityHeaderProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #0f2419 0%, #064e3b 60%, #0d1f17 100%)',
        padding: '24px 20px 28px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(52,211,153,0.15)',
          filter: 'blur(30px)'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Green Loop Wallet & Impact
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Icon name="coin" size={26} color="var(--coin-color)" />
            <span>{coins.toLocaleString()}</span>
            <span style={{ fontSize: '0.9rem', color: '#6ee7b7', fontWeight: 600 }}>Coins</span>
          </h1>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Icon name="flame" size={14} color="#6ee7b7" />
          <span>{streak}-Day Streak</span>
        </div>
      </div>

      {/* 7-Day Streak Row */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d1fae5' }}>
            Weekly Eco-Action Streak
          </span>
          <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
            +50 Coins Weekend Bonus
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
          {STREAK_DAYS.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: d.done ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                  border: d.done ? '1.5px solid #6ee7b7' : '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fff'
                }}
              >
                {d.done ? <Icon name="check" size={12} color="#fff" /> : ''}
              </div>
              <span style={{ fontSize: '0.62rem', color: d.done ? '#a7f3d0' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
