import type { Post } from '../../../../types/post.types'
import Icon from '../../../../components/Icon'
import VerificationBadge from '../../../../components/eco/VerificationBadge'
import { formatCurrency } from '../../../../utils/formatting'

interface PostCardProps {
  post: Post
  onSelect: () => void
  onToggleLike: (e: React.MouseEvent) => void
  onToggleSave: (e: React.MouseEvent) => void
}

export default function PostCard({ post, onSelect, onToggleLike, onToggleSave }: PostCardProps) {
  const getPurposeBadge = () => {
    switch (post.purpose?.toLowerCase()) {
      case 'sell':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--accent-text)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          label: 'For Sale',
        }
      case 'donate':
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          label: 'Donation',
        }
      case 'recycle':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--accent-text)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          label: 'Recycle Scrap',
        }
      case 'repair':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          label: 'Needs Repair',
        }
      default:
        return {
          bg: 'rgba(139, 92, 246, 0.12)',
          color: '#c084fc',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          label: 'Exchange',
        }
    }
  }

  const badge = getPurposeBadge()

  return (
    <div
      onClick={onSelect}
      className="card card-hover"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Seller Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #059669)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {post.seller?.name?.[0] || 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{post.seller?.name}</span>
              {post.seller?.verified && <VerificationBadge size={12} />}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {post.location}
            </div>
          </div>
        </div>

        <span
          style={{
            background: badge.bg,
            color: badge.color,
            border: badge.border,
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Main Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 200,
          background: 'var(--bg-surface-2)',
          overflow: 'hidden',
        }}
      >
        <img
          src={post.images[0]}
          alt={post.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Condition Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(8, 12, 10, 0.78)',
            color: '#f9fafb',
            padding: '3px 9px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.7rem',
            fontWeight: 700,
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {post.condition}
        </div>

        {/* Distance Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(8, 12, 10, 0.78)',
            color: 'var(--accent-text)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.68rem',
            fontWeight: 700,
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name="location-pin" size={10} color="var(--accent)" />
          <span>{post.distance} km</span>
        </div>
      </div>

      {/* Details & Actions */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <h3
            style={{
              fontSize: '0.98rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </h3>
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            {post.price ? formatCurrency(post.price) : 'Free Pickup'}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            margin: '4px 0 12px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {post.description}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 10,
            marginTop: 'auto',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {post.createdAt}
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <button
              onClick={onToggleLike}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: post.liked ? '#ef4444' : 'var(--text-tertiary)',
                padding: '4px',
              }}
              aria-label={post.liked ? 'Unlike' : 'Like'}
            >
              <Icon name="heart" size={16} color={post.liked ? '#ef4444' : 'currentColor'} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{post.likes}</span>
            </button>

            <button
              onClick={onToggleSave}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: post.saved ? 'var(--accent)' : 'var(--text-tertiary)',
                padding: '4px',
              }}
              aria-label={post.saved ? 'Unsave' : 'Save'}
            >
              <Icon name="bookmark" size={16} color={post.saved ? 'var(--accent)' : 'currentColor'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
