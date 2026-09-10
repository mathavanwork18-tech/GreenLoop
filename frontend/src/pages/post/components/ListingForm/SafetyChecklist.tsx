import Icon from '../../../../components/Icon'

interface SafetyChecklistProps {
  checklist: {
    backup: boolean
    signOut: boolean
    factoryReset: boolean
    removeSim: boolean
  }
  onChange: (updated: { backup: boolean; signOut: boolean; factoryReset: boolean; removeSim: boolean }) => void
}

export default function SafetyChecklist({ checklist, onChange }: SafetyChecklistProps) {
  return (
    <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="shield" size={16} color="var(--accent)" />
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Data & Privacy Safety Checklist
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { key: 'backup', label: 'Backed up photos, contacts & personal files' },
          { key: 'signOut', label: 'Signed out of Google, Apple ID & Cloud accounts' },
          { key: 'factoryReset', label: 'Performed full factory data wipe / reset' },
          { key: 'removeSim', label: 'Ejected physical SIM cards & microSD memory' },
        ].map(item => (
          <label
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={(checklist as any)[item.key]}
              onChange={e => onChange({ ...checklist, [item.key]: e.target.checked })}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
