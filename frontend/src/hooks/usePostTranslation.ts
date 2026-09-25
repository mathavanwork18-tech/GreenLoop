import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { translationService, detectLanguage } from '../services/translation/translationService'
import { normalizeLanguage, type CanonicalLanguage } from '../i18n/languages'
import type { Post } from '../types/post.types'

export interface UsePostTranslationResult {
  title: string
  description: string
  isTranslating: boolean
  isOriginal: boolean
  isTranslated: boolean
  originalLanguage: CanonicalLanguage
  sourceLanguage: CanonicalLanguage
  viewerLanguage: CanonicalLanguage
  showOriginal: boolean
  setShowOriginal: (show: boolean) => void
}

/**
 * Hook to render viewer-specific translated post content.
 * Automatically reacts when the viewer changes their language preference.
 */
export function usePostTranslation(
  post?: Partial<Post> & {
    original_title?: string
    original_description?: string
    original_language?: string
    title?: string
    description?: string
  } | null,
  overrideTargetLanguage?: string
): UsePostTranslationResult {
  const { currentLang: viewerLang } = useTranslation()
  const targetLanguage = normalizeLanguage(overrideTargetLanguage || viewerLang)

  const originalTitle = post?.original_title || post?.title || ''
  const originalDesc = post?.original_description || post?.description || ''

  const origLang: CanonicalLanguage = normalizeLanguage(
    post?.original_language || detectLanguage(originalTitle + ' ' + originalDesc)
  )

  const [showOriginal, setShowOriginal] = useState(false)

  const [state, setState] = useState<{
    title: string
    description: string
    isTranslating: boolean
    isOriginal: boolean
    isTranslated: boolean
  }>(() => {
    // If viewer language matches original, display original immediately with 0 latency
    if (origLang === targetLanguage) {
      return {
        title: originalTitle,
        description: originalDesc,
        isTranslating: false,
        isOriginal: true,
        isTranslated: false,
      }
    }
    return {
      title: originalTitle,
      description: originalDesc,
      isTranslating: true,
      isOriginal: false,
      isTranslated: false,
    }
  })

  useEffect(() => {
    if (!post) {
      setState({
        title: '',
        description: '',
        isTranslating: false,
        isOriginal: true,
        isTranslated: false,
      })
      return
    }

    // 1. Same language: no translation needed
    if (origLang === targetLanguage) {
      setState({
        title: originalTitle,
        description: originalDesc,
        isTranslating: false,
        isOriginal: true,
        isTranslated: false,
      })
      return
    }

    let isMounted = true
    setState((prev) => ({
      ...prev,
      isTranslating: true,
      isOriginal: false,
    }))

    translationService
      .translatePost(post as any, targetLanguage)
      .then((translated) => {
        if (!isMounted) return
        setState({
          title: translated.title,
          description: translated.description,
          isTranslating: false,
          isOriginal: false,
          isTranslated: true,
        })
      })
      .catch(() => {
        if (!isMounted) return
        setState({
          title: originalTitle,
          description: originalDesc,
          isTranslating: false,
          isOriginal: true,
          isTranslated: false,
        })
      })

    return () => {
      isMounted = false
    }
  }, [post?.id, originalTitle, originalDesc, origLang, targetLanguage])

  const effectiveTitle = showOriginal ? originalTitle : (state.title || originalTitle)
  const effectiveDesc = showOriginal ? originalDesc : (state.description || originalDesc)

  return {
    title: effectiveTitle,
    description: effectiveDesc,
    isTranslating: state.isTranslating,
    isOriginal: state.isOriginal || showOriginal,
    isTranslated: state.isTranslated && origLang !== targetLanguage,
    originalLanguage: origLang,
    sourceLanguage: origLang,
    viewerLanguage: targetLanguage,
    showOriginal,
    setShowOriginal,
  }
}

export default usePostTranslation
