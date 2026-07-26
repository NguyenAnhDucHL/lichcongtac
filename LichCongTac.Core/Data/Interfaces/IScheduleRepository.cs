using LichCongTac.Models;

namespace LichCongTac.Core.Data.Interfaces
{
    public interface IScheduleRepository
    {
        Task<IEnumerable<Schedule>> GetAllAsync(bool includeInternal = false);
        Task<IEnumerable<Schedule>> GetByDateRangeAsync(string startDate, string endDate, bool includeInternal = false);
        Task<Schedule?> GetByIdAsync(int id);
        Task<int> CreateAsync(Schedule schedule);
        Task<bool> UpdateAsync(Schedule schedule);
        Task<bool> DeleteAsync(int id);
    }
}
