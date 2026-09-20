import type { EcoAction } from './common.types'

export type DeviceCondition = 'Flawless' | 'Good' | 'Fair' | 'Broken / For Parts' | 'Hazmat (Swollen Battery)'

export interface PostSeller {
  id?: string
  name: string
  role?: string
  phone?: string
  rating: number
  verified: boolean
  avatar: string | null
}

export interface Post {
  id: string
  title: string
  category: string
  brand: string
  model: string
  condition: string
  purpose: EcoAction | string
  price: number | null
  negotiable: boolean
  description: string
  location: string
  distance: number
  seller: PostSeller
  images: string[]
  liked: boolean
  saved: boolean
  likes: number
  comments: number
  recommended?: boolean
  createdAt: string
  latitude?: number
  longitude?: number
  locationName?: string
  status?: 'available' | 'reserved' | 'recycled' | 'sold'
  recommendationReason?: string
}

export interface AIAnalysisResult {
  detectedBrand: string
  detectedModel: string
  detectedCategory: string
  confidence: number
  condition: DeviceCondition | string
  estimatedValuation: {
    min: number
    max: number
    currency: string
  }
  suggestedAction: EcoAction | string
  hazardAlert?: string
  recyclingImpact?: {
    co2OffsetKg: number
    materials: string[]
  }
  productName?: string
  description?: string
  damage?: string
  estimatedAge?: string
  reusability?: string
  recyclability?: string
  materials?: string[]
  components?: string[]
  keywords?: string[]
}

