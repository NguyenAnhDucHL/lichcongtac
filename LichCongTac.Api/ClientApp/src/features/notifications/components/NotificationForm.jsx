import { RichTextEditor } from '@/components/ui/rich-text-editor'

export function NotificationForm({
  formData,
  setFormData,
  editId,
  loading,
  error,
  onSubmit,
  onReset,
}) {
  const handleChange = (e) => {
    const { name, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : e.target.value }))
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 w-full">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">
          {error}
        </div>
      )}

      <div className="w-[100%] max-w-[800px] border border-[#8cbabf] rounded overflow-hidden mb-4">
        <RichTextEditor
          value={formData.content}
          onChange={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))}
        />
      </div>

      <div className="flex items-center gap-2 mb-4 font-bold text-[#4cae4c]">
        <label htmlFor="isVisible">Hiển thị</label>
        <input
          type="checkbox"
          id="isVisible"
          name="isVisible"
          checked={formData.isVisible}
          onChange={handleChange}
          className="w-4 h-4 cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
        </button>
        {editId && (
          <button
            type="button"
            onClick={onReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-1.5 rounded text-sm transition-colors"
          >
            Quay lại
          </button>
        )}
      </div>
    </form>
  )
}
