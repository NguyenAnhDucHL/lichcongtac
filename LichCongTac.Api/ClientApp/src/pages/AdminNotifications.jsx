import { useState, useEffect } from 'react'
import AdminHeader from '../components/AdminHeader'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import { notificationService } from '../services/notification.service'
import { NotificationForm } from '../features/notifications/components/NotificationForm'
import { NotificationTable } from '../features/notifications/components/NotificationTable'

const INITIAL_FORM = { content: '', isVisible: true }

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      if (err.status !== 401) setError('Lỗi kết nối máy chủ')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleReset = () => {
    setEditId(null)
    setFormData(INITIAL_FORM)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const plainContent = formData.content.replace(/<[^>]*>?/gm, '').trim()
    if (!plainContent && !formData.content.includes('<img')) {
      setError('Nội dung không được để trống')
      setLoading(false)
      return
    }
    try {
      const payload = { content: formData.content, isVisible: formData.isVisible ? 1 : 0 }
      if (editId) {
        await notificationService.updateNotification(editId, payload)
        toast.success('Cập nhật thông báo thành công!')
      } else {
        await notificationService.createNotification(payload)
        toast.success('Thêm thông báo thành công!')
      }
      handleReset()
      fetchNotifications()
    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setFormData({ content: item.content, isVisible: item.isVisible === 1 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await notificationService.deleteNotification(itemToDelete)
      toast.success('Xóa thông báo thành công!')
      fetchNotifications()
    } catch (err) {
      toast.error(err.message || 'Lỗi kết nối máy chủ')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[15px] text-gray-800">
      <AdminHeader />
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Thông báo</h2>
        <NotificationForm
          formData={formData}
          setFormData={setFormData}
          editId={editId}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
        <NotificationTable
          notifications={notifications}
          currentPage={currentPage}
          onEdit={handleEdit}
          onDelete={(id) => {
            setItemToDelete(id)
            setDeleteConfirmOpen(true)
          }}
          onPageChange={setCurrentPage}
        />
      </main>
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa thông báo này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
