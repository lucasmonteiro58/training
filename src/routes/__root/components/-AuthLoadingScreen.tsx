export function AuthLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center animate-pulse">
          <img src="/icon.png" alt="Logo" className="w-14 h-14 rounded-xl" />
        </div>
        <p className="text-text-muted text-sm">Carregando...</p>
      </div>
    </div>
  )
}
