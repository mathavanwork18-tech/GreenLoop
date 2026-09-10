import Icon from '../../../../components/Icon'

interface AIAnalysisStepProps {
  image: string
  productName: string
  category: string
  brand: string
  model: string
  condition: string
  confidenceScore: number
  estimatedValueMin: number
  estimatedValueMax: number
  description: string
  purpose: string
  onPurposeChange: (purpose: string) => void
  onNext: () => void
  onEditDetails: () => void
  onRetake: () => void
  onManualEntry?: () => void
  isHazardousBattery?: boolean
  hazardAlert?: string
}

export default function AIAnalysisStep({
  image,
  productName,
  category,
  brand,
  model,
  condition,
  confidenceScore,
  estimatedValueMin,
  estimatedValueMax,
  description,
  purpose,
  onPurposeChange,
  onNext,
  onEditDetails,
  onRetake,
  onManualEntry,
  isHazardousBattery,
  hazardAlert
}: AIAnalysisStepProps) {
  // Confidence classification
  const isHighConfidence = confidenceScore >= 80
  const isMediumConfidence = confidenceScore >= 50 && confidenceScore < 80
  const isLowConfidence = confidenceScore < 50

  const formattedValueRange =
    estimatedValueMax > 0
      ? `₹${estimatedValueMin.toLocaleString()} – ₹${estimatedValueMax.toLocaleString()}`
      : 'Scrap / Material Valuation'

  return (
    <div className="ai-analysis-review-screen" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Icon name="sparkles" size={16} color="var(--accent, #10b981)" />
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--accent, #10b981)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              AI Analysis Complete
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Review AI Catalog Extraction
          </h2>
        </div>

        {/* Confidence Indicator Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: isHighConfidence
              ? 'rgba(16, 185, 129, 0.12)'
              : isMediumConfidence
              ? 'rgba(245, 158, 11, 0.12)'
              : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${
              isHighConfidence ? '#10b981' : isMediumConfidence ? '#f59e0b' : '#ef4444'
            }`,
            color: isHighConfidence ? '#059669' : isMediumConfidence ? '#b45309' : '#b91c1c',
            fontSize: '0.76rem',
            fontWeight: 700
          }}
        >
          <Icon
            name={isHighConfidence ? 'check' : 'alert'}
            size={13}
            color={isHighConfidence ? '#059669' : isMediumConfidence ? '#b45309' : '#b91c1c'}
          />
          <span>
            {isHighConfidence
              ? `AI confidence: High (${confidenceScore}%)`
              : isMediumConfidence
              ? `AI confidence: Medium (${confidenceScore}%) — please review`
              : `AI confidence: Low (${confidenceScore}%) — review details`}
          </span>
        </div>
      </div>

      {/* Low Confidence Notice if applicable */}
      {isLowConfidence && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            color: '#b45309',
            fontSize: '0.8rem',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <Icon name="alert" size={18} color="#f59e0b" />
          <div>AI could not confidently identify this product. Please verify and edit the details below.</div>
        </div>
      )}

      {/* Hazardous Material Warning if applicable */}
      {isHazardousBattery && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            color: '#b91c1c',
            fontSize: '0.8rem',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <Icon name="alert" size={20} color="#ef4444" />
          <div>
            <strong>Battery Hazard Detected:</strong> {hazardAlert || 'This item shows swelling or damage. Keep isolated from flammable items and route directly to authorized hazardous recycling.'}
          </div>
        </div>
      )}

      {/* Two-Column Responsive Layout (Desktop: 2 columns, Mobile: 1 column) */}
      <div
        className="ai-review-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16
        }}
      >
        {/* Left Column: Image Card */}
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 240,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#091510'
            }}
          >
            <img
              src={image}
              alt="Analyzed Product"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 8px',
                fontSize: '0.7rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Icon name="camera" size={12} color="#34d399" />
              <span>Captured Image</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRetake}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', gap: 6, fontSize: '0.8rem' }}
          >
            <Icon name="refresh" size={14} color="currentColor" />
            <span>Retake or Choose Another Photo</span>
          </button>
        </div>

        {/* Right Column: AI Extracted Catalog Data */}
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Product Title */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
              AI Detected Product
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              {productName || 'Unknown Device'}
            </div>
          </div>

          {/* Quick Attributes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              padding: '12px',
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>CATEGORY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{category}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>CONDITION</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{condition}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>BRAND</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{brand}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>MODEL</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{model}</div>
            </div>
          </div>

          {/* Estimated Value Card */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Estimated Value
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)' }}>
                {formattedValueRange}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.3 }}>
              This is an AI estimate. Actual value may vary based on condition, location, demand, and market conditions.
            </div>
          </div>

          {/* Description */}
          {description && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                Description
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Pathway Selector */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Select Action Pathway
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {[
            { id: 'Sell', iconName: 'coin' as const, label: 'Sell', desc: 'Working condition' },
            { id: 'Repair', iconName: 'repair' as const, label: 'Repair', desc: 'Fixable component' },
            { id: 'Donate', iconName: 'gift' as const, label: 'Donate', desc: 'Community use' },
            { id: 'Recycle', iconName: 'recycle' as const, label: 'Recycle', desc: 'Zero-landfill certified' },
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
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Icon
                  name={opt.iconName}
                  size={18}
                  color={isSelected ? '#fff' : 'var(--accent)'}
                />
                <span style={{ fontWeight: 800, fontSize: '0.84rem' }}>{opt.label}</span>
                <span style={{ fontSize: '0.66rem', opacity: isSelected ? 0.9 : 0.6 }}>{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Actions Footer */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onEditDetails}
          className="btn btn-secondary"
          style={{ flex: 1, minWidth: '160px', gap: 8 }}
        >
          <Icon name="settings" size={16} color="currentColor" />
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
          style={{ flex: 1, minWidth: '160px', gap: 8 }}
        >
          <span>Continue</span>
          <Icon name="arrow-right" size={16} color="#fff" />
        </button>
      </div>

      {/* Manual fallback link */}
      {onManualEntry && (
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <button
            type="button"
            onClick={onManualEntry}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Enter details manually without AI assistance
          </button>
        </div>
      )}
    </div>
  )
}
