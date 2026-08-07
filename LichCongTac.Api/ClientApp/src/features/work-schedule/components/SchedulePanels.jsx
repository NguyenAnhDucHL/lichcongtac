/* global DOMParser */
const formatLocation = (loc) => {
  if (!loc) return ''
  let s = loc.trim()
  if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim()
  if (s.toLowerCase().startsWith('tại ')) s = s.substring(4).trim()
  if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim()
  if (s.toLowerCase().startsWith('tại ')) s = s.substring(4).trim()
  return s
}


/**
 * Renders a single schedule item row (time + content + location).
 */
export function ScheduleItem({ item }) {
  return (
    <div className="flex gap-2">
      {item.startTime && item.startTime.trim() !== '' && (
        <span className="text-[#c8102e] shrink-0 font-bold font-['Times_New_Roman',_Times,_serif] text-[18px]">
          {item.startTime.trim()}:
        </span>
      )}
      <div className="font-medium font-['Times_New_Roman',_Times,_serif] text-[18px] leading-relaxed w-full text-justify">
        <span>
          {item.invitationNumber && (
            <span className="text-[#005f6b] font-bold mr-1">{item.invitationNumber}</span>
          )}
          {item.location && (
            <span className="text-[#005f6b] font-bold mr-1 inline">
              (Tại <span className="inline-html-content ml-1" dangerouslySetInnerHTML={{ __html: formatLocation(item.location) }} />)
            </span>
          )}
        </span>
        {item.content && (
          <div
            className="text-gray-900 prose dark:prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Renders the Today column (left panel).
 */
export function TodayPanel({ displayToday, notifications }) {
  const { Bell } = require('lucide-react')

  return (
    <div className="flex flex-col h-full md:col-span-3 px-4 pt-5">
      <div className="mb-4">
        <h3 className="text-[18px] md:text-2xl font-bold text-[#1d5792] text-center mb-5">
          {displayToday.dayLabel}: ngày {displayToday.date}
        </h3>

        {displayToday.items.length > 0 ? (
          <div className="space-y-6 px-4">
            {displayToday.items.map((item, idx) => (
              <ScheduleItem key={idx} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic py-4">Không có lịch công tác</p>
        )}
      </div>

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
                  <div className="prose dark:prose-invert max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: notif.content }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Renders the upcoming days (right panel).
 */
export function UpcomingPanel({ upcomingSchedules }) {
  return (
    <div className="bg-[#e6fbda] p-4 rounded-sm md:col-span-2">
      {upcomingSchedules.length > 0 ? (
        upcomingSchedules.map((day, dayIdx) => (
          <div key={dayIdx} className="mb-8">
            <h3 className="text-[18px] md:text-[19px] font-bold text-[#1d5792] mb-4 text-center">
              {day.dayLabel}, ngày {day.date}:
            </h3>
            <div className="space-y-5">
              {day.items.map((item, idx) => (
                <ScheduleItem key={idx} item={item} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 italic">Không có lịch công tác sắp tới</p>
      )}
    </div>
  )
}
