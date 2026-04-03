import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/adminService'
import type { Evento } from '@/services/salesService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/PageLoader'
import { Loader2, Search, CalendarDays, MapPin, Ticket } from 'lucide-react'
import useMainStore from '@/stores/main'

function formatTimestamp(ts: { _seconds: number; _nanoseconds: number } | string | undefined) {
  if (!ts) return '—'
  const date = typeof ts === 'object' && '_seconds' in ts
    ? new Date(ts._seconds * 1000)
    : new Date(ts as string)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

export default function AdminEventos() {
  const navigate = useNavigate()
  const { loadSales } = useMainStore()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminService.getAllEventos()
      .then(setEventos)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    eventos.filter((e) =>
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.local.toLowerCase().includes(search.toLowerCase())
    ), [eventos, search])

  const handleVerVendas = (e: Evento) => {
    loadSales(e.id)
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
              <Card key={evento.id} className="flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{evento.nome}</CardTitle>
                    <Badge variant={evento.status === 'active' ? 'default' : 'secondary'} className="shrink-0 text-xs">
                      {evento.status === 'active' ? 'Ativo' : evento.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{evento.local}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {formatTimestamp(evento.startDate)} — {formatTimestamp(evento.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5 shrink-0" />
                    <span>Senha: R$ {evento.valorSenha?.toLocaleString('pt-BR') ?? '—'}</span>
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
