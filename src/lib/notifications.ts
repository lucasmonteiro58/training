let swRegistration: ServiceWorkerRegistration | null = null

export async function registrarServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js')
    console.log('SW registrado:', swRegistration.scope)
  } catch (err) {
    console.error('Erro ao registrar SW:', err)
  }
}

export async function solicitarPermissaoNotificacao(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function enviarNotificacaoTreino(
  titulo: string,
  corpo: string,
  tag = 'training-workout'
): void {
  if (!swRegistration?.active || Notification.permission !== 'granted') return
  swRegistration.active.postMessage({
    type: 'WORKOUT_NOTIFICATION',
    payload: { titulo, corpo, tag },
  })
}

export function limparNotificacoesTreino(): void {
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({ type: 'CLEAR_NOTIFICATIONS' })
}

export function formatarTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
