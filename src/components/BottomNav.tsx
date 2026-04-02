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
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', borderTop: '1px solid hsl(var(--border))' }}
    >
      <div className="flex h-16">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={cn(
                'flex items-center justify-center rounded-xl w-12 h-7 transition-all',
                active ? 'bg-primary/15' : ''
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-all',
                  active ? 'text-primary stroke-[2.5px]' : 'text-muted-foreground'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                active ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
