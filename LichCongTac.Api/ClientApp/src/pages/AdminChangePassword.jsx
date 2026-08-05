import { useState } from 'react'
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import AdminHeader from '../components/AdminHeader'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { PasswordStrengthBar } from '../features/auth/components/PasswordStrengthBar'

export default function AdminChangePassword() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    logout()
    navigate('/campha/manager/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.')
      return
    }
    setLoading(true)
    try {
      await authService.changePassword({ currentPassword: oldPassword, newPassword })
      setSuccessMsg('Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau 3 giây...')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(handleLogout, 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.')
    } finally {
      setLoading(false)
    }
  }

  const confirmMatchState = confirmPassword
    ? confirmPassword === newPassword
      ? 'match'
      : 'mismatch'
    : 'empty'

  const borderClass = {
    match: 'border-green-300 focus:border-green-400 focus:ring-1 focus:ring-green-300/30',
    mismatch: 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300/30',
    empty: 'border-gray-300 focus:border-[#5bc0de] focus:ring-1 focus:ring-[#5bc0de]/30',
  }[confirmMatchState]

  return (
    <div className="min-h-screen bg-white font-sans text-[15px] text-gray-800">
      <AdminHeader />
      <main className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#5bc0de] px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <KeyRound size={18} className="text-white" />
              </div>
              <h2 className="text-white font-bold text-base">Đổi mật khẩu</h2>
            </div>

            <div className="px-6 py-6">
              {successMsg && (
                <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 size={17} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-green-700 text-[15px]">{successMsg}</p>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-[15px]">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Old password */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5 text-[15px]">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full border border-gray-300 rounded-lg px-3.5 pr-10 py-2.5 text-[15px] outline-none focus:border-[#5bc0de] focus:ring-1 focus:ring-[#5bc0de]/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showOld ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200" />

                {/* New password */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5 text-[15px]">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu mới"
                      className="w-full border border-gray-300 rounded-lg px-3.5 pr-10 py-2.5 text-[15px] outline-none focus:border-[#5bc0de] focus:ring-1 focus:ring-[#5bc0de]/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={newPassword} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5 text-[15px]">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      className={`w-full border rounded-lg px-3.5 pr-10 py-2.5 text-[15px] outline-none transition ${borderClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {confirmMatchState === 'mismatch' && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <XCircle size={12} /> Mật khẩu xác nhận không khớp
                    </p>
                  )}
                  {confirmMatchState === 'match' && (
                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Mật khẩu khớp
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !!successMsg}
                    className="w-full bg-[#5cb85c] hover:bg-[#4cae4c] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-[15px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} /> Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">
            Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất tự động.
          </p>
        </div>
      </main>
    </div>
  )
}
