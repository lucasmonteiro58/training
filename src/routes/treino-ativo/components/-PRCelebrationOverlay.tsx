export function PRCelebrationOverlay() {
  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center pointer-events-none">
      <div className="animate-celebration-pulse text-center">
        <span className="text-7xl block mb-2">🏆</span>
        <span className="text-xl font-black text-accent">NOVO PR!</span>
      </div>
    </div>
  )
}
