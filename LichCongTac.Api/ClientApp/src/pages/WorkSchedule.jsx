import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function WorkSchedule() {
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/meetings/public-schedule')
      .then((res) => res.json())
      .then((json) => {
        // Interceptor might wrap data
        let data = []
        if (Array.isArray(json)) data = json
        else if (json.data) data = json.data
        else if (json.success && Array.isArray(json.data)) data = json.data

        setScheduleData(data)
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
      <div className="max-w-6xl mx-auto bg-white flex justify-start">
        <img
          src="/assets/header-banner.png"
          alt="Lịch Công Tác UBND Phường Cẩm Phả"
          className="h-auto max-h-[86px] object-contain"
        />
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
                        <span className="font-medium text-gray-800 text-[13px] leading-relaxed">
                          {item.title}
                          {item.location && ` (${item.location}) `}
                          {item.content && ` ${item.content} `}
                          {item.presider && ` Dự Đ/c ${item.presider}.`}
                          {item.preparingUnit && ` /.`}
                        </span>
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
                        <div key={idx} className="flex flex-col gap-0.5">
                          <span className="text-[#c8102e] font-medium text-[13px]">
                            {item.startTime}:
                          </span>
                          <span className="font-medium text-gray-800 text-[13px] leading-relaxed">
                            {item.title}
                            {item.location && ` (${item.location}) `}
                            {item.content && ` ${item.content} `}
                            {item.presider && ` Dự Đ/c ${item.presider}.`}
                          </span>
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
