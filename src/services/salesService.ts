import api from './api'

export type Evento = {
  id: string
  nome: string
  status: string
  local: string
  startDate: string
  endDate: string
  valorSenha: number
}

export type VendaDia = {
  dia: string
  senha: number
  vaqueiro: string
  categoria: string
  cavaloPuxa: string
  cavaloEsteira: string
  nomeEsteira: string
  userId: string
  paymentId: string
  metodoPagamento: string
  statusPagamento: 'PAGO' | 'CONFIRMADA' | 'AGUARDANDO' | 'EXPIRADO'
  valor: number
  horario: string
  pagamentoConfirmadoEm: string | null
}

export type ResumoVendas = {
  totalVendas: number
  totalPagas: number
  totalAguardando: number
  totalArrecadadoBruto: number
  taxaPlataforma: number
  totalLiquido: number
  resumoPorDia: Record<string, { pagas: number; aguardando: number; arrecadado: number }>
  resumoPorMetodo: Record<string, number>
}

export type RelatorioVendas = {
  success: boolean
  evento: Evento
  resumo: ResumoVendas
  vendas: VendaDia[]
}

export const salesService = {
  getEventos: async (): Promise<Evento[]> => {
    const response = await api.get<{ success: boolean; total: number; data: Evento[] }>(
      '/wallet/meus-eventos',
    )
    return response.data.data
  },

  getVendas: async (eventId: string): Promise<RelatorioVendas> => {
    const response = await api.get<RelatorioVendas>(`/wallet/vendas/${eventId}`)
    return response.data
  },
}
