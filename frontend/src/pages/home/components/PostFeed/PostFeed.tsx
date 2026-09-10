import type { Post } from '../../../../types/post.types'
import PostCard from './PostCard'
import EmptyState from '../../../../components/feedback/EmptyState'

interface PostFeedProps {
  posts: Post[]
  onSelectPost: (post: Post) => void
  onToggleLike: (postId: string, e: React.MouseEvent) => void
  onToggleSave: (postId: string, e: React.MouseEvent) => void
  onResetFilters: () => void
}

export default function PostFeed({
  posts,
  onSelectPost,
  onToggleLike,
  onToggleSave,
  onResetFilters
}: PostFeedProps) {
  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div className="section-header">
        <span className="section-title">E-Waste Marketplace & Reuse Feed ({posts.length})</span>
        <span className="section-link">Live Stream</span>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Matching Devices Found"
          description="Try broadening your category, distance, or condition filters."
          action={
            <button onClick={onResetFilters} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onSelect={() => onSelectPost(post)}
              onToggleLike={e => {
                e.stopPropagation()
                onToggleLike(post.id, e)
              }}
              onToggleSave={e => {
                e.stopPropagation()
                onToggleSave(post.id, e)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
