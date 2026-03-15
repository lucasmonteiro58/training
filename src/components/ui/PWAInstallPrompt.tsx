import { useState, useEffect } from 'react'
import { Share, PlusSquare, X, Download } from 'lucide-react'

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // 1. Verificar se já foi fechado ou instalado nesta sessão
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (isDismissed || isStandalone) return

    // 2. Detectar plataforma
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIos) {
      setPlatform('ios')
      // Mostrar após um pequeno delay para não impactar o LCP
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    } else if (isAndroid) {
      setPlatform('android')
    }

    // 3. Capturar evento de instalação do Chrome/Android
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Mostrar após um pequeno delay
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShow(false)
      localStorage.setItem('pwa_prompt_dismissed', 'true')
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (!show) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-70 w-[calc(100%-2rem)] max-w-sm"
      style={{ bottom: `calc(100px + env(safe-area-inset-bottom, 0px))` }}
    >
      <div className="card p-5 border border-accent /20 bg-surface/80 backdrop-blur-xl shadow-2xl animate-fade-up">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={16} className="text-text-muted" />
        </button>

        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
            <img src="/icon.png" alt="App Icon" className="w-10 h-10" onError={(e) => {
               // Fallback if icon doesn't exist
               e.currentTarget.style.display = 'none'
               e.currentTarget.parentElement!.innerHTML = '<span class="text-white text-2xl font-bold">T</span>'
            }} />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-bold text-text">Instale o Training</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Adicione à sua tela de início para ter acesso rápido e offline, como um aplicativo nativo.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {platform === 'ios' ? (
            <div className="bg-accent/5 rounded-xl p-3 border border-accent /10">
              <p className="text-[11px] text-text-muted flex flex-wrap items-center gap-1.5 leading-tight">
                Toque em <Share size={14} className="text-accent" />
                depois role para baixo e toque em
                <span className="inline-flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-accent /20 font-semibold text-text">
                  <PlusSquare size={12} /> Adicionar à Tela de Início
                </span>
              </p>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="btn-primary w-full py-3 text-sm font-bold shadow-[0_10px_20px_-5px_var(--color-accent-glow)]"
            >
              <Download size={18} />
              Instalar Agora
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
