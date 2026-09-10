import type { Post } from '../../../../types/post.types'
import Icon from '../../../../components/Icon'
import { formatCurrency } from '../../../../utils/formatting'

interface RecommendationSectionProps {
  recommendedPosts: Post[]
  onSelectPost: (post: Post) => void
}

export default function RecommendationSection({ recommendedPosts, onSelectPost }: RecommendationSectionProps) {
  if (recommendedPosts.length === 0) return null

  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="sparkles" size={16} color="var(--accent)" />
          <span className="section-title">AI Curated Circular Picks</span>
        </div>
        <span className="section-link">View All</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: 4
        }}
      >
        {recommendedPosts.map(post => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="card"
            style={{
              flex: '0 0 240px',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '1.5px solid var(--border-color)',
              transition: 'transform 0.18s ease'
            }}
          >
            <div style={{ height: 130, position: 'relative', background: '#000' }}>
              <img
                src={post.images[0]}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)'
                }}
              >
                {post.purpose}
              </span>
            </div>

            <div style={{ padding: 12 }}>
              <h4
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  margin: '0 0 4px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {post.title}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {post.price ? formatCurrency(post.price) : 'Recycle Free'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                  {post.distance} km
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
