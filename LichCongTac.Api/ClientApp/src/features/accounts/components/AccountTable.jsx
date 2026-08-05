export function AccountTable({ accounts, departments, onEdit, onDelete }) {
  const getDeptName = (deptId) => {
    if (!deptId) return ''
    const dept = departments.find((d) => d.id === deptId)
    return dept ? dept.name : deptId
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 text-center">
        <thead>
          <tr className="bg-[#fff3eb]">
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">STT</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Họ và tên</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Tên đăng nhập</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Phòng ban</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-24">Quản trị</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan="7" className="border border-gray-200 py-4 text-gray-500">
                Không có tài khoản nào
              </td>
            </tr>
          ) : (
            accounts.map((acc, index) => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
                <td className="border border-gray-200 py-2.5 px-4">{acc.fullName}</td>
                <td className="border border-gray-200 py-2.5 px-4">{acc.username}</td>
                <td className="border border-gray-200 py-2.5 px-4">{getDeptName(acc.departmentId)}</td>
                <td className="border border-gray-200 py-2.5 px-4">
                  {acc.role === 'Admin' ? 'Có' : 'Không'}
                </td>
                <td className="border border-gray-200 py-2.5 px-4">
                  <button onClick={() => onEdit(acc)} className="text-[#337ab7] hover:underline">Sửa</button>
                </td>
                <td className="border border-gray-200 py-2.5 px-4">
                  <button onClick={() => onDelete(acc.id)} className="text-[#337ab7] hover:underline">Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
