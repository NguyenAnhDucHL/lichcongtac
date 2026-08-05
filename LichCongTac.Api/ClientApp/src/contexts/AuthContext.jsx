import React, { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'sonner'
import { KeyRound, Loader2, X } from 'lucide-react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [modalUsername, setModalUsername] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    // Khởi tạo state từ localStorage
    const storedToken = localStorage.getItem('auth_token')
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
      // Hiển thị modal để user đăng nhập lại tại chỗ thay vì redirect mất form data
      setModalUsername(localStorage.getItem('user_name') || '')
      setModalPassword('')
      setModalError('')
      setShowExpiredModal(true)
    }
    document.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => document.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = (userData, authToken) => {
    localStorage.setItem('auth_token', authToken)
    if (userData.name) localStorage.setItem('user_name', userData.name)
    if (userData.role) localStorage.setItem('user_role', userData.role)
    if (userData.fullname) localStorage.setItem('user_fullname', userData.fullname)

    setToken(authToken)
    setUser(userData)
  }

  const logout = () => {
    // Fire and forget logout to backend to revoke RefreshToken and clear HttpOnly cookies
    if (token) {
      fetch('/api/auth/logout', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Lỗi khi đăng xuất:', err))
    }

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_fullname')
    setToken(null)
    setUser(null)
  }

  const handleModalLogin = async (e) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modalUsername, password: modalPassword })
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          login(json.data.user, json.data.token)
          setShowExpiredModal(false)
          setModalPassword('')
          document.dispatchEvent(new CustomEvent('auth:login_success', { detail: { token: json.data.token } }))
          toast.success('Đăng nhập lại thành công! Dữ liệu đã tự động được lưu.')
        } else {
          setModalError(json.message || 'Sai tài khoản hoặc mật khẩu')
        }
      } else {
        const err = await res.json()
        setModalError(err.message || 'Sai tài khoản hoặc mật khẩu')
      }
    } catch (error) {
      setModalError('Lỗi kết nối máy chủ')
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
      {showExpiredModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <button 
              onClick={() => {
                setShowExpiredModal(false)
                logout()
                document.dispatchEvent(new CustomEvent('auth:login_cancel'))
                window.location.href = '/campha/manager/login?reason=expired'
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
                <KeyRound className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Phiên đăng nhập hết hạn</h2>
              <p className="mt-2 text-sm text-gray-500">
                Vui lòng đăng nhập lại để tiếp tục công việc mà không làm mất dữ liệu bạn đang nhập dở.
              </p>
            </div>
            {modalError && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {modalError}
              </div>
            )}
            <form onSubmit={handleModalLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                <input
                  type="text"
                  required
                  value={modalUsername}
                  onChange={(e) => setModalUsername(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
                />
              </div>
              <button
                type="submit"
                disabled={modalLoading}
                className="flex w-full items-center justify-center rounded bg-[#5cb85c] px-4 py-2 font-medium text-white hover:bg-[#4cae4c] disabled:opacity-70"
              >
                {modalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Đăng nhập lại'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAuth = () => useContext(AuthContext)
