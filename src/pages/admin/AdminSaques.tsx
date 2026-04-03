import { useEffect, useState } from 'react'
import { adminService, type SaquePendente } from '@/services/adminService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageLoader } from '@/components/PageLoader'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import axios from 'axios'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SOLICITADO: { label: 'Solicitado', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  PROCESSANDO: { label: 'Processando', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  PAGO: { label: 'Pago', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  FALHOU: { label: 'Falhou', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  CANCELADO: { label: 'Cancelado', color: 'bg-muted text-muted-foreground' },
}

export default function AdminSaques() {
  const [saques, setSaques] = useState<SaquePendente[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.getSaquesPendentes()
      setSaques(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (
    saque: SaquePendente,
    status: 'PROCESSANDO' | 'PAGO' | 'FALHOU' | 'CANCELADO',
    observacao?: string,
  ) => {
    setUpdating(saque.id)
    try {
      await adminService.updateSaqueStatus(saque.id, status, observacao)
      setSaques((prev) =>
        prev.map((s) => s.id === saque.id ? { ...s, status } : s)
      )
      toast({ title: `Saque marcado como ${STATUS_CONFIG[status].label}` })
    } catch (err) {
      let msg = 'Erro ao atualizar saque.'
      if (axios.isAxiosError(err)) msg = err.response?.data?.error ?? msg
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    } finally {
      setUpdating(null)
    }
  }

  const pendentes = saques.filter((s) => s.status === 'SOLICITADO' || s.status === 'PROCESSANDO')
  const historico = saques.filter((s) => s.status === 'PAGO' || s.status === 'FALHOU' || s.status === 'CANCELADO')

  return (
    <PageLoader>
      <div className="space-y-6">
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Saques</h2>
            <p className="text-muted-foreground text-sm">Gerencie todas as solicitações de saque.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Solicitados
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-amber-500">
                {saques.filter((s) => s.status === 'SOLICITADO').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-emerald-500">
                {saques.filter((s) => s.status === 'PAGO').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Falhou
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-destructive">
                {saques.filter((s) => s.status === 'FALHOU').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pendentes de Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
              </div>
            ) : pendentes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Nenhum saque pendente.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Titular</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendentes.map((s) => {
                      const cfg = STATUS_CONFIG[s.status]
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="text-sm whitespace-nowrap">{formatDate(s.createdAt as string)}</TableCell>
                          <TableCell className="font-medium">{s.nomeTitular}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{s.tipoChave}</span>{' '}
                            {s.chavePix}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(s.valor)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {s.status === 'SOLICITADO' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updating === s.id}
                                  onClick={() => updateStatus(s, 'PROCESSANDO')}
                                >
                                  {updating === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Processar'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                disabled={updating === s.id}
                                onClick={() => updateStatus(s, 'PAGO', 'PIX enviado')}
                              >
                                {updating === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Pago</>}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={updating === s.id}
                                onClick={() => updateStatus(s, 'CANCELADO')}
                              >
                                {updating === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><XCircle className="h-3.5 w-3.5 mr-1" />Cancelar</>}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        {historico.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Titular</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.map((s) => {
                      const cfg = STATUS_CONFIG[s.status]
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="text-sm whitespace-nowrap">{formatDate(s.createdAt as string)}</TableCell>
                          <TableCell className="font-medium">{s.nomeTitular}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{s.tipoChave}</span>{' '}
                            {s.chavePix}
                          </TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(s.valor)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLoader>
  )
}
