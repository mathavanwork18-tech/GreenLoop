import SafetyChecklist from './SafetyChecklist'
import Icon from '../../../../components/Icon'

interface ConfigurationStepProps {
  purpose: string
  title: string
  onTitleChange: (v: string) => void
  price: number | ''
  onPriceChange: (v: number | '') => void
  priceRange: string
  negotiable: boolean
  onNegotiableChange: (v: boolean) => void
  description: string
  onDescriptionChange: (v: string) => void
  location: string
  onLocationChange: (v: string) => void
  safetyChecklist: {
    backup: boolean
    signOut: boolean
    factoryReset: boolean
    removeSim: boolean
  }
  onSafetyChange: (v: any) => void
  onNext: () => void
  onBack: () => void
}

export default function ConfigurationStep({
  purpose,
  title,
  onTitleChange,
  price,
  onPriceChange,
  priceRange,
  negotiable,
  onNegotiableChange,
  description,
  onDescriptionChange,
  location,
  onLocationChange,
  safetyChecklist,
  onSafetyChange,
  onNext,
  onBack
}: ConfigurationStepProps) {
  const isSell = purpose === 'Sell'

  return (
    <div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Listing Title
            </label>
            <input className="input" value={title} onChange={e => onTitleChange(e.target.value)} style={{ width: '100%' }} />
          </div>

          {/* Pricing for Sell */}
          {isSell && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Price (₹ INR)
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>
                  AI Suggested: {priceRange}
                </span>
              </div>
              <input
                type="number"
                className="input"
                value={price}
                onChange={e => onPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ width: '100%' }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={e => onNegotiableChange(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>Price is negotiable</span>
              </label>
            </div>
          )}

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Pickup / Handover Location
            </label>
            <input className="input" value={location} onChange={e => onLocationChange(e.target.value)} style={{ width: '100%' }} />
          </div>

          {/* Description */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Description
              </label>
              <button
                type="button"
                onClick={() => onDescriptionChange(`${title} in good working order. Inspected via Green Loop AI.`)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Icon name="sparkles" size={11} color="var(--accent)" />
                <span>AI Regenerate</span>
              </button>
            </div>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={e => onDescriptionChange(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Safety Checklist */}
          <SafetyChecklist checklist={safetyChecklist} onChange={onSafetyChange} />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onBack} className="btn btn-ghost btn-full">
          Back
        </button>
        <button type="button" onClick={onNext} className="btn btn-primary btn-full">
          Review & Preview
        </button>
      </div>
    </div>
  )
}
