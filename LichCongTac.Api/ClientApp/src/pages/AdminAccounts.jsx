import { useState, useEffect } from 'react'
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'

import AdminHeader from '../components/AdminHeader'

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([])
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    fullName: '',
    departmentId: '',
    username: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  })
  const [editId, setEditId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // States for confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      })
      if (res.ok) {
        const json = await res.json()
        setDepartments(json.data || json || [])
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phòng ban:', err)
    }
  }

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      })
      if (res.ok) {
        const json = await res.json()
        setAccounts(json.data || json || [])
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tài khoản:', err)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchAccounts()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleReset = () => {
    setFormData({
      fullName: '',
      departmentId: '',
      username: '',
      password: '',
      confirmPassword: '',
      isAdmin: false,
    })
    setEditId(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.')
      return
    }

    if (!editId && !formData.password) {
      setError('Vui lòng nhập mật khẩu cho tài khoản mới.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = editId ? `/api/users/${editId}` : '/api/users'
      const method = editId ? 'PUT' : 'POST'

      // Payload body mapping
      const body = {
        fullName: formData.fullName,
        username: formData.username,
        role: formData.isAdmin ? 'Admin' : 'CanBo',
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null
      }
      if (formData.password) {
        body.passwordHash = formData.password
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(body),
      })

      const result = await res.json()
      if (res.ok && (result.success !== false)) {
        await fetchAccounts()
        handleReset()
      } else {
        setError(result.message || 'Có lỗi xảy ra, vui lòng thử lại.')
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (acc) => {
    setEditId(acc.id)
    setFormData({
      fullName: acc.fullName || '',
      departmentId: acc.departmentId || '',
      username: acc.username || '',
      password: '',
      confirmPassword: '',
      isAdmin: acc.role === 'Admin',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteClick = (id) => {
    setItemToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/users/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (res.ok) {
        fetchAccounts()
        if (editId === itemToDelete) handleReset()
      } else {
        const result = await res.json()
        toast.error(result.message || 'Xóa thất bại.')
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  // Helper to get department name
  const getDepartmentName = (deptId) => {
    if (!deptId) return ''
    const dept = departments.find(d => d.id === deptId)
    return dept ? dept.name : deptId
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">
          {editId ? 'Sửa thông tin tài khoản' : 'Quản trị tài khoản'}
        </h2>

        {error && (
          <div className="max-w-[600px] mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

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
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700 bg-white"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
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
                    disabled={!!editId} // Typically shouldn't change username after creation
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">
                  Mật khẩu{!editId && <span className="text-red-500">*</span>}
                </td>
                <td className="py-2">
                  <div className="relative w-[350px]">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-[#5cb85c] rounded px-2 py-1 pr-8 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                      required={!editId}
                      placeholder={editId ? '(Bỏ trống nếu không đổi)' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">
                  Nhập lại mật khẩu{!editId && <span className="text-red-500">*</span>}
                </td>
                <td className="py-2">
                  <div className="relative w-[350px]">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full border border-[#5cb85c] rounded px-2 py-1 pr-8 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                      required={!editId && !!formData.password}
                      placeholder={editId ? '(Bỏ trống nếu không đổi)' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                    className="w-4 h-4 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm cursor-pointer"
                  />
                </td>
              </tr>
              <tr>
                <td />
                <td className="py-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {editId ? 'Cập nhật' : 'Thêm'}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1.5 rounded text-sm transition-colors"
                    >
                      Hủy
                    </button>
                  )}
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
                  <td className="border border-gray-200 py-2.5 px-4">{getDepartmentName(acc.departmentId)}</td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    {acc.role === 'Admin' ? 'Có' : 'Không'}
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <button 
                      onClick={() => handleEdit(acc)}
                      className="text-[#337ab7] hover:underline"
                    >
                      Sửa
                    </button>
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <button 
                      onClick={() => handleDeleteClick(acc.id)}
                      className="text-[#337ab7] hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan="7" className="border border-gray-200 py-4 text-gray-500">
                    Không có tài khoản nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa tài khoản này không? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
