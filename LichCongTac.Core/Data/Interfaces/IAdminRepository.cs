using System.Threading.Tasks;

using System.Collections.Generic;
using LichCongTac.Models;

namespace LichCongTac.Core.Data.Interfaces
{
    public interface IAdminRepository
    {
        Task<List<Department>> GetDepartmentsAsync();
        Task<int> InsertDepartmentAsync(Department dept);
        Task UpdateDepartmentAsync(Department dept);
        Task DeleteDepartmentAsync(int id);
    }
}
