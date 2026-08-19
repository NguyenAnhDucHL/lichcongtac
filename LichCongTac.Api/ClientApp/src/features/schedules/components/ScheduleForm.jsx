/* global DOMParser */
import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { vi } from 'date-fns/locale'

registerLocale('vi', vi)

const LOCATIONS = [
  'Hội trường A - Trụ sở HĐND và UBND phường',
  'Phòng họp tầng 3 - Trụ sở HĐND và UBND phường',
  'Phòng họp tầng 4 - Trụ sở HĐND và UBND phường',
  'Phòng tiếp công dân - Trụ sở HĐND và UBND phường',
]

export function ScheduleForm({
  formData,
  setFormData,
  editId,
  loading,
  error,
  users,
  departments,
  selectedParticipants,
  setSelectedParticipants,
  onSubmit,
  onReset,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 w-full flex flex-col gap-5">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-2 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Thời gian */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">
          Thời gian <span className="text-red-500">*</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative w-full max-w-[280px] md:max-w-none md:w-[350px] group flex items-center">
            <DatePicker
              selected={
                formData.dateStr
                  ? new Date(`${formData.dateStr}T${formData.timeStr || '00:00'}`)
                  : null
              }
              onChange={(date) => {
                if (date) {
                  const yyyy = date.getFullYear()
                  const mm = String(date.getMonth() + 1).padStart(2, '0')
                  const dd = String(date.getDate()).padStart(2, '0')
                  const hh = String(date.getHours()).padStart(2, '0')
                  const min = String(date.getMinutes()).padStart(2, '0')
                  setFormData((prev) => ({
                    ...prev,
                    dateStr: `${yyyy}-${mm}-${dd}`,
                    timeStr: `${hh}:${min}`,
                  }))
                } else {
                  setFormData((prev) => ({ ...prev, dateStr: '', timeStr: '' }))
                }
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Giờ"
              dateFormat="dd/MM/yyyy HH:mm"
              locale="vi"
              placeholderText="Ngày/Tháng/Năm Giờ:Phút"
              wrapperClassName="w-full"
              className="w-full min-w-0 border border-[#5cb85c] rounded pl-3 pr-10 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
              required
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
      </div>

      {/* Phòng ban */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Thuộc Phòng, Ban</div>
        <div className="flex-1 w-full">
          <select
            name="department"
            value={
              !formData.department
                ? ''
                : departments.some((d) => d.name === formData.department)
                  ? formData.department
                  : 'Khác'
            }
            onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
            className="w-full md:w-[500px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
          >
            <option value="">-- Chọn phòng ban --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
            <option value="Khác">-- Nhập phòng ban khác --</option>
          </select>
          {!departments.some((d) => d.name === formData.department) && !!formData.department && (
            <div className="mt-2 flex flex-col gap-1 w-full">
              <span className="text-xs text-gray-500 italic">hoặc nhập tên đơn vị khác:</span>
              <div className="w-[100%] md:w-[500px] border border-[#8cbabf] rounded overflow-hidden">
                <RichTextEditor
                  minimal={true}
                  value={formData.department === 'Khác' ? '' : formData.department}
                  onChange={(newContent) =>
                    setFormData((prev) => ({ ...prev, department: newContent }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Giấy mời số */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Giấy mời số</div>
        <div className="flex-1 w-full">
          <input
            type="text"
            name="invitationNumber"
            value={formData.invitationNumber}
            onChange={handleChange}
            placeholder="VD: 1131/GM-VP.UBND"
            className="w-full md:w-[500px] border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]"
          />
        </div>
      </div>

      {/* Địa điểm */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Địa điểm</div>
        <div className="flex-1 w-full">
          <select
            name="location"
            value={
              !formData.location
                ? ''
                : LOCATIONS.includes(formData.location)
                  ? formData.location
                  : 'Khác'
            }
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            className="w-full md:w-[500px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] text-gray-700"
          >
            <option value="">-- Chọn địa điểm --</option>
            {LOCATIONS.map((loc, idx) => (
              <option key={idx} value={loc}>
                {loc}
              </option>
            ))}
            <option value="Khác">-- Nhập địa điểm khác --</option>
          </select>
          {!LOCATIONS.includes(formData.location) && !!formData.location && (
            <div className="mt-2 flex flex-col gap-1 w-full">
              <span className="text-xs text-gray-500 italic">hoặc nhập địa điểm khác:</span>
              <div className="w-[100%] md:w-[500px] border border-[#8cbabf] rounded overflow-hidden">
                <RichTextEditor
                  minimal={true}
                  value={formData.location === 'Khác' ? '' : formData.location}
                  onChange={(newContent) =>
                    setFormData((prev) => ({ ...prev, location: newContent }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">
          Nội dung chi tiết <span className="text-red-500">*</span>
        </div>
        <div className="flex-1 w-full">
          <div className="w-[100%] max-w-[800px] border border-[#8cbabf] rounded overflow-hidden">
            <RichTextEditor
              value={formData.content}
              onChange={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))}
            />
          </div>
        </div>
      </div>

      {/* Hiển thị */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Hiển thị</div>
        <div className="flex-1 w-full pt-1 md:pt-2">
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="w-5 h-5 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm"
          />
        </div>
      </div>

      {/* Người được thông báo */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0 pt-1 md:pt-2">Người được thông báo</div>
        <div className="flex-1 w-full">
          <div className="flex flex-wrap gap-2 mb-2 w-[100%] max-w-[600px]">
            {users.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded border border-gray-200 cursor-pointer hover:bg-gray-200"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#5cb85c] focus:ring-[#5cb85c]"
                  checked={selectedParticipants.includes(u.fullName || u.username)}
                  onChange={(e) => {
                    const name = u.fullName || u.username
                    setSelectedParticipants((prev) =>
                      e.target.checked ? [...prev, name] : prev.filter((p) => p !== name)
                    )
                  }}
                />
                <span className="text-sm">{u.fullName || u.username}</span>
              </label>
            ))}
          </div>
          {selectedParticipants.length === 0 && (
            <span className="text-sm text-gray-500 italic block mb-2">
              Chưa chọn người được thông báo
            </span>
          )}
          {selectedParticipants.length > 0 && (
            <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200 mb-2 max-w-[600px]">
              <span className="font-bold text-green-700">Đã chọn:</span>{' '}
              {selectedParticipants.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 w-full mt-4">
        <div className="hidden md:block md:w-[150px] shrink-0" />
        <div className="flex-1 w-full flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50 w-full md:w-auto shadow-sm"
          >
            {loading ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={onReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium text-sm transition-colors shadow-sm w-full md:w-auto"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
