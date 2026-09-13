import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import Icon from '../../components/Icon'

export default function LocalShopPostPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Mobile Phones')
  const [subcategory, setSubcategory] = useState('')
  const [condition, setCondition] = useState('Broken / For Parts')
  const [quantity, setQuantity] = useState<number>(25)
  const [unit, setUnit] = useState<'Pieces' | 'KG'>('Pieces')
  const [askingPrice, setAskingPrice] = useState<string>('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Quick preset templates for common bulk e-waste items
  const presets = [
    { title: 'Broken Mobile Phones', category: 'Mobile Phones', quantity: 25, unit: 'Pieces' as const, condition: 'Broken / For Parts' },
    { title: 'Damaged Laptops', category: 'Laptops', quantity: 12, unit: 'Pieces' as const, condition: 'Broken / For Parts' },
    { title: 'Mixed Chargers & Adapters', category: 'Accessories', quantity: 50, unit: 'Pieces' as const, condition: 'Mixed Working/Faulty' },
    { title: 'Mixed Electronic Parts & PCBs', category: 'Electronic Parts', quantity: 18, unit: 'KG' as const, condition: 'Scrap Components' },
    { title: 'Depleted Lithium Batteries', category: 'Batteries', quantity: 10, unit: 'KG' as const, condition: 'Degraded / Swollen' },
  ]

  const applyPreset = (p: typeof presets[0]) => {
    setTitle(p.title)
    setCategory(p.category)
    setQuantity(p.quantity)
    setUnit(p.unit)
    setCondition(p.condition)
    setSubcategory(`${p.quantity} ${p.unit}`)
    setDescription(`Bulk lot of ${p.quantity} ${p.unit} of ${p.title.toLowerCase()}. Collected through shop trade-ins and diagnostic harvesting. Ideal for component salvage or certified smelting.`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please provide a listing title.')
      return
    }

    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity greater than 0.')
      return
    }

    setSubmitting(true)

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr || !authData?.user) {
        throw new Error('Authentication required. Please sign in to create a bulk listing.')
      }

      const structuredSubcategory = `${quantity} ${unit}${subcategory ? ` • ${subcategory}` : ''}`
      const fullDescription = description.trim() || `Bulk lot: ${quantity} ${unit} of ${title}. Condition: ${condition}.`

      // Real Supabase insert into public.e_waste_posts
      const { error: insertErr } = await supabase
        .from('e_waste_posts')
        .insert({
          user_id: authData.user.id,
          title: title.trim(),
          category: category,
          subcategory: structuredSubcategory,
          condition: condition,
          status: 'available',
          asking_price: askingPrice ? Number(askingPrice) : null,
          image_url: imageUrl.trim() || null,
          description: fullDescription,
        })
        .select('id')
        .single()

      if (insertErr) {
        throw new Error(insertErr.message || 'Database error while saving bulk listing.')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err: any) {
      console.error('[Green Loop Shop] Bulk post error:', err)
      setError(err.message || 'Failed to publish bulk listing. Please check connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 36px)', width: '100%' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="box" size={20} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Publish Bulk E-Waste Material
            </h1>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              List bulk collected hardware, harvested spare parts, or scrap for smelters & recyclers
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Bulk Presets Bar */}
        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="sparkles" size={15} color="var(--accent)" />
            <span>Common Bulk Material Templates:</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.title} ({p.quantity} {p.unit})
              </button>
            ))}
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: 20, textAlign: 'center', marginBottom: 20 }}>
            <Icon name="check-circle" size={36} color="var(--accent)" />
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: 8, fontSize: '1rem' }}>
              Bulk Listing Published Successfully!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Your lot has been added to <code>public.e_waste_posts</code> in Supabase. Redirecting to feed...
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 20, color: '#ef4444', fontSize: '0.84rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 22, boxShadow: 'var(--shadow-sm)' }}>
          {/* Material Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Bulk Material Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Broken Mobile Phones, Damaged Laptops Lot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Quantity & Unit Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Quantity *
              </label>
              <input
                type="number"
                min={1}
                placeholder="25"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
              >
                <option value="Pieces">Pieces</option>
                <option value="KG">KG</option>
              </select>
            </div>
          </div>

          {/* Category & Condition Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
              >
                <option value="Mobile Phones">Mobile Phones</option>
                <option value="Laptops">Laptops & PCs</option>
                <option value="Electronic Parts">Mixed Electronic Parts</option>
                <option value="Batteries">Batteries & Power Packs</option>
                <option value="Accessories">Cables & Chargers</option>
                <option value="Appliances">Other Appliances</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
              >
                <option value="Broken / For Parts">Broken / For Parts</option>
                <option value="Harvested Components">Harvested Components</option>
                <option value="Mixed Working/Faulty">Mixed Working / Faulty</option>
                <option value="Scrap Only">Scrap Only (Smelting)</option>
              </select>
            </div>
          </div>

          {/* Price & Image Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Asking Price (₹) <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Leave blank for quote)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 4500"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Image URL <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Lot Details & Storage Location
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Bulk lot of 25 devices. Includes logic boards, cracked screens, and casing. Ready for pickup at RS Puram shop."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.88rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              {submitting ? 'Publishing Lot...' : 'Publish Bulk Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
