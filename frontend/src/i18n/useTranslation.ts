import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  t as translateStatic,
  translateCategory as trCategory,
  translateCondition as trCondition,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  type CanonicalLanguage,
} from './index'

export function useTranslation() {
  const auth = useAuth()
  const [currentLang, setCurrentLang] = useState<CanonicalLanguage>(() => {
    return normalizeLanguage(auth?.language || localStorage.getItem('gl_language') || 'en')
  })

  // Synchronize with auth language
  useEffect(() => {
    if (auth?.language) {
      setCurrentLang(normalizeLanguage(auth.language))
    }
  }, [auth?.language])

  // Also listen for cross-tab or global language change events
  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: string }>
      if (customEvent.detail?.language) {
        setCurrentLang(normalizeLanguage(customEvent.detail.language))
      }
    }
    window.addEventListener('gl_language_changed', handleLangChange)
    return () => window.removeEventListener('gl_language_changed', handleLangChange)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translateStatic(key, params, currentLang)
    },
    [currentLang]
  )

  const translateCategory = useCallback(
    (category?: string | null) => {
      return trCategory(category, currentLang)
    },
    [currentLang]
  )

  const translateCondition = useCallback(
    (condition?: string | null) => {
      return trCondition(condition, currentLang)
    },
    [currentLang]
  )

  const setLanguage = useCallback(
    (lang: string) => {
      const canonical = normalizeLanguage(lang)
      setCurrentLang(canonical)
      auth?.setLanguage(canonical as any)
      try {
        localStorage.setItem('gl_language', canonical)
        window.dispatchEvent(new CustomEvent('gl_language_changed', { detail: { language: canonical } }))
      } catch {}
    },
    [auth]
  )

  return {
    t,
    language: currentLang,
    currentLang,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    translateCategory,
    translateCondition,
    dir: 'ltr',
  }
}

export default useTranslation
