const PAGE_SIZE = 10

export function NotificationTable({ notifications, currentPage, onEdit, onDelete, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE))
  const paginated = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 text-[15px]">
          Danh sách các thông báo ({notifications.length} bản ghi)
        </span>
        <span className="text-gray-400 text-xs">
          Trang {currentPage}/{totalPages}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-center">
          <thead>
            <tr className="bg-[#fff3eb]">
              <th className="border border-gray-200 py-3 px-4 font-bold w-12">STT</th>
              <th className="border border-gray-200 py-3 px-4 font-bold text-center">Nội dung</th>
              <th className="border border-gray-200 py-3 px-4 font-bold w-20">Hiển thị</th>
              <th className="border border-gray-200 py-3 px-4 font-bold w-16">Sửa</th>
              <th className="border border-gray-200 py-3 px-4 font-bold w-16">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((item, index) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 py-2.5 px-4 font-bold">{globalIndex}</td>
                    <td className="border border-gray-200 py-2.5 px-4 text-left">
                      <span className="text-gray-800 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: item.content }} />
                    </td>
                    <td className="border border-gray-200 py-2.5 px-4">
                      <span className={item.isVisible === 1 ? 'text-[#337ab7]' : 'text-gray-400'}>
                        {item.isVisible === 1 ? 'Có' : 'Không'}
                      </span>
                    </td>
                    <td className="border border-gray-200 py-2.5 px-4">
                      <button onClick={() => onEdit(item)} className="text-[#337ab7] hover:underline">Sửa</button>
                    </td>
                    <td className="border border-gray-200 py-2.5 px-4">
                      <button onClick={() => onDelete(item.id)} className="text-[#337ab7] hover:underline">Xóa</button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="5" className="border border-gray-200 py-4 text-gray-500">
                  Chưa có thông báo nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {notifications.length > PAGE_SIZE && (
        <div className="flex justify-center mt-6 gap-2">
          <button onClick={() => onPageChange((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50">
            Trước
          </button>
          <span className="px-3 py-1 text-gray-600">{currentPage} / {totalPages}</span>
          <button onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50">
            Sau
          </button>
        </div>
      )}
    </>
  )
}
