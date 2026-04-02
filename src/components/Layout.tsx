import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { BottomNav } from './BottomNav'
import useMainStore from '@/stores/main'
import { Bell, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const { user } = useMainStore()
  const location = useLocation()

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  if (!user) {
    return (
      <main className="flex flex-col min-h-screen">
        <Outlet />
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6 bg-background sticky top-0 z-30"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <h1 className="font-semibold text-base md:text-lg">Dashboard ADM</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
          </div>
        </header>
        <main
          className="flex-1 p-4 md:p-8 bg-background overflow-x-hidden"
          style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
