import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { postsApi } from '../../services/posts/posts.api'
import { aiApi } from '../../services/ai/ai.api'
import LiveCameraView from './components/Camera/LiveCameraView'
import DevicePresets from './components/Camera/DevicePresets'
import type { PresetDevice } from './components/Camera/DevicePresets'
import AIAnalysisStep from './components/AIAnalysis/AIAnalysisStep'
import Modal from '../../components/ui/Modal'
import Icon from '../../components/Icon'
import { Button, Input, Card, Badge } from '../../components/ui'
import { formatCurrency } from '../../utils/formatting'

export type PostWizardStep = 1 | 2 | 3 | 4 | 5 | 6

const STEP_TITLES: Record<PostWizardStep, { title: string; subtitle: string }> = {
  1: { title: 'Add E-Waste Photo', subtitle: 'Capture with camera, upload a photo, or choose a preset' },
  2: { title: 'AI Review & Catalog Details', subtitle: 'Verify AI extraction, circular pathway, and device specifications' },
  3: { title: 'Condition & Safety', subtitle: 'Assess physical state and battery safety protocol' },
  4: { title: 'Pricing & Purpose', subtitle: 'Choose whether to sell, donate, or send for certified recycling' },
  5: { title: 'Location & Handover', subtitle: 'Set drop-off or doorstep pickup location' },
  6: { title: 'Review & Publish', subtitle: 'Review listing details before publishing to Green Loop' },
}

const CATEGORIES = [
  'Mobile Phone',
  'Laptop',
  'Tablet',
  'Desktop / PC',
  'Battery & Power Bank',
  'Audio & Headphones',
  'Circuit Board / Scrap',
  'Cables & Adapters',
  'Home Appliance',
  'Other Electronics',
]

export default function PostPage() {
  const navigate = useNavigate()
  const { user, updateCoins } = useAuth()

  // 6 Guided Wizard Steps
  const [step, setStep] = useState<PostWizardStep>(1)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isEditingDetails, setIsEditingDetails] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('Samsung Galaxy A52')
  const [category, setCategory] = useState('Mobile Phone')
  const [brand, setBrand] = useState('Samsung')
  const [model, setModel] = useState('Galaxy A52')
  const [condition, setCondition] = useState('Good')
  const [confidence, setConfidence] = useState('96% (High)')
  const [confidenceScore, setConfidenceScore] = useState<number>(96)
  const [purpose, setPurpose] = useState<'Sell' | 'Donate' | 'Recycle' | 'Repair'>('Sell')
  const [price, setPrice] = useState<number | ''>(5500)
  const [priceRange, setPriceRange] = useState('₹4,800 – ₹6,200')
  const [estimatedValueMin, setEstimatedValueMin] = useState<number>(4800)
  const [estimatedValueMax, setEstimatedValueMax] = useState<number>(6200)
  const [negotiable, setNegotiable] = useState(true)
  const [description, setDescription] = useState('Samsung Galaxy A52 in good working condition with minor external scratches.')
  const [location, setLocation] = useState(user?.area ? `${user.area}, ${user.city || 'Coimbatore'}` : 'RS Puram, Coimbatore')
  const [handoverType, setHandoverType] = useState<'pickup' | 'dropoff'>('pickup')
  const [images, setImages] = useState<string[]>(['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80'])
  const [isHazardousBattery, setIsHazardousBattery] = useState(false)
  const [hazardAlert, setHazardAlert] = useState<string | undefined>(undefined)

  const [safetyChecklist, setSafetyChecklist] = useState({
    backup: false,
    signOut: false,
    factoryReset: false,
    removeSim: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Real Gemini Multimodal AI Analysis Handler
  const handlePhotoCaptured = async (dataUrl: string) => {
    setImages([dataUrl])
    setIsScanning(true)
    setScanError(null)

    try {
      const result = await aiApi.analyzeDeviceImage(dataUrl, 'en')

      // Auto-populate Title
      if (result.productName && result.productName !== 'Unknown') {
        setTitle(result.productName)
      } else if (result.detectedBrand && result.detectedBrand !== 'Unknown') {
        setTitle(`${result.detectedBrand} Device`)
      }

      // Auto-populate Category match
      if (result.detectedCategory) {
        const matched = CATEGORIES.find(
          (c) =>
            c.toLowerCase() === result.detectedCategory.toLowerCase() ||
            result.detectedCategory.toLowerCase().includes(c.toLowerCase()) ||
            c.toLowerCase().includes(result.detectedCategory.toLowerCase())
        )
        if (matched) {
          setCategory(matched)
        } else if (result.detectedCategory.toLowerCase().includes('phone') || result.detectedCategory.toLowerCase().includes('mobile')) {
          setCategory('Mobile Phone')
        } else if (result.detectedCategory.toLowerCase().includes('laptop') || result.detectedCategory.toLowerCase().includes('computer')) {
          setCategory('Laptop')
        } else if (result.detectedCategory.toLowerCase().includes('battery')) {
          setCategory('Battery & Power Bank')
        } else {
          setCategory('Other Electronics')
        }
      }

      // Auto-populate Brand & Model
      if (result.detectedBrand && result.detectedBrand !== 'Unknown') {
        setBrand(result.detectedBrand)
      }
      if (result.detectedModel && result.detectedModel !== 'Unknown') {
        setModel(result.detectedModel)
      }

      // Auto-populate Condition
      if (result.condition) {
        const c = result.condition.toLowerCase()
        if (c.includes('like new') || c.includes('mint') || c.includes('flawless')) {
          setCondition('Like New')
        } else if (c.includes('good') || c.includes('working')) {
          setCondition('Good')
        } else if (c.includes('scrap') || c.includes('parts') || c.includes('broken') || c.includes('non-working')) {
          setCondition('Scrap')
        } else {
          setCondition('Fair')
        }
      }

      // Confidence metrics
      const score = result.confidence || 85
      setConfidenceScore(score)
      const confLevel = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low'
      setConfidence(`${score}% (${confLevel})`)

      // Valuation calculations
      const minVal = result.estimatedValuation?.min ?? 0
      const maxVal = result.estimatedValuation?.max ?? 0
      setEstimatedValueMin(minVal)
      setEstimatedValueMax(maxVal)

      if (maxVal > 0) {
        setPriceRange(`₹${minVal.toLocaleString()} – ₹${maxVal.toLocaleString()}`)
        setPrice(Math.round((minVal + maxVal) / 2))
      } else {
        setPriceRange('Scrap / Material Valuation')
        setPrice('')
      }

      // Description & circular purpose
      if (result.description) {
        setDescription(result.description)
      }

      if (result.suggestedAction) {
        const action = result.suggestedAction as 'Sell' | 'Donate' | 'Recycle' | 'Repair'
        if (['Sell', 'Donate', 'Recycle', 'Repair'].includes(action)) {
          setPurpose(action)
        }
      }

      // Battery hazard detection
      const isHazard = Boolean(
        result.hazardAlert ||
        (result.damage && (result.damage.toLowerCase().includes('swoll') || result.damage.toLowerCase().includes('leak')))
      )
      setIsHazardousBattery(isHazard)
      if (isHazard) {
        setPurpose('Recycle')
        setHazardAlert(result.hazardAlert || 'Battery hazard detected. Route directly to certified recycler.')
      } else {
        setHazardAlert(undefined)
      }

      setIsEditingDetails(false)
      setStep(2)
    } catch (err: any) {
      console.error('AI Analysis failed:', err)
      setScanError(err?.message || "Couldn't analyze the image right now. Please try again or enter details manually.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleSelectPreset = (preset: PresetDevice) => {
    setTitle(preset.title)
    setCategory(preset.category)
    setBrand(preset.brand)
    setModel(preset.model)
    setCondition(preset.condition)
    setConfidence(preset.confidence)
    setConfidenceScore(
      preset.confidence.includes('99') ? 99 : preset.confidence.includes('98') ? 98 : preset.confidence.includes('96') ? 96 : 94
    )
    setPurpose((preset.purpose as any) || 'Sell')
    setPrice(preset.estimatedPrice || '')
    setPriceRange(preset.priceRange)
    if (preset.estimatedPrice) {
      setEstimatedValueMin(Math.round(preset.estimatedPrice * 0.85))
      setEstimatedValueMax(Math.round(preset.estimatedPrice * 1.15))
    } else {
      setEstimatedValueMin(0)
      setEstimatedValueMax(0)
    }
    setDescription(preset.description)
    setImages([preset.image])
    setIsHazardousBattery(!!preset.isHazardousBattery)
    if (preset.isHazardousBattery) {
      setHazardAlert('Swollen battery detected. Keep isolated and schedule certified hazardous collection.')
    } else {
      setHazardAlert(undefined)
    }
    setIsEditingDetails(false)
    setStep(2)
  }

  const handlePublish = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormError(null)

    try {
      const jitterLat = (Math.random() - 0.5) * 0.012
      const jitterLng = (Math.random() - 0.5) * 0.012
      const postLat = 11.0168 + jitterLat
      const postLng = 76.9558 + jitterLng

      await postsApi.createPost({
        title,
        category,
        brand,
        model,
        condition,
        purpose,
        price: purpose === 'Sell' && price !== '' ? Number(price) : null,
        negotiable: purpose === 'Sell' ? negotiable : false,
        description,
        location,
        locationName: location,
        latitude: postLat,
        longitude: postLng,
        distance: 0.8,
        status: 'available',
        seller: {
          name: user?.name || 'Mathavan',
          rating: 4.8,
          verified: user?.isVerified ?? true,
          avatar: user?.avatar || null,
        },
        images,
      })

      updateCoins(10)

      try {
        const existingTx = JSON.parse(localStorage.getItem('gl_custom_coin_history') || '[]')
        const newTx = {
          id: 'c_' + Date.now(),
          type: 'earn',
          title: `Listed E-Waste: "${title}"`,
          amount: '+10',
          time: 'Just now',
          status: 'Completed',
        }
        localStorage.setItem('gl_custom_coin_history', JSON.stringify([newTx, ...existingTx]))
      } catch {}

      setShowSuccessModal(true)
    } catch (err: any) {
      setFormError(err?.message || 'Failed to publish listing. Please verify details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)' }}>
      {/* Top Sticky Header with Step Info & Cancel */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '14px 0',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div className="container-narrow" style={{ maxWidth: step === 2 ? 880 : 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2 && isEditingDetails) {
                      setIsEditingDetails(false)
                    } else {
                      setStep((prev) => ((prev - 1) as PostWizardStep))
                    }
                  }}
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Previous step"
                >
                  <Icon name="arrow-left" size={16} color="var(--text-primary)" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Cancel posting"
                >
                  <Icon name="close" size={18} color="var(--text-tertiary)" />
                </button>
              )}

              <div>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {STEP_TITLES[step].title}
                </h1>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {STEP_TITLES[step].subtitle}
                </div>
              </div>
            </div>

            <Badge variant="green" size="sm">
              Step {step} of 6
            </Badge>
          </div>

          {/* 6-Step Visual Progress Bar */}
          <div style={{ display: 'flex', gap: 4, height: 4, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  background: s <= step ? 'var(--accent)' : 'transparent',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container-narrow" style={{ paddingTop: 20, maxWidth: step === 2 ? 880 : 760 }}>
        {formError && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="alert" size={16} color="#f87171" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: Add E-Waste Photo */}
        {step === 1 && (
          <div>
            <LiveCameraView
              onPhotoCaptured={handlePhotoCaptured}
              onGalleryUploaded={handlePhotoCaptured}
              isScanning={isScanning}
            />

            {/* AI Active Scanning Card Overlay */}
            {isScanning && (
              <div
                style={{
                  marginTop: 18,
                  padding: '22px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-2)',
                  border: '1.5px solid var(--accent)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="sparkles" size={26} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Gemini AI Multimodal Analysis in Progress...
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
                    Extracting brand, model, physical condition, battery safety, and circular fair-market valuation.
                  </div>
                </div>
              </div>
            )}

            {/* Scan Error with Retry and Manual Fallback */}
            {scanError && (
              <div
                style={{
                  marginTop: 18,
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Icon name="alert" size={18} color="#ef4444" />
                  <span>AI Analysis Encountered an Issue</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {scanError}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {images.length > 0 && images[0] && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePhotoCaptured(images[0])}
                    >
                      Try Again
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setScanError(null)
                      setTitle('')
                      setBrand('')
                      setModel('')
                      setConfidenceScore(30)
                      setConfidence('Manual Entry')
                      setIsEditingDetails(true)
                      setStep(2)
                    }}
                  >
                    Enter Details Manually
                  </Button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Device Presets
              </div>
              <DevicePresets onSelectPreset={handleSelectPreset} />
            </div>
          </div>
        )}

        {/* STEP 2: AI Review & Catalog Details */}
        {step === 2 && (
          <div>
            {!isEditingDetails ? (
              <AIAnalysisStep
                image={images[0]}
                productName={title}
                category={category}
                brand={brand}
                model={model}
                condition={condition}
                confidenceScore={confidenceScore}
                estimatedValueMin={estimatedValueMin}
                estimatedValueMax={estimatedValueMax}
                description={description}
                purpose={purpose}
                onPurposeChange={(p) => setPurpose(p as any)}
                onNext={() => setStep(3)}
                onEditDetails={() => setIsEditingDetails(true)}
                onRetake={() => {
                  setImages([])
                  setStep(1)
                }}
                onManualEntry={() => {
                  setTitle('')
                  setBrand('')
                  setModel('')
                  setConfidenceScore(30)
                  setConfidence('Manual Entry')
                  setIsEditingDetails(true)
                }}
                isHazardousBattery={isHazardousBattery}
                hazardAlert={hazardAlert}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header with return to AI Summary */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Edit Product Specifications
                    </h2>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      Fine-tune AI suggestions or fill in custom details before proceeding.
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDetails(false)}
                  >
                    View AI Summary
                  </Button>
                </div>

                {/* Thumbnail Preview Card */}
                <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={images[0]}
                    alt="Selected device"
                    style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Icon name="sparkles" size={14} color="var(--accent)" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 800 }}>
                        Confidence: {confidence}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {title || 'Untitled Device'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '0.72rem',
                        color: 'var(--accent-text)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      Change Photo
                    </button>
                  </div>
                </Card>

                <Input
                  label="Listing Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Samsung Galaxy A52 (128GB)"
                  required
                />

                <div className="input-group">
                  <label className="input-label">Device Category *</label>
                  <select
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input
                    label="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Samsung"
                  />
                  <Input
                    label="Model / Variant"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Galaxy A52"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Condition Assessment</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {[
                      { id: 'Like New', label: 'Like New', desc: 'No visible flaws, fully functional', icon: 'sparkles' as const },
                      { id: 'Good', label: 'Good Condition', desc: 'Minor wear, working display & battery', icon: 'check' as const },
                      { id: 'Fair', label: 'Minor Faults', desc: 'Cracked glass, degraded battery', icon: 'alert' as const },
                      { id: 'Scrap', label: 'Scrap / For Parts', desc: 'Dead board, harvesting parts only', icon: 'recycle' as const },
                    ].map((c) => {
                      const isSelected = condition === c.id
                      return (
                        <div
                          key={c.id}
                          onClick={() => setCondition(c.id)}
                          style={{
                            padding: '12px 10px',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                            border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name={c.icon} size={14} color={isSelected ? 'var(--accent)' : 'var(--text-secondary)'} />
                            <span style={{ fontWeight: 800, fontSize: '0.84rem', color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                              {c.label}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {c.desc}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {purpose === 'Sell' && (
                  <Input
                    label="Asking Price (INR)"
                    type="number"
                    prefixText="₹"
                    value={price === '' ? '' : price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter asking price"
                  />
                )}

                <div className="input-group">
                  <label className="input-label">Description & Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe working condition, physical flaws, included accessories..."
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Button
                    variant="ghost"
                    style={{ flex: 1 }}
                    onClick={() => setIsEditingDetails(false)}
                  >
                    Return to AI Review
                  </Button>
                  <Button
                    variant="primary"
                    style={{ flex: 1.5 }}
                    onClick={() => {
                      if (!title.trim()) {
                        setFormError('Please enter a listing title.')
                        return
                      }
                      setFormError(null)
                      setStep(3)
                    }}
                  >
                    Continue to Condition & Safety →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Condition Assessment & Battery Safety */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Physical & Operational Condition *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { id: 'Like New', label: 'Like New', desc: 'No visible flaws, fully functional', icon: 'sparkles' as const },
                  { id: 'Good', label: 'Good Condition', desc: 'Minor wear, working display & battery', icon: 'check' as const },
                  { id: 'Fair', label: 'Minor Faults', desc: 'Cracked glass, degraded battery', icon: 'alert' as const },
                  { id: 'Scrap', label: 'Scrap / For Parts', desc: 'Dead board, harvesting parts only', icon: 'recycle' as const },
                ].map((c) => {
                  const isSelected = condition === c.id
                  return (
                    <div
                      key={c.id}
                      onClick={() => setCondition(c.id)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name={c.icon} size={15} color={isSelected ? 'var(--accent)' : 'var(--text-secondary)'} />
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                          {c.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {c.desc}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hazardous Battery Safety Checklist */}
            <Card style={{ background: isHazardousBattery ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="battery" size={18} color={isHazardousBattery ? '#ef4444' : 'var(--accent)'} />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Battery Safety Protocol
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#f87171', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isHazardousBattery}
                    onChange={(e) => {
                      setIsHazardousBattery(e.target.checked)
                      if (e.target.checked) {
                        setPurpose('Recycle')
                      }
                    }}
                  />
                  <span>Swollen / Leaking</span>
                </label>
              </div>

              {isHazardousBattery ? (
                <div style={{ fontSize: '0.78rem', color: '#f87171', lineHeight: 1.45, padding: '8px 10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="alert" size={16} color="#ef4444" />
                  <span>This device has been classified as hazardous e-waste. It will be scheduled exclusively for doorstep fire-safe collection with a certified TNPCB recycler.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={safetyChecklist.signOut}
                      onChange={(e) => setSafetyChecklist((s) => ({ ...s, signOut: e.target.checked }))}
                    />
                    <span>Signed out of Google / Apple / iCloud accounts</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={safetyChecklist.factoryReset}
                      onChange={(e) => setSafetyChecklist((s) => ({ ...s, factoryReset: e.target.checked }))}
                    />
                    <span>Factory data reset performed to protect personal privacy</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={safetyChecklist.removeSim}
                      onChange={(e) => setSafetyChecklist((s) => ({ ...s, removeSim: e.target.checked }))}
                    />
                    <span>Removed SIM cards and microSD storage cards</span>
                  </label>
                </div>
              )}
            </Card>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => setStep(4)}
            >
              Continue to Pricing & Purpose →
            </Button>
          </div>
        )}

        {/* STEP 4: Purpose & Pricing */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Preferred Circular Pathway *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'Sell', label: 'Sell', desc: 'Earn money', icon: 'coin' as const },
                  { id: 'Donate', label: 'Donate', desc: 'Schools/NGO', icon: 'gift' as const },
                  { id: 'Recycle', label: 'Recycle', desc: 'Zero Landfill', icon: 'recycle' as const },
                ].map((opt) => {
                  const isSelected = purpose === opt.id
                  const isDisabled = isHazardousBattery && opt.id !== 'Recycle'
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setPurpose(opt.id as any)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--accent)' : 'var(--bg-surface)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.4 : 1,
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Icon name={opt.icon} size={18} color={isSelected ? '#ffffff' : 'var(--accent)'} />
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>
                        {opt.desc}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {purpose === 'Sell' && (
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    AI Fair Market Value
                  </span>
                  <Badge variant="green" size="sm">
                    Est: {priceRange}
                  </Badge>
                </div>

                <Input
                  label="Listing Asking Price"
                  type="number"
                  prefixText="₹"
                  value={price === '' ? '' : price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter fair price"
                  required
                />

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="negotiable-toggle" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
                    Allow fair buyer counter-offers
                  </label>
                  <input
                    id="negotiable-toggle"
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => setNegotiable(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>
              </Card>
            )}

            {purpose !== 'Sell' && (
              <Card style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="coin" size={24} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      Free Drop-Off • Community Eco Contribution
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      You will earn <strong>+10 Green Coins</strong> plus a certified recycling certificate upon verified collector pickup.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => {
                if (purpose === 'Sell' && (price === '' || price <= 0)) {
                  setFormError('Please enter a valid selling price.')
                  return
                }
                setFormError(null)
                setStep(5)
              }}
            >
              Continue to Location →
            </Button>
          </div>
        )}

        {/* STEP 5: Location & Handover */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="City & Area / Neighborhood *"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. RS Puram, Coimbatore"
              prefixIcon="location-pin"
              required
            />

            <Button
              variant="ghost"
              size="sm"
              icon="target"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    () => {
                      setLocation('RS Puram, Coimbatore (GPS Verified)')
                    },
                    () => {
                      setLocation('RS Puram, Coimbatore')
                    }
                  )
                }
              }}
            >
              Auto-Detect via GPS Location
            </Button>

            <div className="input-group" style={{ marginTop: 8 }}>
              <label className="input-label">Handover Preference</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setHandoverType('pickup')}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: handoverType === 'pickup' ? 'var(--accent-light)' : 'var(--bg-surface)',
                    border: `1.5px solid ${handoverType === 'pickup' ? 'var(--accent)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.86rem', color: handoverType === 'pickup' ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                    <Icon name="pickup" size={16} color="currentColor" />
                    <span>Doorstep Pickup</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Collector arrives at your address
                  </div>
                </div>

                <div
                  onClick={() => setHandoverType('dropoff')}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: handoverType === 'dropoff' ? 'var(--accent-light)' : 'var(--bg-surface)',
                    border: `1.5px solid ${handoverType === 'dropoff' ? 'var(--accent)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.86rem', color: handoverType === 'dropoff' ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                    <Icon name="location-pin" size={16} color="currentColor" />
                    <span>Self Drop-Off</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Drop off at nearest partner hub
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => {
                if (!location.trim()) {
                  setFormError('Please provide your location or neighborhood.')
                  return
                }
                setFormError(null)
                setStep(6)
              }}
            >
              Review Listing →
            </Button>
          </div>
        )}

        {/* STEP 6: Review & Publish */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card padding="none" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: 200, background: '#111' }}>
                <img src={images[0]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Badge
                  variant="green"
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {purpose}
                </Badge>
              </div>

              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {title}
                  </h3>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {purpose === 'Sell' && price ? formatCurrency(Number(price)) : 'Free Drop-Off'}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  {category} • {condition} • {location}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 16px' }}>
                  {description}
                </p>

                {/* Breakdown Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Handover Mode</span>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {handoverType === 'pickup' ? 'Doorstep Collection' : 'Self Drop-off'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Battery Safety</span>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isHazardousBattery ? '#f87171' : 'var(--accent)' }}>
                      {isHazardousBattery ? 'Hazardous Recycling' : 'Standard Verified'}
                    </div>
                  </div>
                </div>

                {/* Reward Callout */}
                <div
                  style={{
                    marginTop: 16,
                    padding: '10px 14px',
                    background: 'var(--accent-light)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-text)' }}>
                    <Icon name="coin" size={16} color="var(--accent)" />
                    <span>Reward Credited Upon Publishing:</span>
                  </div>
                  <strong style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>+10 Green Coins</strong>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="ghost"
                size="lg"
                style={{ flex: 1 }}
                onClick={() => {
                  setIsEditingDetails(true)
                  setStep(2)
                }}
              >
                Edit Details
              </Button>
              <Button
                variant="primary"
                size="lg"
                loading={isSubmitting}
                style={{ flex: 2 }}
                onClick={handlePublish}
              >
                Publish E-Waste Listing
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmatory Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          navigate('/')
        }}
        title="Listing Published Successfully!"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Icon name="check" size={30} color="var(--accent)" />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Live in Circular Network
          </h3>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.45 }}>
            "{title}" is now discoverable in the community marketplace and nearby recyclers map.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--coin-bg)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--coin-color)',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: 20,
              border: '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <Icon name="coin" size={17} color="var(--coin-color)" />
            <span>+10 EcoPoints Added to Wallet!</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => {
                setShowSuccessModal(false)
                navigate('/')
              }}
            >
              View in Home Feed
            </Button>
            <Button
              variant="ghost"
              fullWidth
              size="md"
              onClick={() => {
                setShowSuccessModal(false)
                navigate('/map')
              }}
            >
              Explore Nearby Hubs on Map
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
