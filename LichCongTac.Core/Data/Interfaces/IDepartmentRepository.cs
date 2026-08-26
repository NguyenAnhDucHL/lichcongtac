using System.Collections.Generic;
using System.Threading.Tasks;
using LichCongTac.Models;

namespace LichCongTac.Core.Data.Interfaces
{
    public interface IDepartmentRepository
    {
        Task<List<Department>> GetAllAsync();
        Task<Department?> GetByIdAsync(int id);
        Task<bool> CreateAsync(Department department);
        Task<bool> UpdateAsync(Department department);
        Task<bool> DeleteAsync(int id);
    }
}
