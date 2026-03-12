// Service Worker para Training
// Responsável por: cache offline, notificações de treino, alerta de fim de descanso

const CACHE_NAME = 'training-v3'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

let restEndTimer = null

// Instalar SW — precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Ativar SW — limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-GET e de outros domínios
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Assets estáticos (JS, CSS, imagens, fontes) → Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff2?|ttf|webp)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }).catch(() => caches.match(request))
    )
    return
  }

  // Navegação (HTML) → Network First, fallback to cache
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    )
    return
  }

  // Outros requests → Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
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
      tag: tag || 'training-workout',
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '▶ Abrir Treino' },
        { action: 'dismiss', title: '✕ Fechar' },
      ],
    })
  }

  // Agendar notificação para quando o descanso terminar
  if (type === 'SCHEDULE_REST_END') {
    const { segundos, exercicioNome } = payload
    // Cancela timer anterior se existir
    if (restEndTimer) {
      clearTimeout(restEndTimer)
      restEndTimer = null
    }

    restEndTimer = setTimeout(() => {
      restEndTimer = null

      // Notifica o fim do descanso
      self.registration.showNotification('💪 Descanso finalizado!', {
        body: exercicioNome
          ? `Hora de voltar — ${exercicioNome}`
          : 'Hora de voltar ao treino!',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        tag: 'training-rest-end',
        renotify: true,
        requireInteraction: true,
        vibrate: [300, 150, 300, 150, 300],
        actions: [
          { action: 'open', title: '▶ Continuar Treino' },
        ],
      })

      // Avisa o cliente que o descanso acabou (para tocar som/vibrar na aba)
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'REST_ENDED' }))
      })
    }, segundos * 1000)
  }

  // Cancelar timer de descanso (quando o usuário pula o descanso)
  if (type === 'CANCEL_REST_END') {
    if (restEndTimer) {
      clearTimeout(restEndTimer)
      restEndTimer = null
    }
    // Limpa notificação de descanso ativo
    self.registration.getNotifications({ tag: 'training-rest-end' }).then((notifs) => {
      notifs.forEach((n) => n.close())
    })
  }

  if (type === 'CLEAR_NOTIFICATIONS') {
    if (restEndTimer) {
      clearTimeout(restEndTimer)
      restEndTimer = null
    }
    self.registration.getNotifications({ tag: 'training-workout' }).then((notifs) => {
      notifs.forEach((n) => n.close())
    })
    self.registration.getNotifications({ tag: 'training-rest-end' }).then((notifs) => {
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
        const trainingClient = clients.find((c) => c.url.includes(self.location.origin))
        if (trainingClient) {
          trainingClient.focus()
          trainingClient.postMessage({ type: 'OPEN_WORKOUT' })
        } else {
          self.clients.openWindow('/treino-ativo')
        }
      })
    )
  }
})
