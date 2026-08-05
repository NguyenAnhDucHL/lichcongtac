import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function AccountForm({
  formData,
  setFormData,
  editId,
  loading,
  error,
  departments,
  onSubmit,
  onReset,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[600px] mb-10 flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0">
          Họ và tên<span className="text-red-500">*</span>
        </div>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="flex-1 w-full md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c]"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0">Thuộc Phòng, Ban</div>
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          className="flex-1 w-full md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] bg-white"
        >
          <option value="">-- Chọn phòng ban --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0">
          Tài khoản<span className="text-red-500">*</span>
        </div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={!!editId}
          className="flex-1 w-full md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c] disabled:bg-gray-100"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0">
          Mật khẩu{!editId && <span className="text-red-500">*</span>}
        </div>
        <div className="relative flex-1 w-full md:w-[350px]">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!editId}
            placeholder={editId ? '(Bỏ trống nếu không đổi)' : ''}
            className="w-full border border-[#5cb85c] rounded px-3 py-1.5 pr-10 outline-none focus:ring-1 focus:ring-[#5cb85c]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0">
          Nhập lại mật khẩu{!editId && <span className="text-red-500">*</span>}
        </div>
        <div className="relative flex-1 w-full md:w-[350px]">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!editId && !!formData.password}
            placeholder={editId ? '(Bỏ trống nếu không đổi)' : ''}
            className="w-full border border-[#5cb85c] rounded px-3 py-1.5 pr-10 outline-none focus:ring-1 focus:ring-[#5cb85c]"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
        <div className="font-medium md:w-[150px] shrink-0">Quản trị toàn bộ</div>
        <input
          type="checkbox"
          name="isAdmin"
          checked={formData.isAdmin}
          onChange={handleChange}
          className="w-5 h-5 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm cursor-pointer"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full mt-2">
        <div className="hidden md:block md:w-[150px] shrink-0" />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50 shadow-sm"
          >
            {editId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={onReset}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded font-medium text-sm transition-colors shadow-sm"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
