import { supabase } from '../../utils/supabase'
import { normalizeLanguage, type CanonicalLanguage } from '../../i18n/languages'
import type { Post } from '../../types/post.types'

export interface TranslatedPostContent {
  title: string
  description: string
  language: CanonicalLanguage
  isOriginal: boolean
  isTranslated: boolean
  isTranslating: boolean
  error?: string | null
}

// In-Memory cache for lightning-fast repeated renders
const memoryCache = new Map<string, { title: string; description: string; timestamp: number }>()

// In-flight request deduplication map to prevent redundant simultaneous network requests
const inFlightRequests = new Map<string, Promise<{ title: string; description: string }>>()

const STORAGE_CACHE_KEY = 'gl_translation_cache'
const MAX_LOCAL_CACHE_ENTRIES = 500

/**
 * Loads cached translations from localStorage into memory on startup.
 */
function getStorageCache(): Record<string, { title: string; description: string; timestamp: number }> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToStorageCache(key: string, data: { title: string; description: string }) {
  if (typeof window === 'undefined') return
  try {
    const cache = getStorageCache()
    cache[key] = { ...data, timestamp: Date.now() }

    // Evict old entries if cache grows too large
    const keys = Object.keys(cache)
    if (keys.length > MAX_LOCAL_CACHE_ENTRIES) {
      const sorted = keys.sort((a, b) => (cache[a]?.timestamp || 0) - (cache[b]?.timestamp || 0))
      for (const k of sorted.slice(0, 100)) {
        delete cache[k]
      }
    }

    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

/**
 * Fast heuristics language detection for Indic scripts and common Indian phrasing.
 */
export function detectLanguage(text?: string | null): CanonicalLanguage {
  if (!text || typeof text !== 'string') return 'en'
  const str = text.trim()
  if (!str) return 'en'

  // Tamil unicode range \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(str)) return 'ta'

  // Hindi / Devanagari unicode range \u0900-\u097F
  if (/[\u0900-\u097F]/.test(str)) return 'hi'

  // Malayalam unicode range \u0D00-\u0D7F
  if (/[\u0D00-\u0D7F]/.test(str)) return 'ml'

  // Kannada unicode range \u0C80-\u0CFF
  if (/[\u0C80-\u0CFF]/.test(str)) return 'kn'

  // Telugu unicode range \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(str)) return 'te'

  // Common Tanglish keywords
  const lower = str.toLowerCase()
  if (/\b(iruku|irukku|nalla|panren|panna|kudunga|venum|vaanga|kondaa|illai|illada)\b/i.test(lower)) {
    return 'ta'
  }

  // Common Hinglish keywords
  if (/\b(hai|bhi|accha|karo|bechna|chahiye|nahi|mera|kharidna|kaise)\b/i.test(lower)) {
    return 'hi'
  }

  return 'en'
}

/**
 * Builds a deterministic cache key for a post and target language.
 */
function buildCacheKey(postId: string | number | undefined, title: string, targetLanguage: string): string {
  const normalizedTarget = normalizeLanguage(targetLanguage)
  if (postId) {
    return `post_${postId}_${normalizedTarget}`
  }
  // Content hash for unsaved/draft posts
  const cleanTitle = title.trim().toLowerCase().slice(0, 40)
  return `hash_${cleanTitle}_${normalizedTarget}`
}

export const translationService = {
  /**
   * Translates a post's title and description for the current viewer.
   *
   * Flow:
   * 1. If viewer language == original post language, returns original immediately.
   * 2. Checks in-memory cache.
   * 3. Checks localStorage cache.
   * 4. Checks Supabase post_translations table.
   * 5. If not found, calls backend /api/translate securely once and caches results.
   * 6. Falls back safely to original text on any failure without breaking UI.
   */
  async translatePost(
    post: Partial<Post> & {
      original_title?: string
      original_description?: string
      original_language?: string
      title: string
      description?: string
    },
    targetLanguage: string
  ): Promise<{ title: string; description: string; detectedSourceLanguage?: string }> {
    const rawTitle = post.original_title || post.title || ''
    const rawDesc = post.original_description || post.description || ''
    const targetLang = normalizeLanguage(targetLanguage)

    // Detect or use recorded original language
    const origLang = normalizeLanguage(
      post.original_language ||
      detectLanguage(rawTitle + ' ' + rawDesc)
    )

    // 1. Same language: no translation needed!
    if (origLang === targetLang) {
      return {
        title: rawTitle,
        description: rawDesc,
        detectedSourceLanguage: origLang,
      }
    }

    const cacheKey = buildCacheKey(post.id, rawTitle, targetLang)

    // 2. Check in-memory cache
    if (memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey)!
      return {
        title: cached.title,
        description: cached.description,
        detectedSourceLanguage: origLang,
      }
    }

    // 3. Check localStorage cache
    const storageCache = getStorageCache()
    if (storageCache[cacheKey]) {
      const cached = storageCache[cacheKey]
      memoryCache.set(cacheKey, { title: cached.title, description: cached.description, timestamp: cached.timestamp })
      return {
        title: cached.title,
        description: cached.description,
        detectedSourceLanguage: origLang,
      }
    }

    // 4. Check Supabase post_translations table if post.id exists
    if (post.id && typeof post.id === 'string' && post.id.length > 10) {
      try {
        const { data: dbTrans } = await supabase
          .from('post_translations')
          .select('translated_title, translated_description')
          .eq('post_id', post.id)
          .eq('language', targetLang)
          .maybeSingle()

        if (dbTrans?.translated_title) {
          const result = {
            title: dbTrans.translated_title,
            description: dbTrans.translated_description || rawDesc,
          }
          memoryCache.set(cacheKey, { ...result, timestamp: Date.now() })
          saveToStorageCache(cacheKey, result)
          return result
        }
      } catch {}
    }

    // 5. In-flight request deduplication: return ongoing promise if identical request is pending
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!
    }

    // 6. Execute translation via backend service
    const translatePromise = (async () => {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: {
              title: rawTitle,
              description: rawDesc,
            },
            sourceLanguage: origLang,
            targetLanguage: targetLang,
          }),
        })

        if (!response.ok) {
          throw new Error(`Translation API returned status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.translations) {
          throw new Error(data.error || 'Translation response invalid')
        }

        const translatedTitle = data.translations.title || rawTitle
        const translatedDesc = data.translations.description || rawDesc

        const result = {
          title: translatedTitle,
          description: translatedDesc,
          detectedSourceLanguage: data.detectedSourceLanguage || origLang,
        }

        // Cache in memory and localStorage
        memoryCache.set(cacheKey, { title: translatedTitle, description: translatedDesc, timestamp: Date.now() })
        saveToStorageCache(cacheKey, { title: translatedTitle, description: translatedDesc })

        // Persist to Supabase post_translations asynchronously if post.id is available
        if (post.id && typeof post.id === 'string' && post.id.length > 10) {
          supabase
            .from('post_translations')
            .upsert(
              {
                post_id: post.id,
                language: targetLang,
                translated_title: translatedTitle,
                translated_description: translatedDesc,
              },
              { onConflict: 'post_id,language' }
            )
            .then(() => {}, () => {})
        }

        return result
      } catch (err: any) {
        console.warn(`[TranslationService] Fallback to original for "${rawTitle.slice(0, 20)}":`, err?.message)
        // Fallback safely to original content without breaking UI
        return {
          title: rawTitle,
          description: rawDesc,
          detectedSourceLanguage: origLang,
        }
      } finally {
        inFlightRequests.delete(cacheKey)
      }
    })()

    inFlightRequests.set(cacheKey, translatePromise)
    return translatePromise
  },

  /**
   * Preload or translate single text snippet (e.g. location, notes)
   */
  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    if (!text || !text.trim()) return ''
    const targetLang = normalizeLanguage(targetLanguage)
    const origLang = sourceLanguage ? normalizeLanguage(sourceLanguage) : detectLanguage(text)

    if (targetLang === origLang) return text

    const cacheKey = `text_${text.trim().toLowerCase().slice(0, 40)}_${targetLang}`
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey)!.title
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLanguage: origLang,
          targetLanguage: targetLang,
        }),
      })

      if (!res.ok) return text
      const data = await res.json()
      const translated = data.translatedText || text
      memoryCache.set(cacheKey, { title: translated, description: '', timestamp: Date.now() })
      return translated
    } catch {
      return text
    }
  },

  /**
   * Clear cache (useful for testing or cache reset)
   */
  clearCache() {
    memoryCache.clear()
    try {
      localStorage.removeItem(STORAGE_CACHE_KEY)
    } catch {}
  },
}

export default translationService
