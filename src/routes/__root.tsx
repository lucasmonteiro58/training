import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { BottomNav } from '../components/layout/BottomNav'
import { useTreinoAtivoStore } from '../stores'
import { registrarServiceWorker } from '../lib/notifications'
import { subscribeToProgressoTreino } from '../lib/firestore/sync'
import { FloatingWorkoutButton } from '../components/layout/FloatingWorkoutButton'
import { Toaster, toast } from 'sonner'
import { PWAInstallPrompt } from '../components/ui/PWAInstallPrompt'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1',
      },
      { title: 'Training' },
      { name: 'description', content: 'Acompanhe e registre seus treinos com Training' },
      { name: 'theme-color', content: '#6366f1' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'apple-touch-icon', sizes: '167x167', href: '/apple-touch-icon.png' },
      { rel: 'apple-touch-startup-image', href: '/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { rel: 'apple-touch-startup-image', href: '/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { rel: 'apple-touch-startup-image', href: '/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { rel: 'apple-touch-startup-image', href: '/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

import { useAuth as useAuthHook } from '../hooks/useAuth'

function RootComponent() {
  const { user, loading: loadingAuth } = useAuthHook()
  const { iniciado, iniciarTreino, pausado, tickGeral } = useTreinoAtivoStore()

  useEffect(() => {
    registrarServiceWorker()
  }, [])

  // Sincronizar treino ativo de outros dispositivos
  useEffect(() => {
    if (!user || iniciado) return

    const unsub = subscribeToProgressoTreino(user.uid, (dados) => {
      if (dados && dados.iniciado && !iniciado) {
        iniciarTreino(dados.sessao)
      }
    })

    return unsub
  }, [user, iniciado, iniciarTreino])

  // Global timer tick while training is active and not paused
  useEffect(() => {
    if (!iniciado || pausado) return
    const interval = setInterval(tickGeral, 1000)
    return () => clearInterval(interval)
  }, [iniciado, pausado, tickGeral])

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center animate-pulse">
            <img src="/icon.png" alt="Logo" className="w-14 h-14 rounded-xl" />
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg)] relative overflow-x-hidden">
      <main className="flex-1 overflow-y-auto pt-[env(safe-area-inset-top,0)]">
        <div className="pt-4">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-center"
        richColors
        offset={110}
        toastOptions={{
          style: { zIndex: 9999 }
        }}
      />
      <PWAInstallPrompt />
      <FloatingWorkoutButton />
      <BottomNav />
    </div>
  )
}

// ============================================================
// Login Page (inline for simplicity)
// ============================================================

function LoginPage() {
  const { loginComGoogle } = useAuthHook()

  const handleLogin = async () => {
    try {
      await loginComGoogle()
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.')
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top,0)] pb-[max(20px,env(safe-area-inset-bottom,0))] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full bg-purple-500 opacity-[0.06] blur-[80px]" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10 animate-fade-up">
        <div className="flex flex-col items-center gap-4">
          <img src="/icon.png" alt="Logo" className="w-20 h-20 rounded-xl" />
          <div className="text-center">
            <h1 className="text-4xl font-black gradient-text">Training</h1>
            <p className="text-[var(--color-text-muted)] mt-2 text-base">
              Seu parceiro de treino inteligente
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {['📊 Registro de séries', '⏱️ Cronômetro', '📈 Histórico', '🔔 Notificações'].map(
            (f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium"
              >
                {f}
              </span>
            )
          )}
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-800 rounded-2xl font-semibold text-base shadow-lg active:scale-98 transition-transform hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
          <p className="text-center text-xs text-[var(--color-text-subtle)]">
            Seus treinos ficam seguros e sincronizados 🔒
          </p>
        </div>
      </div>
    </div>
  )
}
