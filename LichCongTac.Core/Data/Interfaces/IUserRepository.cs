using LichCongTac.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LichCongTac.Core.Data.Interfaces
{
    public interface IUserRepository
    {
        Task<List<User>> GetUsersAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> LoginAsync(string username, string password);
        Task<bool> CreateUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int id);
        Task<bool> RegisterAsync(string username, string password, string role = "Guest");
        Task<bool> UpdateUserPasswordAsync(int userId, string newPassword);

        // --- ASP.NET Core Identity support ---
        Task UpdateSecurityStampAsync(int userId, string securityStamp);
        Task UpdateLockoutAsync(int userId, int accessFailedCount, DateTimeOffset? lockoutEnd);
        Task ResetAccessFailedCountAsync(int userId);
        
        // --- Refresh Token support ---
        Task UpdateRefreshTokenAsync(int userId, string? refreshToken, DateTime? expiryTime);
    }
}
