/* global DOMParser */
import { useState, useEffect } from 'react'
import { useAppSignalR } from '../contexts/SignalRContext'
import { scheduleService } from '../services/schedule.service'
import { PublicLayout } from '../shared/components/PublicLayout'
import { Calendar } from 'lucide-react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { vi } from 'date-fns/locale'

registerLocale('vi', vi)

const PAGE_SIZE = 10
const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

const extractText = (html) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const formatDateDisplay = (dateString) => {
  if (!dateString) return { dayName: '', date: '' }
  try {
    const parts = dateString.split('T')[0].split('-')
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    return {
      dayName: DAYS[d.getDay()],
      date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
    }
  } catch {
    return { dayName: '', date: dateString }
  }
}

export default function SearchSchedule() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [keyword, setKeyword] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const [results, setResults] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [todayHoliday, setTodayHoliday] = useState(null)
  const { lastHolidayUpdate } = useAppSignalR()

  useEffect(() => {
    scheduleService
      .getTodayHoliday()
      .then((data) => setTodayHoliday(data?.content ? data : data?.data || null))
      .catch(() => { })
  }, [lastHolidayUpdate])

  const fetchResults = async (page) => {
    setLoading(true)
    try {
      const params = { page, pageSize: PAGE_SIZE }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (keyword.trim()) params.keyword = keyword.trim()

      const raw = await scheduleService.searchPublicSchedules(params)
      const items = raw?.items || []
      const count = raw?.totalCount || 0

      setResults(items)
      setTotalCount(count)
      setSearched(true)
    } catch {
      setResults([])
      setTotalCount(0)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (currentPage === 1) {
      fetchResults(1)
    } else {
      setCurrentPage(1)
    }
  }

  useEffect(() => {
    if (searched) {
      fetchResults(currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const paginated = results
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <PublicLayout activeHref="/campha/search" todayHoliday={todayHoliday}>
      <main className="max-w-6xl mx-auto px-4 py-6 text-[16px]">
        {/* Search box */}
        <div className="bg-[#e8f0f7] border border-[#c0d4e8] p-4 md:p-6 mb-6">
          <h2 className="text-[#1d5792] font-bold text-base mb-4">Tìm kiếm</h2>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 w-full max-w-[550px]">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <label className="text-gray-700 font-medium md:w-[160px] shrink-0">
                Thời gian bắt đầu
              </label>
              <div className="relative w-full md:w-[200px] group flex items-center">
                <DatePicker
                  selected={startDate ? new Date(startDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear()
                      const mm = String(date.getMonth() + 1).padStart(2, '0')
                      const dd = String(date.getDate()).padStart(2, '0')
                      setStartDate(`${yyyy}-${mm}-${dd}`)
                    } else {
                      setStartDate('')
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="vi"
                  placeholderText="Ngày/Tháng/Năm"
                  wrapperClassName="w-full"
                  className="border border-gray-300 px-3 py-1.5 rounded min-w-0 w-full outline-none focus:border-[#1d5792] focus:ring-1 focus:ring-[#1d5792] bg-white pr-10"
                  withPortal={isMobile}
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: 'preventOverflow',
                      options: { boundary: 'viewport', altAxis: true, padding: 8 },
                    },
                    {
                      name: 'flip',
                      options: { fallbackPlacements: ['top-start', 'bottom-start'] },
                    },
                  ]}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <label className="text-gray-700 font-medium md:w-[160px] shrink-0">
                Thời gian kết thúc
              </label>
              <div className="relative w-full md:w-[200px] group flex items-center">
                <DatePicker
                  selected={endDate ? new Date(endDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear()
                      const mm = String(date.getMonth() + 1).padStart(2, '0')
                      const dd = String(date.getDate()).padStart(2, '0')
                      setEndDate(`${yyyy}-${mm}-${dd}`)
                    } else {
                      setEndDate('')
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="vi"
                  placeholderText="Ngày/Tháng/Năm"
                  wrapperClassName="w-full"
                  className="border border-gray-300 px-3 py-1.5 rounded min-w-0 w-full outline-none focus:border-[#1d5792] focus:ring-1 focus:ring-[#1d5792] bg-white pr-10"
                  withPortal={isMobile}
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: 'preventOverflow',
                      options: { boundary: 'viewport', altAxis: true, padding: 8 },
                    },
                    {
                      name: 'flip',
                      options: { fallbackPlacements: ['top-start', 'bottom-start'] },
                    },
                  ]}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
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
                className="border border-gray-300 px-3 py-2 rounded text-gray-700 w-full md:w-[300px] outline-none focus:border-[#1d5792] resize-y"
              />
            </div>
            <div className="flex md:gap-4">
              <div className="hidden md:block md:w-[160px] shrink-0" />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-2 rounded font-medium transition-colors disabled:opacity-50 shadow-sm"
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
              Danh sách lịch làm việc {totalCount > 0 ? `(${totalCount} kết quả)` : ''}
            </div>
            {/* Mobile: card layout — Desktop: table */}
            <div className="w-full">
              {/* === DESKTOP TABLE (md+) === */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse border border-gray-300 text-[15px]">
                  <thead>
                    <tr className="bg-[#fce8d5]">
                      <th className="border border-gray-300 py-2 px-3 font-bold w-12 text-center">STT</th>
                      <th className="border border-gray-300 py-2 px-3 font-bold w-28 text-center">Ngày</th>
                      <th className="border border-gray-300 py-2 px-3 font-bold text-center">Nội dung</th>
                      <th className="border border-gray-300 py-2 px-3 font-bold w-28 text-center">Phòng, ban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? (
                      paginated.map((item, index) => {
                        const di = formatDateDisplay(item.date)
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 py-2.5 px-3 text-center font-bold">
                              {(currentPage - 1) * PAGE_SIZE + index + 1}
                            </td>
                            <td className="border border-gray-300 py-2.5 px-3 text-center leading-tight">
                              <div>{di.dayName}</div>
                              <div className="text-[#1d5792] font-bold">{di.date}</div>
                            </td>
                            <td className="border border-gray-300 py-2.5 px-3">
                              {item.startTime?.trim() && (
                                <span className="text-[#c8102e] font-bold mr-2">{item.startTime.trim()}:</span>
                              )}
                              {item.invitationNumber && (
                                <span className="text-[#005f6b] font-bold mr-1">{item.invitationNumber}</span>
                              )}
                              {item.location && (
                                <span className="text-[#005f6b] font-bold mr-1">(Tại {extractText(item.location)})</span>
                              )}
                              {item.content && (
                                <span className="text-gray-900">{extractText(item.content)}</span>
                              )}
                            </td>
                            <td className="border border-gray-300 py-2.5 px-3 text-center">
                              {extractText(item.preparingUnit) || 'Văn phòng'}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="border border-gray-300 py-6 text-center text-gray-500 italic">
                          Không tìm thấy lịch công tác phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* === MOBILE CARD LAYOUT (< md) === */}
              <div className="md:hidden flex flex-col divide-y divide-gray-200 border-t border-gray-300">
                {paginated.length > 0 ? (
                  paginated.map((item, index) => {
                    const di = formatDateDisplay(item.date)
                    return (
                      <div key={item.id} className="py-3 px-1 bg-white hover:bg-gray-50">
                        {/* Dòng trên: STT + Ngày */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] text-gray-400 font-semibold min-w-[20px]">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}.
                          </span>
                          <span className="text-[13px] font-bold text-[#1d5792]">{di.date}</span>
                          <span className="text-[12px] text-gray-500">({di.dayName})</span>
                        </div>
                        {/* Nội dung */}
                        <div className="text-[14px] text-gray-900 leading-snug pl-6">
                          {item.startTime?.trim() && (
                            <span className="text-[#c8102e] font-bold mr-1">{item.startTime.trim()}:</span>
                          )}
                          {item.invitationNumber && (
                            <span className="text-[#005f6b] font-bold mr-1">{item.invitationNumber}</span>
                          )}
                          {item.location && (
                            <span className="text-[#005f6b] font-bold mr-1">(Tại {extractText(item.location)})</span>
                          )}
                          {item.content && (
                            <span>{extractText(item.content)}</span>
                          )}
                        </div>
                        {/* Phòng ban (nhỏ, dưới cùng) */}
                        {extractText(item.preparingUnit) && (
                          <div className="text-[11px] text-gray-400 mt-1 pl-6 italic">
                            {extractText(item.preparingUnit) || 'Văn phòng'}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="py-6 text-center text-gray-500 italic text-[14px]">
                    Không tìm thấy lịch công tác phù hợp.
                  </div>
                )}
              </div>
            </div>
            {/* Pagination */}
            {totalCount > PAGE_SIZE && (
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
                      {p}
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
    </PublicLayout>
  )
}
