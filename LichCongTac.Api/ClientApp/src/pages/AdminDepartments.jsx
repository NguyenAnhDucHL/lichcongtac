import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import AdminHeader from '../components/AdminHeader'
import { adminService } from '../services/admin.service'
import { DepartmentForm } from '../features/departments/components/DepartmentForm'
import { DepartmentTable } from '../features/departments/components/DepartmentTable'

const INITIAL_FORM = { name: '', description: '', isActive: true }

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDepartments = async () => {
    try {
      const data = await adminService.getDepartments()
      setDepartments(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách phòng ban:', err)
    }
  }

  useEffect(() => { fetchDepartments() }, [])

  const handleReset = () => { setFormData(INITIAL_FORM); setEditId(null); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (editId) {
        await adminService.updateDepartment(editId, formData)
        toast.success('Cập nhật phòng ban thành công!')
      } else {
        await adminService.createDepartment(formData)
        toast.success('Thêm phòng ban thành công!')
      }
      handleReset(); fetchDepartments()
    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (dept) => {
    setEditId(dept.id)
    setFormData({ name: dept.name, description: dept.description || '', isActive: dept.isActive })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await adminService.deleteDepartment(itemToDelete)
      toast.success('Xóa phòng ban thành công')
      fetchDepartments()
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa phòng ban')
    } finally {
      setIsDeleting(false); setDeleteConfirmOpen(false); setItemToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[15px] text-gray-800">
      <AdminHeader />
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị phòng ban</h2>
        <DepartmentForm
          formData={formData} setFormData={setFormData} editId={editId}
          loading={loading} error={error} onSubmit={handleSubmit} onReset={handleReset}
        />
        <div className="text-gray-500 mb-2">Danh sách phòng ban</div>
        <DepartmentTable
          departments={departments} onEdit={handleEdit}
          onDelete={(id) => { setItemToDelete(id); setDeleteConfirmOpen(true) }}
        />
      </main>
      <ConfirmationModal
        open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa phòng ban này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm} isLoading={isDeleting}
      />
    </div>
  )
}
