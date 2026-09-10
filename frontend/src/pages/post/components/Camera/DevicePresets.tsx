import Icon from '../../../../components/Icon'

export interface PresetDevice {
  title: string
  category: string
  brand: string
  model: string
  condition: string
  visibleDamage: string
  confidence: string
  purpose: string
  estimatedPrice: number | null
  priceRange: string
  description: string
  image: string
  isHazardousBattery?: boolean
  icon: 'phone' | 'laptop' | 'battery' | 'tablet'
}

export const PRESET_DEVICES: PresetDevice[] = [
  {
    title: 'Samsung Galaxy A52',
    category: 'Mobile Phone',
    brand: 'Samsung',
    model: 'Galaxy A52 128GB',
    condition: 'Good',
    visibleDamage: 'Minor scratches on back plastic, screen intact',
    confidence: '96% (High)',
    purpose: 'Sell',
    estimatedPrice: 5500,
    priceRange: '₹4,800 – ₹6,200',
    description: 'Samsung Galaxy A52 in good working condition with minor cosmetic wear. Battery health at 85%. Original charger included.',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
    icon: 'phone'
  },
  {
    title: 'Dell Inspiron 15 3000',
    category: 'Laptop',
    brand: 'Dell',
    model: 'Inspiron 15 3511',
    condition: 'Damaged',
    visibleDamage: 'Cracked LCD panel, battery won\'t hold charge',
    confidence: '94% (High)',
    purpose: 'Repair',
    estimatedPrice: 3000,
    priceRange: '₹2,500 – ₹3,500',
    description: 'Dell Inspiron 15 with Core i3 processor. Screen has vertical lines and needs panel replacement. Motherboard and SSD fully functional.',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    icon: 'laptop'
  },
  {
    title: 'Swollen Li-Ion Battery Pack',
    category: 'Battery',
    brand: 'Generic / Laptop Pack',
    model: '6-Cell Li-Ion 4800mAh',
    condition: 'Damaged',
    visibleDamage: 'Severe physical swelling / outer casing ruptured',
    confidence: '99% (High)',
    purpose: 'Recycle',
    estimatedPrice: null,
    priceRange: 'Recycle Only',
    description: 'End-of-life lithium-ion pack showing structural bulge. Requires hazardous chemical neutralization and metal recovery.',
    image: 'https://images.unsplash.com/photo-1619641782821-751f8d9254f2?w=500&q=80',
    isHazardousBattery: true,
    icon: 'battery'
  },
  {
    title: 'Apple iPhone 12 Pro',
    category: 'Mobile Phone',
    brand: 'Apple',
    model: 'iPhone 12 Pro 128GB',
    condition: 'Good',
    visibleDamage: 'None visible, fully functional',
    confidence: '98% (High)',
    purpose: 'Donate',
    estimatedPrice: null,
    priceRange: 'Community Donation',
    description: 'iPhone 12 Pro in pristine condition. Donating to support educational digital literacy initiative.',
    image: 'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=500&q=80',
    icon: 'phone'
  }
]

interface DevicePresetsProps {
  onSelectPreset: (preset: PresetDevice) => void
}

export default function DevicePresets({ onSelectPreset }: DevicePresetsProps) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Icon name="sparkles" size={16} color="var(--accent)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Or Select Instant Device Preset
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {PRESET_DEVICES.map((dev, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPreset(dev)}
            className="card"
            style={{
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              border: dev.isHazardousBattery ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
              background: dev.isHazardousBattery ? 'rgba(239,68,68,0.06)' : 'var(--bg-surface)',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: dev.isHazardousBattery ? 'rgba(239,68,68,0.15)' : 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon name={dev.icon} size={20} color={dev.isHazardousBattery ? '#ef4444' : 'var(--accent)'} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {dev.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: dev.isHazardousBattery ? '#ef4444' : 'var(--text-secondary)' }}>
                {dev.purpose} • {dev.confidence}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
