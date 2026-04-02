import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { AuthUser } from '@/services/authService'
import { authService } from '@/services/authService'
import { walletService, type WalletSummary, type SaqueRequest, type SolicitarSaqueParams } from '@/services/walletService'

export type SaleStatus = 'Pago' | 'Pendente' | 'Cancelado'
export type Sale = {
  id: string
  competitor: string
  cpf: string
  category: string
  value: number
  status: SaleStatus
  date: string
}

type MainStore = {
  user: AuthUser | null
  login: (user: AuthUser, token: string, refreshToken: string) => void
  logout: () => void
  // wallet
  walletSummary: WalletSummary | null
  walletLoading: boolean
  withdrawals: SaqueRequest[]
  requestWithdrawal: (params: SolicitarSaqueParams) => Promise<void>
  refreshWallet: () => Promise<void>
  // sales (mock until sales API is integrated)
  sales: Sale[]
}

const MOCK_SALES: Sale[] = [
  {
    id: 'V-1001',
    competitor: 'Carlos Silva',
    cpf: '111.222.333-44',
    category: 'Profissional',
    value: 200.0,
    status: 'Pago',
    date: '2023-10-01T10:00:00Z',
  },
  {
    id: 'V-1002',
    competitor: 'Mariana Costa',
    cpf: '222.333.444-55',
    category: 'Amador',
    value: 100.0,
    status: 'Pago',
    date: '2023-10-02T11:30:00Z',
  },
  {
    id: 'V-1003',
    competitor: 'João Pedro',
    cpf: '333.444.555-66',
    category: 'Aspirante',
    value: 80.0,
    status: 'Pendente',
    date: '2023-10-03T09:15:00Z',
  },
  {
    id: 'V-1004',
    competitor: 'Ana Paula',
    cpf: '444.555.666-77',
    category: 'Amador',
    value: 100.0,
    status: 'Cancelado',
    date: '2023-10-03T14:20:00Z',
  },
  {
    id: 'V-1005',
    competitor: 'Roberto Alves',
    cpf: '555.666.777-88',
    category: 'Profissional',
    value: 200.0,
    status: 'Pago',
    date: '2023-10-04T16:45:00Z',
  },
  {
    id: 'V-1006',
    competitor: 'Juliana Mendes',
    cpf: '666.777.888-99',
    category: 'Aspirante',
    value: 80.0,
    status: 'Pago',
    date: '2023-10-05T08:10:00Z',
  },
  {
    id: 'V-1007',
    competitor: 'Lucas Fernandes',
    cpf: '777.888.999-00',
    category: 'Amador',
    value: 100.0,
    status: 'Pago',
    date: '2023-10-05T14:20:00Z',
  },
]

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
  const [sales] = useState<Sale[]>(MOCK_SALES)

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
      // If token is invalid/expired, log out cleanly
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        authService.logout()
        setUser(null)
        setWalletSummary(null)
        setWithdrawals([])
      }
      // other errors: keep user logged in, wallet shows zeros
    } finally {
      setWalletLoading(false)
    }
  }, [])

  // load wallet whenever a user session is active
  useEffect(() => {
    if (user) refreshWallet()
  }, [user, refreshWallet])

  const login = (userData: AuthUser, token: string, refreshToken: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setWalletSummary(null)
    setWithdrawals([])
  }

  const requestWithdrawal = async (params: SolicitarSaqueParams) => {
    await walletService.solicitarSaque(params)
    await refreshWallet()
  }

  return React.createElement(
    MainContext.Provider,
    {
      value: { user, login, logout, walletSummary, walletLoading, withdrawals, requestWithdrawal, refreshWallet, sales },
    },
    children,
  )
}

export default function useMainStore() {
  const context = useContext(MainContext)
  if (!context) throw new Error('useMainStore must be used within MainProvider')
  return context
}
