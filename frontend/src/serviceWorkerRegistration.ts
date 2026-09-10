// Service Worker Registration & Event-Driven Update Manager

export type SWConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onUpdate?: (registration: ServiceWorkerRegistration) => void
}

export function registerServiceWorker(config?: SWConfig) {
  // Service Worker check
  if (!('serviceWorker' in navigator)) return

  // Do not register/poll updates during active Vite development (HMR causes repeated false updates)
  if (import.meta.env.DEV) {
    console.log('[PWA] Dev mode: Service worker update notifications suppressed during active HMR.')
    return
  }

  // Only run over HTTPS or localhost
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  if (window.location.protocol !== 'https:' && !isLocalhost) return

  const doRegister = () => {
    const swUrl = '/sw.js'

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('[PWA] Service Worker active with scope:', registration.scope)

        // Case 1: A genuinely new SW is already waiting in the background
        if (registration.waiting && navigator.serviceWorker.controller) {
          config?.onUpdate?.(registration)
        }

        // Case 2: A new SW is found and finishes installing
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing
          if (installingWorker == null) return

          installingWorker.addEventListener('statechange', () => {
            // Only notify when installation has completed AND an active controller exists
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] Genuine new version installed and waiting.')
              config?.onUpdate?.(registration)
            }
          })
        })
      })
      .catch((error) => {
        console.warn('[PWA] Service worker registration error:', error)
      })

    // Reload page once the new SW takes active control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }

  if (document.readyState === 'complete') {
    doRegister()
  } else {
    window.addEventListener('load', doRegister)
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
