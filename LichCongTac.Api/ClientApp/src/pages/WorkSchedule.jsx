import React, { useState, useEffect } from 'react'
import { Loader2, Menu } from 'lucide-react'

const formatLocation = (loc) => {
  if (!loc) return '';
  let cleanLoc = loc.trim();
  // Loại bỏ dấu ngoặc đơn bọc ngoài nếu có
  if (cleanLoc.startsWith('(') && cleanLoc.endsWith(')')) {
    cleanLoc = cleanLoc.slice(1, -1).trim();
  }
  // Loại bỏ chữ "Tại " ở đầu nếu có
  if (cleanLoc.toLowerCase().startsWith('tại ')) {
    cleanLoc = cleanLoc.substring(4).trim();
  }
  // Thử loại bỏ ngoặc đơn một lần nữa đề phòng trường hợp (Tại (Phòng...))
  if (cleanLoc.startsWith('(') && cleanLoc.endsWith(')')) {
    cleanLoc = cleanLoc.slice(1, -1).trim();
  }
  if (cleanLoc.toLowerCase().startsWith('tại ')) {
    cleanLoc = cleanLoc.substring(4).trim();
  }
  return cleanLoc;
};

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

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${yyyy}-${mm}-${dd}`;

        const grouped = {};
        data.forEach(item => {
          if (!item.date) return;
          const dateStr = item.date.split('T')[0];
          if (!grouped[dateStr]) grouped[dateStr] = [];
          grouped[dateStr].push(item);
        });

        const sortedDates = Object.keys(grouped).sort();
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

        const transformedData = sortedDates.map(dateStr => {
          const isToday = dateStr === todayFormatted;
          const d = new Date(dateStr);
          const dayOfWeek = d.getDay();
          const dayLabel = isToday ? 'Hôm nay' : days[dayOfWeek];
          const formattedDate = dateStr.split('-').reverse().join('/');

          return {
            isToday: isToday,
            dayLabel: dayLabel,
            date: formattedDate,
            originalDate: dateStr,
            items: grouped[dateStr].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
          };
        }).filter(d => d.originalDate >= todayFormatted);

        setScheduleData(transformedData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Lỗi tải dữ liệu lịch:', err)
        setLoading(false)
      })

    // Fetch notifications
    fetch('/api/notifications/visible')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setNotifications(json)
        else if (json.data) setNotifications(json.data)
      })
      .catch(err => console.error('Lỗi tải thông báo:', err))

    // Fetch today's holiday
    fetch('/api/holidays/today')
      .then(res => res.json())
      .then(json => {
        if (json && json.content) {
          setTodayHoliday(json)
        } else if (json.success && json.data) {
          setTodayHoliday(json.data)
        }
      })
      .catch(err => console.error('Lỗi tải ngày lễ:', err))
  }, [])

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'QUẢN LÝ VĂN BẢN ĐIỀU HÀNH', href: 'https://congchuc.quangninh.gov.vn/sso/Login.aspx', target: '_blank' },
    { label: 'CỔNG THÔNG TIN', href: 'https://quangninh.gov.vn/Trang/Default.aspx', target: '_blank' },
    { label: 'THƯ ĐIỆN TỬ', href: 'https://mail.quangninh.gov.vn/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmail.quangninh.gov.vn%2fowa%2f', target: '_blank' },
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
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <div className="relative z-10 pl-[130px] py-2">
          <h1 className="text-[24px] font-bold text-[#1d5792] uppercase m-0 leading-tight tracking-wide">LỊCH CÔNG TÁC</h1>
          <h1 className="text-[18px] font-bold text-[#c8102e] uppercase m-0 leading-tight tracking-wide mt-1">UBND PHƯỜNG CẨM PHẢ</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#1d5792] shadow-md relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center">
          {/* Mobile Menu Toggle */}
          <div
            className="md:hidden flex justify-between items-center px-4 py-3 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="text-white font-serif font-bold uppercase text-base tracking-wide">MENU</span>
            <Menu className="text-white w-7 h-7" />
          </div>

          {/* Nav Items */}
          <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full`}>
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target={item.target || '_self'}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={`px-6 py-3 border-t border-[#154374] md:border-none text-white text-xs font-bold uppercase hover:bg-[#154374] transition-colors`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

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
        {loading ? (
          <div className="flex justify-center py-20 text-[#1d5792]">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column (Today & Empty Background) */}
            <div className="flex flex-col h-full">
              {/* Today's Schedule */}
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-[#1d5792] text-center mb-4">
                  {displayToday.dayLabel}: {displayToday.dayLabel === 'Hôm nay' ? '' : 'Chủ nhật,'}{' '}
                  ngày {displayToday.date}
                </h3>

                {displayToday.items.length > 0 ? (
                  <div className="space-y-3 px-4">
                    {displayToday.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-[#c8102e] shrink-0 font-medium">
                          {item.startTime}:
                        </span>
                        <div className="font-medium text-gray-800 text-[13px] leading-relaxed w-full">
                          <span>
                            {item.invitationNumber && `${item.invitationNumber} `}
                            {item.location && <span className="text-[#1d5792] font-semibold">(Tại {formatLocation(item.location)}) </span>}
                          </span>
                          {item.content && (
                            <span>
                              {item.content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()}
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
                <div className="mb-4">
                  <hr className="border-gray-200 my-4" />
                  <div className="space-y-3">
                    {notifications.map((notif, idx) => (
                      <div key={notif.id || idx} className="text-gray-800 text-[14px] leading-relaxed break-words content-render">
                        <div dangerouslySetInnerHTML={{ __html: notif.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Light blue/gray filler box mimicking screenshot */}
              <div className="bg-[#f0f4f8] flex-grow mt-4 rounded-sm min-h-[300px]" />
            </div>

            {/* Right Column (Upcoming Days) */}
            <div className="bg-[#e6fbda] p-6 rounded-sm min-h-[600px]">
              {upcomingSchedules.length > 0 ? (
                upcomingSchedules.map((day, dayIdx) => (
                  <div key={dayIdx} className="mb-8">
                    <h3 className="text-[17px] font-semibold text-[#1d5792] mb-3">
                      {day.dayLabel}, ngày {day.date}:
                    </h3>
                    <div className="space-y-4">
                      {day.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-[#c8102e] shrink-0 font-medium">
                            {item.startTime}:
                          </span>
                          <div className="font-medium text-gray-800 text-[13px] leading-relaxed w-full">
                            <span>
                              {item.invitationNumber && `${item.invitationNumber} `}
                              {item.location && <span className="text-[#1d5792] font-semibold">(Tại {formatLocation(item.location)}) </span>}
                            </span>
                            {item.content && (
                              <span>
                                {item.content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()}
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
      <footer className="bg-[#1d8fe8] text-white text-center py-2 text-xs mt-8">
        Bản quyền thuộc về UBND phường Cẩm Phả
      </footer>
    </div>
  )
}
