/* global DOMParser */
import { useState, useEffect, useCallback } from 'react'
import { Loader2, Bell } from 'lucide-react'
import { useAppSignalR } from '../contexts/SignalRContext'
import { scheduleService } from '../services/schedule.service'
import { notificationService } from '../services/notification.service'
import { PublicLayout } from '../shared/components/PublicLayout'

// --- Pure helper functions ---
const formatLocation = (loc) => {
  if (!loc) return ''
  let s = loc.trim()
  if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim()
  if (s.toLowerCase().startsWith('tại ')) s = s.substring(4).trim()
  if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim()
  if (s.toLowerCase().startsWith('tại ')) s = s.substring(4).trim()
  return s
}



const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

const groupAndTransform = (arrayData) => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const grouped = {}
  arrayData.forEach((item) => {
    if (!item.date) return
    const dateStr = item.date.split('T')[0]
    if (!grouped[dateStr]) grouped[dateStr] = []
    grouped[dateStr].push(item)
  })
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 7)
  const maxStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`

  return Object.keys(grouped)
    .sort()
    .filter((d) => d >= todayStr && d <= maxStr)
    .map((dateStr) => {
      const parts = dateStr.split('-')
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      const isToday = dateStr === todayStr
      return {
        isToday,
        originalDate: dateStr,
        dayLabel: isToday ? 'Hôm nay' : DAYS[d.getDay()],
        date: dateStr.split('-').reverse().join('/'),
        items: grouped[dateStr].sort((a, b) => {
          const timeCmp = (a.startTime || '').localeCompare(b.startTime || '')
          if (timeCmp !== 0) return timeCmp
          return (a.id || 0) - (b.id || 0)
        }),
      }
    })
}

// --- Sub-components (local, small) ---
function ScheduleItem({ item }) {
  return (
    <div className="flex gap-2">
      {item.startTime?.trim() && (
        <span className="text-[#c8102e] shrink-0 font-bold text-[17px] md:text-[18px]">
          {item.startTime.trim()}:
        </span>
      )}
      <div className="font-medium text-[16px] md:text-[17px] leading-relaxed w-full text-justify">
        {item.invitationNumber && (
          <span className="text-[#005f6b] font-bold mr-1">{item.invitationNumber}</span>
        )}
        {item.location && (
          <span className="text-[#005f6b] font-bold mr-1 inline-flex items-baseline flex-wrap font-['Times_New_Roman',_Times,_serif] text-[18px]">
            (Tại <span className="[&>p]:inline ml-1" dangerouslySetInnerHTML={{ __html: formatLocation(item.location) }} />)
          </span>
        )}
        {item.content && (
          <div
            className="text-gray-900 prose dark:prose-invert prose-sm max-w-none [&>p:first-child]:inline"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}
      </div>
    </div>
  )
}

// --- Page ---
export default function WorkSchedule() {
  const [scheduleData, setScheduleData] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayHoliday, setTodayHoliday] = useState(null)
  const { lastScheduleUpdate, lastHolidayUpdate } = useAppSignalR()

  const fetchData = useCallback(async () => {
    try {
      const raw = await scheduleService.getPublicSchedule()
      setScheduleData(groupAndTransform(Array.isArray(raw) ? raw : raw?.data || []))
    } catch (err) {
      console.error('Lỗi tải lịch:', err)
    } finally {
      setLoading(false)
    }
    try {
      const notifRaw = await notificationService.getVisibleNotifications()
      setNotifications(Array.isArray(notifRaw) ? notifRaw : notifRaw?.data || [])
    } catch {
      /* silent */
    }
    try {
      const hol = await scheduleService.getTodayHoliday()
      setTodayHoliday(hol?.content ? hol : hol?.data || null)
    } catch {
      /* silent */
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData, lastScheduleUpdate])

  useEffect(() => {
    scheduleService
      .getTodayHoliday()
      .then((d) => setTodayHoliday(d?.content ? d : d?.data || null))
      .catch(() => { })
  }, [lastHolidayUpdate])

  const todayData = scheduleData.find((d) => d.isToday) || {
    dayLabel: 'Hôm nay',
    date: new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    items: [],
  }
  const upcoming = scheduleData.filter((d) => !d.isToday)

  return (
    <PublicLayout activeHref="/campha/" todayHoliday={todayHoliday}>
      <main className="max-w-6xl mx-auto pt-0 pb-6">
        {loading ? (
          <div className="flex justify-center py-20 text-[#1d5792]">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4">
            {/* Left: Today */}
            <div className="flex flex-col h-full md:col-span-3 px-4 pt-5">
              <h3 className="text-[18px] md:text-2xl font-bold text-[#1d5792] text-center mb-5">
                {todayData.dayLabel}: ngày {todayData.date}
              </h3>
              {todayData.items.length > 0 ? (
                <div className="space-y-6 px-4">
                  {todayData.items.map((item, idx) => (
                    <ScheduleItem key={idx} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 italic py-4">Không có lịch công tác</p>
              )}
              {notifications.length > 0 && (
                <div className="mb-6 px-4 md:px-0 mt-6">
                  <div className="bg-[#f8f9fa] border-l-4 border-[#1d5792] p-4 rounded shadow-sm">
                    <h4 className="text-[#1d5792] font-bold text-[17px] flex items-center gap-2 mb-3 uppercase tracking-wide">
                      <Bell className="w-5 h-5 text-[#c8102e] animate-pulse" /> Thông báo
                    </h4>
                    <div className="space-y-3">
                      {notifications.map((notif, idx) => (
                        <div
                          key={notif.id || idx}
                          className="text-gray-800 text-[16px] leading-relaxed text-justify break-words content-render border-b border-gray-200 last:border-0 pb-3 last:pb-0"
                        >
                          <div className="prose dark:prose-invert max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: notif.content }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Right: Upcoming */}
            <div className="bg-[#e6fbda] p-4 rounded-sm md:col-span-2">
              {upcoming.length > 0 ? (
                upcoming.map((day, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-[18px] md:text-[19px] font-bold text-[#1d5792] mb-4 text-center">
                      {day.dayLabel}, ngày {day.date}:
                    </h3>
                    <div className="space-y-5">
                      {day.items.map((item, i) => (
                        <ScheduleItem key={i} item={item} />
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
    </PublicLayout>
  )
}
