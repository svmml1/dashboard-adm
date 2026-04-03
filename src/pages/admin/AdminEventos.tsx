import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, type AdminDashboardEvento } from '@/services/adminService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/PageLoader'
import { Loader2, Search, TrendingUp, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import useMainStore from '@/stores/main'

export default function AdminEventos() {
  const navigate = useNavigate()
  const { loadSales } = useMainStore()
  const [eventos, setEventos] = useState<AdminDashboardEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminService.getAllEventos()
      .then(setEventos)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    eventos.filter((e) =>
      e.nome.toLowerCase().includes(search.toLowerCase())
    ), [eventos, search])

  const handleVerVendas = (e: AdminDashboardEvento) => {
    loadSales(e.eventId)
    navigate('/admin/vendas')
  }

  return (
    <PageLoader>
      <div className="space-y-4">
        <div className="hidden md:flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Todos os Eventos</h2>
          <p className="text-muted-foreground text-sm">Visualize e gerencie todos os eventos cadastrados.</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar evento ou local..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando eventos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum evento encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((evento) => (
              <Card key={evento.eventId} className="flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-tight">{evento.nome}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{evento.totalTransacoes} transações</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    <span>Líquido: {formatCurrency(evento.totalLiquido)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span>Bruto: {formatCurrency(evento.totalBruto)}</span>
                    <span className="ml-auto">Taxa: {formatCurrency(evento.taxa)}</span>
                  </div>
                </CardContent>
                <div className="px-6 pb-4">
                  <Button className="w-full" size="sm" onClick={() => handleVerVendas(evento)}>
                    Ver Vendas
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLoader>
  )
}
