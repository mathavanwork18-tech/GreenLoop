export type AIIntent =
  | 'SEARCH_ITEM'
  | 'SEARCH_PART'
  | 'FIND_NEARBY'
  | 'RECYCLING_GUIDANCE'
  | 'DISPOSAL_GUIDANCE'
  | 'REUSE_GUIDANCE'
  | 'REPAIR_GUIDANCE'
  | 'POST_ITEM'
  | 'EDIT_POST'
  | 'DELETE_POST'
  | 'MARKETPLACE_HELP'
  | 'MAP_HELP'
  | 'ACCOUNT_HELP'
  | 'ACTIVITY_HELP'
  | 'APP_NAVIGATION'
  | 'PRICE_ESTIMATE'
  | 'BATTERY_SAFETY'
  | 'GENERAL_EWASTE_QUESTION'
  | 'UNSUPPORTED_REQUEST'

export interface AIProductCard {
  id: string
  title: string
  category: string
  price: number | null
  purpose: string
  condition: string
  distanceKm?: number
  locationName: string
  sellerName: string
  imageUrl?: string
  status: string
}

export interface AIPartnerCard {
  id: string
  name: string
  type: 'recycler' | 'repair' | 'shop' | 'dropoff'
  distanceKm?: number
  address: string
  rating: number
  reviews: number
  open: boolean
  hours: string
  verified: boolean
  services: string[]
}

export interface AIActionChip {
  label: string
  actionType: 'navigate' | 'query' | 'set_radius' | 'confirm_delete' | 'cancel_delete'
  payload?: string | number
}

export interface AIDeleteConfirmation {
  postId: string
  postTitle: string
}

export interface AIMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  intent?: AIIntent
  productCards?: AIProductCard[]
  partnerCards?: AIPartnerCard[]
  actionChips?: AIActionChip[]
  deleteConfirmation?: AIDeleteConfirmation
  radiusUsed?: number
  isError?: boolean
  hazardAlert?: string
}

export interface AIConversationState {
  lastQuery?: string
  lastCategory?: string
  lastIntent?: AIIntent
  radiusKm: number
  userLat?: number
  userLng?: number
  pendingDeletePostId?: string
}
