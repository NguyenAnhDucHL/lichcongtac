import { useState, useEffect } from 'react'
import AdminHeader from '../components/AdminHeader'

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
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
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert(editId ? 'Cập nhật phòng ban thành công!' : 'Thêm phòng ban thành công!')
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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (res.ok) {
        alert('Xóa phòng ban thành công')
        fetchDepartments()
      } else {
        const errData = await res.json()
        alert(errData.message || 'Lỗi khi xóa phòng ban')
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị phòng ban</h2>

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
                  Tên phòng ban<span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Mô tả</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Trạng thái</td>
                <td className="py-2">
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

        <div className="text-gray-500 mb-2 text-[13px]">Danh sách phòng ban</div>
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
                        onClick={() => handleDelete(dept.id)}
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
    </div>
  )
}
