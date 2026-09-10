import type { Post } from '../../../types/post.types'
import type { EcosystemPartner } from '../../../types/map.types'

export interface HomeFilterState {
  category: string
  condition: string
  distance: string
  sort: string
  verifiedOnly: boolean
}

export interface HomeFeedState {
  posts: Post[]
  recommendedPosts: Post[]
  nearbyPartners: EcosystemPartner[]
  loading: boolean
}
