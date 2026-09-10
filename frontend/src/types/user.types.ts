import type { Role } from './auth.types'
import type { LanguageCode, EcoAction } from './common.types'

export interface UserPreferences {
  language: LanguageCode
  preferredCategories: string[]
  preferredAction: EcoAction
  pickupPreference: 'doorstep' | 'hub_dropoff'
  aiRecommendations: boolean
  notifications: {
    email: boolean
    sms: boolean
    missionReminders: boolean
    pickupUpdates: boolean
  }
}

export interface UserPrivacy {
  showApproximateLocation: boolean
  showPhoneToVerifiedOnly: boolean
  profileVisibility: 'public' | 'community' | 'private'
  activityVisibility: boolean
  aiDataAnalysis: boolean
}

export interface UserRoleProfile {
  interests?: string[]
  shopName?: string
  shopLogo?: string
  shopDescription?: string
  shopServices?: string[]
  shopHours?: string
  shopAddress?: string
  shopGst?: string
  companyName?: string
  companyLogo?: string
  companyDescription?: string
  companyMaterials?: string[]
  serviceAreas?: string[]
  pickupFleetAvailable?: boolean
  tnpcbLicenseNo?: string
  adminLevel?: string
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  phone: string
  city: string
  area: string
  bio: string
  avatar: string | null
  role: Role
  greenCoins: number
  level: string
  levelIcon: string
  levelMin: number
  levelMax: number
  streak: number
  isVerified: boolean
  rating: number
  transactions: number
  joinedAt: string
  preferences?: UserPreferences
  privacy?: UserPrivacy
  roleProfile?: UserRoleProfile
}
