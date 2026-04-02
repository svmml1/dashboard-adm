import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import useMainStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Wallet, Info, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { PageLoader } from '@/components/PageLoader'
import type { PixTipoChave } from '@/services/walletService'
import axios from 'axios'

const PIX_TIPOS: { value: PixTipoChave; label: string }[] = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'ALEATORIA', label: 'Chave aleatória' },
]

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  SOLICITADO: { icon: <Clock className="h-4 w-4 mr-1" />, label: 'Solicitado', color: 'text-amber-500' },
  PROCESSANDO: { icon: <Clock className="h-4 w-4 mr-1" />, label: 'Processando', color: 'text-blue-500' },
  PAGO: { icon: <CheckCircle2 className="h-4 w-4 mr-1" />, label: 'Pago', color: 'text-emerald-500' },
  FALHOU: { icon: <XCircle className="h-4 w-4 mr-1" />, label: 'Falhou', color: 'text-destructive' },
  CANCELADO: { icon: <XCircle className="h-4 w-4 mr-1" />, label: 'Cancelado', color: 'text-muted-foreground' },
}

export default function Withdrawals() {
  const { walletSummary, walletLoading, withdrawals, requestWithdrawal, refreshWallet } = useMainStore()
  const [amount, setAmount] = useState('')
  const [chavePix, setChavePix] = useState('')
  const [tipoChave, setTipoChave] = useState<PixTipoChave>('CPF')
  const [nomeTitular, setNomeTitular] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => { refreshWallet() }, [])

  const saldoDisponivel = walletSummary?.saldoDisponivel ?? 0

  const handleRequest = () => {
    const val = parseFloat(amount.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' })
      return
    }
    if (val > saldoDisponivel) {
      toast({
        title: 'Saldo insuficiente',
        description: `Disponível: ${formatCurrency(saldoDisponivel)}`,
        variant: 'destructive',
      })
      return
    }
    if (!chavePix.trim() || !nomeTitular.trim()) {
      toast({ title: 'Preencha os dados PIX', variant: 'destructive' })
      return
    }
    setConfirmOpen(true)
  }

  const confirmRequest = async () => {
    setSubmitting(true)
    try {
      const val = parseFloat(amount.replace(',', '.'))
      await requestWithdrawal({ valor: val, chavePix: chavePix.trim(), tipoChave, nomeTitular: nomeTitular.trim() })
      setConfirmOpen(false)
      setAmount('')
      setChavePix('')
      setNomeTitular('')
      toast({
        title: 'Saque solicitado!',
        description: 'Sua solicitação está em análise e será processada em até D+2.',
      })
    } catch (err) {
      let message = 'Erro ao solicitar saque.'
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error ?? message
      }
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLoader>
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="hidden md:flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground text-sm">Gerencie seus recebíveis e solicite saques via PIX.</p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Disponível', value: walletSummary?.saldoDisponivel ?? 0, highlight: true },
            { label: 'Pendente', value: walletSummary?.saldoPendente ?? 0 },
            { label: 'Total recebido', value: walletSummary?.totalRecebido ?? 0 },
            { label: 'Total sacado', value: walletSummary?.totalSacado ?? 0 },
          ].map(({ label, value, highlight }) => (
            <Card key={label} className={highlight ? 'border-primary' : ''}>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {walletLoading ? (
                  <div className="h-7 w-24 rounded bg-muted animate-pulse" />
                ) : (
                  <p className={`text-xl font-bold font-mono ${highlight ? 'text-primary' : ''}`}>
                    {formatCurrency(value)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance hero */}
          <Card className="md:col-span-2 bg-card shadow-lg border-border overflow-hidden relative">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 text-muted/20">
              <Wallet className="h-64 w-64" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="font-medium text-muted-foreground">Saldo Disponível</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {walletLoading ? (
                <div className="h-14 w-48 rounded bg-muted animate-pulse mb-4" />
              ) : (
                <div className="text-5xl font-bold font-mono tracking-tighter mb-4">
                  {formatCurrency(saldoDisponivel)}
                </div>
              )}
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Info className="h-4 w-4 shrink-0" />
                Saldo líquido — taxa de 3% da plataforma já descontada.
              </p>
            </CardContent>
          </Card>

          {/* Withdrawal form */}
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Solicitar Saque</CardTitle>
              <CardDescription>Transferência via PIX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="font-mono text-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de chave PIX</Label>
                <Select value={tipoChave} onValueChange={(v) => setTipoChave(v as PixTipoChave)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIX_TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chavePix">Chave PIX</Label>
                <Input
                  id="chavePix"
                  placeholder={tipoChave === 'EMAIL' ? 'email@exemplo.com' : tipoChave === 'TELEFONE' ? '(00) 00000-0000' : 'Sua chave'}
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nomeTitular">Nome do titular</Label>
                <Input
                  id="nomeTitular"
                  placeholder="Nome completo"
                  value={nomeTitular}
                  onChange={(e) => setNomeTitular(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleRequest}
                disabled={!amount || !chavePix || !nomeTitular || walletLoading}
              >
                Solicitar Saque
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* History */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Histórico de Saques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum saque solicitado ainda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((w) => {
                      const cfg = STATUS_CONFIG[w.status] ?? STATUS_CONFIG['SOLICITADO']
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="text-sm">{w.createdAt ? formatDate(w.createdAt) : '—'}</TableCell>
                          <TableCell className="font-mono font-medium">{formatCurrency(w.valor)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{w.tipoChave}</span>{' '}
                            {w.chavePix}
                          </TableCell>
                          <TableCell>
                            <span className={`flex items-center text-sm font-medium ${cfg.color}`}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Solicitação</DialogTitle>
              <DialogDescription>
                Saque de{' '}
                <strong className="font-mono text-foreground font-bold">
                  {amount && formatCurrency(parseFloat(amount.replace(',', '.')))}
                </strong>{' '}
                para a chave PIX <strong className="text-foreground">{chavePix}</strong> ({tipoChave}) em nome de{' '}
                <strong className="text-foreground">{nomeTitular}</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={confirmRequest} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar Saque
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLoader>
  )
}
