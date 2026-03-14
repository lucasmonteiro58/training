import { usePendingSyncCount, useOnlineStatus, useQueuedWriteCount } from '../../../lib/syncQueue'

export function SyncIndicator() {
  const pending = usePendingSyncCount()
  const online = useOnlineStatus()
  const queued = useQueuedWriteCount()

  if (!online) {
    return (
      <div className="fixed top-[max(env(safe-area-inset-top,0px),8px)] left-1/2 -translate-x-1/2 z-100 flex items-center gap-1.5 bg-surface border border-amber-500/30 px-3 py-1.5 rounded-full shadow-lg animate-scale-in">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
        <span className="text-[11px] font-medium text-amber-400">
          Offline{queued > 0 ? ` · ${queued} pendente${queued > 1 ? 's' : ''}` : ''}
        </span>
      </div>
    )
  }

  if (pending === 0) return null
  return (
    <div className="fixed top-[max(env(safe-area-inset-top,0px),8px)] left-1/2 -translate-x-1/2 z-100 flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 rounded-full shadow-lg animate-scale-in">
      <span className="animate-spin inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full" />
      <span className="text-[11px] font-medium text-text-muted">
        Sincronizando{pending > 1 ? ` (${pending})` : ''}
      </span>
    </div>
  )
}
