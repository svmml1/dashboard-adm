import api from './api'
import type { Evento, RelatorioVendas } from './salesService'
import type { PixTipoChave } from './walletService'

export interface AdminWallet {
  id?: string
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

export interface AdminDashboardEvento {
  eventId: string
  nome: string
  organizerId: string
  totalTransacoes: number
  totalBruto: number
  taxa: number
  totalLiquido: number
  resumoPorDia: Record<string, number>
}

export interface AdminDashboardParque {
  organizerId: string
  totalTransacoes: number
  totalBruto: number
  taxa: number
  totalLiquido: number
  saldoDisponivel: number
  totalSacado: number
  saquesPendentes: number
  valorSaquePendente: number
}

export interface AdminDashboard {
  resumo: {
    totalEventosComVendas: number
    totalTransacoes: number
    totalArrecadadoBruto: number
    totalTaxaPlataforma: number
    totalLiquidoParques: number
    totalSaldoEmWallets: number
    totalSaquesPendentes: number
    totalValorSaquesPendentes: number
  }
  porEvento: AdminDashboardEvento[]
  porParque: AdminDashboardParque[]
}

export const adminService = {
  getDashboard: async (): Promise<AdminDashboard> => {
    const res = await api.get<{ success: boolean } & AdminDashboard>('/wallet/admin/dashboard')
    return { resumo: res.data.resumo, porEvento: res.data.porEvento, porParque: res.data.porParque }
  },

  getAllEventos: async (): Promise<AdminDashboardEvento[]> => {
    const res = await api.get<{ success: boolean } & AdminDashboard>('/wallet/admin/dashboard')
    return res.data.porEvento
  },

  getAdminVendas: async (eventId: string): Promise<RelatorioVendas> => {
    const response = await api.get<RelatorioVendas>(`/wallet/admin/vendas/${eventId}`)
    return response.data
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

