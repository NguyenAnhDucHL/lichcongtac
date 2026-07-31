import { useState } from 'react'
import AdminHeader from '../components/AdminHeader'

export default function AdminAccounts() {
  const [formData, setFormData] = useState({
    fullName: '',
    department: 'CƠ QUAN',
    username: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  })

  const accounts = [
    { id: 1, fullName: 'haidv', username: 'haidv', department: 'CƠ QUAN', isAdmin: true },
    { id: 2, fullName: 'quantri', username: 'quantri', department: 'CƠ QUAN', isAdmin: true },
    { id: 3, fullName: 'test', username: 'test123', department: 'CƠ QUAN', isAdmin: true },
  ]

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    window.location.href = '/campha/manager/login'
  }

  const navItems = [
    { label: 'QUẢN TRỊ', href: '/campha/manager/accounts' },
    { label: 'LỊCH CÔNG TÁC', href: '/campha/' },
    { label: 'QUẢN TRỊ LỊCH', href: '/campha/manager/schedules' },
    { label: 'THÔNG BÁO', href: '#' },
    { label: 'NGÀY LỄ', href: '#' },
    { label: 'ĐỔI MẬT KHẨU', href: '/campha/manager/change-password' },
    { label: 'ĐĂNG XUẤT', href: null, onClick: handleLogout },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock submit
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị tài khoản</h2>

        <form onSubmit={handleSubmit} className="max-w-[600px] mb-10">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 w-[150px] font-medium">
                  Họ và tên<span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Thuộc Phòng, Ban</td>
                <td className="py-2">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
                  >
                    <option value="CƠ QUAN">CƠ QUAN</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">
                  Tài khoản<span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">
                  Mật khẩu<span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">
                  Nhập lại mật khẩu<span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Quản trị toàn bộ</td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleChange}
                    className="w-4 h-4 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm"
                  />
                </td>
              </tr>
              <tr>
                <td />
                <td className="py-3">
                  <button
                    type="submit"
                    className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-1.5 rounded text-sm transition-colors"
                  >
                    Thêm
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        <div className="text-gray-500 mb-2 text-[13px]">Danh sách tài khoản</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#fff3eb]">
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">STT</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Họ và tên</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Tên đăng nhập</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Phòng ban</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-24">Quản trị</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, index) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
                  <td className="border border-gray-200 py-2.5 px-4">{acc.fullName}</td>
                  <td className="border border-gray-200 py-2.5 px-4">{acc.username}</td>
                  <td className="border border-gray-200 py-2.5 px-4">{acc.department}</td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    {acc.isAdmin ? 'Có' : 'Không'}
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <a href="#" className="text-[#337ab7] hover:underline">
                      Sửa
                    </a>
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <a href="#" className="text-[#337ab7] hover:underline">
                      Xóa
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
