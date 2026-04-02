import  api  from './api'
export interface WalletSummary {
  eventOwnerId: string
  saldoDisponivel: number
  saldoPendente: number
  totalRecebido: number
  totalSacado: number
}

export interface WalletTransaction {
  id?: string
  eventOwnerId: string
  eventId: string
  paymentId: string
  senhas: number[]
  dia: string
  valorBruto: number
  taxaPlataforma: number
  valorLiquido: number
  tipo: 'CREDITO' | 'DEBITO'
  status: 'PENDENTE' | 'DISPONIVEL' | 'SACADO'
  descricao: string
  createdAt?: string
}

export type PixTipoChave = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA'

export interface SaqueRequest {
  id?: string
  eventOwnerId: string
  valor: number
  chavePix: string
  tipoChave: PixTipoChave
  nomeTitular: string
  status: 'SOLICITADO' | 'PROCESSANDO' | 'PAGO' | 'FALHOU' | 'CANCELADO'
  observacao?: string
  createdAt?: string
}

export interface SolicitarSaqueParams {
  valor: number
  chavePix: string
  tipoChave: PixTipoChave
  nomeTitular: string
}

export const walletService = {
  getSaldo: async (): Promise<WalletSummary> => {
    const res = await api.get<{ success: boolean; data: WalletSummary }>('/wallet/saldo')
    return res.data.data
  },

  getTransacoes: async (limit = 50): Promise<WalletTransaction[]> => {
    const res = await api.get<{ success: boolean; data: WalletTransaction[] }>(
      '/wallet/transacoes',
      { params: { limit } },
    )
    return res.data.data
  },

  getSaques: async (): Promise<SaqueRequest[]> => {
    const res = await api.get<{ success: boolean; data: SaqueRequest[] }>('/wallet/saques')
    return res.data.data
  },

  solicitarSaque: async (params: SolicitarSaqueParams): Promise<{ saqueId: string }> => {
    const res = await api.post<{ success: boolean; saqueId: string }>('/wallet/saque', params)
    return { saqueId: res.data.saqueId }
  },
}
