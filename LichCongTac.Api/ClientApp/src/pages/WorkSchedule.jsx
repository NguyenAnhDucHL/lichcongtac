import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function WorkSchedule() {
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)

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
  }, [])

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'QUẢN LÝ VĂN BẢN ĐIỀU HÀNH', href: '#' },
    { label: 'CỔNG THÔNG TIN', href: '#' },
    { label: 'THƯ ĐIỆN TỬ', href: '#' },
    { label: 'TÌM KIẾM', href: '#' },
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
            src="/assets/header-banner.png"
            alt="Lịch Công Tác UBND Phường Cẩm Phả"
            className="h-full w-auto max-h-[86px] object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <div className="relative z-10 pl-6 py-2">
          <h1 className="text-[24px] font-bold text-[#1d5792] uppercase m-0 leading-tight tracking-wide">LỊCH CÔNG TÁC</h1>
          <h1 className="text-[18px] font-bold text-[#c8102e] uppercase m-0 leading-tight tracking-wide mt-1">UBND PHƯỜNG CẨM PHẢ</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#1d5792] shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="px-6 py-3 text-white text-xs font-bold uppercase hover:bg-[#154374] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

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
                          </span>
                          {item.content && (
                            <div className="my-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 italic py-4">Không có lịch công tác</p>
                )}
              </div>

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
                            </span>
                            {item.content && (
                              <div className="my-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
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
    </div>
  )
}
