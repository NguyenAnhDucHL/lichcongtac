using Microsoft.AspNetCore.Identity;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Models;

namespace LichCongTac.Api.Security
{
    /// <summary>
    /// CustomUserStore: Cầu nối giữa ASP.NET Core Identity và cơ sở dữ liệu SQLite hiện có.
    /// Không cần Entity Framework Core — tất cả truy vấn đi qua IUserRepository (ADO.NET + Dapper pattern).
    /// 
    /// Implement các interface:
    ///   - IUserStore: CRUD cơ bản
    ///   - IUserPasswordStore: lưu/đọc PasswordHash (tương thích BCrypt + PBKDF2)
    ///   - IUserSecurityStampStore: vô hiệu hóa token/session cũ khi đổi mật khẩu
    ///   - IUserLockoutStore: đếm sai mật khẩu & khóa tài khoản tự động
    ///   - IUserRoleStore: quản lý Role của user
    /// </summary>
    public class CustomUserStore :
        IUserStore<User>,
        IUserPasswordStore<User>,
        IUserSecurityStampStore<User>,
        IUserLockoutStore<User>,
        IUserRoleStore<User>
    {
        private readonly IUserRepository _userRepository;

        public CustomUserStore(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // ─── IUserStore ──────────────────────────────────────────────────────────

        public async Task<IdentityResult> CreateAsync(User user, CancellationToken ct)
        {
            var success = await _userRepository.CreateUserAsync(user);
            return success
                ? IdentityResult.Success
                : IdentityResult.Failed(new IdentityError { Code = "DuplicateUserName", Description = "Tên đăng nhập đã tồn tại." });
        }

        public async Task<IdentityResult> DeleteAsync(User user, CancellationToken ct)
        {
            await _userRepository.DeleteUserAsync(user.Id);
            return IdentityResult.Success;
        }

        public async Task<User?> FindByIdAsync(string userId, CancellationToken ct)
        {
            var result = int.TryParse(userId, out int id) ? await _userRepository.GetUserByIdAsync(id) : null;
            return result;
        }

        public async Task<User?> FindByNameAsync(string normalizedUserName, CancellationToken ct)
        {
            // Tìm theo NormalizedUserName (case-insensitive)
            var result = await _userRepository.GetUserByUsernameAsync(normalizedUserName);
            return result;
        }

        public Task<string?> GetNormalizedUserNameAsync(User user, CancellationToken ct)
            => Task.FromResult<string?>(user.NormalizedUserName ?? user.Username.ToUpperInvariant());

        public Task<string> GetUserIdAsync(User user, CancellationToken ct)
            => Task.FromResult(user.Id.ToString());

        public Task<string?> GetUserNameAsync(User user, CancellationToken ct)
            => Task.FromResult<string?>(user.Username);

        public Task SetNormalizedUserNameAsync(User user, string? normalizedName, CancellationToken ct)
        {
            user.NormalizedUserName = normalizedName ?? user.Username.ToUpperInvariant();
            return Task.CompletedTask;
        }

        public Task SetUserNameAsync(User user, string? userName, CancellationToken ct)
        {
            user.Username = userName ?? user.Username;
            return Task.CompletedTask;
        }

        public async Task<IdentityResult> UpdateAsync(User user, CancellationToken ct)
        {
            await _userRepository.UpdateUserAsync(user);
            return IdentityResult.Success;
        }

        // ─── IUserPasswordStore ──────────────────────────────────────────────────

        public Task<string?> GetPasswordHashAsync(User user, CancellationToken ct)
            => Task.FromResult<string?>(user.PasswordHash);

        public Task<bool> HasPasswordAsync(User user, CancellationToken ct)
            => Task.FromResult(!string.IsNullOrEmpty(user.PasswordHash));

        public Task SetPasswordHashAsync(User user, string? passwordHash, CancellationToken ct)
        {
            user.PasswordHash = passwordHash ?? "";
            return Task.CompletedTask;
        }

        // ─── IUserSecurityStampStore ─────────────────────────────────────────────

        public Task<string?> GetSecurityStampAsync(User user, CancellationToken ct)
            => Task.FromResult<string?>(user.SecurityStamp);

        public async Task SetSecurityStampAsync(User user, string stamp, CancellationToken ct)
        {
            user.SecurityStamp = stamp;
            await _userRepository.UpdateSecurityStampAsync(user.Id, stamp);
        }

        // ─── IUserLockoutStore ───────────────────────────────────────────────────

        public Task<int> GetAccessFailedCountAsync(User user, CancellationToken ct)
            => Task.FromResult(user.AccessFailedCount);

        public Task<bool> GetLockoutEnabledAsync(User user, CancellationToken ct)
            => Task.FromResult(user.LockoutEnabled);

        public Task<DateTimeOffset?> GetLockoutEndDateAsync(User user, CancellationToken ct)
            => Task.FromResult(user.LockoutEnd);

        public async Task<int> IncrementAccessFailedCountAsync(User user, CancellationToken ct)
        {
            user.AccessFailedCount++;
            user.FailedLoginCount++;
            await _userRepository.UpdateLockoutAsync(user.Id, user.AccessFailedCount, user.LockoutEnd);
            return user.AccessFailedCount;
        }

        public async Task ResetAccessFailedCountAsync(User user, CancellationToken ct)
        {
            user.AccessFailedCount = 0;
            user.FailedLoginCount  = 0;
            user.LockoutEnd        = null;
            user.LockoutUntil      = null;
            await _userRepository.ResetAccessFailedCountAsync(user.Id);
        }

        public Task SetLockoutEnabledAsync(User user, bool enabled, CancellationToken ct)
        {
            user.LockoutEnabled = enabled;
            return Task.CompletedTask;
        }

        public async Task SetLockoutEndDateAsync(User user, DateTimeOffset? lockoutEnd, CancellationToken ct)
        {
            user.LockoutEnd   = lockoutEnd;
            user.LockoutUntil = lockoutEnd?.UtcDateTime;
            await _userRepository.UpdateLockoutAsync(user.Id, user.AccessFailedCount, lockoutEnd);
        }

        // ─── IUserRoleStore ──────────────────────────────────────────────────────
        // Hệ thống dùng Role string đơn giản (Admin, VanThu, LanhDao, CanBo, Guest)
        // → không cần bảng RoleClaims, chỉ cần đọc/ghi trường Role trong Users

        public async Task AddToRoleAsync(User user, string roleName, CancellationToken ct)
        {
            user.Role = roleName;
            await _userRepository.UpdateUserAsync(user);
        }

        public Task RemoveFromRoleAsync(User user, string roleName, CancellationToken ct)
        {
            if (user.Role.Equals(roleName, StringComparison.OrdinalIgnoreCase))
                user.Role = "Guest";
            return Task.CompletedTask;
        }

        public Task<IList<string>> GetRolesAsync(User user, CancellationToken ct)
        {
            IList<string> roles = string.IsNullOrEmpty(user.Role)
                ? new List<string>()
                : new List<string> { user.Role };
            return Task.FromResult(roles);
        }

        public Task<bool> IsInRoleAsync(User user, string roleName, CancellationToken ct)
            => Task.FromResult(user.Role.Equals(roleName, StringComparison.OrdinalIgnoreCase));

        public async Task<IList<User>> GetUsersInRoleAsync(string roleName, CancellationToken ct)
        {
            var users = await _userRepository.GetUsersAsync();
            IList<User> result = users
                .Where(u => u.Role.Equals(roleName, StringComparison.OrdinalIgnoreCase))
                .ToList();
            return result;
        }

        // ─── IDisposable ─────────────────────────────────────────────────────────

        public void Dispose() { /* UserRepository không cần Dispose */ }
    }
}
