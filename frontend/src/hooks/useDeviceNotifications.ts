import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { deviceNotificationService } from '../services/notifications/deviceNotificationService'

export function useDeviceNotifications() {
  const { user } = useAuth()
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    deviceNotificationService.getPermissionState()
  )
  const [isSupported] = useState<boolean>(deviceNotificationService.isSupported())

  // Refresh permission state
  const refreshPermission = useCallback(() => {
    setPermissionState(deviceNotificationService.getPermissionState())
  }, [])

  // User-triggered permission request
  const requestPermission = useCallback(async () => {
    const result = await deviceNotificationService.requestPermission(user?.id)
    setPermissionState(result)
    return result
  }, [user?.id])

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    await deviceNotificationService.unsubscribeFromPush()
    refreshPermission()
  }, [refreshPermission])

  // Send test notification
  const sendTest = useCallback(async () => {
    await deviceNotificationService.sendTestNotification()
  }, [])

  // Listen to Supabase Realtime for instant system notification dispatch
  useEffect(() => {
    if (!user?.id || permissionState !== 'granted') return

    console.log('[useDeviceNotifications] Subscribing to notifications Realtime for:', user.id)

    const channel = supabase
      .channel(`user_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload: any) => {
          const row = payload.new
          if (!row) return

          // Verify notification belongs to the current user
          const isForMe = row.recipient_id === user.id || row.user_id === user.id
          if (!isForMe) return

          console.log('[useDeviceNotifications] Realtime notification received:', row.title)

          // Determine deep link URL based on notification title or type
          let targetUrl = '/notifications'
          const lowerTitle = (row.title || '').toLowerCase()

          if (lowerTitle.includes('sold')) {
            targetUrl = '/transactions'
          } else if (lowerTitle.includes('payment successful') || lowerTitle.includes('purchased')) {
            targetUrl = '/transactions'
          } else if (lowerTitle.includes('message') || row.type === 'message') {
            targetUrl = '/chat'
          }

          // Trigger browser/device system notification
          deviceNotificationService.showDeviceNotification({
            title: row.title || 'Green Loop',
            body: row.message || 'You have a new update.',
            url: targetUrl,
            tag: `notif-${row.id || Date.now()}`,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, permissionState])

  return {
    isSupported,
    permissionState,
    isGranted: permissionState === 'granted',
    isDenied: permissionState === 'denied',
    isDefault: permissionState === 'default',
    requestPermission,
    unsubscribe,
    sendTest,
    refreshPermission,
  }
}
