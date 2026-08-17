using LichCongTac.Models;
using LichCongTac.Core.Models;

namespace LichCongTac.Core.Data.Interfaces
{
    public interface IScheduleRepository
    {
        Task<IEnumerable<Schedule>> GetAllAsync(bool includeInternal = false);
        Task<IEnumerable<Schedule>> GetByDateRangeAsync(string startDate, string endDate, bool includeInternal = false);
        Task<(IEnumerable<Schedule> Items, int TotalCount)> SearchPaginatedAsync(string? startDate, string? endDate, string? keyword, int page, int pageSize, bool includeInternal = false);
        Task<Schedule?> GetByIdAsync(int id);
        Task<int> CreateAsync(Schedule schedule);
        Task<UpdateResult> UpdateAsync(Schedule schedule, string? expectedUpdatedAt = null);
        Task<bool> DeleteAsync(int id);
    }
}
