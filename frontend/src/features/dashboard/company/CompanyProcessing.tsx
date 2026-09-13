import { useState, useEffect } from 'react'
import { companyService, type CompanyProcessingItem } from '../../../services/company/companyService'
import Icon from '../../../components/Icon'

export default function CompanyProcessing() {
  const [items, setItems] = useState<CompanyProcessingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const stages: CompanyProcessingItem['currentStage'][] = [
    'Collected',
    'Sorting',
    'Processing',
    'Reusable/Recyclable',
    'Completed',
  ]

  const loadProcessing = async () => {
    setLoading(true)
    try {
      const data = await companyService.getProcessingItems()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProcessing()
  }, [])

  const advanceStage = async (item: CompanyProcessingItem) => {
    const currentIndex = stages.indexOf(item.currentStage)
    if (currentIndex >= stages.length - 1) return
    const nextStage = stages[currentIndex + 1]

    setUpdatingId(item.id)
    try {
      await companyService.updateProcessingStage(item.id, nextStage)
      await loadProcessing()
    } catch (e: any) {
      alert(`Stage transition failed: ${e?.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Circular Processing Pipeline
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Track e-waste batches through industrial sorting, mechanical shredding, and chemical neutralization
          </p>
        </div>
        <button
          onClick={loadProcessing}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
        >
          <Icon name="refresh" size={14} color="currentColor" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Stage Progression Visualizer */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 8,
          textAlign: 'center',
        }}
      >
        {stages.map((st, idx) => {
          const count = items.filter(i => i.currentStage === st).length
          return (
            <div key={st} style={{ padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                Step {idx + 1}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                {st}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#059669' }}>
                {count} {count === 1 ? 'batch' : 'batches'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading circular processing items...
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.1)', display: 'inline-flex', marginBottom: 12 }}>
            <Icon name="recycle" size={24} color="#059669" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            Pipeline currently idle
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Authorize incoming collection requests to feed batches into the industrial pipeline.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map(item => {
            const isLast = item.currentStage === 'Completed'
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  borderLeft: isLast ? '4px solid #10b981' : '4px solid #059669',
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>
                      {item.batchNo}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: isLast ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.15)',
                        color: isLast ? '#10b981' : '#059669',
                      }}
                    >
                      Stage: {item.currentStage}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {item.materialType}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                    <span>Batch Weight: <strong>{item.weightKg} kg</strong></span>
                    <span>Facility: {item.targetFacility}</span>
                    <span>Intake: {item.lastUpdated}</span>
                  </div>
                </div>

                <div>
                  {!isLast ? (
                    <button
                      onClick={() => advanceStage(item)}
                      disabled={updatingId === item.id}
                      className="btn btn-primary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.78rem',
                        background: '#059669',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Icon name="arrow-right" size={14} color="#ffffff" />
                      <span>{updatingId === item.id ? 'Advancing...' : 'Advance Stage'}</span>
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="check" size={16} color="#10b981" />
                      <span>Recycling Complete</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
