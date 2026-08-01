import { useState, useEffect } from 'react'
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'

import AdminHeader from '../components/AdminHeader'

export default function AdminEmployees() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    fullName: '',
    departmentId: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'CanBo',
    zaloId: '',
    notificationPreference: '',
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

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      })
      if (res.ok) {
        const json = await res.json()
        setUsers(json.data || json || [])
      }
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err)
    }
  }

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

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
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
      role: 'CanBo',
      zaloId: '',
      notificationPreference: '',
    })
    setEditId(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      const url = editId ? `/api/users/${editId}` : `/api/users`
      const method = editId ? 'PUT' : 'POST'

      const payload = { ...formData, departmentId: formData.departmentId ? parseInt(formData.departmentId) : null }
      if (!editId) {
        payload.role = formData.role
      } else if (!payload.password) {
        delete payload.password
      }

      const bodyData = {
        fullName: payload.fullName,
        username: payload.username,
        role: payload.role,
        departmentId: payload.departmentId,
        zaloId: payload.zaloId,
        notificationPreference: payload.notificationPreference
      }
      if (payload.password) {
        bodyData.passwordHash = payload.password
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(bodyData),
      })

      const result = await res.json()
      if (!res.ok || result.success === false) {
        throw new Error(result.message || 'Lỗi khi lưu nhân viên')
      }

      toast.success(editId ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công. Lưu ý: Cần Sửa lại để bổ sung Zalo/Phòng ban!')
      handleReset()
      fetchUsers()

    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditId(user.id)
    setFormData({
      fullName: user.fullName || '',
      departmentId: user.departmentId || '',
      username: user.username || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'CanBo',
      zaloId: user.zaloId || '',
      notificationPreference: user.notificationPreference || '',
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
        toast.success('Xóa nhân viên thành công')
        fetchUsers()
      } else {
        const errData = await res.json()
        toast.error(errData.message || 'Lỗi khi xóa nhân viên')
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị nhân viên</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">
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
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map((d) => (
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
                    disabled={!!editId}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c] disabled:bg-gray-100"
                    required
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
                      required={!editId}
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
                <td className="py-2 font-medium">Zalo ID</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="zaloId"
                    value={formData.zaloId}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Thông báo Zalo</td>
                <td className="py-2">
                  <select
                    name="notificationPreference"
                    value={formData.notificationPreference}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                  >
                    <option value="">Không nhận</option>
                    <option value="ALL">Nhận tất cả</option>
                    <option value="IMPORTANT">Chỉ thông báo quan trọng</option>
                  </select>
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
                    {loading ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-1.5 rounded text-sm transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        <div className="text-gray-500 mb-2 text-[13px]">Danh sách nhân viên</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#fff3eb]">
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">STT</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Họ và tên</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Tên đăng nhập</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Phòng ban</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Zalo ID</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
                  <td className="border border-gray-200 py-2.5 px-4 text-left">{user.fullName}</td>
                  <td className="border border-gray-200 py-2.5 px-4">{user.username}</td>
                  <td className="border border-gray-200 py-2.5 px-4">{user.departmentName || '---'}</td>
                  <td className="border border-gray-200 py-2.5 px-4">{user.zaloId || '---'}</td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <button onClick={() => handleEdit(user)} className="text-[#337ab7] hover:underline bg-transparent border-none cursor-pointer">
                      Sửa
                    </button>
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <button onClick={() => handleDeleteClick(user.id)} className="text-[#c8102e] hover:underline bg-transparent border-none cursor-pointer">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa nhân viên này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
