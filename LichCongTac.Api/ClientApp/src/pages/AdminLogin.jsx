import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('reason') === 'expired') {
      toast.error(
        'Phiên đăng nhập đã hết hạn hoặc tài khoản đang được đăng nhập ở nơi khác. Vui lòng đăng nhập lại.',
        {
          duration: 5000,
        }
      )
      // Xóa query param để không hiện lại khi F5
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  if (authLoading) return null
  if (token) return <Navigate to="/campha/manager/schedules" replace />

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        const data = await res.json()
        // Fallback cho interceptor trả về `data` thay vì object phẳng
        let token, user_name, role
        if (data.token) {
          token = data.token
          user_name = data.username || data.fullName
          role = data.role
        } else if (data.data && data.data.token) {
          token = data.data.token
          user_name = data.data.username || data.data.fullName
          role = data.data.role
        }

        if (token) {
          login({ name: user_name, role: role }, token)
          navigate('/campha/manager/schedules', { replace: true })
        } else {
          setError('Đăng nhập thành công nhưng không lấy được token.')
        }
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác')
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans">
      {/* Background shape */}
      <div className="absolute inset-0 z-0 bg-white">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              'linear-gradient(105deg, #8cbabf 0%, #8cbabf 60%, #e6d1d8 60%, #e6d1d8 70%, #f8f6f5 70%, #f8f6f5 100%)',
          }}
        />
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#8cbabf] shadow-[15px_15px_20px_rgba(0,0,0,0.1)] p-12 -mt-10">
        <h2 className="text-3xl font-bold text-[#d62828] text-center mb-12 tracking-wide">
          Quản trị
        </h2>

        {error && (
          <div className="text-white text-sm mb-4 text-center bg-red-500/50 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="w-full bg-transparent border border-[#5e8b91] rounded-md text-gray-800 placeholder:text-gray-500 py-2 px-3 outline-none focus:border-white transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              className="w-full bg-transparent border border-[#5e8b91] rounded-md text-gray-800 placeholder:text-gray-500 py-2 pl-3 pr-10 outline-none focus:border-white transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#5e8b91] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-[140px] mx-auto block bg-[#5cb85c] hover:bg-[#4cae4c] text-white py-2.5 rounded text-sm transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
