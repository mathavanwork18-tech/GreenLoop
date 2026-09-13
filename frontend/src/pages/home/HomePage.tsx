import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHomeFeed } from './hooks/useHomeFeed'
import { useAuth } from '../../context/AuthContext'
import HomeHeader from './components/HomeHeader/HomeHeader'
import HeroSection from './components/HeroSection/HeroSection'
import SearchSection from './components/SearchSection/SearchSection'
import FilterSection from './components/FilterSection/FilterSection'
import RecommendationSection from './components/RecommendationSection/RecommendationSection'
import PostFeed from './components/PostFeed/PostFeed'
import NearbySection from './components/NearbySection/NearbySection'
import PostDetailModal from '../../components/PostDetailModal'
import RecommendationDebugModal from '../../components/RecommendationDebugModal'
import Icon from '../../components/Icon'
import type { Post } from '../../types/post.types'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    posts,
    recommended,
    nearby,
    debugScores,
    handleToggleLike,
    handleToggleSave,
    handleTrackPostOpen,
    handleTrackSearch,
  } = useHomeFeed()

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCondition, setActiveCondition] = useState('all')
  const [activeDistance, setActiveDistance] = useState('all')
  const [activeSort, setActiveSort] = useState('newest')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [showDebugModal, setShowDebugModal] = useState(false)

  // Selected post for detail modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const handleSelectPost = (post: Post) => {
    handleTrackPostOpen(post)
    setSelectedPost(post)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    handleTrackSearch(query)
  }

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    let list = [...posts]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    }

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase())
    }

    if (activeCondition !== 'all') {
      list = list.filter((p) => p.condition.toLowerCase() === activeCondition.toLowerCase())
    }

    if (activeDistance !== 'all') {
      const maxDist = parseFloat(activeDistance.replace('km', ''))
      if (!isNaN(maxDist)) {
        list = list.filter((p) => p.distance <= maxDist)
      }
    }

    if (verifiedOnly) {
      list = list.filter((p) => p.seller.verified)
    }

    if (activeSort === 'price_low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (activeSort === 'price_high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (activeSort === 'distance') {
      list.sort((a, b) => a.distance - b.distance)
    }

    return list
  }, [posts, searchQuery, activeCategory, activeCondition, activeDistance, activeSort, verifiedOnly])

  const activeFiltersCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (activeCondition !== 'all' ? 1 : 0) +
    (activeDistance !== 'all' ? 1 : 0) +
    (verifiedOnly ? 1 : 0)

  const handleResetFilters = () => {
    setActiveCategory('all')
    setActiveCondition('all')
    setActiveDistance('all')
    setActiveSort('newest')
    setVerifiedOnly(false)
    setSearchQuery('')
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)', position: 'relative' }}>
      {/* 1. Sticky Header */}
      <HomeHeader onNotificationClick={() => navigate('/notifications')} />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Search Bar with Intent Tracking */}
      <SearchSection
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* 4. Category Pills & Filter Bottom Sheet */}
      <FilterSection
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeCondition={activeCondition}
        onConditionChange={setActiveCondition}
        activeDistance={activeDistance}
        onDistanceChange={setActiveDistance}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        verifiedOnly={verifiedOnly}
        onVerifiedOnlyChange={setVerifiedOnly}
        onReset={handleResetFilters}
      />

      {/* 5. AI Personalized Recommendations */}
      {!searchQuery && activeCategory === 'all' && (
        <RecommendationSection recommendedPosts={recommended} onSelectPost={handleSelectPost} />
      )}

      {/* 6. Post Feed */}
      <PostFeed
        posts={filteredPosts}
        onSelectPost={handleSelectPost}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onResetFilters={handleResetFilters}
      />

      {/* 7. Nearby Ecosystem Hubs */}
      <NearbySection partners={nearby} />

      {/* 8. Post Detail Modal */}
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

      {/* 9. AI Recommendation Engine Debugger (Admin/Dev Mode) */}
      {user?.role === 'admin' && debugScores.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            zIndex: 90,
          }}
        >
          <button
            onClick={() => setShowDebugModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: '#0d1f17',
              border: '1.5px solid var(--accent)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              cursor: 'pointer',
            }}
          >
            <Icon name="sparkles" size={14} color="var(--accent)" />
            <span>AI Rec Scores ({debugScores.length})</span>
          </button>
        </div>
      )}

      {showDebugModal && (
        <RecommendationDebugModal
          isOpen={showDebugModal}
          onClose={() => setShowDebugModal(false)}
          scores={debugScores}
          userId={user?.id}
          role={user?.role}
        />
      )}
    </div>
  )
}
