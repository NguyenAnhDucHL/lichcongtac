import { useState, useEffect } from 'react'
import AdminHeader from '../components/AdminHeader'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import { PlusCircle, Loader2 } from 'lucide-react'

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([])
  const [formData, setFormData] = useState({ date: '', content: '' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      })
      if (res.ok) {
        const json = await res.json()
        let data = []
        if (Array.isArray(json)) data = json
        else if (json.data) data = json.data
        else if (json.success && Array.isArray(json.data)) data = json.data
        setHolidays(data)
      }
    } catch (err) {
      console.error('Lỗi tải danh sách ngày lễ:', err)
      toast.error('Lỗi tải danh sách ngày lễ')
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.date || !formData.content) {
      toast.error('Vui lòng điền đầy đủ ngày và nội dung')
      return
    }

    setLoading(true)
    const url = editId ? `/api/holidays/${editId}` : '/api/holidays'
    const method = editId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && (data.success || data.id)) {
        toast.success(editId ? 'Cập nhật thành công' : 'Thêm mới thành công')
        setFormData({ date: '', content: '' })
        setEditId(null)
        fetchHolidays()
      } else {
        toast.error(data.message || data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      toast.error('Lỗi hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (holiday) => {
    setEditId(holiday.id)
    setFormData({
      date: holiday.date,
      content: holiday.content,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteClick = (id) => {
    setItemToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/holidays/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Xóa thành công')
        fetchHolidays()
        if (editId === itemToDelete) {
          setEditId(null)
          setFormData({ date: '', content: '' })
        }
      } else {
        toast.error(data.message || data.error || 'Lỗi khi xóa')
      }
    } catch (err) {
      toast.error('Lỗi hệ thống khi xóa')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  // Helper to format date YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateString
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <AdminHeader />
      
      <main className="max-w-[1000px] mx-auto bg-white min-h-[500px] p-6 shadow-sm border border-gray-200 mt-4 mb-8">
        <h2 className="text-[#c8102e] text-xl font-bold mb-6 border-b border-gray-200 pb-2">
          Quản lý ngày lễ
        </h2>

        {/* Form */}
        <div className="mb-8 w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="w-full sm:w-32 text-sm font-semibold text-gray-700">
                Thời gian <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#46b8da] focus:ring-1 focus:ring-[#46b8da]"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <label className="w-full sm:w-32 text-sm font-semibold text-gray-700 mt-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#46b8da] focus:ring-1 focus:ring-[#46b8da] min-h-[80px]"
                  placeholder="Ví dụ: Nghỉ lễ Quốc khánh 2/9"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-32 hidden sm:block"></div>
              <div className="flex-1 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editId ? 'Cập nhật' : 'Thêm'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null)
                      setFormData({ date: '', content: '' })
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <p className="text-sm text-gray-600 mb-2">Danh sách ngày lễ</p>

        {/* Table */}
        <div className="overflow-x-auto border border-[#ddd]">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#fcf8e3] text-gray-800 border-b border-[#ddd]">
                <th className="p-3 border-r border-[#ddd] font-semibold text-center w-16">STT</th>
                <th className="p-3 border-r border-[#ddd] font-semibold text-center w-32">Ngày</th>
                <th className="p-3 border-r border-[#ddd] font-semibold text-center">Nội dung</th>
                <th className="p-3 border-r border-[#ddd] font-semibold text-center w-16">Sửa</th>
                <th className="p-3 font-semibold text-center w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1d5792]" />
                  </td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 italic border-b border-[#ddd]">
                    Chưa có ngày lễ nào được thiết lập.
                  </td>
                </tr>
              ) : (
                holidays.map((h, idx) => (
                  <tr key={h.id} className="border-b border-[#ddd] hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-r border-[#ddd] text-center">{idx + 1}</td>
                    <td className="p-3 border-r border-[#ddd] text-center font-semibold text-blue-600">
                      {formatDate(h.date)}
                    </td>
                    <td className="p-3 border-r border-[#ddd]">{h.content}</td>
                    <td className="p-3 border-r border-[#ddd] text-center">
                      <button
                        onClick={() => handleEdit(h)}
                        className="text-[#337ab7] hover:text-[#23527c] transition-colors"
                      >
                        Sửa
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteClick(h.id)}
                        className="text-[#337ab7] hover:text-[#23527c] transition-colors"
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
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa ngày lễ này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
