import { useState } from 'react'
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import AdminHeader from '../components/AdminHeader'

const navItems = [
  { label: 'QUẢN TRỊ', href: '/campha/manager/accounts' },
  { label: 'LỊCH CÔNG TÁC', href: '/campha/' },
  { label: 'QUẢN TRỊ LỊCH', href: '/campha/manager/schedules' },
  { label: 'THÔNG BÁO', href: '#' },
  { label: 'NGÀY LỄ', href: '#' },
  { label: 'ĐỔI MẬT KHẨU', href: '/campha/manager/change-password', active: true },
  { label: 'ĐĂNG XUẤT', href: null, isLogout: true },
]

function PasswordStrengthBar({ password }) {
  const checks = [
    { label: 'Ít nhất 8 ký tự', ok: password.length >= 8 },
    { label: '1 chữ HOA (A-Z)', ok: /[A-Z]/.test(password) },
    { label: '1 chữ thường (a-z)', ok: /[a-z]/.test(password) },
    { label: '1 chữ số (0-9)', ok: /[0-9]/.test(password) },
    { label: '1 ký tự đặc biệt (!@#$...)', ok: /[!@#$%^&*()_+\-=[\]{}|;':",./|<>?]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const colors = ['#ef4444', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
  const labels = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']

  return (
    <div className="mt-3 space-y-2">
      {/* Strength bar */}
      {password && (
        <>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: i <= score ? colors[score] : '#e5e7eb' }}
              />
            ))}
          </div>
          {score > 0 && (
            <p className="text-xs font-medium" style={{ color: colors[score] }}>
              {labels[score]}
            </p>
          )}
        </>
      )}
      {/* Requirements checklist */}
      {password && (
        <ul className="space-y-1 mt-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-1.5 text-xs">
              {c.ok ? (
                <CheckCircle2 size={13} className="text-green-500 shrink-0" />
              ) : (
                <XCircle size={13} className="text-gray-300 shrink-0" />
              )}
              <span className={c.ok ? 'text-green-700' : 'text-gray-400'}>{c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AdminChangePassword() {
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
    window.location.href = '/campha/manager/login'
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
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      })

      const json = await res.json()
      // Unwrap interceptor
      const msg = json.message || json.error || (json.data && json.data.message)

      if (res.ok) {
        setSuccessMsg('Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau 3 giây...')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          handleLogout()
        }, 3000)
      } else {
        setErrorMsg(msg || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.')
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  const username = localStorage.getItem('user_name') || ''

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-[#5bc0de] px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <KeyRound size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Đổi mật khẩu</h2>
                {username && (
                  <p className="text-white/80 text-xs mt-0.5">Tài khoản: {username}</p>
                )}
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-6">
              {/* Success message */}
              {successMsg && (
                <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 size={17} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-green-700 text-[13px]">{successMsg}</p>
                </div>
              )}

              {/* Error message */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-[13px]">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Old password */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5 text-[13px]">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full border border-gray-300 rounded-lg px-3.5 pr-10 py-2.5 text-[13px] outline-none focus:border-[#5bc0de] focus:ring-1 focus:ring-[#5bc0de]/30 transition"
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

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200" />

                {/* New password */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5 text-[13px]">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu mới"
                      className="w-full border border-gray-300 rounded-lg px-3.5 pr-10 py-2.5 text-[13px] outline-none focus:border-[#5bc0de] focus:ring-1 focus:ring-[#5bc0de]/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  <PasswordStrengthBar password={newPassword} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-gray-600 font-medium mb-1.5 text-[13px]">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      className={`w-full border rounded-lg px-3.5 pr-10 py-2.5 text-[13px] outline-none transition ${confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300/30'
                        : confirmPassword && confirmPassword === newPassword
                          ? 'border-green-300 focus:border-green-400 focus:ring-1 focus:ring-green-300/30'
                          : 'border-gray-300 focus:border-[#5bc0de] focus:ring-1 focus:ring-[#5bc0de]/30'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <XCircle size={12} /> Mật khẩu xác nhận không khớp
                    </p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Mật khẩu khớp
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !!successMsg}
                    className="w-full bg-[#5cb85c] hover:bg-[#4cae4c] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Note */}
          <p className="text-center text-gray-400 text-xs mt-4">
            Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất tự động.
          </p>
        </div>
      </main>
    </div>
  )
}
