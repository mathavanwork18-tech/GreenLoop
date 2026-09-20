/**
 * Green Loop - Web Push & System Notification Handlers
 * Handles background push notifications, interaction clicks, and client deep linking.
 */

self.addEventListener('push', (event) => {
  console.log('[SW Push] Push event received:', event)
  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data = { title: 'Green Loop', body: event.data.text() }
    }
  }

  const title = data.title || 'Green Loop Alert'
  const options = {
    body: data.body || 'You have a new update in Green Loop.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || 'greenloop-system-notification',
    data: {
      url: data.url || '/notifications',
      id: data.id,
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    renotify: true,
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  console.log('[SW Notification Click] Event:', event)
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window client is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          if ('navigate' in client && client.url && !client.url.includes(targetUrl)) {
            return client.navigate(targetUrl)
          }
          return
        }
      }
      // If no client is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('[SW Notification Close] Notification closed:', event.notification.tag)
})
