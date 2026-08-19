/* global DOMParser */

const extractTextFromHtml = (html) => {
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

export function ScheduleTable({
  schedules,
  currentPage,
  pageSize,
  onEdit,
  onDelete,
  serverSide = false,
}) {
  return (
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
            (serverSide
              ? schedules
              : schedules.slice((currentPage - 1) * pageSize, currentPage * pageSize)
            ).map((item, index) => {
              const globalIndex = (currentPage - 1) * pageSize + index + 1
              const dateInfo = formatDateDisplay(item.date)
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 py-2.5 px-4 font-bold">{globalIndex}</td>
                  <td className="border border-gray-200 py-2.5 px-4 leading-tight">
                    <div>{dateInfo.dayName}</div>
                    <div className="text-blue-700 font-bold">{dateInfo.date}</div>
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4 text-left">
                    <span className="text-red-600 font-bold mr-2">
                      {item.startTime ? `${item.startTime}:` : ''}
                    </span>
                    <span>
                      {item.invitationNumber && (
                        <span className="text-[#005f6b] font-bold mr-1">
                          {item.invitationNumber}
                        </span>
                      )}
                      {item.location && (
                        <span className="text-[#005f6b] font-bold mr-1">
                          (Tại {extractTextFromHtml(item.location)})
                        </span>
                      )}
                      <span className="text-gray-800">
                        {item.content && ` ${extractTextFromHtml(item.content)} `}
                      </span>
                    </span>
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    {extractTextFromHtml(item.preparingUnit) || 'CƠ QUAN'}
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    {item.isPublic ? 'Có' : 'Không'}
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <a
                      href="#"
                      className="text-[#337ab7] hover:underline"
                      onClick={(e) => {
                        e.preventDefault()
                        onEdit(item)
                      }}
                    >
                      Sửa
                    </a>
                  </td>
                  <td className="border border-gray-200 py-2.5 px-4">
                    <a
                      href="#"
                      className="text-[#337ab7] hover:underline"
                      onClick={(e) => {
                        e.preventDefault()
                        onDelete(item.id)
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
  )
}
