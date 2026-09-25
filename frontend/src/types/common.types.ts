import type { IconName } from '../components/Icon'

export type Theme = 'light' | 'dark'

export type LanguageCode =
  | 'en' | 'ta' | 'hi' | 'ml' | 'kn' | 'te'
  | 'EN' | 'TA' | 'HI' | 'ML' | 'KN' | 'TE'

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface Coordinates {
  lat: number
  lng: number
}

export type EcoAction = 'Sell' | 'Donate' | 'Recycle' | 'Repair' | 'Exchange'

export interface CategoryOption {
  id: string
  label: string
  icon: IconName
}

export interface LevelTier {
  name: string
  min: number
  max: number
  icon: IconName
}
