/* global CustomEvent */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'sonner'
import { KeyRound, Loader2, X, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services/auth.service'

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
  const [showModalPassword, setShowModalPassword] = useState(false)

  // Ref để debounce - tránh bắn sự kiện unauthorized nhiều lần cùng lúc
  const unauthorizedTimerRef = useRef(null)

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
    const handleUnauthorized = (e) => {
      // Bỏ qua nếu token đã bị xóa (người dùng chủ động bấm Đăng xuất)
      if (!localStorage.getItem('auth_token')) return

      // Bỏ qua nếu đang ở trang login
      if (window.location.pathname.includes('/login')) return

      // Debounce: nếu đã có timer đang chạy thì bỏ qua, tránh spam modal
      if (unauthorizedTimerRef.current) return
      unauthorizedTimerRef.current = setTimeout(() => {
        unauthorizedTimerRef.current = null
      }, 3000)

      // Nếu người dùng đang thực sự làm việc trong trang Admin (không phải lần đầu vào)
      // → hiện Modal tại chỗ để không mất form data đang nhập
      const isInsideAdmin =
        window.location.pathname.startsWith('/campha/manager') &&
        !window.location.pathname.includes('/campha/manager/login')

      if (isInsideAdmin) {
        // Đang làm việc dở → hiện modal để đăng nhập lại không mất dữ liệu
        setModalUsername(localStorage.getItem('user_name') || '')
        setModalPassword('')
        setModalError(e.detail?.message || 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
        setShowExpiredModal(true)
      } else {
        // Đang ở trang công khai hoặc vừa mới điều hướng vào Admin → redirect sạch về Login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_name')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_fullname')
        setToken(null)
        setUser(null)
        toast.info('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.')
        window.location.href = '/campha/manager/login'
      }
    }
    document.addEventListener('auth:unauthorized', handleUnauthorized)
    document.addEventListener('auth:forcelogout', handleUnauthorized)
    return () => {
      document.removeEventListener('auth:unauthorized', handleUnauthorized)
      document.removeEventListener('auth:forcelogout', handleUnauthorized)
      if (unauthorizedTimerRef.current) clearTimeout(unauthorizedTimerRef.current)
    }
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
      authService.logout().catch((err) => console.error('Lỗi khi đăng xuất:', err))
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
      const data = await authService.login({ username: modalUsername, password: modalPassword })
      if (data && data.token) {
        const userData = {
          name: data.username || data.fullName,
          role: data.role,
          fullname: data.fullName,
        }
        login(userData, data.token)
        setShowExpiredModal(false)
        setModalPassword('')
        document.dispatchEvent(
          new CustomEvent('auth:login_success', { detail: { token: data.token } })
        )
        toast.success('Đăng nhập lại thành công! Dữ liệu đã tự động được lưu.')
      } else {
        setModalError('Sai tài khoản hoặc mật khẩu')
      }
    } catch (error) {
      setModalError(error.message || 'Lỗi kết nối máy chủ')
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
                Vui lòng đăng nhập lại để tiếp tục công việc mà không làm mất dữ liệu bạn đang nhập
                dở.
              </p>
            </div>
            {modalError && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {modalError}
              </div>
            )}
            <form onSubmit={handleModalLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tên đăng nhập
                </label>
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
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    required
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showModalPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
