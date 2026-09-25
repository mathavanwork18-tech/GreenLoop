export type CanonicalLanguage = 'en' | 'ta' | 'hi' | 'ml' | 'kn' | 'te'

export interface LanguageOption {
  code: CanonicalLanguage
  upperCode: 'EN' | 'TA' | 'HI' | 'ML' | 'KN' | 'TE'
  name: string
  nativeName: string
  greeting: string
  flag?: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    upperCode: 'EN',
    name: 'English',
    nativeName: 'English',
    greeting: 'Welcome to Green Loop',
    flag: '🇬🇧'
  },
  {
    code: 'ta',
    upperCode: 'TA',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    greeting: 'கிரீன் லூப்பிற்கு நல்வரவு',
    flag: '🇮🇳'
  },
  {
    code: 'hi',
    upperCode: 'HI',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    greeting: 'ग्रीन लूप में आपका स्वागत है',
    flag: '🇮🇳'
  },
  {
    code: 'ml',
    upperCode: 'ML',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    greeting: 'ഗ്രീൻ ലൂപ്പിലേക്ക് സ്വാഗതം',
    flag: '🇮🇳'
  },
  {
    code: 'kn',
    upperCode: 'KN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ಗ್ರೀನ್ ಲೂಪ್‌ಗೆ ಸುಸ್ವಾಗತ',
    flag: '🇮🇳'
  },
  {
    code: 'te',
    upperCode: 'TE',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    greeting: 'గ్రీన్ లూప్‌కు స్వాగతం',
    flag: '🇮🇳'
  }
]

export const DEFAULT_LANGUAGE: CanonicalLanguage = 'en'

/**
 * Normalizes any language input ('EN', 'ta', 'Tamil', undefined) to a canonical code ('en', 'ta', 'hi', 'ml', 'kn', 'te').
 */
export function normalizeLanguage(lang?: string | null): CanonicalLanguage {
  if (!lang) return DEFAULT_LANGUAGE
  const cleaned = String(lang).trim().toLowerCase()
  if (cleaned.startsWith('ta')) return 'ta'
  if (cleaned.startsWith('hi')) return 'hi'
  if (cleaned.startsWith('ml')) return 'ml'
  if (cleaned.startsWith('kn')) return 'kn'
  if (cleaned.startsWith('te')) return 'te'
  if (cleaned.startsWith('en')) return 'en'
  return DEFAULT_LANGUAGE
}

/**
 * Returns uppercase code for backward compatibility with legacy uppercase types ('EN', 'TA', etc.)
 */
export function toUpperLanguageCode(lang?: string | null): 'EN' | 'TA' | 'HI' | 'ML' | 'KN' | 'TE' {
  const canonical = normalizeLanguage(lang)
  return canonical.toUpperCase() as 'EN' | 'TA' | 'HI' | 'ML' | 'KN' | 'TE'
}

/**
 * Get language metadata by code
 */
export function getLanguageMeta(lang?: string | null): LanguageOption {
  const code = normalizeLanguage(lang)
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0]
}

/**
 * Get friendly display name of language
 */
export function getLanguageName(lang?: string | null): string {
  return getLanguageMeta(lang).name
}
