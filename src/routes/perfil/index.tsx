import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useHistoricoStore, usePlanosStore } from '../../stores'
import { formatarTempo, solicitarPermissaoNotificacao, getNotifAtivas, setNotifAtivas } from '../../lib/notifications'
import { LogOut, User, Dumbbell, History, TrendingUp, Bell, BellOff, Info, ChevronRight, AlertTriangle, Download, Ruler } from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { exportarSessoesCSV, exportarSessoesJSON, exportarPlanosJSON } from '../../lib/exportar'
import { calcularStreaks, calcularConquistas } from '../../lib/streaks'

export const Route = createFileRoute('/perfil/')({
  component: PerfilPage,
})

function PerfilPage() {
  const { user, logout } = useAuth()
  const planos = usePlanosStore((s) => s.planos)
  const sessoes = useHistoricoStore((s) => s.sessoes)
  const [notifPermitida, setNotifPermitida] = useState(() => getNotifAtivas())
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const streaks = useMemo(() => calcularStreaks(sessoes), [sessoes])
  const conquistas = useMemo(() => calcularConquistas(sessoes, streaks), [sessoes, streaks])
  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada)
  const conquistasBloqueadas = conquistas.filter(c => !c.desbloqueada)

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

      {/* Conquistas */}
      <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '75ms' }}>
        <p className="text-xs font-bold text-[var(--color-text-muted)] mb-3">
          CONQUISTAS ({conquistasDesbloqueadas.length}/{conquistas.length})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {conquistas.map(c => (
            <div
              key={c.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                c.desbloqueada ? '' : 'opacity-30 grayscale'
              }`}
              title={`${c.nome}: ${c.descricao}`}
            >
              <span className="text-2xl">{c.icone}</span>
              <span className="text-[9px] font-semibold text-[var(--color-text-muted)] text-center leading-tight">{c.nome}</span>
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

        <Link to="/perfil/medidas" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors text-left" style={{ textDecoration: 'none' }}>
          <div className="w-9 h-9 rounded-xl bg-[rgba(99,102,241,0.12)] flex items-center justify-center">
            <Ruler size={18} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Medidas Corporais</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Acompanhe peso, gordura e circunferências</p>
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

        <div className="mx-4 h-px bg-[var(--color-border)] opacity-20" />

        <button
          onClick={() => setShowExportMenu(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-2)] rounded-xl transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center">
            <Download size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Exportar Dados</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Histórico em CSV, planos e sessões em JSON</p>
          </div>
          <ChevronRight size={16} className="text-[var(--color-text-subtle)]" />
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
      <button onClick={() => setShowLogoutConfirm(true)}
        className="btn-danger w-full animate-fade-up" style={{ animationDelay: '150ms' }}>
        <LogOut size={16} />
        Sair da Conta
      </button>

      <p className="text-center text-xs text-[var(--color-text-subtle)] mt-4 mb-2">
        Seus dados estão sincronizados com o Firebase 🔒
      </p>

      {/* Modal de Exportação */}
      {showExportMenu && (
        <div className="modal-overlay" onClick={() => setShowExportMenu(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Exportar Dados</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { exportarSessoesCSV(sessoes); setShowExportMenu(false); toast.success('Histórico exportado em CSV!') }}
                disabled={sessoes.length === 0}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] transition-colors text-left disabled:opacity-40"
              >
                <Download size={18} className="text-emerald-400" />
                <div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">Histórico (CSV)</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Planilha com todas as séries de todas as sessões</p>
                </div>
              </button>
              <button
                onClick={() => { exportarSessoesJSON(sessoes); setShowExportMenu(false); toast.success('Histórico exportado em JSON!') }}
                disabled={sessoes.length === 0}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] transition-colors text-left disabled:opacity-40"
              >
                <Download size={18} className="text-blue-400" />
                <div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">Sessões (JSON)</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Dados completos das sessões de treino</p>
                </div>
              </button>
              <button
                onClick={() => { exportarPlanosJSON(planos); setShowExportMenu(false); toast.success('Planos exportados em JSON!') }}
                disabled={planos.length === 0}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] transition-colors text-left disabled:opacity-40"
              >
                <Download size={18} className="text-purple-400" />
                <div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">Planos (JSON)</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Todos os planos de treino com exercícios</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Logout */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-[var(--color-warning)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Sair da Conta?</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">
              Você precisará fazer login novamente para acessar seus treinos.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  logout()
                }}
                className="btn-danger w-full py-4 text-base"
              >
                <LogOut size={16} />
                Sim, Sair
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-ghost w-full py-3"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
