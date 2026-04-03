import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Home, Ticket, Wallet, LogOut, CalendarDays, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useMainStore from '@/stores/main'

export function AppSidebar() {
  const location = useLocation()
  const { logout, user } = useMainStore()
  const isAdmin = user?.role === 'admin'

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <span className="font-bold text-xl flex items-center gap-2 text-foreground">
          <Ticket className="h-6 w-6 text-primary" />
          Vaquejadapro
        </span>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {isAdmin ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/admin/eventos'}>
                  <Link to="/admin/eventos">
                    <CalendarDays /> <span>Eventos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/admin/vendas'}>
                  <Link to="/admin/vendas">
                    <Ticket /> <span>Vendas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/admin/saques'}>
                  <Link to="/admin/saques">
                    <CreditCard /> <span>Saques</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                  <Link to="/">
                    <Home /> <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/vendas'}>
                  <Link to="/vendas">
                    <Ticket /> <span>Vendas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/saques'}>
                  <Link to="/saques">
                    <Wallet /> <span>Solicitar Saque</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {isAdmin && (
          <p className="text-xs text-muted-foreground mb-2 px-1">
            Logado como <span className="font-semibold text-primary">Admin</span>
          </p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
