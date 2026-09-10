import Icon from '../../../../components/Icon'

interface AIAnalysisStepProps {
  image: string
  title: string
  category: string
  brand: string
  model: string
  condition: string
  confidence: string
  purpose: string
  onPurposeChange: (purpose: string) => void
  onNext: () => void
  onRetake: () => void
  isHazardousBattery?: boolean
}

export default function AIAnalysisStep({
  image,
  title,
  category,
  brand,
  model,
  condition,
  confidence,
  purpose,
  onPurposeChange,
  onNext,
  onRetake,
  isHazardousBattery
}: AIAnalysisStepProps) {
  return (
    <div>
      {/* Captured Photo Preview Card */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <img
            src={image}
            alt="Scanned Device"
            style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Icon name="sparkles" size={15} color="var(--accent)" />
              <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 800 }}>
                AI Vision Match • {confidence}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              {brand} {model} • <strong>{category}</strong> • <em>{condition}</em>
            </div>
          </div>
        </div>
      </div>

      {/* Hazardous Battery Banner if applicable */}
      {isHazardousBattery && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: 16,
            color: '#b91c1c',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}
        >
          <strong>⚠️ Battery Swelling Detected:</strong> This item contains pressurized volatile electrolyte. It cannot be sold or repaired. Routing directly to authorized hazardous recycling.
        </div>
      )}

      {/* Suggested Action Selector */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
          AI Recommended Pathway
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {[
            { id: 'Sell', label: '💰 Sell', desc: 'Working condition' },
            { id: 'Repair', label: '🛠️ Repair', desc: 'Fixable faults' },
            { id: 'Donate', label: '🤝 Donate', desc: 'Community use' },
            { id: 'Recycle', label: '♻️ Recycle', desc: 'Zero-landfill' },
          ].map(opt => {
            const isSelected = purpose === opt.id
            const isDisabled = isHazardousBattery && opt.id !== 'Recycle'
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isDisabled}
                onClick={() => onPurposeChange(opt.id)}
                style={{
                  background: isSelected ? 'var(--accent)' : 'var(--bg-surface-2)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 8px',
                  textAlign: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{opt.label}</div>
                <div style={{ fontSize: '0.65rem', opacity: isSelected ? 0.9 : 0.6, marginTop: 2 }}>{opt.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onRetake} className="btn btn-ghost btn-full">
          Retake Photo
        </button>
        <button type="button" onClick={onNext} className="btn btn-primary btn-full">
          Continue
        </button>
      </div>
    </div>
  )
}
