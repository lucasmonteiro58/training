import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { BottomNav } from '../components/layout/BottomNav'
import { useActiveWorkoutStore } from '../stores'
import { registrarServiceWorker } from '../lib/notifications'
import { FloatingWorkoutButton } from '../components/layout/FloatingWorkoutButton'
import { Toaster } from 'sonner'
import { PWAInstallPrompt } from '../components/ui/PWAInstallPrompt'
import { useAuth as useAuthHook } from '../hooks/useAuth'
import { useWorkoutProgressSync } from '../hooks/useWorkoutProgressSync'
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
  const { iniciado, pausado, tickGeral } = useActiveWorkoutStore()

  useWorkoutProgressSync(user)

  useEffect(() => {
    if (import.meta.env.DEV && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister())
      })
    }
    registrarServiceWorker()
  }, [])

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
