import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHomeFeed } from '../home/hooks/useHomeFeed'
import PostDetailModal from '../../components/PostDetailModal'
import Icon from '../../components/Icon'
import LanguageSwitcherModal from '../../components/LanguageSwitcherModal'
import { useTranslation } from '../../i18n/useTranslation'
import { translateCondition } from '../../i18n'
import { usePostTranslation } from '../../hooks/usePostTranslation'
import { matchesMultilingualSearch } from '../../utils/multilingualSearch'
import type { Post } from '../../types/post.types'

const CONDITION_COLORS: Record<string, string> = {
  Flawless: '#10b981',
  Good: '#34d399',
  Fair: '#f59e0b',
  'Broken / For Parts': '#f87171',
  'Hazmat (Swollen Battery)': '#ef4444',
}

export default function MarketplacePage() {
  const navigate = useNavigate()
  const { posts, handleToggleLike, handleToggleSave, handleTrackPostOpen } = useHomeFeed()
  const { t, currentLang } = useTranslation()

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSort, setActiveSort] = useState('newest')
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const purposeTabs = useMemo(() => [
    { id: 'all', label: t('marketplace.all'), icon: '📋' },
    { id: 'Sell', label: t('marketplace.sell'), icon: '💰' },
    { id: 'Donate', label: t('marketplace.donate'), icon: '🤝' },
    { id: 'Exchange', label: t('marketplace.exchange'), icon: '🔄' },
    { id: 'Repair', label: t('marketplace.repair'), icon: '🛠️' },
    { id: 'Recycle', label: t('marketplace.recycle'), icon: '♻️' },
  ], [t])

  const sortOptions = useMemo(() => [
    { id: 'newest', label: t('marketplace.newest') },
    { id: 'price_low', label: t('marketplace.priceLowToHigh') },
    { id: 'price_high', label: t('marketplace.priceHighToLow') },
    { id: 'distance', label: t('marketplace.nearest') },
  ], [t])

  const handleSelectPost = (post: Post) => {
    handleTrackPostOpen(post)
    setSelectedPost(post)
  }

  const filteredPosts = useMemo(() => {
    let list = [...posts]

    if (searchQuery.trim()) {
      list = list.filter(p => matchesMultilingualSearch(p, searchQuery, currentLang))
    }

    if (activeTab !== 'all') {
      list = list.filter(p =>
        typeof p.purpose === 'string' &&
        p.purpose.toLowerCase() === activeTab.toLowerCase()
      )
    }

    if (activeSort === 'price_low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (activeSort === 'price_high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (activeSort === 'distance') {
      list.sort((a, b) => a.distance - b.distance)
    }

    return list
  }, [posts, activeTab, searchQuery, activeSort, currentLang])

  const currentSort = sortOptions.find(s => s.id === activeSort)?.label || t('marketplace.newest')

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 20px 0',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
              {t('marketplace.title')}
            </h1>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {t('marketplace.listingsNearYou', { count: filteredPosts.length })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Language Switcher Trigger */}
            <button
              onClick={() => setShowLangModal(true)}
              aria-label={t('common.language')}
              title={t('common.language')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 11px', borderRadius: 999,
                background: 'var(--bg-surface-2)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', fontSize: '0.74rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Icon name="globe" size={13} color="var(--accent)" />
              <span>{currentLang.toUpperCase()}</span>
            </button>

            <button
              onClick={() => navigate('/post')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                border: 'none', fontSize: '0.78rem', fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Icon name="plus" size={13} color="#fff" />
              {t('marketplace.postDevice')}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Icon
            name="search"
            size={15}
            color="var(--text-tertiary)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('marketplace.searchPlaceholder')}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              borderRadius: 12, border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-2)', color: 'var(--text-primary)',
              fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                fontSize: '1rem', lineHeight: 1,
              }}
            >
              {'\u00d7'}
            </button>
          )}
        </div>

        {/* Purpose Tabs */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 12,
        }}>
          {purposeTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 14px', borderRadius: 999, flexShrink: 0,
                background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: activeTab === tab.id ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sort Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-base)',
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{filteredPosts.length}</span>{' '}
          {activeTab === 'all' ? t('marketplace.title').toLowerCase() : activeTab.toLowerCase()}
        </div>
        <button
          onClick={() => setShowSortSheet(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 8,
            background: 'var(--bg-surface)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Icon name="filter" size={12} color="var(--text-secondary)" />
          {t('marketplace.sortBy')}: {currentSort}
        </button>
      </div>

      {/* ── Listing Grid ── */}
      <div className="container" style={{ paddingTop: 16 }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{'\ud83d\udce6'}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {t('marketplace.noListings')}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 260, margin: '0 auto 20px' }}>
              {t('marketplace.noListingsDesc')}
            </div>
            <button
              onClick={() => navigate('/post')}
              style={{
                padding: '12px 24px', borderRadius: 12, background: 'var(--accent)',
                color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              {t('marketplace.postDevice')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {filteredPosts.map(post => (
              <MarketplaceCard
                key={post.id}
                post={post}
                onSelect={handleSelectPost}
                onLike={() => handleToggleLike(post.id)}
                onSave={() => handleToggleSave(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Post Detail Modal ── */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost as any}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => handleToggleLike(selectedPost.id)}
          isLiked={selectedPost.liked}
          onSave={() => handleToggleSave(selectedPost.id)}
          isSaved={selectedPost.saved}
        />
      )}

      {/* ── Sort Bottom Sheet ── */}
      {showSortSheet && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowSortSheet(false)}
        >
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'var(--bg-surface)', borderRadius: '20px 20px 0 0',
              padding: '20px 20px 40px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              {t('marketplace.sortBy')}
            </div>
            {sortOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setActiveSort(opt.id); setShowSortSheet(false) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '14px 0',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: activeSort === opt.id ? 'var(--accent)' : 'var(--text-primary)',
                  fontSize: '0.88rem', fontWeight: activeSort === opt.id ? 800 : 500,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                {opt.label}
                {activeSort === opt.id && (
                  <Icon name="check" size={16} color="var(--accent)" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Language Switcher Modal */}
      <LanguageSwitcherModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </div>
  )
}

// ─── Marketplace Card with Viewer-Specific Dynamic Translation ───────────────
function MarketplaceCard({
  post,
  onSelect,
  onLike,
  onSave,
}: {
  post: Post
  onSelect: (p: Post) => void
  onLike: () => void
  onSave: () => void
}) {
  const { t, currentLang } = useTranslation()
  const { title, isTranslating, isTranslated } = usePostTranslation(post)

  const condColor = CONDITION_COLORS[post.condition] || '#6b7280'
  const localizedCondition = translateCondition(post.condition, currentLang)

  const purposeBg: Record<string, string> = {
    Sell: 'rgba(16,185,129,0.1)',
    Donate: 'rgba(236,72,153,0.1)',
    Exchange: 'rgba(56,189,248,0.1)',
    Repair: 'rgba(245,158,11,0.1)',
    Recycle: 'rgba(52,211,153,0.1)',
  }
  const purposeColor: Record<string, string> = {
    Sell: '#10b981',
    Donate: '#ec4899',
    Exchange: '#38bdf8',
    Repair: '#f59e0b',
    Recycle: '#34d399',
  }

  const getPurposeLabel = (purp: string) => {
    switch (purp?.toLowerCase()) {
      case 'sell': return t('marketplace.sell')
      case 'donate': return t('marketplace.donate')
      case 'exchange': return t('marketplace.exchange')
      case 'repair': return t('marketplace.repair')
      case 'recycle': return t('marketplace.recycle')
      default: return purp
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)', overflow: 'hidden',
        cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onClick={() => onSelect(post)}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '65%', background: 'var(--bg-surface-2)' }}>
        {post.images?.[0] ? (
          <img
            src={post.images[0]}
            alt={title}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
          }}>
            {'📱'}
          </div>
        )}
        {/* Purpose tag */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          background: purposeBg[post.purpose as string] || 'rgba(16,185,129,0.1)',
          color: purposeColor[post.purpose as string] || '#10b981',
          fontSize: '0.6rem', fontWeight: 800, padding: '3px 7px', borderRadius: 999,
          backdropFilter: 'blur(6px)',
        }}>
          {getPurposeLabel(post.purpose as string)}
        </div>
        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); onSave() }}
          style={{
            position: 'absolute', top: 4, right: 4,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
            border: 'none', borderRadius: '50%', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="bookmark" size={12} color={post.saved ? '#f59e0b' : '#fff'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 10px 8px' }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)',
          lineHeight: 1.3, marginBottom: 4,
          minHeight: '2.4em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
          {isTranslating && (
            <span style={{ fontSize: '0.62rem', color: 'var(--accent)', marginLeft: 4, fontWeight: 600 }}>
              ({t('common.translating')})
            </span>
          )}
          {isTranslated && !isTranslating && (
            <span
              title={t('common.translated')}
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                marginLeft: 4,
                verticalAlign: 'middle'
              }}
            />
          )}
        </div>

        {/* Condition badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: '0.62rem', fontWeight: 700,
          color: condColor, marginBottom: 6,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: condColor, display: 'inline-block' }} />
          {localizedCondition}
        </div>

        {/* Price */}
        {post.price != null ? (
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent)', marginBottom: 4 }}>
            {'₹'}{post.price.toLocaleString()}
            {post.negotiable && (
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: 4 }}>
                {t('product.negotiable')}
              </span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ec4899', marginBottom: 4 }}>
            {post.purpose === 'Donate' ? t('marketplace.donate') : getPurposeLabel(post.purpose as string)}
          </div>
        )}

        {/* Distance & Likes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {'📍'} {post.distance} km
          </span>
          <button
            onClick={e => { e.stopPropagation(); onLike() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="heart" size={12} color={post.liked ? '#ef4444' : 'var(--text-tertiary)'} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {post.likes}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
