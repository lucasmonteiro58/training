import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useHistoryStore, usePlansStore } from '../../stores'
import { getNotifAtivas, setNotifAtivas, solicitarPermissaoNotificacao } from '../../lib/notifications'
import { LogOut } from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { calcularStreaks, calcularConquistas } from '../../lib/streaks'

function parseDiasOpcionais(): number[] {
  try {
    const v = localStorage.getItem('diasOpcionais')
    if (!v) return []
    const arr = JSON.parse(v) as unknown
    return Array.isArray(arr) ? arr.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6) : []
  } catch {
    return []
  }
}
import { PerfilHeader } from './components/-PerfilHeader'
import { PerfilStats } from './components/-PerfilStats'
import { ConquistasCard } from './components/-ConquistasCard'
import { ConfiguracoesCard } from './components/-ConfiguracoesCard'
import { ExportModal } from './components/-ExportModal'
import { LogoutConfirmModal } from './components/-LogoutConfirmModal'

export const Route = createFileRoute('/perfil/')({
  component: PerfilPage,
})

function PerfilPage() {
  const { user, logout } = useAuth()
  const planos = usePlansStore((s) => s.planos)
  const sessoes = useHistoryStore((s) => s.sessoes)
  const [notifPermitida, setNotifPermitida] = useState(() => getNotifAtivas())
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const streaks = useMemo(
    () => calcularStreaks(sessoes, 4, parseDiasOpcionais()),
    [sessoes]
  )
  const conquistas = useMemo(() => calcularConquistas(sessoes, streaks), [sessoes, streaks])

  const totalDuracao = sessoes.reduce((sum, s) => sum + (s.duracaoSegundos ?? 0), 0)
  const totalVolume = sessoes.reduce((sum, s) => sum + (s.volumeTotal ?? 0), 0)

  const handleNotif = async () => {
    const permissao = typeof Notification !== 'undefined' ? Notification.permission : 'denied'

    if (permissao === 'granted' && notifPermitida) {
      setNotifAtivas(false)
      setNotifPermitida(false)
      toast.success('Notificações desativadas.')
      return
    }

    if (permissao === 'granted' && !notifPermitida) {
      setNotifAtivas(true)
      setNotifPermitida(true)
      toast.success('Notificações reativadas!')
      return
    }

    if (permissao === 'denied') {
      toast.error('Permissão bloqueada pelo navegador. Acesse as configurações do site para reativar.')
      return
    }

    const ok = await solicitarPermissaoNotificacao()
    if (ok) {
      setNotifAtivas(true)
      setNotifPermitida(true)
      toast.success('Notificações ativadas! Você receberá alertas durante o treino.')
    } else {
      toast.error('Permissão negada. Ative nas configurações do seu navegador.')
    }
  }

  return (
    <div className="page-container pt-6">
      <PerfilHeader
        photoURL={user?.photoURL}
        displayName={user?.displayName}
        email={user?.email}
      />

      <PerfilStats
        totalTreinos={sessoes.length}
        totalPlanos={planos.length}
        volumeTotal={totalVolume}
        tempoTotal={totalDuracao}
      />

      <ConquistasCard conquistas={conquistas} />

      <ConfiguracoesCard
        notifPermitida={notifPermitida}
        onNotifToggle={handleNotif}
        onExportClick={() => setShowExportMenu(true)}
      />

      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="btn-danger w-full animate-fade-up"
        style={{ animationDelay: '150ms' }}
      >
        <LogOut size={16} />
        Sair da Conta
      </button>

      <p className="text-center text-xs text-text-subtle mt-4 mb-2">
        Seus dados estão sincronizados com o Firebase 🔒
      </p>

      {showExportMenu && (
        <ExportModal
          sessoes={sessoes}
          planos={planos}
          onClose={() => setShowExportMenu(false)}
          onExport={(msg) => toast.success(msg)}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={() => {
            setShowLogoutConfirm(false)
            logout()
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}
