export function DepartmentTable({ departments, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 text-center">
        <thead>
          <tr className="bg-[#fff3eb]">
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">STT</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Mã phòng ban</th>
            <th className="border border-gray-200 py-3 px-4 font-bold">Tên phòng ban</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
            <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {departments.length === 0 ? (
            <tr>
              <td colSpan="5" className="border border-gray-200 py-4 text-gray-500">
                Chưa có phòng ban nào
              </td>
            </tr>
          ) : (
            departments.map((dept, index) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 py-2.5 px-4 font-bold">{index + 1}</td>
                <td className="border border-gray-200 py-2.5 px-4">{dept.id}</td>
                <td className="border border-gray-200 py-2.5 px-4 text-left">{dept.name}</td>
                <td className="border border-gray-200 py-2.5 px-4">
                  <button onClick={() => onEdit(dept)} className="text-[#337ab7] hover:underline">
                    Sửa
                  </button>
                </td>
                <td className="border border-gray-200 py-2.5 px-4">
                  <button
                    onClick={() => onDelete(dept.id)}
                    className="text-[#c8102e] hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
