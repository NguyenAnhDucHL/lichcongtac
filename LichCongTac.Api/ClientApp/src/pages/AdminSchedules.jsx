import { useState, useEffect, useCallback } from 'react'
import { useAppSignalR } from '../contexts/SignalRContext'
import AdminHeader from '../components/AdminHeader'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import { adminService } from '../services/admin.service'
import { ScheduleForm } from '../features/schedules/components/ScheduleForm'
import { ScheduleTable } from '../features/schedules/components/ScheduleTable'
import { SchedulePagination } from '../features/schedules/components/SchedulePagination'

const EMPTY_FORM = {
  dateStr: '',
  timeStr: '',
  department: '',
  title: '',
  invitationNumber: '',
  location: '',
  presider: '',
  content: '',
  isPublic: true,
  participants: '',
  updatedAt: '',
}

export default function AdminSchedules() {
  const { lastScheduleUpdate } = useAppSignalR()

  const [schedules, setSchedules] = useState([])
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const PAGE_SIZE = 10

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await adminService.getSchedules()
      setSchedules(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách lịch:', err)
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
    adminService.getUsers().then((d) => setUsers(Array.isArray(d) ? d : d?.data || []))
    adminService.getDepartments().then((d) => setDepartments(Array.isArray(d) ? d : d?.data || []))
  }, [fetchSchedules, lastScheduleUpdate])

  const handleReset = () => {
    setEditId(null)
    setFormData({ ...EMPTY_FORM, dateStr: new Date().toISOString().split('T')[0] })
    setSelectedParticipants([])
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setFormData({
      dateStr: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
      timeStr: item.startTime || '',
      department: item.preparingUnit || 'CƠ QUAN',
      title: item.title || '',
      invitationNumber: item.invitationNumber || '',
      location: item.location || '',
      presider: item.presider || '',
      content: item.content || '',
      isPublic: item.isPublic === 1 || item.isPublic === true,
      participants: item.participants || '',
      updatedAt: item.updatedAt || '',
    })
    setSelectedParticipants(
      item.participants
        ? item.participants
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const plainContent = (formData.content || '').replace(/<[^>]*>?/gm, '').trim()
    if (!plainContent) {
      setError('Vui lòng nhập Nội dung chi tiết')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: plainContent.substring(0, 50) || 'Lịch công tác',
        invitationNumber: formData.invitationNumber,
        date: formData.dateStr,
        startTime: formData.timeStr,
        location: formData.location,
        content: formData.content,
        presider: formData.presider,
        preparingUnit: formData.department,
        participants: selectedParticipants.join(', '),
        isPublic: formData.isPublic ? 1 : 0,
        updatedAt: formData.updatedAt || null,
      }
      if (editId) {
        await adminService.updateSchedule(editId, payload)
        toast.success('Cập nhật lịch công tác thành công!')
      } else {
        await adminService.createSchedule(payload)
        toast.success('Thêm lịch công tác thành công!')
      }
      handleReset()
      fetchSchedules()
    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await adminService.deleteSchedule(itemToDelete)
      toast.success('Xóa lịch công tác thành công!')
      fetchSchedules()
    } catch (e) {
      toast.error(e.message || 'Xóa thất bại')
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
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị lịch</h2>

        <ScheduleForm
          formData={formData}
          setFormData={setFormData}
          editId={editId}
          loading={loading}
          error={error}
          users={users}
          departments={departments}
          selectedParticipants={selectedParticipants}
          setSelectedParticipants={setSelectedParticipants}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-[15px]">
            Danh sách lịch làm việc ({schedules.length} bản ghi)
          </span>
          <span className="text-gray-400 text-xs">
            Trang {currentPage}/{Math.max(1, Math.ceil(schedules.length / PAGE_SIZE))}
          </span>
        </div>

        <ScheduleTable
          schedules={schedules}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          onEdit={handleEdit}
          onDelete={(id) => {
            setItemToDelete(id)
            setDeleteConfirmOpen(true)
          }}
        />

        <SchedulePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={schedules.length}
          pageSize={PAGE_SIZE}
        />
      </main>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa lịch công tác này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
