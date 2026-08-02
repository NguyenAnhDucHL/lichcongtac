import React, { useState, useEffect } from 'react'
import { Loader2, Menu, Bell } from 'lucide-react'

const formatLocation = (loc) => {
  if (!loc) return ''
  let cleanLoc = loc.trim()
  // Loại bỏ dấu ngoặc đơn bọc ngoài nếu có
  if (cleanLoc.startsWith('(') && cleanLoc.endsWith(')')) {
    cleanLoc = cleanLoc.slice(1, -1).trim()
  }
  // Loại bỏ chữ "Tại " ở đầu nếu có
  if (cleanLoc.toLowerCase().startsWith('tại ')) {
    cleanLoc = cleanLoc.substring(4).trim()
  }
  // Thử loại bỏ ngoặc đơn một lần nữa đề phòng trường hợp (Tại (Phòng...))
  if (cleanLoc.startsWith('(') && cleanLoc.endsWith(')')) {
    cleanLoc = cleanLoc.slice(1, -1).trim()
  }
  if (cleanLoc.toLowerCase().startsWith('tại ')) {
    cleanLoc = cleanLoc.substring(4).trim()
  }
  return cleanLoc
}

export default function WorkSchedule() {
  const [scheduleData, setScheduleData] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [todayHoliday, setTodayHoliday] = useState(null)

  useEffect(() => {
    fetch('/api/schedules/public-schedule')
      .then((res) => res.json())
      .then((json) => {
        let data = []
        if (Array.isArray(json)) data = json
        else if (json.data) data = json.data
        else if (json.success && Array.isArray(json.data)) data = json.data

        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const todayFormatted = `${yyyy}-${mm}-${dd}`

        const grouped = {}
        data.forEach((item) => {
          if (!item.date) return
          const dateStr = item.date.split('T')[0]
          if (!grouped[dateStr]) grouped[dateStr] = []
          grouped[dateStr].push(item)
        })

        const sortedDates = Object.keys(grouped).sort()
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

        const transformedData = sortedDates
          .map((dateStr) => {
            const isToday = dateStr === todayFormatted
            const parts = dateStr.split('-')
            const d = new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10)
            )
            const dayOfWeek = d.getDay()
            const dayLabel = isToday ? 'Hôm nay' : days[dayOfWeek]
            const formattedDate = dateStr.split('-').reverse().join('/')

            return {
              isToday: isToday,
              dayLabel: dayLabel,
              date: formattedDate,
              originalDate: dateStr,
              items: grouped[dateStr].sort((a, b) =>
                (a.startTime || '').localeCompare(b.startTime || '')
              ),
            }
          })
          .filter((d) => {
            if (d.originalDate < todayFormatted) return false
            const maxDate = new Date()
            maxDate.setDate(maxDate.getDate() + 7)
            const maxFormatted = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`
            return d.originalDate <= maxFormatted
          })

        setScheduleData(transformedData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Lỗi tải dữ liệu lịch:', err)
        setLoading(false)
      })

    // Fetch notifications
    fetch('/api/notifications/visible')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) setNotifications(json)
        else if (json.data) setNotifications(json.data)
      })
      .catch((err) => console.error('Lỗi tải thông báo:', err))

    // Fetch today's holiday
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

  const navItems = [
    { label: 'HOME', href: '/' },
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

  const todaySchedule = scheduleData.find((d) => d.isToday) || null
  const upcomingSchedules = scheduleData.filter((d) => !d.isToday)

  // Fallback if no "today" in data but we want to show something
  const displayToday = todaySchedule || {
    dayLabel: 'Hôm nay',
    date: new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    items: [],
  }

  return (
    <div className="min-h-screen bg-white font-sans text-sm text-gray-800">
      {/* Header Image */}
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
                  className={`px-6 py-3 border-t border-[#154374] md:border-none text-white text-[15px] font-bold uppercase hover:bg-[#154374] transition-colors`}
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
      <main className="max-w-6xl mx-auto pt-0 pb-6">
        {loading ? (
          <div className="flex justify-center py-20 text-[#1d5792]">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4">
            {/* Left Column (Today & Empty Background) */}
            <div className="flex flex-col h-full md:col-span-3 px-4 pt-5">
              {/* Today's Schedule */}
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-[#1d5792] text-center mb-4">
                  {displayToday.dayLabel}: {displayToday.dayLabel === 'Hôm nay' ? '' : 'Chủ nhật,'}{' '}
                  ngày {displayToday.date}
                </h3>

                {displayToday.items.length > 0 ? (
                  <div className="space-y-6 px-4">
                    {displayToday.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        {item.startTime && item.startTime.trim() !== '' && (
                          <span className="text-[#c8102e] shrink-0 font-medium text-[16px]">
                            {item.startTime.trim()}:
                          </span>
                        )}
                        <div className="font-medium text-gray-800 text-[16px] leading-snug w-full text-justify">
                          <span>
                            {item.invitationNumber && `${item.invitationNumber} `}
                            {item.location && (
                              <span className="text-[#1d5792] font-semibold">
                                (Tại {formatLocation(item.location)}){' '}
                              </span>
                            )}
                          </span>
                          {item.content && (
                            <span>
                              {item.content
                                .replace(/<[^>]*>/g, ' ')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 italic py-4">Không có lịch công tác</p>
                )}
              </div>

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="mb-6 px-4 md:px-0">
                  <div className="bg-[#f8f9fa] border-l-4 border-[#1d5792] p-4 rounded shadow-sm">
                    <h4 className="text-[#1d5792] font-bold text-[17px] flex items-center gap-2 mb-3 uppercase tracking-wide">
                      <Bell className="w-5 h-5 text-[#c8102e] animate-pulse" />
                      Thông báo
                    </h4>
                    <div className="space-y-3">
                      {notifications.map((notif, idx) => (
                        <div
                          key={notif.id || idx}
                          className="text-gray-800 text-[16px] leading-relaxed text-justify break-words content-render border-b border-gray-200 last:border-0 pb-3 last:pb-0"
                        >
                          <div dangerouslySetInnerHTML={{ __html: notif.content }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Upcoming Days) */}
            <div className="bg-[#e6fbda] p-4 rounded-sm md:col-span-2">
              {upcomingSchedules.length > 0 ? (
                upcomingSchedules.map((day, dayIdx) => (
                  <div key={dayIdx} className="mb-8">
                    <h3 className="text-[17px] font-semibold text-[#1d5792] mb-3">
                      {day.dayLabel}, ngày {day.date}:
                    </h3>
                    <div className="space-y-4">
                      {day.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          {item.startTime && item.startTime.trim() !== '' && (
                            <span className="text-[#c8102e] shrink-0 font-medium text-[16px]">
                              {item.startTime.trim()}:
                            </span>
                          )}
                          <div className="font-medium text-gray-800 text-[16px] leading-snug w-full text-justify">
                            <span>
                              {item.invitationNumber && `${item.invitationNumber} `}
                              {item.location && (
                                <span className="text-[#1d5792] font-semibold">
                                  (Tại {formatLocation(item.location)}){' '}
                                </span>
                              )}
                            </span>
                            {item.content && (
                              <span>
                                {item.content
                                  .replace(/<[^>]*>/g, ' ')
                                  .replace(/&nbsp;/g, ' ')
                                  .replace(/\s+/g, ' ')
                                  .trim()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 italic">Không có lịch công tác sắp tới</p>
              )}
            </div>
          </div>
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
