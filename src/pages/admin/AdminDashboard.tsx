import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, type AdminDashboard } from '@/services/adminService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/PageLoader'
import { formatCurrency } from '@/lib/utils'
import { Loader2, TrendingUp, Wallet, Ticket, CreditCard, RefreshCw, BadgeDollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useMainStore from '@/stores/main'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { loadSales } = useMainStore()
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminService.getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleVerEvento = (eventId: string) => {
    loadSales(eventId)
    navigate('/admin/vendas')
  }

  return (
    <PageLoader>
      <div className="space-y-6">
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Geral</h2>
            <p className="text-muted-foreground text-sm">Visão consolidada de todos os eventos e parques.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
          </div>
        ) : !data ? (
          <p className="text-center py-20 text-muted-foreground">Erro ao carregar dados.</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Bruto</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(data.resumo.totalArrecadadoBruto)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Taxa: {formatCurrency(data.resumo.totalTaxaPlataforma)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Líquido Parques</CardTitle>
                  <BadgeDollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(data.resumo.totalLiquidoParques)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em Wallets</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(data.resumo.totalSaldoEmWallets)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saques Pendentes</CardTitle>
                  <CreditCard className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">{data.resumo.totalSaquesPendentes}</div>
                  <p className="text-xs text-muted-foreground mt-1">{formatCurrency(data.resumo.totalValorSaquesPendentes)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Eventos table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ticket className="h-4 w-4" /> Por Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Evento</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Transações</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Bruto</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Taxa</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Líquido</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.porEvento.map((ev) => (
                        <tr key={ev.eventId} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="px-4 py-3 font-medium">{ev.nome}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{ev.totalTransacoes}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(ev.totalBruto)}</td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatCurrency(ev.taxa)}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">{formatCurrency(ev.totalLiquido)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" onClick={() => handleVerEvento(ev.eventId)}>
                              Ver vendas
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Parques table */}
            {data.porParque.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Por Parque
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Parque ID</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Bruto</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Saldo</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sacado</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Saques pend.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.porParque.map((p, i) => (
                          <tr key={`${p.organizerId}-${i}`} className="border-b last:border-0 hover:bg-muted/40">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.organizerId}</td>
                            <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.totalBruto)}</td>
                            <td className="px-4 py-3 text-right font-mono text-primary font-semibold">{formatCurrency(p.saldoDisponivel)}</td>
                            <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.totalSacado)}</td>
                            <td className="px-4 py-3 text-right">
                              {p.saquesPendentes > 0 ? (
                                <span className="text-amber-500 font-semibold">{p.saquesPendentes} ({formatCurrency(p.valorSaquePendente)})</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageLoader>
  )
}
