import { Link, useMatchRoute } from '@tanstack/react-router'
import { Home, Dumbbell, Zap, BookOpen, User } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Início', icon: Home, exact: true },
  { to: '/treinos', label: 'Treinos', icon: Dumbbell, exact: false },
  { to: '/treino-ativo', label: 'Treinar', icon: Zap, exact: false },
  { to: '/exercicios', label: 'Exercícios', icon: BookOpen, exact: false },
  { to: '/perfil', label: 'Perfil', icon: User, exact: false },
]

export function BottomNav() {
  const matchRoute = useMatchRoute()

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2 max-w-[480px] mx-auto">
        {navItems.map((item) => {
          const isActive = matchRoute({ to: item.to, fuzzy: !item.exact })
          const isTreinar = item.to === '/treino-ativo'

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isTreinar
                  ? `relative bg-accent text-white rounded-2xl px-5 py-3 -mt-4 shadow-lg ${
                      isActive ? 'scale-105 shadow-[0_0_20px_var(--color-accent-glow)]' : ''
                    } hover:bg-accent-hover active:scale-95`
                  : isActive
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <item.icon size={isTreinar ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-[10px] font-medium ${isTreinar ? 'font-semibold' : ''}`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
