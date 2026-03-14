import { Link } from '@tanstack/react-router'
import {
  History,
  TrendingUp,
  Ruler,
  Bell,
  BellOff,
  Download,
  Info,
  ChevronRight,
} from 'lucide-react'

interface ConfiguracoesCardProps {
  notifPermitida: boolean
  onNotifToggle: () => void
  onExportClick: () => void
}

export function ConfiguracoesCard({
  notifPermitida,
  onNotifToggle,
  onExportClick,
}: ConfiguracoesCardProps) {
  const Separator = () => (
    <div className="mx-4 h-px bg-[var(--color-border)] opacity-20" />
  )

  return (
    <div className="card p-1 mb-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <p className="text-xs font-bold text-text-muted px-4 py-3 uppercase tracking-wider">
        Conta e Recursos
      </p>

      <Link
        to="/historico"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <History size={18} className="text-[var(--color-accent)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Histórico de Treinos</p>
          <p className="text-xs text-text-muted mt-0.5">Veja todos os seus treinos passados</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </Link>

      <Separator />

      <Link
        to="/perfil/evolucao"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center">
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Evolução de Peso</p>
          <p className="text-xs text-text-muted mt-0.5">Gráficos de progresso por exercício</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </Link>

      <Separator />

      <Link
        to="/perfil/medidas"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-[rgba(99,102,241,0.12)] flex items-center justify-center">
          <Ruler size={18} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Medidas Corporais</p>
          <p className="text-xs text-text-muted mt-0.5">Acompanhe peso, gordura e circunferências</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </Link>

      <Separator />

      <button
        type="button"
        onClick={onNotifToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            notifPermitida ? 'bg-[rgba(245,158,11,0.12)]' : 'bg-surface-2'
          }`}
        >
          {notifPermitida ? (
            <Bell size={18} className="text-amber-400" />
          ) : (
            <BellOff size={18} className="text-text-muted" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Notificações de Treino</p>
          <p className="text-xs text-text-muted mt-0.5">
            {notifPermitida ? 'Toque para desativar' : 'Toque para ativar'}
          </p>
        </div>
        <div
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
            notifPermitida ? 'bg-amber-400' : 'bg-[var(--color-border-strong)]'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              notifPermitida ? 'left-5' : 'left-0.5'
            }`}
          />
        </div>
      </button>

      <Separator />

      <button
        type="button"
        onClick={onExportClick}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center">
          <Download size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Exportar Dados</p>
          <p className="text-xs text-text-muted mt-0.5">Histórico em CSV, planos e sessões em JSON</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </button>

      <div className="mx-4 h-px bg-[var(--color-border)]" />

      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <Info size={18} className="text-[var(--color-accent)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Training</p>
          <p className="text-xs text-text-muted mt-0.5">Versão 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
