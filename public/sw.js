// Service Worker para FitTrack
// Responsável por: notificações de treino em andamento

const CACHE_NAME = 'fittrack-v1'

// Instalar SW
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Recebe mensagens do app principal
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {}

  if (type === 'WORKOUT_NOTIFICATION') {
    const { titulo, corpo, tag } = payload
    self.registration.showNotification(titulo, {
      body: corpo,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: tag || 'fittrack-workout',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '▶ Abrir Treino' },
        { action: 'dismiss', title: '✕ Fechar' },
      ],
    })
  }

  if (type === 'CLEAR_NOTIFICATIONS') {
    self.registration.getNotifications({ tag: 'fittrack-workout' }).then((notifs) => {
      notifs.forEach((n) => n.close())
    })
  }
})

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        const fittrackClient = clients.find((c) => c.url.includes(self.location.origin))
        if (fittrackClient) {
          fittrackClient.focus()
          fittrackClient.postMessage({ type: 'OPEN_WORKOUT' })
        } else {
          self.clients.openWindow('/treino-ativo')
        }
      })
    )
  }
})
