// Service Worker para Training
// Responsável por: cache offline, notificações de treino, alerta de fim de descanso

const CACHE_NAME = 'training-v5'
const EXTERNAL_CACHE = 'training-external-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

// Domínios externos que devem ser cacheados (imagens, fontes)
const CACHEABLE_ORIGINS = [
  'raw.githubusercontent.com',
  'media.giphy.com',
  'media0.giphy.com',
  'media1.giphy.com',
  'media2.giphy.com',
  'media3.giphy.com',
  'media4.giphy.com',
  'i.giphy.com',
  'lh3.googleusercontent.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
]

let restEndTimer = null

// Instalar SW — precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(STATIC_ASSETS)
      // Proativamente cacheia assets linkados no HTML da raiz
      try {
        const res = await fetch('/')
        if (res.ok) {
          const html = await res.text()
          const assetUrls = []
          // Extrai links de CSS e JS do HTML
          const linkMatches = html.matchAll(/(?:href|src)=["'](\/(assets\/[^"']+|[^"']+\.(js|css)))/g)
          for (const m of linkMatches) {
            assetUrls.push(m[1])
          }
          if (assetUrls.length > 0) {
            await cache.addAll([...new Set(assetUrls)])
          }
        }
      } catch { /* offline install — assets will be cached on first use */ }
    })
  )
  self.skipWaiting()
})

// Ativar SW — limpar caches antigos
self.addEventListener('activate', (event) => {
  const keepCaches = [CACHE_NAME, EXTERNAL_CACHE]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keepCaches.includes(k)).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Cacheia assets linkados em uma resposta HTML
async function cacheLinkedAssets(response) {
  try {
    const html = await response.text()
    const cache = await caches.open(CACHE_NAME)
    const assetUrls = []
    const linkMatches = html.matchAll(/(?:href|src)=["'](\/(assets\/[^"']+|[^"']+\.(js|css)))/g)
    for (const m of linkMatches) {
      assetUrls.push(m[1])
    }
    // Cache assets que ainda não existem
    for (const url of [...new Set(assetUrls)]) {
      const existing = await cache.match(url)
      if (!existing) {
        try {
          const assetRes = await fetch(url)
          if (assetRes.ok) await cache.put(url, assetRes)
        } catch { /* ignore individual failures */ }
      }
    }
  } catch { /* ignore */ }
}

// Estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return

  // Imagens e fontes externas → Cache First (cache separado)
  if (url.origin !== self.location.origin) {
    if (CACHEABLE_ORIGINS.includes(url.hostname)) {
      event.respondWith(
        caches.open(EXTERNAL_CACHE).then(async (cache) => {
          const cached = await cache.match(request)
          if (cached) return cached
          try {
            const response = await fetch(request)
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          } catch {
            return new Response('', { status: 408 })
          }
        })
      )
    }
    return
  }

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

  // Navegação (HTML) → Network First, fallback completo
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            const clone2 = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            // Proativamente cacheia assets linkados nessa página
            cacheLinkedAssets(clone2)
          }
          return response
        })
        .catch(async () => {
          // Offline: tenta cache exato da rota, senão serve a raiz (SPA fallback)
          const cached = await caches.match(request)
          if (cached) return cached
          const root = await caches.match('/')
          if (root) return root
          return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
        })
    )
    return
  }

  // TanStack Router data requests (__data, .json) → Network First
  if (url.pathname.includes('__data') || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request).then((c) => c || new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })))
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

      // Notifica o fim do descanso (som padrão do sistema + vibração; funciona em background PWA)
      self.registration.showNotification('💪 Descanso finalizado!', {
        body: exercicioNome
          ? `Hora de voltar — ${exercicioNome}`
          : 'Hora de voltar ao treino!',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        tag: 'training-rest-end',
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [300, 150, 300, 150, 400],
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
