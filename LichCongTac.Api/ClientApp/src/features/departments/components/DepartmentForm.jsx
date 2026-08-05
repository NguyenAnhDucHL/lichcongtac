export function DepartmentForm({
  formData,
  setFormData,
  editId,
  loading,
  error,
  onSubmit,
  onReset,
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[600px] mb-10 flex flex-col gap-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-2 rounded border border-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="font-medium md:w-[150px] shrink-0">
          Tên phòng ban<span className="text-red-500">*</span>
        </div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="flex-1 md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c]"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="font-medium md:w-[150px] shrink-0">Mô tả</div>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="flex-1 md:w-[350px] border border-[#5cb85c] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#5cb85c]"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="font-medium md:w-[150px] shrink-0">Trạng thái</div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 border-[#5cb85c] text-[#5cb85c] focus:ring-[#5cb85c] rounded-sm"
          />
          <span>Hoạt động</span>
        </label>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2">
        <div className="hidden md:block md:w-[150px] shrink-0" />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
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
