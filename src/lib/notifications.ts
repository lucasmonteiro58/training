let swRegistration: ServiceWorkerRegistration | null = null
let audioContext: AudioContext | null = null

const NOTIF_PREF_KEY = 'training_notif_ativas'

// ─── Preferências ─────────────────────────────────────────────────────────────

export function getNotificationsEnabled(): boolean {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false
  return localStorage.getItem(NOTIF_PREF_KEY) !== 'false'
}

export function setNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem(NOTIF_PREF_KEY, enabled ? 'true' : 'false')
}

// ─── Service Worker ───────────────────────────────────────────────────────────

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  // Em desenvolvimento o SW pode cachear HTML/CSS e deixar a página sem estilos
  // até limpar o cache; só registramos em produção.
  if (import.meta.env.DEV) return
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js')
    console.log('SW registrado:', swRegistration.scope)
  } catch (err) {
    console.error('Erro ao registrar SW:', err)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ─── Detecção de plataforma ───────────────────────────────────────────────────

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
}

// ─── Audio alert (Web Audio API — funciona em iOS PWA) ────────────────────────

function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    return audioContext
  } catch {
    return null
  }
}

export function playRestAlert(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  // Resume AudioContext se estiver suspenso (exigência de iOS)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const now = ctx.currentTime

  // Beep 1
  playBeep(ctx, 880, now, 0.15)
  // Pausa
  // Beep 2
  playBeep(ctx, 880, now + 0.25, 0.15)
  // Pausa
  // Beep 3 (mais alto, tom mais alto)
  playBeep(ctx, 1100, now + 0.5, 0.2)
}

function playBeep(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.3, startTime)
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration)
}

export function prepareAudio(): void {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

// ─── Vibração ─────────────────────────────────────────────────────────────────

export function vibrateRestEnd(): void {
  if (!('vibrate' in navigator)) return
  navigator.vibrate([300, 150, 300, 150, 400])
}

// ─── Notificações via SW ──────────────────────────────────────────────────────

export function sendWorkoutNotification(
  title: string,
  body: string,
  tag = 'training-workout'
): void {
  if (!getNotificationsEnabled()) return
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({
    type: 'WORKOUT_NOTIFICATION',
    payload: { title, body, tag },
  })
}

export function scheduleRestNotification(
  seconds: number,
  exerciseName?: string
): void {
  if (!getNotificationsEnabled()) return
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({
    type: 'SCHEDULE_REST_END',
    payload: { seconds, exerciseName },
  })
}

export function cancelRestNotification(): void {
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({ type: 'CANCEL_REST_END' })
}

export function clearWorkoutNotifications(): void {
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({ type: 'CLEAR_NOTIFICATIONS' })
}

/**
 * Registra listener para mensagens do SW (ex: REST_ENDED).
 * Retorna função de cleanup.
 */
export function onSwMessage(callback: (msg: any) => void): () => void {
  if (!('serviceWorker' in navigator)) return () => {}
  const handler = (event: MessageEvent) => callback(event.data)
  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
