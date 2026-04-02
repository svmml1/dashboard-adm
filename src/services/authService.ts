import api from './api'
export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  photoUrl: string | null
}

export interface LoginResponse {
  status: string
  message: string
  data: {
    token: string
    refreshToken: string
    expiresIn: number
    refreshTokenExpiresIn: number
    user: AuthUser
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  getProfile: async (): Promise<{ status: string; message: string; data: AuthUser }> => {
    const response = await api.get<{ status: string; message: string; data: AuthUser }>('/auth/me')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
}
