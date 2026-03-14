import { User } from 'lucide-react'

interface PerfilHeaderProps {
  photoURL?: string | null
  displayName?: string | null
  email?: string | null
}

export function PerfilHeader({ photoURL, displayName, email }: PerfilHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6 animate-fade-up">
      {photoURL ? (
        <img
          src={photoURL}
          alt="Foto de perfil"
          className="w-16 h-16 rounded-2xl object-cover border-2 border-border"
        />
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-accent-subtle flex items-center justify-center border-2 border-border">
          <User size={28} className="text-accent" />
        </div>
      )}
      <div>
        <p className="text-xl font-bold text-text">{displayName ?? 'Atleta'}</p>
        <p className="text-sm text-text-muted mt-0.5">{email}</p>
      </div>
    </div>
  )
}
