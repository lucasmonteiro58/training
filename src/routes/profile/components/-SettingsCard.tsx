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
  Calendar,
} from 'lucide-react'

interface SettingsCardProps {
  notificationsEnabled: boolean
  onNotifToggle: () => void
  onExportClick: () => void
}

export function SettingsCard({
  notificationsEnabled,
  onNotifToggle,
  onExportClick,
}: SettingsCardProps) {
  const Separator = () => (
    <div className="mx-4 h-px bg-border opacity-20" />
  )

  return (
    <div className="card p-1 mb-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <p className="text-xs font-bold text-text-muted px-4 py-3 uppercase tracking-wider">
        Account & Features
      </p>

      <Link
        to="/history"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
          <History size={18} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Workout History</p>
          <p className="text-xs text-text-muted mt-0.5">View all your past workouts</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </Link>

      <Separator />

      <Link
        to="/profile/progress"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center">
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Weight Progress</p>
          <p className="text-xs text-text-muted mt-0.5">Progress charts per exercise</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </Link>

      <Separator />

      <Link
        to="/profile/measurements"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
          <Ruler size={18} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Body Measurements</p>
          <p className="text-xs text-text-muted mt-0.5">Track weight, body fat and circumferences</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </Link>

      <Separator />

      <Link
        to="/profile/optional-days"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
          <Calendar size={18} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Optional workout days</p>
          <p className="text-xs text-text-muted mt-0.5">
            Days you can skip without losing the sequence
          </p>
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
            notificationsEnabled ? 'bg-[rgba(245,158,11,0.12)]' : 'bg-surface-2'
          }`}
        >
          {notificationsEnabled ? (
            <Bell size={18} className="text-amber-400" />
          ) : (
            <BellOff size={18} className="text-text-muted" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Workout Notifications</p>
          <p className="text-xs text-text-muted mt-0.5">
            {notificationsEnabled ? 'Tap to disable' : 'Tap to enable'}
          </p>
        </div>
        <div
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            notificationsEnabled ? 'bg-amber-400' : 'bg-border-strong'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              notificationsEnabled ? 'left-5' : 'left-0.5'
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
          <p className="text-sm font-medium text-text">Export Data</p>
          <p className="text-xs text-text-muted mt-0.5">History as CSV, plans and sessions as JSON</p>
        </div>
        <ChevronRight size={16} className="text-text-subtle" />
      </button>

      <div className="mx-4 h-px bg-border" />

      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
          <Info size={18} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Training</p>
          <p className="text-xs text-text-muted mt-0.5">Versão 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
