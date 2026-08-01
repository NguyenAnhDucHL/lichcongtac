import { useState, useEffect, useRef } from 'react'
import JoditEditor from 'jodit-react'
import AdminHeader from '../components/AdminHeader'


export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([])
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    dateStr: '',
    timeStr: '',
    department: 'CƠ QUAN',
    title: '',
    invitationNumber: '',
    location: '',
    presider: '',
    content: '',
    isPublic: true,
    participants: '',
  })
  const [editId, setEditId] = useState(null)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const LOCATIONS = [
    'Hội trường A UBND phường',
    'Phòng họp tầng 3 UBND phường',
    'Phòng họp tầng 4 UBND phường'
  ]

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        let data = []
        if (Array.isArray(json)) data = json
        else if (json.data) data = json.data
        else if (json.success && Array.isArray(json.data)) data = json.data
        setSchedules(data)
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lịch:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        let data = []
        if (Array.isArray(json)) data = json
        else if (json.data) data = json.data
        else if (json.success && Array.isArray(json.data)) data = json.data
        setUsers(data)
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
    fetchSchedules()
    fetchUsers()
    fetchDepartments()
  }, [])

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

  const handleReset = () => {
    setEditId(null)
    setFormData({
      dateStr: new Date().toISOString().split('T')[0],
      timeStr: '',
      department: '',
      title: '',
      invitationNumber: '',
      location: '',
      presider: '',
      content: '',
      isPublic: true,
      participants: '',
    })
    setSelectedParticipants([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const plainContent = (formData.content || '').replace(/<[^>]*>?/gm, '').trim()
    if (!plainContent) {
      setError('Vui lòng nhập Nội dung chi tiết')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = {
        title: plainContent.substring(0, 50) || 'Lịch công tác',
        invitationNumber: formData.invitationNumber,
        date: formData.dateStr,
        startTime: formData.timeStr,
        location: formData.location,
        content: formData.content,
        presider: formData.presider,
        preparingUnit: formData.department,
        participants: selectedParticipants.join(', '),
        isPublic: formData.isPublic ? 1 : 0,
      }

      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `/api/schedules/${editId}` : '/api/schedules'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert(editId ? 'Cập nhật lịch công tác thành công!' : 'Thêm lịch công tác thành công!')
        handleReset()
        fetchSchedules()
      } else {
        const errData = await res.json()
        let errMsg = 'Lỗi khi lưu lịch'
        if (errData.message) {
          errMsg = errData.message
        } else if (errData.errors) {
          errMsg = Object.values(errData.errors).flat().join(', ')
        } else if (errData.title) {
          errMsg = errData.title
        }
        setError(errMsg)
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  // Format date for table display: Thứ ba 15/12/2026
  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    try {
      const d = new Date(dateString)
      const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
      const dayName = days[d.getDay()]
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return { dayName, date: `${dd}/${mm}/${yyyy}` }
    } catch {
      return { dayName: '', date: dateString }
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-gray-800">
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị lịch</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-10 w-full">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 w-[150px] font-medium align-top pt-3">
                  Thời gian <span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="dateStr"
                      value={formData.dateStr}
                      onChange={handleChange}
                      className="w-[200px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                      required
                    />
                    <input
                      type="time"
                      name="timeStr"
                      value={formData.timeStr}
                      onChange={handleChange}
                      className="w-[142px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    />
                  </div>
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
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-gray-500 italic">hoặc nhập tên đơn vị khác:</span>
                    <input
                      type="text"
                      placeholder="VD: Công an phường, Quân sự, ..."
                      value={departments.some(d => d.name === formData.department) || formData.department === '' ? '' : formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-[260px] border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
                    />
                  </div>
                </td>
              </tr>

              {/* Form fields that were combined into a WYSIWYG editor in the old system, now structured for clarity but keeping layout similar */}
              <tr>
                <td className="py-2 font-medium">Giấy mời số</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="invitationNumber"
                    value={formData.invitationNumber}
                    onChange={handleChange}
                    placeholder="VD: 1131/GM-VP.UBND"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Địa điểm</td>
                <td className="py-2">
                  <select
                    name="location"
                    value={LOCATIONS.includes(formData.location) ? formData.location : ''}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
                  >
                    <option value="">-- Chọn địa điểm --</option>
                    {LOCATIONS.map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-gray-500 italic">hoặc nhập địa điểm khác:</span>
                    <input
                      type="text"
                      placeholder="VD: Phòng họp số 1"
                      value={LOCATIONS.includes(formData.location) || formData.location === '' ? '' : formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-[260px] border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium align-top pt-3">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <div className="w-[100%] max-w-[800px] border border-[#8cbabf] rounded overflow-hidden">
                    <JoditEditor
                      value={formData.content}
                      config={{
                        readonly: false,
                        placeholder: '• Nội dung: ...\n• Thành phần: ...\n• Địa điểm: ...',
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
                          'symbol', 'fullsize', 'print'
                        ]
                      }}
                      onBlur={(newContent) => setFormData({ ...formData, content: newContent })}
                    />
                  </div>
                </td>
              </tr>



              <tr>
                <td className="py-2 font-medium">Hiển thị</td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="w-4 h-4 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium align-top pt-3">Người được thông báo</td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-2 mb-2 w-[100%] max-w-[500px]">
                    {users.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-200"
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 text-[#5cb85c] focus:ring-[#5cb85c]"
                          checked={selectedParticipants.includes(user.fullName || user.username)}
                          onChange={(e) => {
                            const name = user.fullName || user.username
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, name])
                            } else {
                              setSelectedParticipants(
                                selectedParticipants.filter((p) => p !== name)
                              )
                            }
                          }}
                        />
                        <span className="text-xs">{user.fullName || user.username}</span>
                      </label>
                    ))}
                  </div>
                  {selectedParticipants.length === 0 && (
                    <span className="text-xs text-gray-500 italic block mb-2">
                      Chưa chọn người được thông báo
                    </span>
                  )}
                  {selectedParticipants.length > 0 && (
                    <div className="text-xs text-gray-700 bg-green-50 p-2 rounded border border-green-200 mb-2 max-w-[500px]">
                      <span className="font-bold text-green-700">Đã chọn:</span>{' '}
                      {selectedParticipants.join(', ')}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td />
                <td className="py-4">
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
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-[13px]">Danh sách lịch làm việc ({schedules.length} bản ghi)</span>
          <span className="text-gray-400 text-xs">Trang {currentPage}/{Math.max(1, Math.ceil(schedules.length / PAGE_SIZE))}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#fff3eb]">
                <th className="border border-gray-200 py-3 px-4 font-bold w-12">STT</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-32">Ngày</th>
                <th className="border border-gray-200 py-3 px-4 font-bold text-left">Nội dung</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-32">Phòng, ban</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-20">Hiển thị</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
                <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules
                  .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                  .map((item, index) => {
                    const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1
                    const dateInfo = formatDateDisplay(item.date)
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 py-2.5 px-4 font-bold">{globalIndex}</td>
                        <td className="border border-gray-200 py-2.5 px-4 leading-tight">
                          <div>{dateInfo.dayName}</div>
                          <div className="text-blue-700 font-bold">{dateInfo.date}</div>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4 text-left">
                          <span className="text-red-600 font-bold mr-2">{item.startTime}</span>
                          <span className="text-gray-800">
                            {item.content && ` ${item.content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()} `}
                          </span>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          {item.preparingUnit || 'CƠ QUAN'}
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          {item.isPublic ? 'Có' : 'Không'}
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          <a
                            href="#"
                            className="text-[#337ab7] hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              setEditId(item.id)
                              setFormData({
                                dateStr: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
                                timeStr: item.startTime || '',
                                department: item.preparingUnit || 'CƠ QUAN',
                                title: item.title || '',
                                invitationNumber: item.invitationNumber || '',
                                location: item.location || '',
                                presider: item.presider || '',
                                content: item.content || '',
                                isPublic: item.isPublic === 1 || item.isPublic === true,
                                participants: item.participants || '',
                              })
                              const parts = item.participants ? item.participants.split(',').map(s => s.trim()).filter(s => s) : []
                              setSelectedParticipants(parts)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                          >
                            Sửa
                          </a>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4">
                          <a
                            href="#"
                            className="text-[#337ab7] hover:underline"
                            onClick={async (e) => {
                              e.preventDefault()
                              if (window.confirm('Bạn có chắc muốn xóa?')) {
                                try {
                                  const res = await fetch(`/api/schedules/${item.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                                    }
                                  })
                                  if (res.ok) {
                                    fetchSchedules()
                                  } else {
                                    alert('Xóa thất bại')
                                  }
                                } catch (e) {
                                  alert('Lỗi kết nối')
                                }
                              }
                            }}
                          >
                            Xóa
                          </a>
                        </td>
                      </tr>
                    )
                  })
              ) : (
                <tr>
                  <td colSpan="7" className="border border-gray-200 py-4 text-gray-500">
                    Chưa có dữ liệu lịch làm việc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {schedules.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-4">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: Math.ceil(schedules.length / PAGE_SIZE) }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === Math.ceil(schedules.length / PAGE_SIZE) || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 text-xs border rounded ${currentPage === p
                      ? 'bg-[#337ab7] text-white border-[#337ab7]'
                      : 'border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(schedules.length / PAGE_SIZE), p + 1))}
              disabled={currentPage === Math.ceil(schedules.length / PAGE_SIZE)}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(Math.ceil(schedules.length / PAGE_SIZE))}
              disabled={currentPage === Math.ceil(schedules.length / PAGE_SIZE)}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
