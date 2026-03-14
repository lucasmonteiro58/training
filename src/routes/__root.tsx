import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { BottomNav } from '../components/layout/BottomNav'
import { useTreinoAtivoStore, useHistoricoStore, INATIVIDADE_AUTO_ENCERRAR_MS, calcularVolume } from '../stores'
import { registrarServiceWorker } from '../lib/notifications'
import { subscribeToProgressoTreino, limparProgressoTreinoFirestore } from '../lib/firestore/sync'
import { FloatingWorkoutButton } from '../components/layout/FloatingWorkoutButton'
import { Toaster } from 'sonner'
import { PWAInstallPrompt } from '../components/ui/PWAInstallPrompt'
import { useAuth as useAuthHook } from '../hooks/useAuth'
import { useHistorico } from '../hooks/useHistorico'
import appCss from '../styles.css?url'
import { AuthLoadingScreen } from './__root/components/-AuthLoadingScreen'
import { AutoEncerradoBanner } from './__root/components/-AutoEncerradoBanner'
import { SyncIndicator } from './__root/components/-SyncIndicator'
import { LoginPage } from './__root/components/-LoginPage'

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

function RootComponent() {
  const { user, loading: loadingAuth } = useAuthHook()
  const { iniciado, pausado, tickGeral } = useTreinoAtivoStore()
  const { salvarSessaoCompleta } = useHistorico()
  const setSessaoAutoEncerrada = useHistoricoStore(s => s.setSessaoAutoEncerrada)

  useEffect(() => {
    registrarServiceWorker()
  }, [])

  useEffect(() => {
    if (!user) return

    const unsub = subscribeToProgressoTreino(user.uid, dados => {
      const state = useTreinoAtivoStore.getState()
      const historicoState = useHistoricoStore.getState()

      if (!dados || !dados.iniciado) {
        if (state.iniciado) state.limparLocal()
        return
      }

      const updatedAt = (dados as { updatedAt?: number }).updatedAt
      if (updatedAt && Date.now() - updatedAt > INATIVIDADE_AUTO_ENCERRAR_MS) {
        if (historicoState.sessaoAutoEncerrada?.sessao.id === dados.sessao?.id) return
        const sessao = dados.sessao
        if (!sessao) return
        const finalizada = {
          ...sessao,
          finalizadoEm: Date.now(),
          duracaoSegundos: (dados as { cronometroGeralSegundos?: number }).cronometroGeralSegundos ?? 0,
          volumeTotal: calcularVolume(sessao),
          autoEncerrado: true,
        }
        salvarSessaoCompleta(finalizada).then(() => {
          limparProgressoTreinoFirestore(user.uid)
          state.limparLocal()
          setSessaoAutoEncerrada({
            sessao: finalizada,
            exercicioAtualIndex: dados.exercicioAtualIndex ?? 0,
            serieAtualIndex: dados.serieAtualIndex ?? 0,
            cronometroGeralSegundos: (dados as { cronometroGeralSegundos?: number }).cronometroGeralSegundos ?? 0,
          })
        })
        return
      }

      if (!state.iniciado) {
        state.restaurarDeExterno(dados)
        return
      }

      state.sincronizarEstadoExterno(dados)
    })

    return unsub
  }, [user, salvarSessaoCompleta, setSessaoAutoEncerrada])

  useEffect(() => {
    if (!iniciado || pausado) return
    const interval = setInterval(tickGeral, 1000)
    return () => clearInterval(interval)
  }, [iniciado, pausado, tickGeral])

  if (loadingAuth) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg relative overflow-x-hidden">
      <SyncIndicator />
      <AutoEncerradoBanner />
      <main className="flex-1 overflow-y-auto pt-[env(safe-area-inset-top,0)]">
        <div className="pt-4 py-2">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-center"
        richColors
        visibleToasts={1}
        className="toast-above-nav"
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
