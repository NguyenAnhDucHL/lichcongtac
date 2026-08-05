import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import { useAppSignalR } from '../contexts/SignalRContext'
import { adminService } from '../services/admin.service'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import { HolidayForm, HolidayTable } from '../features/holidays/components/HolidayComponents'

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([])
  const [formData, setFormData] = useState({ date: '', content: '' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { lastHolidayUpdate } = useAppSignalR()

  const fetchHolidays = useCallback(async () => {
    try {
      const data = await adminService.getHolidays()
      setHolidays(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách ngày lễ:', err)
      toast.error('Lỗi tải danh sách ngày lễ')
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHolidays()
  }, [fetchHolidays, lastHolidayUpdate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.date || !formData.content) {
      toast.error('Vui lòng điền đầy đủ ngày và nội dung')
      return
    }
    setLoading(true)
    try {
      if (editId) {
        await adminService.updateHoliday(editId, formData)
        toast.success('Cập nhật thành công')
      } else {
        await adminService.createHoliday(formData)
        toast.success('Thêm mới thành công')
      }
      setFormData({ date: '', content: '' })
      setEditId(null)
      fetchHolidays()
    } catch (err) {
      toast.error(err.message || 'Lỗi hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (holiday) => {
    setEditId(holiday.id)
    setFormData({ date: holiday.date, content: holiday.content })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await adminService.deleteHoliday(itemToDelete)
      toast.success('Xóa thành công')
      fetchHolidays()
      if (editId === itemToDelete) {
        setEditId(null)
        setFormData({ date: '', content: '' })
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi hệ thống khi xóa')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-[15px]">
      <AdminHeader />
      <main className="max-w-[1000px] mx-auto bg-white min-h-[500px] p-6 shadow-sm border border-gray-200 mt-4 mb-8">
        <h2 className="text-[#c8102e] text-xl font-bold mb-6 border-b border-gray-200 pb-2">
          Quản lý ngày lễ
        </h2>
        <HolidayForm
          formData={formData}
          setFormData={setFormData}
          editId={editId}
          loading={loading}
          onSubmit={handleSubmit}
        />
        <p className="text-sm text-gray-600 mb-2">Danh sách ngày lễ</p>
        <HolidayTable
          holidays={holidays}
          initialLoading={initialLoading}
          onEdit={handleEdit}
          onDelete={(id) => {
            setItemToDelete(id)
            setDeleteConfirmOpen(true)
          }}
        />
      </main>
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa ngày lễ này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
