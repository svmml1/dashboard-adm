import { Link, useLocation } from 'react-router-dom'
import { Home, Ticket, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/vendas', icon: Ticket, label: 'Vendas' },
  { to: '/saques', icon: Wallet, label: 'Saques' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
