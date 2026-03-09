import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useHistoricoStore, usePlanosStore } from '../../stores'
import { formatarTempo, solicitarPermissaoNotificacao, getNotifAtivas, setNotifAtivas } from '../../lib/notifications'
import { LogOut, User, Dumbbell, History, TrendingUp, Bell, BellOff, Info, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/perfil/')({
  component: PerfilPage,
})

function PerfilPage() {
  const { user, logout } = useAuth()
  const planos = usePlanosStore((s) => s.planos)
  const sessoes = useHistoricoStore((s) => s.sessoes)
  const [notifPermitida, setNotifPermitida] = useState(() => getNotifAtivas())

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

  const totalDuracao = sessoes.reduce((sum, s) => sum + (s.duracaoSegundos ?? 0), 0)
  const totalVolume = sessoes.reduce((sum, s) => sum + (s.volumeTotal ?? 0), 0)

  return (
    <div className="page-container pt-6">
      {/* Perfil header */}
      <div className="flex items-center gap-4 mb-6 animate-fade-up">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Foto de perfil"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--color-border)]" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-subtle)] flex items-center justify-center border-2 border-[var(--color-border)]">
            <User size={28} className="text-[var(--color-accent)]" />
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-[var(--color-text)]">{user?.displayName ?? 'Atleta'}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <p className="text-xs font-bold text-[var(--color-text-muted)] mb-3">ESTATÍSTICAS GERAIS</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: History, label: 'Total de Treinos', value: sessoes.length },
            { icon: Dumbbell, label: 'Planos Criados', value: planos.length },
            { icon: TrendingUp, label: 'Volume Total (kg)', value: Math.round(totalVolume).toLocaleString('pt-BR') },
            { icon: null, label: 'Tempo Total', value: formatarTempo(totalDuracao) },
          ].map((stat, i) => (
            <div key={i} className="bg-[var(--color-surface-2)] rounded-xl p-3">
              <p className="text-xl font-bold text-[var(--color-text)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações */}
      <div className="card p-1 mb-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <p className="text-xs font-bold text-[var(--color-text-muted)] px-4 py-3 uppercase tracking-wider">Conta e Recursos</p>

        <Link to="/historico" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors text-left" style={{ textDecoration: 'none' }}>
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center">
            <History size={18} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Histórico de Treinos</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Veja todos os seus treinos passados</p>
          </div>
          <History size={16} className="text-[var(--color-text-subtle)]" />
        </Link>

        <div className="mx-4 h-px bg-[var(--color-border)] opacity-20" />

        <Link to="/perfil/evolucao" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors text-left" style={{ textDecoration: 'none' }}>
          <div className="w-9 h-9 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center">
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Evolução de Peso</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Gráficos de progresso por exercício</p>
          </div>
          <ChevronRight size={16} className="text-[var(--color-text-subtle)]" />
        </Link>

        <div className="mx-4 h-px bg-[var(--color-border)] opacity-20" />

        <button onClick={handleNotif}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors text-left">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${notifPermitida ? 'bg-[rgba(245,158,11,0.12)]' : 'bg-[var(--color-surface-2)]'}`}>
            {notifPermitida
              ? <Bell size={18} className="text-amber-400" />
              : <BellOff size={18} className="text-[var(--color-text-muted)]" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Notificações de Treino</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {notifPermitida ? 'Toque para desativar' : 'Toque para ativar'}
            </p>
          </div>
          {/* Toggle switch */}
          <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
            notifPermitida ? 'bg-amber-400' : 'bg-[var(--color-border-strong)]'
          }`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              notifPermitida ? 'left-5' : 'left-0.5'
            }`} />
          </div>
        </button>

        <div className="mx-4 h-px bg-[var(--color-border)]" />

        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center">
            <Info size={18} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Training</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Versão 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="btn-danger w-full animate-fade-up" style={{ animationDelay: '150ms' }}>
        <LogOut size={16} />
        Sair da Conta
      </button>

      <p className="text-center text-xs text-[var(--color-text-subtle)] mt-4 mb-2">
        Seus dados estão sincronizados com o Firebase 🔒
      </p>
    </div>
  )
}
