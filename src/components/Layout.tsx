import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { BottomNav } from './BottomNav'
import useMainStore from '@/stores/main'
import { Bell, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/vendas': 'Vendas',
  '/saques': 'Saques',
  '/admin/eventos': 'Eventos',
  '/admin/vendas': 'Vendas',
  '/admin/saques': 'Saques',
}

export default function Layout() {
  const { user } = useMainStore()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (user && location.pathname === '/login') {
    return <Navigate to={isAdmin ? '/admin/eventos' : '/'} replace />
  }

  if (!user) {
    return (
      <main className="flex flex-col min-h-screen">
        <Outlet />
      </main>
    )
  }

  // Redirect admin away from organizer-only routes
  if (isAdmin && ['/', '/vendas', '/saques'].includes(location.pathname)) {
    return <Navigate to="/admin/eventos" replace />
  }

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard ADM'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile header — shown only on mobile */}
        <header className="md:hidden flex flex-col bg-background border-b sticky top-0 z-30">
          {/* safe-area top spacer */}
          <div style={{ height: 'env(safe-area-inset-top)' }} />
          {/* actual header row */}
          <div className="flex h-14 items-center justify-between px-4">
            <span className="font-bold text-lg text-foreground">{pageTitle}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop header — shown only on desktop */}
        <header className="hidden md:flex h-14 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="font-semibold text-base">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
              <span>{user.name}</span>
            </div>
          </div>
        </header>

        <main
          className="flex-1 p-4 md:p-8 bg-muted/30 md:bg-background overflow-x-hidden"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
