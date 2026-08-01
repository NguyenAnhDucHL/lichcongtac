import React, { useState, useEffect, useRef } from 'react'
import AdminHeader from '../components/AdminHeader'
import JoditEditor from 'jodit-react'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    content: '',
    isVisible: true
  })
  const editor = useRef(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        setNotifications(json)
      } else {
        if (res.status !== 401) setError('Lỗi khi tải danh sách thông báo')
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleReset = () => {
    setEditId(null)
    setFormData({ content: '', isVisible: true })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate
    const plainContent = formData.content.replace(/<[^>]*>?/gm, '').trim()
    if (!plainContent && !formData.content.includes('<img')) {
      setError('Nội dung không được để trống')
      setLoading(false)
      return
    }

    try {
      const payload = {
        content: formData.content,
        isVisible: formData.isVisible ? 1 : 0
      }

      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `/api/notifications/${editId}` : '/api/notifications'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert(editId ? 'Cập nhật thông báo thành công!' : 'Thêm thông báo thành công!')
        handleReset()
        fetchNotifications()
      } else {
        const errData = await res.json()
        let errMsg = 'Lỗi khi lưu thông báo'
        if (errData.message) errMsg = errData.message
        else if (errData.errors) errMsg = Object.values(errData.errors).flat().join(', ')
        setError(errMsg)
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setFormData({
      content: item.content,
      isVisible: item.isVisible === 1
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (res.ok) {
        alert('Xóa thông báo thành công!')
        // If we delete the last item on current page
        const newTotal = notifications.length - 1
        const maxPage = Math.ceil(newTotal / PAGE_SIZE)
        if (currentPage > maxPage && maxPage > 0) setCurrentPage(maxPage)
        
        fetchNotifications()
      } else {
        alert('Có lỗi xảy ra khi xóa')
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Thông báo</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-10 w-full">
          <div className="w-[100%] max-w-[800px] border border-[#8cbabf] rounded overflow-hidden mb-4">
            <JoditEditor
              ref={editor}
              value={formData.content}
              config={{
                readonly: false,
                height: 300,
                language: 'vi',
                askBeforePasteHTML: false,
                askBeforePasteFromWord: false,
                defaultActionOnPaste: 'insert_as_html',
                toolbarButtonSize: 'small',
                buttons: [
                  'source', '|',
                  'bold', 'strikethrough', 'underline', 'italic', '|',
                  'superscript', 'subscript', '|',
                  'ul', 'ol', '|',
                  'outdent', 'indent', '|',
                  'font', 'fontsize', 'brush', 'paragraph', '|',
                  'image', 'table', 'link', '|',
                  'align', 'undo', 'redo', '|',
                  'hr', 'eraser', 'copyformat', '|',
                  'symbol', 'fullsize', 'print', 'about'
                ],
                removeButtons: ['file', 'video']
              }}
              onBlur={newContent => setFormData(prev => ({ ...prev, content: newContent }))}
              onChange={() => {}}
            />
          </div>

          <div className="flex items-center gap-2 mb-4 font-bold text-[#4cae4c]">
            <label htmlFor="isVisible">Hiển thị</label>
            <input
              type="checkbox"
              id="isVisible"
              name="isVisible"
              checked={formData.isVisible}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm')}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleReset}
                className="ml-3 bg-gray-500 hover:bg-gray-600 text-white px-6 py-1.5 rounded text-sm transition-colors"
              >
                Quay lại
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-[13px]">Danh sách các thông báo ({notifications.length} bản ghi)</span>
          <span className="text-gray-400 text-xs">Trang {currentPage}/{Math.max(1, Math.ceil(notifications.length / PAGE_SIZE))}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#fff3eb]">
                <th className="border border-gray-200 py-3 px-4 font-bold w-12">STT</th>
                <th className="border border-gray-200 py-3 px-4 font-bold text-center">Nội dung</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-20">Hiển thị</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications
                  .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                  .map((item, index) => {
                    const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 py-2.5 px-4 font-bold">{globalIndex}</td>
                        <td className="border border-gray-200 py-2.5 px-4 text-left">
                          <span 
                            className="text-gray-800 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          ></span>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          <span className={item.isVisible === 1 ? 'text-[#337ab7]' : 'text-gray-400'}>
                            {item.isVisible === 1 ? 'Có' : 'Không'}
                          </span>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-[#337ab7] hover:underline"
                          >
                            Sửa
                          </button>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-[#337ab7] hover:underline"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    )
                  })
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-200 py-4 text-gray-500">
                    Chưa có thông báo nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {notifications.length > PAGE_SIZE && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-gray-600">
              {currentPage} / {Math.ceil(notifications.length / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(notifications.length / PAGE_SIZE), p + 1))}
              disabled={currentPage === Math.ceil(notifications.length / PAGE_SIZE)}
              className="px-3 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
