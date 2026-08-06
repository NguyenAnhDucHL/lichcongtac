namespace LichCongTac.Core.Models
{
    public enum UpdateResult
    {
        Success = 1,
        NotFound = 0,
        ConcurrencyConflict = -1,
        Failed = -2
    }
}
