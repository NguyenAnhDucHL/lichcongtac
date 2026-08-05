import { useState, useEffect, useRef } from 'react'
import JoditEditor from 'jodit-react'
import AdminHeader from '../components/AdminHeader'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { vi } from 'date-fns/locale'
import { Calendar } from 'lucide-react'

const extractTextFromHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
};

registerLocale('vi', vi)
export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([])
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    dateStr: '',
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
  const [editId, setEditId] = useState(null)

  // States for confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const LOCATIONS = [
    'Hội trường A - Trụ sở HĐND và UBND phường',
    'Phòng họp tầng 3 - Trụ sở HĐND và UBND phường',
    'Phòng họp tầng 4 - Trụ sở HĐND và UBND phường',
    'Phòng tiếp công dân - Trụ sở HĐND và UBND phường',
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
        toast.success(
          editId ? 'Cập nhật lịch công tác thành công!' : 'Thêm lịch công tác thành công!'
        )
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

  const handleDeleteClick = (id) => {
    setItemToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/schedules/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (res.ok) {
        toast.success('Xóa lịch công tác thành công!')
        fetchSchedules()
      } else {
        toast.error('Xóa thất bại')
      }
    } catch (e) {
      toast.error('Lỗi kết nối')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  // Format date for table display: Thứ ba 15/12/2026
  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    try {
      const parts = dateString.split('T')[0].split('-')
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
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
    <div className="min-h-screen bg-white font-sans text-[15px] text-gray-800">
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị lịch</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-10 w-full flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">
              Thời gian <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative w-full max-w-[280px] md:max-w-none md:w-[350px] group flex items-center">
                <DatePicker
                  selected={
                    formData.dateStr
                      ? new Date(`${formData.dateStr}T${formData.timeStr || '00:00'}`)
                      : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear()
                      const mm = String(date.getMonth() + 1).padStart(2, '0')
                      const dd = String(date.getDate()).padStart(2, '0')
                      const hh = String(date.getHours()).padStart(2, '0')
                      const min = String(date.getMinutes()).padStart(2, '0')

                      setFormData((prev) => ({
                        ...prev,
                        dateStr: `${yyyy}-${mm}-${dd}`,
                        timeStr: `${hh}:${min}`,
                      }))
                    } else {
                      setFormData((prev) => ({ ...prev, dateStr: '', timeStr: '' }))
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Giờ"
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale="vi"
                  placeholderText="Ngày/Tháng/Năm Giờ:Phút"
                  wrapperClassName="w-full"
                  className="w-full min-w-0 border border-[#5cb85c] rounded pl-3 pr-10 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Thuộc Phòng, Ban</div>
            <div className="flex-1 w-full">
              <select
                name="department"
                value={
                  !formData.department
                    ? ''
                    : departments.some((d) => d.name === formData.department)
                      ? formData.department
                      : 'Khác'
                }
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full md:w-[500px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
              >
                <option value="">-- Chọn phòng ban --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
                <option value="Khác">-- Nhập phòng ban khác --</option>
              </select>
              {!departments.some((d) => d.name === formData.department) &&
                !!formData.department && (
                  <div className="mt-2 flex flex-col gap-1 w-full">
                    <span className="text-xs text-gray-500 italic">hoặc nhập tên đơn vị khác:</span>
                    <textarea
                      placeholder="VD: Công an phường, Quân sự, ..."
                      value={formData.department === 'Khác' ? '' : formData.department}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, department: e.target.value }))
                      }
                      rows={2}
                      className="w-full md:w-[500px] border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c] resize-y"
                      autoFocus
                    />
                  </div>
                )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Giấy mời số</div>
            <div className="flex-1 w-full">
              <input
                type="text"
                name="invitationNumber"
                value={formData.invitationNumber}
                onChange={handleChange}
                placeholder="VD: 1131/GM-VP.UBND"
                className="w-full md:w-[500px] border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Địa điểm</div>
            <div className="flex-1 w-full">
              <select
                name="location"
                value={
                  !formData.location
                    ? ''
                    : LOCATIONS.includes(formData.location)
                      ? formData.location
                      : 'Khác'
                }
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full md:w-[500px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
              >
                <option value="">-- Chọn địa điểm --</option>
                {LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="Khác">-- Nhập địa điểm khác --</option>
              </select>
              {!LOCATIONS.includes(formData.location) && !!formData.location && (
                <div className="mt-2 flex flex-col gap-1 w-full">
                  <span className="text-xs text-gray-500 italic">hoặc nhập địa điểm khác:</span>
                  <textarea
                    placeholder="VD: Phòng họp số 1"
                    value={formData.location === 'Khác' ? '' : formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    rows={2}
                    className="w-full md:w-[500px] border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c] resize-y"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </div>
            <div className="flex-1 w-full">
              <div className="w-[100%] max-w-[800px] border border-[#8cbabf] rounded overflow-hidden">
                <JoditEditor
                  value={formData.content}
                  config={{
                    readonly: false,
                    placeholder: '• Nội dung: ...\n• Thành phần dự: ...',
                    height: 300,
                    language: 'vi',
                    askBeforePasteHTML: false,
                    askBeforePasteFromWord: false,
                    defaultActionOnPaste: 'insert_as_html',
                    toolbarButtonSize: 'small',
                    buttons: [
                      'source',
                      '|',
                      'bold',
                      'strikethrough',
                      'underline',
                      'italic',
                      '|',
                      'superscript',
                      'subscript',
                      '|',
                      'ul',
                      'ol',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'font',
                      'fontsize',
                      'brush',
                      'paragraph',
                      '|',
                      'image',
                      'table',
                      'link',
                      '|',
                      'align',
                      'undo',
                      'redo',
                      '|',
                      'hr',
                      'eraser',
                      'copyformat',
                      '|',
                      'symbol',
                      'fullsize',
                      'print',
                    ],
                  }}
                  onBlur={(newContent) => setFormData({ ...formData, content: newContent })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Hiển thị</div>
            <div className="flex-1 w-full pt-1 md:pt-2">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-5 h-5 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
            <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">
              Người được thông báo
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-wrap gap-2 mb-2 w-[100%] max-w-[600px]">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded border border-gray-200 cursor-pointer hover:bg-gray-200"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#5cb85c] focus:ring-[#5cb85c]"
                      checked={selectedParticipants.includes(user.fullName || user.username)}
                      onChange={(e) => {
                        const name = user.fullName || user.username
                        if (e.target.checked) {
                          setSelectedParticipants([...selectedParticipants, name])
                        } else {
                          setSelectedParticipants(selectedParticipants.filter((p) => p !== name))
                        }
                      }}
                    />
                    <span className="text-sm">{user.fullName || user.username}</span>
                  </label>
                ))}
              </div>
              {selectedParticipants.length === 0 && (
                <span className="text-sm text-gray-500 italic block mb-2">
                  Chưa chọn người được thông báo
                </span>
              )}
              {selectedParticipants.length > 0 && (
                <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200 mb-2 max-w-[600px]">
                  <span className="font-bold text-green-700">Đã chọn:</span>{' '}
                  {selectedParticipants.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full mt-4">
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
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium text-sm transition-colors shadow-sm w-full md:w-auto"
                >
                  Quay lại
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-[15px]">
            Danh sách lịch làm việc ({schedules.length} bản ghi)
          </span>
          <span className="text-gray-400 text-xs">
            Trang {currentPage}/{Math.max(1, Math.ceil(schedules.length / PAGE_SIZE))}
          </span>
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
                        <td className="border border-gray-200 py-2.5 px-4 font-bold">
                          {globalIndex}
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4 leading-tight">
                          <div>{dateInfo.dayName}</div>
                          <div className="text-blue-700 font-bold">{dateInfo.date}</div>
                        </td>
                        <td className="border border-gray-200 py-2.5 px-4 text-left">
                          <span className="text-red-600 font-bold mr-2">
                            {item.startTime ? `${item.startTime}:` : ''}
                          </span>
                          <span>
                            {item.invitationNumber && (
                              <span className="text-[#005f6b] font-bold mr-1">
                                {item.invitationNumber}
                              </span>
                            )}
                            {item.location && (
                              <span className="text-[#005f6b] font-bold mr-1">
                                (Tại {item.location})
                              </span>
                            )}
                            <span className="text-gray-800">
                              {item.content && ` ${extractTextFromHtml(item.content)} `}
                            </span>
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
                                dateStr: item.date
                                  ? item.date.split('T')[0]
                                  : new Date().toISOString().split('T')[0],
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
                              const parts = item.participants
                                ? item.participants
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter((s) => s)
                                : []
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
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteClick(item.id)
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
              .filter(
                (p) =>
                  p === 1 ||
                  p === Math.ceil(schedules.length / PAGE_SIZE) ||
                  Math.abs(p - currentPage) <= 2
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 text-xs border rounded ${
                      currentPage === p
                        ? 'bg-[#337ab7] text-white border-[#337ab7]'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(Math.ceil(schedules.length / PAGE_SIZE), p + 1))
              }
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

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa lịch công tác này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
