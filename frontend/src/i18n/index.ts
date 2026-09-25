import { en } from './translations/en'
import { ta } from './translations/ta'
import { hi } from './translations/hi'
import { ml } from './translations/ml'
import { kn } from './translations/kn'
import { te } from './translations/te'
import {
  type CanonicalLanguage,
  DEFAULT_LANGUAGE,
  normalizeLanguage,
} from './languages'
import type { TranslationSchema } from './translations/en'

export * from './languages'
export type { TranslationSchema }

export const translations: Record<CanonicalLanguage, TranslationSchema> = {
  en,
  ta,
  hi,
  ml,
  kn,
  te,
}

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export type TranslationKey = NestedKeyOf<TranslationSchema>

/**
 * Retrieves a translated string by dot notation with parameter interpolation.
 * If not found in the selected language, it falls back to English, then to the provided fallback or key.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  language?: string | null
): string {
  const lang = normalizeLanguage(language || getCurrentLanguage())
  const dict = translations[lang] || translations.en

  let val: any = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dict as any)

  if (val === undefined || val === null) {
    // Fallback to English
    val = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), translations.en as any)
  }

  if (typeof val !== 'string') {
    return key
  }

  if (params) {
    return Object.entries(params).reduce((str, [pKey, pVal]) => {
      return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
    }, val)
  }

  return val
}

/**
 * Gets currently active language from localStorage or default.
 */
export function getCurrentLanguage(): CanonicalLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = localStorage.getItem('gl_language')
    return normalizeLanguage(stored)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

/**
 * Stable category mapping.
 * Database stores stable categories or legacy English names; this maps them to localized labels.
 */
const CATEGORY_KEY_MAP: Record<string, keyof TranslationSchema['categories']> = {
  'mobile phone': 'smartphone',
  'mobile': 'smartphone',
  'smartphone': 'smartphone',
  'smartphones': 'smartphone',
  'phone': 'smartphone',
  'laptop': 'laptop',
  'laptops': 'laptop',
  'tablet': 'tablet',
  'tablets': 'tablet',
  'desktop': 'desktop',
  'desktop / pc': 'desktop',
  'computer': 'desktop',
  'pc': 'desktop',
  'battery': 'battery',
  'battery & power bank': 'battery',
  'power bank': 'battery',
  'audio': 'audio',
  'audio & headphones': 'audio',
  'headphones': 'audio',
  'circuit board': 'scrap',
  'circuit board / scrap': 'scrap',
  'scrap': 'scrap',
  'cables': 'cables',
  'cables & adapters': 'cables',
  'adapters': 'cables',
  'home appliance': 'appliance',
  'appliances': 'appliance',
  'appliance': 'appliance',
  'other': 'other',
  'other electronics': 'other',
  'electronics': 'other',
}

/**
 * Translates a category into the target language.
 */
export function translateCategory(category?: string | null, language?: string | null): string {
  if (!category || typeof category !== 'string') return t('categories.other', undefined, language)
  const normalized = category.trim().toLowerCase()
  const key = CATEGORY_KEY_MAP[normalized] || 'other'
  return t(`categories.${key}`, undefined, language)
}

/**
 * Stable condition mapping.
 */
const CONDITION_KEY_MAP: Record<string, keyof TranslationSchema['conditions']> = {
  'flawless': 'flawless',
  'brand new': 'flawless',
  'like new': 'flawless',
  'good': 'good',
  'good condition': 'good',
  'fair': 'fair',
  'used - acceptable': 'fair',
  'acceptable': 'fair',
  'broken': 'broken',
  'for parts': 'broken',
  'broken / for parts': 'broken',
  'hazmat': 'hazmat',
  'hazmat (swollen battery)': 'hazmat',
  'swollen battery': 'hazmat',
}

/**
 * Translates a condition into the target language.
 */
export function translateCondition(condition?: string | null, language?: string | null): string {
  if (!condition || typeof condition !== 'string') return t('conditions.good', undefined, language)
  const normalized = condition.trim().toLowerCase()
  const key = CONDITION_KEY_MAP[normalized] || 'good'
  return t(`conditions.${key}`, undefined, language)
}
