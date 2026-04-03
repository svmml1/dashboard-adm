import api from './api'
import type { Evento } from './salesService'
import type { PixTipoChave } from './walletService'

export interface AdminWallet {
  eventOwnerId: string
  saldoDisponivel: number
  saldoPendente: number
  totalRecebido: number
  totalSacado: number
}

export interface SaquePendente {
  id: string
  eventOwnerId: string
  valor: number
  chavePix: string
  tipoChave: PixTipoChave
  nomeTitular: string
  status: 'SOLICITADO' | 'PROCESSANDO' | 'PAGO' | 'FALHOU' | 'CANCELADO'
  observacao?: string
  createdAt?: string | { _seconds: number; _nanoseconds: number }
}

export const adminService = {
  getAllEventos: async (): Promise<Evento[]> => {
    const response = await api.get<{ success: boolean; total: number; data: Evento[] }>(
      '/wallet/meus-eventos',
    )
    return response.data.data
  },

  getAllWallets: async (): Promise<AdminWallet[]> => {
    const response = await api.get<{ success: boolean; data: AdminWallet[] }>(
      '/wallet/admin/wallets',
    )
    return response.data.data
  },

  getSaquesPendentes: async (): Promise<SaquePendente[]> => {
    const response = await api.get<{ success: boolean; data: SaquePendente[] }>(
      '/wallet/admin/saques-pendentes',
    )
    return response.data.data
  },

  updateSaqueStatus: async (
    saqueId: string,
    status: 'PROCESSANDO' | 'PAGO' | 'FALHOU' | 'CANCELADO',
    observacao?: string,
  ): Promise<void> => {
    await api.patch(`/wallet/admin/saque/${saqueId}`, { status, observacao })
  },

  vincularEvento: async (eventId: string, organizerId: string): Promise<void> => {
    await api.patch(`/wallet/admin/evento/${eventId}/organizador`, { organizerId })
  },
}
