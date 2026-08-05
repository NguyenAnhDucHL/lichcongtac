import { Loader2 } from 'lucide-react'

const formatDate = (dateString) => {
  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateString
}

export function HolidayForm({ formData, setFormData, editId, loading, onSubmit }) {
  return (
    <div className="mb-8 w-full max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-full sm:w-32 text-sm font-semibold text-gray-700">
            Thời gian <span className="text-red-500">*</span>
          </label>
          <input
            type="date" required value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="flex-1 max-w-[280px] p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#46b8da] focus:ring-1 focus:ring-[#46b8da]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <label className="w-full sm:w-32 text-sm font-semibold text-gray-700 mt-2">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea required value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#46b8da] min-h-[80px]"
            placeholder="Ví dụ: Nghỉ lễ Quốc khánh 2/9"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-32 hidden sm:block" />
          <button type="submit" disabled={loading}
            className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editId && (
            <button type="button"
              onClick={() => setFormData({ date: '', content: '' })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export function HolidayTable({ holidays, initialLoading, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto border border-[#ddd]">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-[#fcf8e3] text-gray-800 border-b border-[#ddd]">
            <th className="p-3 border-r border-[#ddd] font-semibold text-center w-16">STT</th>
            <th className="p-3 border-r border-[#ddd] font-semibold text-center w-32">Ngày</th>
            <th className="p-3 border-r border-[#ddd] font-semibold text-center">Nội dung</th>
            <th className="p-3 border-r border-[#ddd] font-semibold text-center w-16">Sửa</th>
            <th className="p-3 font-semibold text-center w-16">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {initialLoading ? (
            <tr>
              <td colSpan="5" className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1d5792]" />
              </td>
            </tr>
          ) : holidays.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500 italic border-b border-[#ddd]">
                Chưa có ngày lễ nào được thiết lập.
              </td>
            </tr>
          ) : (
            holidays.map((h, idx) => (
              <tr key={h.id} className="border-b border-[#ddd] hover:bg-gray-50 transition-colors">
                <td className="p-3 border-r border-[#ddd] text-center">{idx + 1}</td>
                <td className="p-3 border-r border-[#ddd] text-center font-semibold text-blue-600">
                  {formatDate(h.date)}
                </td>
                <td className="p-3 border-r border-[#ddd]">{h.content}</td>
                <td className="p-3 border-r border-[#ddd] text-center">
                  <button onClick={() => onEdit(h)} className="text-[#337ab7] hover:text-[#23527c]">Sửa</button>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => onDelete(h.id)} className="text-[#337ab7] hover:text-[#23527c]">Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
