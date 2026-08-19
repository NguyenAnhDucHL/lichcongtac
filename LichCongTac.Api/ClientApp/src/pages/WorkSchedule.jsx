/* global DOMParser */
import { useState, useEffect, useCallback, useRef } from 'react'
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

// Helper luôn trả về ngày hôm nay theo giờ Việt Nam (GMT+7)
// Dùng local time để match với server lưu date theo múi giờ địa phương
const getTodayStr = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// Parse date string từ server về local date string — xử lý cả 2 dạng:
//   'YYYY-MM-DD'          → trả nguyên về
//   'YYYY-MM-DDTHH:mm:ssZ' → chuyển sang local date theo múi giờ máy client
const parseDateStr = (raw) => {
  if (!raw) return null
  const plain = raw.split('T')[0]   // lấy phần YYYY-MM-DD
  // Nếu server trả dạng có timezone (Z hoặc +07:00), parse đúng về local
  if (raw.includes('T')) {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }
  return plain
}

const groupAndTransform = (arrayData) => {
  const todayStr = getTodayStr()
  const grouped = {}
  arrayData.forEach((item) => {
    if (!item.date) return
    // Dùng parseDateStr để xử lý đúng cả UTC ISO string lẫn plain YYYY-MM-DD
    const dateStr = parseDateStr(item.date)
    if (!dateStr) return
    if (!grouped[dateStr]) grouped[dateStr] = []
    grouped[dateStr].push(item)
  })
  const maxDate = new Date(todayStr + 'T00:00:00')
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
        <span className="text-[#c8102e] shrink-0 font-bold font-['Times_New_Roman',_Times,_serif] text-[18px]">
          {item.startTime.trim()}:
        </span>
      )}
      <div className="font-medium font-['Times_New_Roman',_Times,_serif] text-[18px] leading-tight w-full text-justify">
        {item.invitationNumber && (
          <span className="text-[#005f6b] font-bold mr-1">{item.invitationNumber}</span>
        )}
        {item.location && (
          <span className="text-[#005f6b] font-bold mr-1 inline">
            (Tại{' '}
            <span
              className="inline-html-content ml-1"
              dangerouslySetInnerHTML={{ __html: formatLocation(item.location) }}
            />
            )
          </span>
        )}
        {item.content && (
          <div
            className="text-gray-900 mt-0.5 [&_p]:m-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-5 [&_ol]:ml-5 [&_li]:m-0"
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
  const [error, setError] = useState(null)
  const { lastScheduleUpdate, lastHolidayUpdate, lastReconnect } = useAppSignalR()
  // Lưu ngày cuối cùng fetch để phát hiện khi ngày thay đổi qua đêm
  const lastFetchDateRef = useRef(null)
  // Guard: ngăn setState sau khi component unmount (tránh memory leak từ retry timeout)
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])
  // Race condition guard: mọi fetch được đánh số ID — response cũ hơn sẽ bị bỏ qua
  const fetchIdRef = useRef(0)
  // Deduplication: không start fetch mới khi đang có fetch chạy
  const isFetchingRef = useRef(false)

  const fetchData = useCallback(async (retryCount = 0) => {
    // ━━ Deduplication: bỏ qua nếu đang có fetch chạy (tránh 3 trigger cùng lúc gây 3 request song song)
    if (isFetchingRef.current && retryCount === 0) {
      console.log('[WorkSchedule] Fetch already in progress, skipping duplicate trigger')
      return
    }

    // ━━ Race condition guard: đánh dấu fetch này với ID duy nhất
    const currentId = ++fetchIdRef.current
    isFetchingRef.current = true
    lastFetchDateRef.current = getTodayStr()

    let scheduleOk = false
    try {
      if (isMountedRef.current) setError(null)
      const raw = await scheduleService.getPublicSchedule()

      // Chỉ cập nhật state nếu đây là fetch MỚI NHẤT (bỏ qua response lỗi thời)
      if (fetchIdRef.current !== currentId) {
        console.log('[WorkSchedule] Stale response discarded (newer fetch already resolved)')
        return
      }
      if (isMountedRef.current) {
        setScheduleData(groupAndTransform(Array.isArray(raw) ? raw : raw?.data || []))
        scheduleOk = true
      }
    } catch (err) {
      if (fetchIdRef.current !== currentId || !isMountedRef.current) return

      console.error('Lỗi tải lịch:', err)
      // ━━ Exponential backoff: 3s → 6s → 12s (ghìp đôi mỗi lần retry, tối đa 3 lần)
      const MAX_RETRIES = 3
      if (retryCount < MAX_RETRIES) {
        const delay = 3000 * Math.pow(2, retryCount)  // 3s, 6s, 12s
        console.log(`[WorkSchedule] Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms...`)
        setTimeout(() => { if (isMountedRef.current) fetchData(retryCount + 1) }, delay)
      } else {
        if (isMountedRef.current) setError('Đang mất kết nối máy chủ, vui lòng thử lại sau...')
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
      // Giải phóng lock chỉ khi đây là fetch hiện tại (không giải phóng nếu đã có fetch mới hơn)
      if (fetchIdRef.current === currentId) isFetchingRef.current = false
    }

    // Chỉ fetch notification/holiday khi lịch chính thành công — tránh gọi API thừa khi lỗi
    if (!scheduleOk) return
    try {
      const notifRaw = await notificationService.getVisibleNotifications()
      if (isMountedRef.current) {
        setNotifications(Array.isArray(notifRaw) ? notifRaw : notifRaw?.data || [])
      }
    } catch {
      /* silent */
    }
    try {
      const hol = await scheduleService.getTodayHoliday()
      if (isMountedRef.current) {
        setTodayHoliday(hol?.content ? hol : hol?.data || null)
      }
    } catch {
      /* silent */
    }
  }, [])

  // Lần mount đầu tiên
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cơ chế 1: SignalR — admin sửa lịch → server push → fetch ngay
  useEffect(() => {
    if (lastScheduleUpdate) fetchData()
  }, [lastScheduleUpdate, fetchData])

  // Cơ chế 2: SignalR reconnect sau sleep/mất mạng → fetch lại
  useEffect(() => {
    if (lastReconnect) fetchData()
  }, [lastReconnect, fetchData])

  // Cơ chế 3: visibilitychange — người dùng quay lại app/tab sau khi để qua đêm
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Luôn fetch lại khi quay lại, đặc biệt nếu ngày đã đổi
        fetchData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchData])

  // Cơ chế 4: online event — mạng bị mất rồi trở lại → fetch ngay
  useEffect(() => {
    const handleOnline = () => {
      console.log('[WorkSchedule] Network online — refetching...')
      fetchData()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [fetchData])

  // Cơ chế 4b: pageshow — BFCache (Back/Forward Cache trên iOS Safari & Mobile Chrome)
  // visibilitychange KHÔNG fire khi trang được khôi phục từ BFCache → cần event riêng
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        // e.persisted = true nghĩa là trang được restore từ BFCache, không phải load mới
        console.log('[WorkSchedule] Restored from BFCache — refetching...')
        fetchData()
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [fetchData])

  // Cơ chế 5: Midnight clock-tick — tự động đổi ngày lúc 0h00
  useEffect(() => {
    const scheduleMidnightRefresh = () => {
      const now = new Date()
      // Tính số ms còn lại đến 00:01 ngày hôm sau (buffer 1 phút)
      const msToMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0).getTime() - now.getTime()
      const timer = setTimeout(() => {
        console.log('[WorkSchedule] Midnight tick — refreshing for new day...')
        fetchData()
        // Đặt lại timer cho ngày hôm sau
        scheduleMidnightRefresh()
      }, msToMidnight)
      return timer
    }
    const timer = scheduleMidnightRefresh()
    return () => clearTimeout(timer)
  }, [fetchData])

  // Cơ chế 6: Fallback polling 30 phút — chỉ chạy khi tab ĐANG VISIBLE
  // Tránh nhiều tab cùng poll song song lãng phí tài nguyên điện thoại
  useEffect(() => {
    const THIRTY_MINUTES = 30 * 60 * 1000
    const interval = setInterval(() => {
      // Bỏ qua nếu tab đang ẩn — visibilitychange sẽ xử lý khi quay lại
      if (document.visibilityState !== 'visible') return
      console.log('[WorkSchedule] Polling fallback — refetching...')
      fetchData()
    }, THIRTY_MINUTES)
    return () => clearInterval(interval)
  }, [fetchData])

  // Holiday update từ SignalR
  useEffect(() => {
    if (!lastHolidayUpdate) return
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
        ) : error ? (
          <div className="flex justify-center py-20 px-4">
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md text-center max-w-lg shadow-sm">
              <p className="font-medium text-lg">{error}</p>
              <p className="text-sm mt-2 text-red-500">
                Hệ thống có thể đang bảo trì hoặc mạng không ổn định.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4">
            {/* Left: Today */}
            <div className="flex flex-col h-full md:col-span-3 px-4 pt-5">
              <h3 className="text-[18px] md:text-2xl font-bold text-[#1d5792] text-center mb-5">
                {todayData.dayLabel}: ngày {todayData.date}
              </h3>
              {todayData.items.length > 0 ? (
                <div className="space-y-2 px-4">
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
                          <div
                            className="prose dark:prose-invert max-w-none prose-sm"
                            dangerouslySetInnerHTML={{ __html: notif.content }}
                          />
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
                    <div className="space-y-2">
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
