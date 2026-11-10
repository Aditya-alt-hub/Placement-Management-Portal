import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user || res.data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token)
    }
    const userData = res.data.user || res.data
    setUser(userData)
    return userData
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    let token = res.data?.token
    let userData = res.data?.user || res.data

    if (!token) {
      const loginRes = await api.post('/auth/login', { email, password })
      token = loginRes.data?.token
      userData = loginRes.data?.user || loginRes.data
    }

    if (token) {
      localStorage.setItem('token', token)
    }
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await api.get('/auth/logout')
    } catch {
      // ignore logout network errors
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
