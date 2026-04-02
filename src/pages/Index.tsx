import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Wallet, Users, Ticket, TrendingUp, ArrowRight } from 'lucide-react'
import useMainStore from '@/stores/main'
import DashboardChart from '@/components/DashboardChart'
import { PageLoader } from '@/components/PageLoader'
import { formatCurrency } from '@/lib/utils'

export default function Index() {
  const { salesReport, salesLoading, walletSummary, walletLoading } = useMainStore()

  const totalSales = salesReport?.resumo.totalVendas ?? 0
  const confirmed = salesReport?.resumo.totalPagas ?? 0
  const totalBruto = salesReport?.resumo.totalArrecadadoBruto ?? 0
  const totalLiquido = salesReport?.resumo.totalLiquido ?? 0
  const recentSales = salesReport?.vendas.slice(0, 5) ?? []

  const saldoDisponivel = walletSummary?.saldoDisponivel ?? 0
  const isLoading = walletLoading || salesLoading

  return (
    <PageLoader>
      <div className="space-y-4">
        <div className="hidden md:flex flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-sm">Resumo do desempenho da sua vaquejada.</p>
          </div>
          <Button asChild className="shrink-0 shadow-md hover:shadow-lg transition-all group">
            <Link to="/saques">
              <Wallet className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />{' '}
              Solicitar Saque
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:-translate-y-1 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Vendas
              </CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <span className="text-muted-foreground text-base">...</span> : totalSales}
              </div>
              {salesReport && (
                <p className="text-xs text-amber-500 mt-1 font-medium">{salesReport.resumo.totalAguardando} aguardando pagamento</p>
              )}
            </CardContent>
          </Card>
          <Card className="hover:-translate-y-1 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Bruto
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {isLoading ? <span className="text-muted-foreground text-base">...</span> : formatCurrency(totalBruto)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Líquido: {formatCurrency(totalLiquido)}</p>
            </CardContent>
          </Card>
          <Card className="hover:-translate-y-1 transition-transform duration-200 border-primary shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Disponível
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {walletLoading ? <span className="text-muted-foreground text-base">...</span> : formatCurrency(saldoDisponivel)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pronto para saque</p>
            </CardContent>
          </Card>
          <Card className="hover:-translate-y-1 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmados
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <span className="text-muted-foreground text-base">...</span> : confirmed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalSales > 0 ? `${Math.round((confirmed / totalSales) * 100)}% de conversão` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Receita nos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardChart />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Vendas Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/vendas">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 mt-4">
                {recentSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda ainda.</p>
                ) : recentSales.map((sale) => (
                  <div key={sale.paymentId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-foreground">
                          {sale.vaqueiro.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="grid gap-0.5">
                        <p className="text-sm font-medium leading-none truncate max-w-[120px] sm:max-w-[160px]">
                          {sale.vaqueiro}
                        </p>
                        <p className="text-xs text-muted-foreground">{sale.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right grid gap-0.5">
                      <p className="text-sm font-medium font-mono">{formatCurrency(sale.valor)}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{sale.statusPagamento}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 pt-0 sm:hidden border-t mt-auto">
              <Button variant="ghost" className="w-full mt-2" asChild>
                <Link to="/vendas">Ver todas as vendas</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLoader>
  )
}

