import Icon from '../../../../components/Icon'

interface PickupTrackerProps {
  currentStep: number
  onStepChange: (step: number) => void
}

const PICKUP_STEPS = [
  { num: 1, title: 'Request Created', desc: 'Booking confirmed via app' },
  { num: 2, title: 'Partner Assigned', desc: 'GreenCycle Logistics Unit #4' },
  { num: 3, title: 'Pickup Confirmed', desc: 'Slot: Today 11:30 AM' },
  { num: 4, title: 'Collector En Route', desc: 'Driver: Rajesh K. • 12 mins away' },
  { num: 5, title: 'Arrived at Address', desc: 'Weighing & safety inspection' },
  { num: 6, title: 'Collected', desc: 'Digital receipt generated' },
  { num: 7, title: 'Recycled & Certified', desc: 'Certificate & coins issued' },
]

export default function PickupTracker({ currentStep, onStepChange }: PickupTrackerProps) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Live Pickup Chain of Custody</span>
        <span className="section-link">Order #GL-8821</span>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ position: 'relative', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Vertical Connecting Line */}
          <div
            style={{
              position: 'absolute',
              left: 7,
              top: 8,
              bottom: 8,
              width: 2,
              background: 'var(--border-color)',
              zIndex: 1
            }}
          />

          {PICKUP_STEPS.map((step, idx) => {
            const isDone = currentStep >= step.num
            const isActive = currentStep === step.num

            return (
              <div key={idx} style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: -24,
                    top: 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: isDone ? 'var(--accent)' : 'var(--bg-surface)',
                    border: isDone ? '2px solid var(--accent)' : '2px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  {isDone && <Icon name="check" size={10} color="#fff" />}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isActive ? 'var(--accent)' : isDone ? 'var(--text-primary)' : 'var(--text-tertiary)'
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step Controls */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onStepChange(Math.min(7, currentStep + 1))}
            style={{ flex: 1, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <span>Simulate Next Step</span>
            <Icon name="arrow-right" size={14} color="#fff" />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => alert('Pickup rescheduled to next available slot.')}
            style={{ fontSize: '0.78rem' }}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  )
}
