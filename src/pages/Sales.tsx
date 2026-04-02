import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import useMainStore, { Sale } from '@/stores/main'
import { Download, Search, Ticket } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/PageLoader'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pago':
      return 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
    case 'Pendente':
      return 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
    case 'Cancelado':
      return 'bg-slate-300 hover:bg-slate-400 text-slate-800 border-transparent'
    default:
      return 'bg-primary text-primary-foreground'
  }
}

export default function Sales() {
  const { sales } = useMainStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const { toast } = useToast()

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.competitor.toLowerCase().includes(search.toLowerCase()) || s.cpf.includes(search)
      const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [sales, search, statusFilter])

  const handleExport = () => {
    toast({ title: 'Exportando relatório...', description: 'O download (CSV) começará em breve.' })
  }

  return (
    <PageLoader>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendas de Senhas</h2>
            <p className="text-muted-foreground">
              Acompanhe todas as senhas vendidas e gerencie status.
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" className="shrink-0 shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
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
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Competidor</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center animate-in fade-in">
                          <Ticket className="h-12 w-12 text-muted-foreground/30 mb-3" />
                          Nenhuma venda encontrada para os filtros aplicados.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="cursor-pointer hover:bg-muted/60 transition-colors"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <TableCell className="font-medium">{sale.competitor}</TableCell>
                        <TableCell className="text-muted-foreground">{sale.cpf}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sale.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(sale.date)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(sale.value)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
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
              <SheetDescription>Pedido {selectedSale?.id}</SheetDescription>
            </SheetHeader>
            {selectedSale && (
              <div className="mt-6 space-y-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Status do Pagamento
                  </div>
                  <div>
                    <Badge className={getStatusColor(selectedSale.status)}>
                      {selectedSale.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Valor</div>
                    <div className="font-mono text-xl font-semibold">
                      {formatCurrency(selectedSale.value)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Data da Compra</div>
                    <div className="text-sm">{formatDate(selectedSale.date)}</div>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium flex items-center gap-2">Dados do Competidor</h4>
                  <div className="grid gap-3 bg-muted/30 p-4 rounded-lg border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Nome Completo</span>
                      <span className="font-medium text-sm text-right">
                        {selectedSale.competitor}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">CPF</span>
                      <span className="font-medium text-sm">{selectedSale.cpf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Categoria</span>
                      <span className="font-medium text-sm">{selectedSale.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PageLoader>
  )
}
