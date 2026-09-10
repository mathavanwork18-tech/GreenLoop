import { postsApi } from '../posts/posts.api'
import { MOCK_MAP_PARTNERS } from '../../data/mockData'
import { calculateDistance } from '../../utils/distance'
import type { AIProductCard, AIPartnerCard } from '../../types/ai.types'
import type { Post } from '../../types/post.types'

export interface SearchMarketplaceParams {
  query?: string
  category?: string
  maxPrice?: number
  minPrice?: number
  onlyParts?: boolean
  condition?: string
  userCoords?: { lat: number; lng: number }
  radiusKm?: number
}

export interface SearchMarketplaceResult {
  count: number
  items: AIProductCard[]
  radiusKm?: number
  appliedFilters: {
    query?: string
    category?: string
    maxPrice?: number
    onlyParts?: boolean
    radiusKm?: number
  }
}

export interface NearbyCentersParams {
  userCoords?: { lat: number; lng: number }
  radiusKm?: number
  typeFilter?: 'all' | 'recycler' | 'repair' | 'shop'
  serviceQuery?: string
}

export interface NearbyCentersResult {
  count: number
  partners: AIPartnerCard[]
  radiusKm: number
}

export interface PriceEstimateResult {
  foundMatches: boolean
  matchCount: number
  sampleListingTitles: string[]
  minPrice?: number
  maxPrice?: number
  avgPrice?: number
  category?: string
  disclaimer: string
}

// Default fallback user coordinates (RS Puram, Coimbatore) if geolocation is not granted
export const DEFAULT_COORDS = { lat: 11.0168, lng: 76.9558 }

export const aiTools = {
  /**
   * Searches marketplace listings strictly from real verified data.
   */
  async searchMarketplace(params: SearchMarketplaceParams): Promise<SearchMarketplaceResult> {
    const allPosts = await postsApi.getPosts()
    const { query, category, maxPrice, minPrice, onlyParts, condition, userCoords, radiusKm } = params

    const q = query ? query.toLowerCase().trim() : ''

    const filtered = allPosts.filter((post: Post) => {
      // Status filter
      if (post.status && post.status !== 'available') return false

      // Text query match
      if (q) {
        const titleMatch = post.title?.toLowerCase().includes(q)
        const descMatch = post.description?.toLowerCase().includes(q)
        const brandMatch = post.brand?.toLowerCase().includes(q)
        const modelMatch = post.model?.toLowerCase().includes(q)
        const catMatch = post.category?.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !brandMatch && !modelMatch && !catMatch) {
          return false
        }
      }

      // Category filter
      if (category && category !== 'All') {
        const catLower = category.toLowerCase()
        if (!post.category?.toLowerCase().includes(catLower)) {
          return false
        }
      }

      // Only parts filter
      if (onlyParts) {
        const isPartCategory = post.category === 'Electronic Parts'
        const partsKeywords = ['ram', 'ssd', 'hdd', 'motherboard', 'charger', 'battery', 'psu', 'screen', 'board', 'cable', 'fan', 'gpu']
        const hasPartKeyword = partsKeywords.some(kw =>
          post.title?.toLowerCase().includes(kw) || post.description?.toLowerCase().includes(kw)
        )
        if (!isPartCategory && !hasPartKeyword) return false
      }

      // Max price filter
      if (maxPrice !== undefined && maxPrice !== null) {
        if (post.price !== null && post.price > maxPrice) return false
      }

      // Min price filter
      if (minPrice !== undefined && minPrice !== null) {
        if (post.price !== null && post.price < minPrice) return false
      }

      // Condition filter
      if (condition) {
        if (post.condition?.toLowerCase() !== condition.toLowerCase()) return false
      }

      // Distance / Radius filter
      if (userCoords && radiusKm) {
        const dist = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          post.latitude || DEFAULT_COORDS.lat,
          post.longitude || DEFAULT_COORDS.lng
        )
        if (dist > radiusKm) return false
      }

      return true
    })

    // Map to normalized AI product cards with accurate computed distance
    const items: AIProductCard[] = filtered.map((p: Post) => {
      let distanceKm = p.distance
      if (userCoords && p.latitude && p.longitude) {
        distanceKm = calculateDistance(userCoords.lat, userCoords.lng, p.latitude, p.longitude)
      }

      return {
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price ?? null,
        purpose: p.purpose || 'Sell',
        condition: p.condition || 'Good',
        distanceKm: distanceKm ? Number(distanceKm.toFixed(1)) : undefined,
        locationName: p.locationName || p.location || 'Coimbatore',
        sellerName: p.seller?.name || 'Verified Member',
        imageUrl: p.images?.[0] || undefined,
        status: p.status || 'available'
      }
    })

    // Sort by distance if available, otherwise by relevance
    if (userCoords) {
      items.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    }

    return {
      count: items.length,
      items,
      radiusKm,
      appliedFilters: {
        query,
        category,
        maxPrice,
        onlyParts,
        radiusKm
      }
    }
  },

  /**
   * Retrieves verified recycling centers, repair hubs, and electronics shops.
   */
  async getNearbyCenters(params: NearbyCentersParams): Promise<NearbyCentersResult> {
    const coords = params.userCoords || DEFAULT_COORDS
    const radius = params.radiusKm || 10
    const { typeFilter, serviceQuery } = params

    const filtered = MOCK_MAP_PARTNERS.filter(partner => {
      // Type filter
      if (typeFilter && typeFilter !== 'all') {
        if (typeFilter === 'recycler' && partner.type !== 'recycler') return false
        if (typeFilter === 'repair' && partner.type !== 'repair') return false
        if (typeFilter === 'shop' && partner.type !== 'shop') return false
      }

      // Service query match
      if (serviceQuery) {
        const sq = serviceQuery.toLowerCase()
        const matchService = partner.services.some(s => s.toLowerCase().includes(sq))
        const matchName = partner.name.toLowerCase().includes(sq)
        const matchCategory = partner.categories.some(c => c.toLowerCase().includes(sq))
        if (!matchService && !matchName && !matchCategory) return false
      }

      // Distance calculation
      const dist = calculateDistance(coords.lat, coords.lng, partner.lat, partner.lng)
      return dist <= radius
    })

    const partners: AIPartnerCard[] = filtered.map(partner => {
      const dist = calculateDistance(coords.lat, coords.lng, partner.lat, partner.lng)
      return {
        id: partner.id,
        name: partner.name,
        type: partner.type,
        distanceKm: Number(dist.toFixed(1)),
        address: partner.address,
        rating: partner.rating,
        reviews: partner.reviews,
        open: partner.open,
        hours: partner.hours,
        verified: partner.verified,
        services: partner.services
      }
    })

    partners.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))

    return {
      count: partners.length,
      partners,
      radiusKm: radius
    }
  },

  /**
   * Returns current user's posts.
   */
  async getUserPosts(userName: string = 'Mathavan'): Promise<AIProductCard[]> {
    const allPosts = await postsApi.getPosts()
    const userPosts = allPosts.filter(p => p.seller?.name?.toLowerCase() === userName.toLowerCase())

    return userPosts.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price ?? null,
      purpose: p.purpose || 'Sell',
      condition: p.condition || 'Good',
      distanceKm: p.distance ? Number(p.distance.toFixed(1)) : undefined,
      locationName: p.locationName || p.location || 'Coimbatore',
      sellerName: p.seller?.name || userName,
      imageUrl: p.images?.[0] || undefined,
      status: p.status || 'available'
    }))
  },

  /**
   * Deletes a user's post after verification.
   */
  async deleteUserPost(postId: string, userName: string = 'Mathavan'): Promise<boolean> {
    try {
      await postsApi.deletePost(postId, userName)
      return true
    } catch {
      return false
    }
  },

  /**
   * Estimates item value based ONLY on actual matching listings currently in Green Loop.
   */
  async estimatePrice(query: string, category?: string): Promise<PriceEstimateResult> {
    const allPosts = await postsApi.getPosts()
    const q = query.toLowerCase().trim()

    const matches = allPosts.filter(p => {
      if (p.price === null || p.price === undefined) return false
      const titleMatch = p.title.toLowerCase().includes(q)
      const modelMatch = p.model?.toLowerCase().includes(q)
      const brandMatch = p.brand?.toLowerCase().includes(q)
      const catMatch = category ? p.category.toLowerCase().includes(category.toLowerCase()) : false
      return titleMatch || modelMatch || brandMatch || catMatch
    })

    if (matches.length === 0) {
      return {
        foundMatches: false,
        matchCount: 0,
        sampleListingTitles: [],
        disclaimer: "I couldn't verify that from Green Loop's current data. There are no active listings matching this exact item to compute a grounded estimate."
      }
    }

    const prices = matches.map(m => m.price as number)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)

    return {
      foundMatches: true,
      matchCount: matches.length,
      sampleListingTitles: matches.slice(0, 3).map(m => m.title),
      minPrice,
      maxPrice,
      avgPrice,
      category: matches[0].category,
      disclaimer: `Based on ${matches.length} current Green Loop listing${matches.length > 1 ? 's' : ''}, similar items are listed around ₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}. (Estimate only)`
    }
  },

  /**
   * Returns available categories.
   */
  getCategories(): string[] {
    return [
      'Mobile Phone',
      'Laptop',
      'Electronic Parts',
      'Monitor',
      'Audio & Headphones',
      'Accessories & Cables',
      'Home Appliances'
    ]
  }
}
