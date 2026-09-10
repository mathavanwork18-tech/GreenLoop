import React, { useEffect, useState } from 'react'
import Icon from './Icon'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallButtonProps {
  className?: string
  style?: React.CSSProperties
  showIcon?: boolean
  label?: string
  onFallback?: () => void
}

export function InstallButton({
  className = 'install-btn',
  style,
  showIcon = true,
  label = 'Install Green Loop',
  onFallback,
}: InstallButtonProps = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__glInstallPrompt) {
      return (window as any).__glInstallPrompt as BeforeInstallPromptEvent
    }
    return null
  })
  const [installed, setInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      )
    }
    return false
  })

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      ;(window as any).__glInstallPrompt = promptEvent
    }

    const appInstalledHandler = () => {
      setInstalled(true)
      setDeferredPrompt(null)
      ;(window as any).__glInstallPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', appInstalledHandler)

    const handlePromptReady = () => {
      if ((window as any).__glInstallPrompt) {
        setDeferredPrompt((window as any).__glInstallPrompt)
      }
    }
    window.addEventListener('gl-pwa-prompt-ready', handlePromptReady)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalledHandler)
      window.removeEventListener('gl-pwa-prompt-ready', handlePromptReady)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      onFallback?.()
      return
    }
    const promptToTrigger = deferredPrompt
    // Hide button IMMEDIATELY on click with zero delay/flicker
    setDeferredPrompt(null)
    if (typeof window !== 'undefined') (window as any).__glInstallPrompt = null

    try {
      await promptToTrigger.prompt()
      const choice = await promptToTrigger.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      } else {
        // If dismissed, restore prompt state
        setDeferredPrompt(promptToTrigger)
        if (typeof window !== 'undefined') (window as any).__glInstallPrompt = promptToTrigger
      }
    } catch (err) {
      console.warn('[PWA] Error calling prompt():', err)
      onFallback?.()
    }
  }

  // Hide button if already installed, or if not installable and no fallback provided
  if (installed || (!deferredPrompt && !onFallback)) return null

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className={className}
      style={style}
      title="Install Green Loop as an application"
      aria-label={label}
    >
      {showIcon && <Icon name="install" size={16} color="currentColor" />}
      <span>{label}</span>
    </button>
  )
}

export default InstallButton
