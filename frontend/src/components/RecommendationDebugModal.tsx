import Icon from './Icon'
import type { CandidatePostScore } from '../types/recommendation.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  scores: CandidatePostScore[]
  userId?: string
  role?: string
}

export default function RecommendationDebugModal({
  isOpen,
  onClose,
  scores,
  userId,
  role,
}: Props) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '88vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="sparkles" size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                AI Recommendation Engine Debugger
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                User: <strong>{userId || 'Guest'}</strong> | Active Role: <strong>{role || 'citizen'}</strong> | Candidates:{' '}
                <strong>{scores.length}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: 6,
            }}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Candidate Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 8px' }}>Candidate Post</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Category</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Semantic (35%)</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Behavior (20%)</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Recency (15%)</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Role (10%)</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Local (8%)</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>Final Score</th>
                <th style={{ padding: '10px 8px' }}>Explanation Reason</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((c, idx) => (
                <tr
                  key={c.post.id || idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.post.title}
                    </div>
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(255, 255, 255, 0.06)',
                        fontSize: '0.72rem',
                      }}
                    >
                      {c.post.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: '#38bdf8', fontWeight: 700 }}>
                    {(c.semanticScore * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: '#a78bfa', fontWeight: 700 }}>
                    {(c.behaviorScore * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>
                    {(c.recencyScore * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: '#fbbf24', fontWeight: 700 }}>
                    {(c.roleScore * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: '#f472b6', fontWeight: 700 }}>
                    {(c.localScore * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--accent)',
                        fontWeight: 800,
                      }}
                    >
                      {c.finalScore.toFixed(3)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {c.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-surface-2)',
          }}
        >
          <span>Formula: 0.35·Sem + 0.20·Beh + 0.15·Rec + 0.10·Role + 0.08·Loc + 0.07·Eng + 0.05·Exp − Pen</span>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
