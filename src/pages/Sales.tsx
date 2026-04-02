import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useMainStore from '@/stores/main'
import type { VendaDia } from '@/services/salesService'
import { Download, Search, Ticket, Loader2, TrendingUp, CheckCircle, Clock, BadgeDollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/PageLoader'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAGO':
    case 'CONFIRMADA':
      return 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
    case 'AGUARDANDO':
      return 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
    case 'EXPIRADO':
      return 'bg-slate-300 hover:bg-slate-400 text-slate-800 border-transparent'
    default:
      return 'bg-primary text-primary-foreground'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PAGO': return 'Pago'
    case 'CONFIRMADA': return 'Confirmada'
    case 'AGUARDANDO': return 'Aguardando'
    case 'EXPIRADO': return 'Expirado'
    default: return status
  }
}

const getMetodoLabel = (metodo: string) => {
  switch (metodo) {
    case 'PIX_EFI': return 'PIX'
    case 'BOLETO_EFI': return 'Boleto'
    case 'CREDIT_CARD': return 'Cartão'
    default: return metodo
  }
}

export default function Sales() {
  const { eventos, eventosLoading, salesReport, salesLoading, selectedEventId, loadSales } = useMainStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selectedSale, setSelectedSale] = useState<VendaDia | null>(null)
  const { toast } = useToast()

  const vendas = salesReport?.vendas ?? []

  const filteredSales = useMemo(() => {
    return vendas.filter((s) => {
      const matchesSearch = s.vaqueiro.toLowerCase().includes(search.toLowerCase()) ||
        String(s.senha).includes(search)
      const matchesStatus = statusFilter === 'Todos' || s.statusPagamento === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [vendas, search, statusFilter])

  const handleExport = () => {
    if (!filteredSales.length) return
    const header = 'Senha,Vaqueiro,Categoria,Dia,Valor,Status,Método'
    const rows = filteredSales.map((s) =>
      `${s.senha},"${s.vaqueiro}","${s.categoria}","${s.dia}",${s.valor},${s.statusPagamento},${s.metodoPagamento}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendas-${selectedEventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'CSV exportado com sucesso!' })
  }

  return (
    <PageLoader>
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold tracking-tight">Vendas de Senhas</h2>
            <p className="text-muted-foreground text-sm">Acompanhe todas as senhas vendidas.</p>
          </div>
          <Button onClick={handleExport} variant="outline" className="shrink-0 shadow-sm md:flex" disabled={!filteredSales.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>

        {/* Event selector */}
        <div className="flex items-center gap-3">
          {eventosLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando eventos...
            </div>
          ) : eventos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum evento encontrado.</p>
          ) : (
            <Select value={selectedEventId ?? ''} onValueChange={(v) => loadSales(v)}>
              <SelectTrigger className="w-full sm:w-[360px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {eventos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {salesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Summary cards */}
        {salesReport && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendas</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesReport.resumo.totalVendas}</div>
                <p className="text-xs text-muted-foreground">{salesReport.resumo.totalAguardando} aguardando</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pagas</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{salesReport.resumo.totalPagas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bruto</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesReport.resumo.totalArrecadadoBruto)}</div>
                <p className="text-xs text-muted-foreground">Taxa: {formatCurrency(salesReport.resumo.taxaPlataforma)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Líquido</CardTitle>
                <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(salesReport.resumo.totalLiquido)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por vaqueiro ou nº senha..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os Status</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                  <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                  <SelectItem value="EXPIRADO">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Senha</TableHead>
                    <TableHead>Vaqueiro</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Dia</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                          Carregando vendas...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center animate-in fade-in">
                          <Ticket className="h-12 w-12 text-muted-foreground/30 mb-3" />
                          {selectedEventId ? 'Nenhuma venda encontrada.' : 'Selecione um evento acima.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow
                        key={sale.paymentId}
                        className="cursor-pointer hover:bg-muted/60 transition-colors"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <TableCell className="font-mono font-bold">#{sale.senha}</TableCell>
                        <TableCell className="font-medium">{sale.vaqueiro}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sale.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">{sale.dia}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(sale.valor)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getMetodoLabel(sale.metodoPagamento)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sale.statusPagamento)}>
                            {getStatusLabel(sale.statusPagamento)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Sheet open={!!selectedSale} onOpenChange={(o) => !o && setSelectedSale(null)}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Detalhes da Venda</SheetTitle>
              <SheetDescription>Senha #{selectedSale?.senha} — {selectedSale?.paymentId}</SheetDescription>
            </SheetHeader>
            {selectedSale && (
              <div className="mt-6 space-y-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Status do Pagamento</div>
                  <Badge className={getStatusColor(selectedSale.statusPagamento)}>
                    {getStatusLabel(selectedSale.statusPagamento)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Valor</div>
                    <div className="font-mono text-xl font-semibold">{formatCurrency(selectedSale.valor)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Horário</div>
                    <div className="text-sm">{formatDate(selectedSale.horario)}</div>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Dados do Vaqueiro</h4>
                  <div className="grid gap-3 bg-muted/30 p-4 rounded-lg border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Nome</span>
                      <span className="font-medium text-sm text-right">{selectedSale.vaqueiro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Categoria</span>
                      <span className="font-medium text-sm">{selectedSale.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Dia</span>
                      <span className="font-medium text-sm capitalize">{selectedSale.dia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Método</span>
                      <span className="font-medium text-sm">{getMetodoLabel(selectedSale.metodoPagamento)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Cavalos</h4>
                  <div className="grid gap-3 bg-muted/30 p-4 rounded-lg border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Cavalo Puxa</span>
                      <span className="font-medium text-sm text-right">{selectedSale.cavaloPuxa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Cavalo Esteira</span>
                      <span className="font-medium text-sm text-right">{selectedSale.cavaloEsteira}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Haras</span>
                      <span className="font-medium text-sm text-right">{selectedSale.nomeEsteira}</span>
                    </div>
                  </div>
                </div>
                {selectedSale.pagamentoConfirmadoEm && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <Clock className="h-4 w-4" />
                    Pago em {formatDate(selectedSale.pagamentoConfirmadoEm)}
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PageLoader>
  )
}
