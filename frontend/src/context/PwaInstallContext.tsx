import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { registerServiceWorker } from '../serviceWorkerRegistration'

export type PlatformType = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'other'
export type BrowserType = 'chrome' | 'edge' | 'safari' | 'firefox' | 'samsung' | 'opera' | 'other'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface PwaInstallContextValue {
  // Device & Platform Info
  platform: PlatformType
  browser: BrowserType
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isDesktop: boolean
  isStandalone: boolean

  // Installation States
  isInstalled: boolean
  isInstallPromptAvailable: boolean
  isInstallable: boolean
  installationCompleted: boolean
  installationDismissed: boolean

  // Actions
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'manual'>
  openInstallModal: () => void
  closeInstallModal: (dismissTemporarily?: boolean) => void
  showInstallModal: boolean
  resetInstallState: () => void

  // Service Worker Updates
  hasUpdate: boolean
  applyUpdate: () => void
}

const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined)

const DISMISS_STORAGE_KEY = 'gl_pwa_install_dismissed_at'
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days cooldown for auto-popup

export const PwaInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__glInstallPrompt) {
      return (window as any).__glInstallPrompt
    }
    return null
  })
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installationCompleted, setInstallationCompleted] = useState(false)
  const [installationDismissed, setInstallationDismissed] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [hasUpdate, setHasUpdate] = useState(false)

  // 1. Detect Standalone / Already Installed State
  const checkIsStandalone = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    // Check display-mode standalone (Chrome, Edge, Android, iOS 13+)
    const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches
    // Check iOS Safari standalone property
    const isIosStandalone = (window.navigator as any).standalone === true
    // Check Android app intent referrer
    const isAndroidApp = document.referrer.includes('android-app://')

    return isMediaStandalone || isIosStandalone || isAndroidApp
  }, [])

  // 2. Platform & Browser Detection
  const { platform, browser, isMobile, isIOS, isAndroid, isDesktop } = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        platform: 'other' as PlatformType,
        browser: 'other' as BrowserType,
        isMobile: false,
        isIOS: false,
        isAndroid: false,
        isDesktop: true,
      }
    }

    const ua = navigator.userAgent || ''
    const vendor = navigator.vendor || ''

    // Detect Platform
    const isIOSDevice =
      (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !(window as any).MSStream

    const isAndroidDevice = /android/i.test(ua)
    const isWindowsDevice = /windows/i.test(ua)
    const isMacDevice = /macintosh|mac os x/i.test(ua) && !isIOSDevice
    const isLinuxDevice = /linux/i.test(ua) && !isAndroidDevice

    let detectedPlatform: PlatformType = 'other'
    if (isIOSDevice) detectedPlatform = 'ios'
    else if (isAndroidDevice) detectedPlatform = 'android'
    else if (isWindowsDevice) detectedPlatform = 'windows'
    else if (isMacDevice) detectedPlatform = 'macos'
    else if (isLinuxDevice) detectedPlatform = 'linux'

    // Detect Browser
    let detectedBrowser: BrowserType = 'other'
    if (/samsungbrowser/i.test(ua)) detectedBrowser = 'samsung'
    else if (/edg/i.test(ua)) detectedBrowser = 'edge'
    else if (/opr\//i.test(ua) || /opera/i.test(ua)) detectedBrowser = 'opera'
    else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) detectedBrowser = 'chrome'
    else if (/firefox|fxios/i.test(ua)) detectedBrowser = 'firefox'
    else if (/safari/i.test(ua) && /apple/i.test(vendor)) detectedBrowser = 'safari'

    const mobile = isIOSDevice || isAndroidDevice || window.innerWidth < 768
    const desktop = !isIOSDevice && !isAndroidDevice && window.innerWidth >= 768

    return {
      platform: detectedPlatform,
      browser: detectedBrowser,
      isMobile: mobile,
      isIOS: isIOSDevice,
      isAndroid: isAndroidDevice,
      isDesktop: desktop,
    }
  }, [])

  // 3. Initialize Listeners & Service Worker
  useEffect(() => {
    const standalone = checkIsStandalone()
    setIsStandalone(standalone)
    setIsInstalled(standalone)

    // Check dismissed state in local storage
    try {
      const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY)
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < DISMISS_COOLDOWN_MS) {
        setInstallationDismissed(true)
      }
    } catch {}

    if (typeof window !== 'undefined') {
      if ((window as any).__glInstallPrompt) {
        setDeferredPrompt((window as any).__glInstallPrompt)
      }

      const handleEarlyPrompt = () => {
        if ((window as any).__glInstallPrompt) {
          setDeferredPrompt((window as any).__glInstallPrompt)
        }
      }
      window.addEventListener('gl-pwa-prompt-ready', handleEarlyPrompt)

      // Listen for display-mode change (e.g. installed while running)
      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      const handleDisplayModeChange = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches)
        if (e.matches) {
          setIsInstalled(true)
        }
      }
      mediaQuery.addEventListener?.('change', handleDisplayModeChange)

      // Intercept native beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        const promptEvent = e as BeforeInstallPromptEvent
        setDeferredPrompt(promptEvent)
        ;(window as any).__glInstallPrompt = promptEvent
      }

      // Listen for appinstalled confirmation
      const handleAppInstalled = () => {
        setIsInstalled(true)
        setInstallationCompleted(true)
        setDeferredPrompt(null)
        ;(window as any).__glInstallPrompt = null
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)

      // Register Service Worker and handle update triggers
      registerServiceWorker({
        onUpdate: (registration) => {
          if (registration.waiting) {
            setWaitingWorker(registration.waiting)
            setHasUpdate(true)
          }
        },
      })

      return () => {
        window.removeEventListener('gl-pwa-prompt-ready', handleEarlyPrompt)
        mediaQuery.removeEventListener?.('change', handleDisplayModeChange)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }
  }, [checkIsStandalone])

  // 4. Trigger Installation Prompt or Fallback Modal
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__glInstallPrompt : null)

    // If native prompt is ready:
    if (activePrompt) {
      try {
        await activePrompt.prompt()
        const choice = await activePrompt.userChoice
        setDeferredPrompt(null)
        if (typeof window !== 'undefined') (window as any).__glInstallPrompt = null
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
          setInstallationCompleted(true)
          return 'accepted'
        }
        return 'dismissed'
      } catch (err) {
        console.warn('[PWA] Native install prompt error:', err)
        setShowInstallModal(true)
        return 'manual'
      }
    }

    // Otherwise, open modal
    setShowInstallModal(true)
    return 'manual'
  }, [deferredPrompt])

  const openInstallModal = useCallback(() => {
    setShowInstallModal(true)
  }, [])

  const closeInstallModal = useCallback((dismissTemporarily: boolean = false) => {
    setShowInstallModal(false)
    if (dismissTemporarily) {
      setInstallationDismissed(true)
      try {
        localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString())
      } catch {}
    }
  }, [])

  const resetInstallState = useCallback(() => {
    setInstallationCompleted(false)
  }, [])

  // 5. Apply Service Worker Update
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
    setHasUpdate(false)
    window.location.reload()
  }, [waitingWorker])

  const isInstallPromptAvailable = deferredPrompt !== null || (typeof window !== 'undefined' && (window as any).__glInstallPrompt !== null)
  // Can install if not installed yet
  const isInstallable = !isInstalled

  const value: PwaInstallContextValue = {
    platform,
    browser,
    isMobile,
    isIOS,
    isAndroid,
    isDesktop,
    isStandalone,
    isInstalled,
    isInstallPromptAvailable,
    isInstallable,
    installationCompleted,
    installationDismissed,
    promptInstall,
    openInstallModal,
    closeInstallModal,
    showInstallModal,
    resetInstallState,
    hasUpdate,
    applyUpdate,
  }

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
}

export const usePwaInstall = () => {
  const context = useContext(PwaInstallContext)
  if (!context) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider')
  }
  return context
}
