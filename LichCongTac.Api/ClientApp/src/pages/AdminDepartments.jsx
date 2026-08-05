import { useState, useEffect } from 'react'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'

import AdminHeader from '../components/AdminHeader'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AdminDepartments() {
  const { token, user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  })
  const [editId, setEditId] = useState(null)

  // States for confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    setFormData({ name: '', description: '', isActive: true })
    setEditId(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editId ? `/api/departments/${editId}` : '/api/departments'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editId ? 'Cập nhật phòng ban thành công!' : 'Thêm phòng ban thành công!')
        handleReset()
        fetchDepartments()
      } else {
        const errData = await res.json()
        setError(errData.message || 'Lỗi khi lưu phòng ban')
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (dept) => {
    setEditId(dept.id)
    setFormData({
      name: dept.name,
      description: dept.description || '',
      isActive: dept.isActive,
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
      const res = await fetch(`/api/departments/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        toast.success('Xóa phòng ban thành công')
        fetchDepartments()
      } else {
        const errData = await res.json()
        toast.error(errData.message || 'Lỗi khi xóa phòng ban')
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
    <div className="min-h-screen bg-white font-sans text-[15px] text-gray-800">
      <AdminHeader />

      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị phòng ban</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-[600px] mb-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0">
              Tên phòng ban<span className="text-red-500">*</span>
            </div>
            <div className="flex-1 w-full">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0">Mô tả</div>
            <div className="flex-1 w-full">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0">Trạng thái</div>
            <div className="flex-1 w-full">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm"
                />
                <span>Hoạt động</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full mt-2">
            <div className="hidden md:block md:w-[150px] shrink-0" />
            <div className="flex-1 w-full flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50 w-full md:w-auto shadow-sm"
              >
                {loading ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded font-medium text-sm transition-colors shadow-sm w-full md:w-auto"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="text-gray-500 mb-2 text-[15px]">Danh sách phòng ban</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#fff3eb]">
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">STT</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Mã phòng ban</th>
                <th className="border border-gray-200 py-3 px-4 font-bold">Tên phòng ban</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border border-gray-200 py-4 text-gray-500">
                    Chưa có phòng ban nào
                  </td>
                </tr>
              ) : (
                departments.map((dept, index) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
                    <td className="border border-gray-200 py-2.5 px-4">{dept.id}</td>
                    <td className="border border-gray-200 py-2.5 px-4 text-left">{dept.name}</td>
                    <td className="border border-gray-200 py-2.5 px-4">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-[#337ab7] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Sửa
                      </button>
                    </td>
                    <td className="border border-gray-200 py-2.5 px-4">
                      <button
                        onClick={() => handleDeleteClick(dept.id)}
                        className="text-[#c8102e] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa phòng ban này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
