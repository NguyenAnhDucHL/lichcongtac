import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import AdminHeader from '../components/AdminHeader'
import { adminService } from '../services/admin.service'
import { EmployeeForm } from '../features/employees/components/EmployeeForm'
import { EmployeeTable } from '../features/employees/components/EmployeeTable'

const INITIAL_FORM = {
  fullName: '', departmentId: '', username: '',
  password: '', confirmPassword: '', role: 'CanBo',
  zaloId: '', notificationPreference: '',
}

export default function AdminEmployees() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchAll = async () => {
    try {
      const [userData, deptData] = await Promise.all([
        adminService.getUsers(),
        adminService.getDepartments(),
      ])
      setUsers(Array.isArray(userData) ? userData : userData?.data || [])
      setDepartments(Array.isArray(deptData) ? deptData : deptData?.data || [])
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleReset = () => { setFormData(INITIAL_FORM); setEditId(null); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true); setError('')
    try {
      const body = {
        fullName: formData.fullName, username: formData.username, role: formData.role,
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
        zaloId: formData.zaloId, notificationPreference: formData.notificationPreference,
      }
      if (formData.password) body.passwordHash = formData.password
      if (editId) {
        await adminService.updateUser(editId, body)
        toast.success('Cập nhật nhân viên thành công!')
      } else {
        await adminService.createUser(body)
        toast.success('Thêm nhân viên thành công!')
      }
      await fetchAll(); handleReset()
    } catch (err) {
      setError(err.message || 'Lỗi kết nối đến máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditId(user.id)
    setFormData({
      fullName: user.fullName || '', departmentId: user.departmentId || '',
      username: user.username || '', password: '', confirmPassword: '',
      role: user.role || 'CanBo', zaloId: user.zaloId || '',
      notificationPreference: user.notificationPreference || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await adminService.deleteUser(itemToDelete)
      toast.success('Xóa nhân viên thành công')
      fetchAll()
      if (editId === itemToDelete) handleReset()
    } catch (err) {
      toast.error(err.message || 'Xóa thất bại.')
    } finally {
      setIsDeleting(false); setDeleteConfirmOpen(false); setItemToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[15px] text-gray-800">
      <AdminHeader />
      <main className="max-w-[1000px] mx-auto px-4 py-6">
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">Quản trị nhân viên</h2>
        <EmployeeForm
          formData={formData} setFormData={setFormData} editId={editId}
          loading={loading} error={error} departments={departments}
          onSubmit={handleSubmit} onReset={handleReset}
        />
        <div className="text-gray-500 mb-2">Danh sách nhân viên</div>
        <EmployeeTable
          users={users} onEdit={handleEdit}
          onDelete={(id) => { setItemToDelete(id); setDeleteConfirmOpen(true) }}
        />
      </main>
      <ConfirmationModal
        open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa nhân viên này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm} isLoading={isDeleting}
      />
    </div>
  )
}
