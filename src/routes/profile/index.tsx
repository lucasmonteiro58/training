import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useHistoryStore, usePlansStore } from '../../stores'
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
  requestNotificationPermission,
} from '../../lib/notifications'
import { LogOut } from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { calculateStreaks, calculateAchievements } from '../../lib/streaks'

function parseOptionalDays(): number[] {
  try {
    const v = localStorage.getItem('diasOpcionais')
    if (!v) return []
    const arr = JSON.parse(v) as unknown
    return Array.isArray(arr) ? arr.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6) : []
  } catch {
    return []
  }
}
import { ProfileHeader } from './components/-ProfileHeader'
import { ProfileStats } from './components/-ProfileStats'
import { AchievementsCard } from './components/-AchievementsCard'
import { SettingsCard } from './components/-SettingsCard'
import { ExportModal } from './components/-ExportModal'
import { LogoutConfirmModal } from './components/-LogoutConfirmModal'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, logout } = useAuth()
  const plans = usePlansStore((s) => s.plans)
  const sessions = useHistoryStore((s) => s.sessions)
  const [notificationsEnabled, setNotificationsEnabledState] = useState(() => getNotificationsEnabled())
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const streaks = useMemo(
    () => calculateStreaks(sessions, 4, parseOptionalDays()),
    [sessions]
  )
  const achievements = useMemo(() => calculateAchievements(sessions, streaks), [sessions, streaks])

  const totalDuration = sessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
  const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0)

  const handleNotificationToggle = async () => {
    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'denied'

    if (permission === 'granted' && notificationsEnabled) {
      setNotificationsEnabled(false)
      setNotificationsEnabledState(false)
      toast.success('Notificações desativadas.')
      return
    }

    if (permission === 'granted' && !notificationsEnabled) {
      setNotificationsEnabled(true)
      setNotificationsEnabledState(true)
      toast.success('Notificações reativadas!')
      return
    }

    if (permission === 'denied') {
      toast.error('Permissão bloqueada pelo navegador. Acesse as configurações do site para reativar.')
      return
    }

    const ok = await requestNotificationPermission()
    if (ok) {
      setNotificationsEnabled(true)
      setNotificationsEnabledState(true)
      toast.success('Notificações ativadas! Você receberá alertas durante o treino.')
    } else {
      toast.error('Permissão negada. Ative nas configurações do seu navegador.')
    }
  }

  return (
    <div className="page-container pt-6">
      <ProfileHeader
        photoURL={user?.photoURL}
        displayName={user?.displayName}
        email={user?.email}
      />

      <ProfileStats
        totalTreinos={sessions.length}
        totalPlanos={plans.length}
        volumeTotal={totalVolume}
        tempoTotal={totalDuration}
      />

      <AchievementsCard achievements={achievements} />

      <SettingsCard
        notifPermitida={notificationsEnabled}
        onNotifToggle={handleNotificationToggle}
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
          sessions={sessions}
          plans={plans}
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
