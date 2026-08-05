import React, { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Khởi tạo state từ localStorage
    const storedToken = localStorage.getItem('auth_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedName = localStorage.getItem('user_name')
    const storedRole = localStorage.getItem('user_role')
    const storedFullname = localStorage.getItem('user_fullname')

    if (storedToken) {
      setToken(storedToken)
      setUser({
        name: storedName,
        role: storedRole,
        fullname: storedFullname,
      })
    }
    setLoading(false)

    // Lắng nghe sự kiện đăng xuất từ interceptor 401
    const handleUnauthorized = () => {
      logout()
      window.location.href = '/campha/manager/login?reason=expired'
    }
    document.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => document.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = (userData, authToken, refreshToken) => {
    localStorage.setItem('auth_token', authToken)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    if (userData.name) localStorage.setItem('user_name', userData.name)
    if (userData.role) localStorage.setItem('user_role', userData.role)
    if (userData.fullname) localStorage.setItem('user_fullname', userData.fullname)

    setToken(authToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_fullname')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAuth = () => useContext(AuthContext)
