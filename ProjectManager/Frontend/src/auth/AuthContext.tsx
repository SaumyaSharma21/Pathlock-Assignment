import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/api'

type AuthContextType = {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mpm.token'))

  useEffect(() => {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete api.defaults.headers.common['Authorization']
  }, [token])

  const login = async (username: string, password: string) => {
    const res = await api.post('/api/auth/login', { username, password })
    const t = res.data.token
    setToken(t)
    localStorage.setItem('mpm.token', t)
  }

  const register = async (username: string, email: string, password: string) => {
    await api.post('/api/auth/register', { username, email, password })
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('mpm.token')
  }

  return <AuthContext.Provider value={{ token, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
