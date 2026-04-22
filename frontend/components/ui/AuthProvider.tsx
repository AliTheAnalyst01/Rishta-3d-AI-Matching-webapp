'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, setAuthToken, getMe } from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, logout: () => {}, loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('rc_token')
    if (saved) {
      setAuthToken(saved)
      setToken(saved)
      getMe()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('rc_token')
          setAuthToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (t: string, u: AuthUser) => {
    localStorage.setItem('rc_token', t)
    setAuthToken(t)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('rc_token')
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
