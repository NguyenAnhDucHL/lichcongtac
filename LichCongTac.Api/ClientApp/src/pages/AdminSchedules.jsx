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
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const PAGE_SIZE = 10

  const fetchSchedules = useCallback(async (page = 1, kw = keyword) => {
    try {
      const data = await adminService.getSchedulesPaginated(page, PAGE_SIZE, kw)
      // Server trả về { items, totalCount, page, pageSize, totalPages }
      if (data && 'items' in data) {
        setSchedules(Array.isArray(data.items) ? data.items : [])
        setTotalCount(data.totalCount ?? 0)
        setTotalPages(data.totalPages ?? 1)
        setCurrentPage(data.page ?? page)
      } else {
        // Fallback backward-compat nếu server trả array thẳng
        setSchedules(Array.isArray(data) ? data : data?.data || [])
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lịch:', err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Search với debounce 400ms tránh gọi API mỗi ký tự
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchSchedules(1, keyword)
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  useEffect(() => {
    fetchSchedules(currentPage, keyword)
    adminService.getUsers().then((d) => setUsers(Array.isArray(d) ? d : d?.data || []))
    adminService.getDepartments().then((d) => setDepartments(Array.isArray(d) ? d : d?.data || []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastScheduleUpdate])

  // Mount lần đầu
  useEffect(() => {
    fetchSchedules(1, '')
    adminService.getUsers().then((d) => setUsers(Array.isArray(d) ? d : d?.data || []))
    adminService.getDepartments().then((d) => setDepartments(Array.isArray(d) ? d : d?.data || []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      fetchSchedules(currentPage, keyword)
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
      // Sau khi xóa: nếu trang hiện tại chỉ còn 1 item thì quay về trang trước
      const newPage = schedules.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
      fetchSchedules(newPage, keyword)
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

        <div className="flex items-center justify-between mb-2 gap-4">
          <span className="text-gray-500 text-[15px]">
            Danh sách lịch làm việc ({totalCount} bản ghi)
          </span>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-44 focus:outline-none focus:border-blue-400"
            />
            <span className="text-gray-400 text-xs whitespace-nowrap">
              Trang {currentPage}/{totalPages}
            </span>
          </div>
        </div>

        <ScheduleTable
          schedules={schedules}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          serverSide={true}
          onEdit={handleEdit}
          onDelete={(id) => {
            setItemToDelete(id)
            setDeleteConfirmOpen(true)
          }}
        />

        <SchedulePagination
          currentPage={currentPage}
          setCurrentPage={(p) => {
            setCurrentPage(p)
            fetchSchedules(p, keyword)
          }}
          totalItems={totalCount}
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
