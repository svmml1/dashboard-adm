import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MainProvider } from '@/stores/main'
import { InstallPrompt } from '@/components/InstallPrompt'

import Index from './pages/Index'
import Login from './pages/Login'
import Sales from './pages/Sales'
import Withdrawals from './pages/Withdrawals'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AdminEventos from './pages/admin/AdminEventos'
import AdminSaques from './pages/admin/AdminSaques'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <MainProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <Routes>
          <Route element={<Layout />}>
            {/* Organizador routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/vendas" element={<Sales />} />
            <Route path="/saques" element={<Withdrawals />} />
            {/* Admin routes */}
            <Route path="/admin/eventos" element={<AdminEventos />} />
            <Route path="/admin/vendas" element={<Sales />} />
            <Route path="/admin/saques" element={<AdminSaques />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </MainProvider>
  </BrowserRouter>
)

export default App
