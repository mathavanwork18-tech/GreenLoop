import { useState, useMemo } from 'react'
import { useHomeFeed } from './hooks/useHomeFeed'
import HomeHeader from './components/HomeHeader/HomeHeader'
import HeroSection from './components/HeroSection/HeroSection'
import SearchSection from './components/SearchSection/SearchSection'
import FilterSection from './components/FilterSection/FilterSection'
import RecommendationSection from './components/RecommendationSection/RecommendationSection'
import PostFeed from './components/PostFeed/PostFeed'
import NearbySection from './components/NearbySection/NearbySection'
import PostDetailModal from '../../components/PostDetailModal'
import type { Post } from '../../types/post.types'

export default function HomePage() {
  const { posts, recommended, nearby, handleToggleLike, handleToggleSave } = useHomeFeed()

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCondition, setActiveCondition] = useState('all')
  const [activeDistance, setActiveDistance] = useState('all')
  const [activeSort, setActiveSort] = useState('newest')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Selected post for detail modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    let list = [...posts]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    }

    if (activeCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase())
    }

    if (activeCondition !== 'all') {
      list = list.filter(p => p.condition.toLowerCase() === activeCondition.toLowerCase())
    }

    if (activeDistance !== 'all') {
      const maxDist = parseFloat(activeDistance.replace('km', ''))
      if (!isNaN(maxDist)) {
        list = list.filter(p => p.distance <= maxDist)
      }
    }

    if (verifiedOnly) {
      list = list.filter(p => p.seller.verified)
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
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 24px)' }}>
      {/* 1. Sticky Header */}
      <HomeHeader onNotificationClick={() => alert('All caught up! No unread notifications.')} />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Search Bar */}
      <SearchSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

      {/* 5. AI Recommendations */}
      {!searchQuery && activeCategory === 'all' && (
        <RecommendationSection recommendedPosts={recommended} onSelectPost={setSelectedPost} />
      )}

      {/* 6. Post Feed */}
      <PostFeed
        posts={filteredPosts}
        onSelectPost={setSelectedPost}
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
    </div>
  )
}
