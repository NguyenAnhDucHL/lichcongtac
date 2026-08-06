import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import AdminHeader from '../components/AdminHeader'
import { adminService } from '../services/admin.service'
import { AccountForm } from '../features/accounts/components/AccountForm'
import { AccountTable } from '../features/accounts/components/AccountTable'

const INITIAL_FORM = {
  fullName: '',
  departmentId: '',
  username: '',
  password: '',
  confirmPassword: '',
  isAdmin: false,
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([])
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
      const [accData, deptData] = await Promise.all([
        adminService.getUsers(),
        adminService.getDepartments(),
      ])
      setAccounts(Array.isArray(accData) ? accData : accData?.data || [])
      setDepartments(Array.isArray(deptData) ? deptData : deptData?.data || [])
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleReset = () => {
    setFormData(INITIAL_FORM)
    setEditId(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.')
      return
    }
    if (!editId && !formData.password) {
      setError('Vui lòng nhập mật khẩu cho tài khoản mới.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        fullName: formData.fullName,
        username: formData.username,
        role: formData.isAdmin ? 'Admin' : 'CanBo',
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
      }
      if (formData.password) body.passwordHash = formData.password
      if (editId) await adminService.updateUser(editId, body)
      else await adminService.createUser(body)
      await fetchAll()
      handleReset()
    } catch (err) {
      setError(err.message || 'Lỗi kết nối đến máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (acc) => {
    setEditId(acc.id)
    setFormData({
      fullName: acc.fullName || '',
      departmentId: acc.departmentId || '',
      username: acc.username || '',
      password: '',
      confirmPassword: '',
      isAdmin: acc.role === 'Admin',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await adminService.deleteUser(itemToDelete)
      fetchAll()
      if (editId === itemToDelete) handleReset()
    } catch (err) {
      toast.error(err.message || 'Xóa thất bại.')
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
        <h2 className="text-[#c8102e] font-bold text-lg mb-6">
          {editId ? 'Sửa thông tin tài khoản' : 'Quản trị tài khoản'}
        </h2>
        <AccountForm
          formData={formData}
          setFormData={setFormData}
          editId={editId}
          loading={loading}
          error={error}
          departments={departments}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
        <div className="text-gray-500 mb-2">Danh sách tài khoản</div>
        <AccountTable
          accounts={accounts}
          departments={departments}
          onEdit={handleEdit}
          onDelete={(id) => {
            setItemToDelete(id)
            setDeleteConfirmOpen(true)
          }}
        />
      </main>
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa tài khoản này không? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
