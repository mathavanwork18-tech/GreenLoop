/**
 * ==============================================================================
 * GREEN LOOP — DEVICE & SYSTEM NOTIFICATION SERVICE
 * ==============================================================================
 * Handles:
 *  - Browser Notification permissions (default, granted, denied)
 *  - Persistent Service Worker notifications (for Mobile & Desktop OS)
 *  - Web Push subscription management (multi-device support in Supabase)
 *  - Deep linking navigation on notification clicks
 * ==============================================================================
 */

import { supabase } from '../../utils/supabase'

export interface DeviceNotificationOptions {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
}

// Fallback VAPID key for development/demo test modes if none is provided via env
const DEFAULT_VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const deviceNotificationService = {
  /**
   * Check whether the current browser supports Notification API
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  },

  /**
   * Check whether Service Worker + PushManager is supported (Mobile / Desktop)
   */
  isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    )
  },

  /**
   * Get current browser permission state: 'default' | 'granted' | 'denied'
   */
  getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return 'denied'
    return Notification.permission
  },

  /**
   * Request notification permission upon explicit user action
   */
  async requestPermission(userId?: string): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Attempt Web Push subscription in background
        await this.subscribeToPush(userId)
      }
      return permission
    } catch (err) {
      console.warn('[NotificationService] Permission request failed:', err)
      return 'denied'
    }
  },

  /**
   * Create and register Web Push Subscription with Supabase
   */
  async subscribeToPush(userId?: string): Promise<boolean> {
    if (!this.isPushSupported()) return false

    try {
      // 1. Wait for active Service Worker
      const registration = await navigator.serviceWorker.ready
      if (!registration || !registration.pushManager) return false

      // 2. Check existing subscription or subscribe
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        try {
          const applicationServerKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY) as unknown as BufferSource
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          })
        } catch (subErr) {
          console.log('[NotificationService] Web push server key subscription bypassed:', subErr)
          // Local service worker notifications still work with granted permission
          return true
        }
      }

      if (!subscription) return false

      // 3. Extract subscription keys
      const p256dhKey = subscription.getKey('p256dh')
      const authKey = subscription.getKey('auth')
      if (!p256dhKey || !authKey) return true

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)))
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)))
      const endpoint = subscription.endpoint
      const deviceInfo = `${navigator.userAgent.slice(0, 80)}`

      // 4. Save subscription to Supabase public.notification_subscriptions
      const authUser = userId || (await supabase.auth.getUser()).data.user?.id
      if (authUser) {
        try {
          const { error } = await supabase.rpc('save_push_subscription', {
            p_endpoint: endpoint,
            p_p256dh: p256dh,
            p_auth: auth,
            p_device_info: deviceInfo,
          })
          if (error) throw error
        } catch {
          // Fallback direct table insert if RPC is pending migration
          await supabase
            .from('notification_subscriptions')
            .upsert(
              {
                user_id: authUser,
                endpoint,
                p256dh,
                auth,
                device_info: deviceInfo,
                is_active: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,endpoint' }
            )
        }
      }

      return true
    } catch (err) {
      console.warn('[NotificationService] Push subscription registration error:', err)
      return false
    }
  },

  /**
   * Unsubscribe from push notifications and delete device record
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.isPushSupported()) return false

    try {
      const registration = await navigator.serviceWorker.ready
      if (registration?.pushManager) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          const endpoint = subscription.endpoint
          await subscription.unsubscribe()

          // Remove from Supabase
          try {
            const { error } = await supabase.rpc('remove_push_subscription', { p_endpoint: endpoint })
            if (error) throw error
          } catch {
            await supabase.from('notification_subscriptions').delete().eq('endpoint', endpoint)
          }
        }
      }
      return true
    } catch (err) {
      console.warn('[NotificationService] Unsubscribe error:', err)
      return false
    }
  },

  /**
   * Display a device/system notification outside the web page
   */
  async showDeviceNotification(options: DeviceNotificationOptions): Promise<void> {
    if (this.getPermissionState() !== 'granted') {
      return
    }

    const {
      title,
      body,
      url = '/notifications',
      tag = 'greenloop-alert',
      icon = '/icons/icon-192.png',
    } = options

    // Prefer Service Worker showNotification (reliable on Android mobile & background)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, {
            body,
            icon,
            badge: '/icons/icon-192.png',
            data: { url },
            tag,
            vibrate: [200, 100, 200],
            renotify: true,
          } as NotificationOptions)
          return
        }
      } catch (swErr) {
        console.warn('[NotificationService] ServiceWorker showNotification fallback:', swErr)
      }
    }

    // Fallback: Standard browser Notification API
    try {
      const notif = new Notification(title, {
        body,
        icon,
        tag,
      })

      notif.onclick = () => {
        window.focus()
        if (url && typeof window !== 'undefined') {
          window.location.href = url
        }
        notif.close()
      }
    } catch (apiErr) {
      console.warn('[NotificationService] Notification constructor failed:', apiErr)
    }
  },

  /**
   * Send a quick test notification to confirm system alerts work
   */
  async sendTestNotification(): Promise<void> {
    await this.showDeviceNotification({
      title: 'Green Loop Notifications Active',
      body: 'You will receive instant system alerts for sales, purchases, and messages.',
      url: '/notifications',
      tag: 'test-notification',
    })
  },
}
