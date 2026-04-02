import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { AuthUser } from '@/services/authService'
import { authService } from '@/services/authService'
import { walletService, type WalletSummary, type SaqueRequest, type SolicitarSaqueParams } from '@/services/walletService'
import { salesService, type Evento, type RelatorioVendas } from '@/services/salesService'

export type { VendaDia as Sale } from '@/services/salesService'

type MainStore = {
  user: AuthUser | null
  login: (user: AuthUser, token: string, refreshToken?: string) => void
  logout: () => void
  // wallet
  walletSummary: WalletSummary | null
  walletLoading: boolean
  withdrawals: SaqueRequest[]
  requestWithdrawal: (params: SolicitarSaqueParams) => Promise<void>
  refreshWallet: () => Promise<void>
  // sales
  eventos: Evento[]
  eventosLoading: boolean
  salesReport: RelatorioVendas | null
  salesLoading: boolean
  selectedEventId: string | null
  loadEventos: () => Promise<void>
  loadSales: (eventId: string) => Promise<void>
}

export const MainContext = createContext<MainStore | null>(null)

function loadUserFromStorage(): AuthUser | null {
  try {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) return JSON.parse(stored) as AuthUser
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
  return null
}

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUserFromStorage)
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [withdrawals, setWithdrawals] = useState<SaqueRequest[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventosLoading, setEventosLoading] = useState(false)
  const [salesReport, setSalesReport] = useState<RelatorioVendas | null>(null)
  const [salesLoading, setSalesLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const refreshWallet = useCallback(async () => {
    setWalletLoading(true)
    try {
      const [summary, saques] = await Promise.all([
        walletService.getSaldo(),
        walletService.getSaques(),
      ])
      setWalletSummary(summary)
      setWithdrawals(saques)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        authService.logout()
        setUser(null)
        setWalletSummary(null)
        setWithdrawals([])
      }
    } finally {
      setWalletLoading(false)
    }
  }, [])

  const loadEventos = useCallback(async () => {
    setEventosLoading(true)
    try {
      const data = await salesService.getEventos()
      setEventos(data)
      if (data.length > 0) {
        setSelectedEventId(data[0].id)
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        authService.logout()
        setUser(null)
      }
      // keep eventos empty, user can retry via refresh button
    } finally {
      setEventosLoading(false)
    }
  }, [])

  const loadSales = useCallback(async (eventId: string) => {
    setSalesLoading(true)
    setSelectedEventId(eventId)
    try {
      const data = await salesService.getVendas(eventId)
      setSalesReport(data)
    } catch (err) {
      setSalesReport(null)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        authService.logout()
        setUser(null)
      }
    } finally {
      setSalesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      refreshWallet()
      loadEventos()
    }
  }, [user, refreshWallet, loadEventos])

  // auto-load sales when first event is set
  useEffect(() => {
    if (selectedEventId && salesReport === null) {
      loadSales(selectedEventId)
    }
  }, [selectedEventId, salesReport, loadSales])

  const login = (userData: AuthUser, token: string, refreshToken?: string) => {
    localStorage.setItem('token', token)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setWalletSummary(null)
    setWithdrawals([])
    setEventos([])
    setSalesReport(null)
    setSelectedEventId(null)
  }

  const requestWithdrawal = async (params: SolicitarSaqueParams) => {
    await walletService.solicitarSaque(params)
    await refreshWallet()
  }

  return React.createElement(
    MainContext.Provider,
    {
      value: {
        user, login, logout,
        walletSummary, walletLoading, withdrawals, requestWithdrawal, refreshWallet,
        eventos, eventosLoading, salesReport, salesLoading, selectedEventId, loadEventos, loadSales,
      },
    },
    children,
  )
}

export default function useMainStore() {
  const context = useContext(MainContext)
  if (!context) throw new Error('useMainStore must be used within MainProvider')
  return context
}
