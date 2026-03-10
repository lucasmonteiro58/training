let swRegistration: ServiceWorkerRegistration | null = null
let audioContext: AudioContext | null = null

const NOTIF_PREF_KEY = 'training_notif_ativas'

// ─── Preferências ─────────────────────────────────────────────────────────────

export function getNotifAtivas(): boolean {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false
  return localStorage.getItem(NOTIF_PREF_KEY) !== 'false'
}

export function setNotifAtivas(ativo: boolean): void {
  localStorage.setItem(NOTIF_PREF_KEY, ativo ? 'true' : 'false')
}

// ─── Service Worker ───────────────────────────────────────────────────────────

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

/** Toca um beep duplo para sinalizar fim do descanso */
export function tocarAlertaDescanso(): void {
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

/**
 * Prepara o AudioContext com uma interação do usuário.
 * Chamar ao iniciar treino ou completar série (dentro de event handler).
 */
export function prepararAudio(): void {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

// ─── Vibração ─────────────────────────────────────────────────────────────────

/** Vibra o dispositivo (padrão forte para fim de descanso) */
export function vibrarDescansoFim(): void {
  if (!('vibrate' in navigator)) return
  navigator.vibrate([300, 150, 300, 150, 400])
}

// ─── Notificações via SW ──────────────────────────────────────────────────────

export function enviarNotificacaoTreino(
  titulo: string,
  corpo: string,
  tag = 'training-workout'
): void {
  if (!getNotifAtivas()) return
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({
    type: 'WORKOUT_NOTIFICATION',
    payload: { titulo, corpo, tag },
  })
}

/**
 * Agenda uma notificação no SW para quando o descanso terminar.
 * Funciona mesmo com a aba em background.
 */
export function agendarNotificacaoDescanso(
  segundos: number,
  exercicioNome?: string
): void {
  if (!getNotifAtivas()) return
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({
    type: 'SCHEDULE_REST_END',
    payload: { segundos, exercicioNome },
  })
}

/** Cancela a notificação agendada de fim de descanso (skip) */
export function cancelarNotificacaoDescanso(): void {
  if (!swRegistration?.active) return
  swRegistration.active.postMessage({ type: 'CANCEL_REST_END' })
}

export function limparNotificacoesTreino(): void {
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

export function formatarTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
