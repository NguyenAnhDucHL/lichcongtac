import { useState, useEffect } from 'react'

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([])
  const [formData, setFormData] = useState({
    dateStr: '',
    timeStr: '',
    department: 'CƠ QUAN',
    title: '',
    location: '',
    presider: '',
    content: '',
    isPublic: true,
    participants: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    fetchSchedules()
  }, [])

  const navItems = [
    { label: 'QUẢN TRỊ', href: '/campha/manager/accounts' },
    { label: 'LỊCH CÔNG TÁC', href: '#' },
    { label: 'QUẢN TRỊ LỊCH', href: '/campha/manager/schedules' },
    { label: 'THÔNG BÁO', href: '#' },
    { label: 'NGÀY LỄ', href: '#' },
    { label: 'ĐỔI MẬT KHẨU', href: '#' },
    { label: 'ĐĂNG XUẤT', href: '#' },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: formData.title || 'Lịch công tác',
        date: formData.dateStr,
        startTime: formData.timeStr,
        location: formData.location,
        content: formData.content,
        presider: formData.presider,
        preparingUnit: formData.department,
        participants: formData.participants,
        isPublic: formData.isPublic ? 1 : 0,
      }

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert('Thêm lịch công tác thành công!')
        setFormData({
          ...formData,
          title: '',
          location: '',
          presider: '',
          content: '',
          participants: '',
        })
        fetchSchedules()
      } else {
        const errData = await res.json()
        setError(errData.message || 'Lỗi khi thêm lịch')
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
      {/* Header */}
      <div className="max-w-[1000px] mx-auto bg-white flex justify-start pt-2">
        <img
          src="/assets/header-banner.png"
          alt="Lịch Công Tác"
          className="h-auto max-h-[90px] object-contain"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextElementSibling.style.display = 'block'
          }}
        />
        <div style={{ display: 'none' }} className="py-4">
          <h1 className="text-xl font-bold text-[#1d5792]">PHẦN MỀM QUẢN LÝ</h1>
          <h1 className="text-2xl font-bold text-[#c8102e]">LỊCH CÔNG TÁC</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#5bc0de]">
        <div className="max-w-[1000px] mx-auto flex flex-wrap justify-center sm:justify-start">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-6 py-2.5 text-white text-[13px] font-bold uppercase hover:bg-[#46b8da] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

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
                    <option value="CƠ QUAN">CƠ QUAN</option>
                    <option value="Văn phòng">Văn phòng</option>
                  </select>
                </td>
              </tr>

              {/* Form fields that were combined into a WYSIWYG editor in the old system, now structured for clarity but keeping layout similar */}
              <tr>
                <td className="py-2 font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-[100%] max-w-[800px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium align-top pt-3">Nội dung chi tiết</td>
                <td className="py-2">
                  {/* Fake toolbar for visual fidelity to screenshot, purely aesthetic */}
                  <div className="w-[100%] max-w-[800px] border border-[#8cbabf] rounded overflow-hidden">
                    <div className="bg-gradient-to-b from-[#e8f0f8] to-[#bcd4eb] border-b border-[#8cbabf] p-1 flex flex-wrap gap-1 items-center">
                      {/* Mock buttons */}
                      <div className="h-6 w-6 bg-white border border-gray-300 rounded shadow-sm text-center leading-6 text-xs text-gray-500 font-bold">
                        B
                      </div>
                      <div className="h-6 w-6 bg-white border border-gray-300 rounded shadow-sm text-center leading-6 text-xs text-gray-500 italic font-serif">
                        I
                      </div>
                      <div className="h-6 w-6 bg-white border border-gray-300 rounded shadow-sm text-center leading-6 text-xs text-gray-500 underline font-serif">
                        U
                      </div>
                      <div className="ml-2 px-2 h-6 bg-white border border-gray-300 rounded shadow-sm flex items-center text-xs text-gray-600">
                        Font <span className="ml-4 text-[8px]">▼</span>
                      </div>
                      <div className="px-2 h-6 bg-white border border-gray-300 rounded shadow-sm flex items-center text-xs text-gray-600">
                        Size <span className="ml-4 text-[8px]">▼</span>
                      </div>
                    </div>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      className="w-full h-[150px] p-3 outline-none resize-y text-gray-800"
                      placeholder="• Nội dung: ...&#10;• Thành phần: ...&#10;• Địa điểm: ..."
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Địa điểm</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                  />
                </td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Chủ trì</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="presider"
                    value={formData.presider}
                    onChange={handleChange}
                    className="w-[350px] border border-[#5cb85c] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#5cb85c]"
                  />
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
                  <input
                    type="text"
                    name="participants"
                    value={formData.participants}
                    onChange={handleChange}
                    placeholder="Lựa chọn..."
                    className="w-[100%] max-w-[500px] border border-[#5cb85c] rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#5cb85c] block mb-2"
                  />
                  <select className="w-[200px] border border-[#5cb85c] rounded px-2 py-1 text-gray-700 outline-none">
                    <option>Tìm kiếm</option>
                  </select>
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
                    {loading ? 'Đang lưu...' : 'Thêm'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        <div className="text-gray-500 mb-2 text-[13px]">Danh sách lịch làm việc</div>
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
                schedules.map((item, index) => {
                  const dateInfo = formatDateDisplay(item.date)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
                      <td className="border border-gray-200 py-2.5 px-4 leading-tight">
                        <div>{dateInfo.dayName}</div>
                        <div className="text-blue-700 font-bold">{dateInfo.date}</div>
                      </td>
                      <td className="border border-gray-200 py-2.5 px-4 text-left">
                        <span className="text-red-600 font-bold mr-2">{item.startTime}</span>
                        <span className="text-gray-800">
                          {item.title}
                          {item.location && ` (Tại ${item.location}) `}
                          {item.content && ` ${item.content} `}
                          {item.presider && ` Dự đồng chí ${item.presider}.`}
                        </span>
                      </td>
                      <td className="border border-gray-200 py-2.5 px-4">
                        {item.preparingUnit || 'CƠ QUAN'}
                      </td>
                      <td className="border border-gray-200 py-2.5 px-4">
                        {item.isPublic ? 'Có' : 'Không'}
                      </td>
                      <td className="border border-gray-200 py-2.5 px-4">
                        <a href="#" className="text-[#337ab7] hover:underline">
                          Sửa
                        </a>
                      </td>
                      <td className="border border-gray-200 py-2.5 px-4">
                        <a
                          href="#"
                          className="text-[#337ab7] hover:underline"
                          onClick={(e) => {
                            e.preventDefault()
                            if (window.confirm('Bạn có chắc muốn xóa?')) {
                              /* call delete API */
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
      </main>
    </div>
  )
}
