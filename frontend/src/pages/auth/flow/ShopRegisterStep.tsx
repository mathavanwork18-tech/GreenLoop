import React, { useState } from 'react'
import Icon from '../../../components/Icon'
import type { LanguageCode } from '../../../types/common.types'
import { getAuthTranslation } from '../../../utils/translations'

interface Props {
  language: LanguageCode
  phone: string
  initialData?: any
  onSaveDraft: (data: any) => void
  onSubmit: (data: any) => Promise<void>
  onBack: () => void
}

const SHOP_CATEGORIES = [
  'Mobile Repair',
  'Electronics Repair',
  'Appliance Repair',
  'General Electronics',
  'E-Waste Collection',
  'Other',
]

export default function ShopRegisterStep({
  language,
  phone,
  initialData = {},
  onSaveDraft,
  onSubmit,
  onBack,
}: Props) {
  const t = getAuthTranslation(language)

  const [shopName, setShopName] = useState(initialData.shopName || '')
  const [ownerName, setOwnerName] = useState(initialData.ownerName || '')
  const [category, setCategory] = useState(initialData.category || 'Electronics Repair')
  const [email, setEmail] = useState(initialData.email || '')
  const [shopAddress, setShopAddress] = useState(initialData.shopAddress || '')
  const [area, setArea] = useState(initialData.area || 'Ritchie Street')
  const [city, setCity] = useState(initialData.city || 'Chennai')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (field: string, val: any) => {
    onSaveDraft({
      shopName: field === 'shopName' ? val : shopName,
      ownerName: field === 'ownerName' ? val : ownerName,
      category: field === 'category' ? val : category,
      email: field === 'email' ? val : email,
      shopAddress: field === 'shopAddress' ? val : shopAddress,
      area: field === 'area' ? val : area,
      city: field === 'city' ? val : city,
      phone,
    })
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!shopName.trim()) {
      newErrors.shopName = t.shopNameError
    }
    if (!ownerName.trim()) {
      newErrors.ownerName = t.ownerNameError
    }
    if (!shopAddress.trim()) {
      newErrors.shopAddress = t.shopAddressError
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = t.emailError
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        category,
        email: email.trim(),
        shopAddress: shopAddress.trim(),
        area: area.trim(),
        city: city.trim(),
        phone,
        role: 'LOCAL_SHOP',
      })
    } catch (err: any) {
      setErrors({ form: err.message || 'Shop registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        padding: '24px 20px',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="arrow-left" size={18} color="var(--accent)" />
        </button>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {t.shopHeading}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {t.shopSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Pre-filled Verified Mobile Number (Locked) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.verifiedMobileNumber}
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 48,
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              background: 'rgba(255,255,255,0.03)',
              padding: '0 14px',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            <span>+91 {phone}</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16,185,129,0.2)',
                color: '#34d399',
                fontWeight: 700,
              }}
            >
              {t.mobileLockedBadge}
            </span>
          </div>
        </div>

        {/* Shop Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.shopName} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value)
              handleFieldChange('shopName', e.target.value)
            }}
            placeholder={t.shopNamePlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.shopName ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.shopName && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.shopName}
            </span>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.ownerName} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => {
              setOwnerName(e.target.value)
              handleFieldChange('ownerName', e.target.value)
            }}
            placeholder={t.ownerNamePlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.ownerName ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.ownerName && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.ownerName}
            </span>
          )}
        </div>

        {/* Shop Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.shopCategory}
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              handleFieldChange('category', e.target.value)
            }}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {SHOP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} style={{ background: '#152a1e', color: '#fff' }}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Email Address (Optional) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.emailOptional}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              handleFieldChange('email', e.target.value)
            }}
            placeholder={t.emailPlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.email ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.email && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Street & Shop Address */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
            {t.shopAddress} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={shopAddress}
            onChange={(e) => {
              setShopAddress(e.target.value)
              handleFieldChange('shopAddress', e.target.value)
            }}
            placeholder={t.shopAddressPlaceholder}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '12px',
              border: errors.shopAddress ? '2px solid #ef4444' : '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              padding: '0 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          {errors.shopAddress && (
            <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
              {errors.shopAddress}
            </span>
          )}
        </div>

        {/* Area & City */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
              {t.area}
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => {
                setArea(e.target.value)
                handleFieldChange('area', e.target.value)
              }}
              placeholder={t.areaPlaceholder}
              style={{
                width: '100%',
                height: 48,
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                padding: '0 12px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
              {t.city}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                handleFieldChange('city', e.target.value)
              }}
              placeholder={t.cityPlaceholder}
              style={{
                width: '100%',
                height: 48,
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                padding: '0 12px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Global form error */}
        {errors.form && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontSize: '0.84rem',
            }}
          >
            {errors.form}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-full"
          style={{
            height: 52,
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(16,185,129,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 10,
          }}
        >
          {loading ? (
            <span>Registering Shop...</span>
          ) : (
            <>
              <span>Complete Shop Setup</span>
              <Icon name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
