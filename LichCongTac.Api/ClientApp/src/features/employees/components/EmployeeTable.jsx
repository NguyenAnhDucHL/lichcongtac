export function EmployeeTable({ users, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 text-center">
        <thead>
          <tr className="bg-[#fff3eb]">
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">STT</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Họ và tên</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Tên đăng nhập</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Phòng ban</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Zalo ID</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
              <td className="border border-gray-200 py-2.5 px-4 text-left">{user.fullName}</td>
              <td className="border border-gray-200 py-2.5 px-4">{user.username}</td>
              <td className="border border-gray-200 py-2.5 px-4">{user.departmentName || '---'}</td>
              <td className="border border-gray-200 py-2.5 px-4">{user.zaloId || '---'}</td>
              <td className="border border-gray-200 py-2.5 px-4">
                <button onClick={() => onEdit(user)} className="text-[#337ab7] hover:underline">Sửa</button>
              </td>
              <td className="border border-gray-200 py-2.5 px-4">
                <button onClick={() => onDelete(user.id)} className="text-[#c8102e] hover:underline">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
