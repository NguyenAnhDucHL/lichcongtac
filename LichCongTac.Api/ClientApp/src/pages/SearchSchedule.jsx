import { useState, useEffect } from 'react'
import { Search, FileText, Loader2, Menu } from 'lucide-react'

const PAGE_SIZE = 10

const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

function formatDateDisplay(dateString) {
  if (!dateString) return { dayName: '', date: '' }
  try {
    const parts = dateString.split('T')[0].split('-')
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    const dayName = DAYS[d.getDay()]
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return { dayName, date: `${dd}/${mm}/${yyyy}` }
  } catch {
    return { dayName: '', date: dateString }
  }
}

const navItems = [
  { label: 'HOME', href: '/campha/' },
  {
    label: 'QUẢN LÝ VĂN BẢN ĐIỀU HÀNH',
    href: 'https://congchuc.quangninh.gov.vn/sso/Login.aspx',
    target: '_blank',
  },
  {
    label: 'CỔNG THÔNG TIN',
    href: 'https://quangninh.gov.vn/Trang/Default.aspx',
    target: '_blank',
  },
  {
    label: 'THƯ ĐIỆN TỬ',
    href: 'https://mail.quangninh.gov.vn/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmail.quangninh.gov.vn%2fowa%2f',
    target: '_blank',
  },
  { label: 'TÌM KIẾM', href: '/campha/search' },
  { label: 'QUẢN TRỊ', href: '/campha/manager/login' },
]

export default function SearchSchedule() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [todayHoliday, setTodayHoliday] = useState(null)

  // Fetch today's holiday on mount
  useEffect(() => {
    fetch('/api/holidays/today')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.content) {
          setTodayHoliday(json)
        } else if (json.success && json.data) {
          setTodayHoliday(json.data)
        }
      })
      .catch((err) => console.error('Lỗi tải ngày lễ:', err))
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setCurrentPage(1)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const url = `/api/schedules/public-schedule${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      const json = await res.json()

      let data = []
      if (Array.isArray(json)) data = json
      else if (json.data) data = json.data

      // Filter by keyword on frontend
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase()
        data = data.filter(
          (item) =>
            (item.content && item.content.toLowerCase().includes(kw)) ||
            (item.title && item.title.toLowerCase().includes(kw)) ||
            (item.invitationNumber && item.invitationNumber.toLowerCase().includes(kw))
        )
      }

      // Sort by date descending
      data.sort((a, b) => {
        const da = (a.date || '').split('T')[0]
        const db = (b.date || '').split('T')[0]
        if (db > da) return 1
        if (db < da) return -1
        return (b.startTime || '').localeCompare(a.startTime || '')
      })

      setResults(data)
      setSearched(true)
    } catch (err) {
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const paginated = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-[16px] text-gray-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white relative flex flex-col justify-center min-h-[86px] overflow-hidden">
        <div className="absolute inset-0 z-0 flex justify-start">
          <img
            src="/assets/header-banner.jpg"
            alt="Lịch Công Tác UBND Phường Cẩm Phả"
            className="h-full w-auto max-h-[86px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
        <div className="relative z-10 pl-[90px] md:pl-[130px] py-2 pr-2">
          <h1 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-[#1d5792] uppercase m-0 leading-tight tracking-wide">
            LỊCH CÔNG TÁC
          </h1>
          <h1 className="text-[13px] sm:text-[15px] md:text-[18px] font-bold text-[#c8102e] uppercase m-0 leading-tight tracking-wide mt-1">
            UBND PHƯỜNG CẨM PHẢ
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto">
        <nav className="bg-[#1d5792] shadow-md relative z-20">
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Mobile Menu Toggle */}
            <div
              className="md:hidden flex justify-between items-center px-4 py-3 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-white font-serif font-bold uppercase text-base tracking-wide">
                MENU
              </span>
              <Menu className="text-white w-7 h-7" />
            </div>

            {/* Nav Items */}
            <div
              className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full`}
            >
              {navItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target={item.target || '_self'}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className={`px-6 py-3 border-t border-[#154374] md:border-none text-white text-[15px] font-bold uppercase hover:bg-[#154374] transition-colors ${item.href === '/campha/search' ? 'bg-[#154374]' : ''}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Holiday Marquee */}
      {todayHoliday && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#fcf8e3] text-[#c8102e] py-1.5 border-b border-[#faebcc] overflow-hidden whitespace-nowrap relative">
            <marquee scrollamount="6" className="text-[13px] font-semibold tracking-wide">
              ⚛ {todayHoliday.content} ⚛
            </marquee>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search box */}
        <div className="bg-[#e8f0f7] border border-[#c0d4e8] p-4 md:p-6 mb-6">
          <h2 className="text-[#1d5792] font-bold text-base mb-4">Tìm kiếm</h2>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-[550px]">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <label className="text-gray-700 font-medium md:w-[160px] shrink-0">
                Thời gian bắt đầu
              </label>
              <div className="relative w-full max-w-[280px] md:max-w-none md:w-[200px] group">
                {!startDate && (
                  <div className="absolute inset-0 px-3 py-1.5 pointer-events-none text-gray-400 text-sm flex items-center group-focus-within:hidden">
                    dd/mm/yyyy
                  </div>
                )}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`border border-gray-300 px-3 py-1.5 rounded text-[16px] w-full outline-none focus:border-[#1d5792] focus:ring-1 focus:ring-[#1d5792] bg-transparent ${!startDate ? 'empty-date' : 'text-gray-700'}`}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <label className="text-gray-700 font-medium md:w-[160px] shrink-0">
                Thời gian kết thúc
              </label>
              <div className="relative w-full max-w-[280px] md:max-w-none md:w-[200px] group">
                {!endDate && (
                  <div className="absolute inset-0 px-3 py-1.5 pointer-events-none text-gray-400 text-sm flex items-center group-focus-within:hidden">
                    dd/mm/yyyy
                  </div>
                )}
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`border border-gray-300 px-3 py-1.5 rounded text-[16px] w-full outline-none focus:border-[#1d5792] focus:ring-1 focus:ring-[#1d5792] bg-transparent ${!endDate ? 'empty-date' : 'text-gray-700'}`}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-1 md:gap-4">
              <label className="text-gray-700 font-medium md:w-[160px] shrink-0 pt-1">
                Nội dung
              </label>
              <textarea
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                rows={3}
                className="border border-gray-300 px-3 py-2 rounded text-gray-700 text-[16px] w-full md:w-[300px] outline-none focus:border-[#1d5792] focus:ring-1 focus:ring-[#1d5792] resize-y"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-1 md:gap-4 mt-2">
              <div className="hidden md:block md:w-[160px] shrink-0" />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-2 rounded text-[16px] font-medium transition-colors disabled:opacity-50 w-full md:w-auto shadow-sm"
              >
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <>
            <div className="text-gray-500 text-[14px] mb-2">
              Danh sách lịch làm việc {results.length > 0 ? `(${results.length} kết quả)` : ''}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse border border-gray-300 text-[15px]">
                <thead>
                  <tr className="bg-[#fce8d5]">
                    <th className="border border-gray-300 py-2 px-3 font-bold w-12 text-center">
                      STT
                    </th>
                    <th className="border border-gray-300 py-2 px-3 font-bold w-28 text-center">
                      Ngày
                    </th>
                    <th className="border border-gray-300 py-2 px-3 font-bold text-center">
                      Nội dung
                    </th>
                    <th className="border border-gray-300 py-2 px-3 font-bold w-28 text-center">
                      Phòng, ban
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((item, index) => {
                      const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1
                      const dateInfo = formatDateDisplay(item.date)
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 py-2.5 px-3 text-center font-bold">
                            {globalIndex}
                          </td>
                          <td className="border border-gray-300 py-2.5 px-3 text-center leading-tight">
                            <div>{dateInfo.dayName}</div>
                            <div className="text-[#1d5792] font-bold">{dateInfo.date}</div>
                          </td>
                          <td className="border border-gray-300 py-2.5 px-3">
                            {item.startTime && (
                              <span className="text-[#c8102e] font-bold mr-2">
                                {item.startTime}
                              </span>
                            )}
                            {item.invitationNumber && (
                              <span className="mr-1">{item.invitationNumber}</span>
                            )}
                            {item.location && <span className="mr-1">(Tại {item.location})</span>}
                            {item.content && (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: item.content
                                    .replace(/<[^>]*>/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim(),
                                }}
                              />
                            )}
                          </td>
                          <td className="border border-gray-300 py-2.5 px-3 text-center">
                            {item.preparingUnit || 'Văn phòng'}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="border border-gray-300 py-6 text-center text-gray-500 italic"
                      >
                        Không tìm thấy lịch công tác phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {results.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-0.5 mt-4 text-xs flex-wrap">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-1.5 text-[#1d5792] hover:underline"
                  >
                    Previous
                  </button>
                )}
                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="px-1 text-gray-500">
                      |
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-1.5 ${currentPage === p ? 'font-bold text-gray-800' : 'text-[#1d5792] hover:underline'}`}
                    >
                      {currentPage === p ? p : <span>{p}</span>}
                    </button>
                  )
                )}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-1.5 text-[#1d5792] hover:underline"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <div className="max-w-6xl mx-auto">
        <footer className="bg-[#1d8fe8] text-white text-center py-2 text-xs mt-8">
          Bản quyền thuộc về UBND phường Cẩm Phả
        </footer>
      </div>
    </div>
  )
}
