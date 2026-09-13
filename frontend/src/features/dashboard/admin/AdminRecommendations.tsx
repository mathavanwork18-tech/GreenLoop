import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'

export default function AdminRecommendations() {
  const [totalEvents, setTotalEvents] = useState<number>(0)
  const [eventBreakdown, setEventBreakdown] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const { count } = await supabase.from('recommendation_events').select('id', { count: 'exact', head: true })
        setTotalEvents(count || 0)

        const { data } = await supabase.from('recommendation_events').select('event_type').limit(300)
        if (data) {
          const counts: Record<string, number> = {}
          data.forEach((e: { event_type: string }) => {
            counts[e.event_type] = (counts[e.event_type] || 0) + 1
          })
          setEventBreakdown(counts)
        }
      } catch (err) {
        console.warn('Failed to load recommendation stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          AI Recommendation Engine Status & Tuning
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>
          Instagram-style continuous personalization using user behavior signals and Gemini embeddings.
        </p>
      </div>

      {/* Engine Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ backgroundColor: '#0f1713', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Behavior Signals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: 6 }}>
            {loading ? '...' : totalEvents}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
            Stored in <code>public.recommendation_events</code>
          </div>
        </div>

        <div style={{ backgroundColor: '#0f1713', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Exploration vs Exploitation</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 6 }}>
            85% / 15%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
            Auto-tuned with cold-start boost (35%)
          </div>
        </div>

        <div style={{ backgroundColor: '#0f1713', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Decay Half-Life</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginTop: 6 }}>
            7 Days (168h)
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
            Exponential decay: <code>e^(-t/168)</code>
          </div>
        </div>
      </div>

      {/* Scoring Formula Architecture */}
      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 22,
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 12px' }}>
          Active Multi-Factor Ranking Formula
        </h3>
        <div
          style={{
            backgroundColor: '#16221c',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: 16,
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#34d399',
            lineHeight: 1.6,
          }}
        >
          Score = 0.35·Semantic + 0.20·Behavior + 0.15·Recency + 0.10·Role + 0.08·Local + 0.07·Engagement + 0.05·Exploration<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (0.18·SeenPenalty + 0.15·RepeatedCategoryPenalty + 10.0·HiddenPenalty)
        </div>
      </div>

      {/* Signal Distribution */}
      <div
        style={{
          backgroundColor: '#0f1713',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 22,
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 16px' }}>
          Recent Behavior Event Distribution
        </h3>
        {Object.keys(eventBreakdown).length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.84rem' }}>
            No recent interaction events logged yet. Events accumulate as users search, view, like, and claim items.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {Object.entries(eventBreakdown).map(([type, count]) => (
              <div
                key={type}
                style={{
                  backgroundColor: '#16221c',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>{type}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
