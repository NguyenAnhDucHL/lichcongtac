using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Core.Models;
using LichCongTac.Models;

namespace LichCongTac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly UserManager<User> _userManager;

        public AuthController(
            IConfiguration configuration,
            IUserRepository userRepository,
            UserManager<User> userManager)
        {
            _configuration  = configuration;
            _userRepository = userRepository;
            _userManager    = userManager;
        }

        // ─── LOGIN ───────────────────────────────────────────────────────────────
        // Áp dụng rate limit: tối đa 5 lần đăng nhập / 60 giây / IP → chống Brute Force
        [EnableRateLimiting("login-policy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            string? clientIp  = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                             ?? HttpContext.Connection.RemoteIpAddress?.ToString();
            string? userAgent = Request.Headers["User-Agent"].FirstOrDefault();

            try
            {
                var logPath = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "login_ips.txt");
                var logLine = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] IP: {clientIp ?? "Unknown"} | Tải khoản: {request.Username}\n";
                System.IO.File.AppendAllText(logPath, logLine);
            }
            catch { /* Bỏ qua nếu lỗi ghi file */ }

            // ── Bước 1: Tìm user qua Identity UserManager ────────────────────────
            var user = await _userManager.FindByNameAsync(request.Username);

            if (user == null)
            {

                return Unauthorized(ApiResponse.Fail("Tài khoản hoặc mật khẩu không chính xác, hoặc tài khoản đang tạm thời bị khóa."));
            }

            // ── Bước 2: Kiểm tra tài khoản bị khóa (Identity Lockout) ────────────
            if (await _userManager.IsLockedOutAsync(user))
            {

                return Unauthorized(ApiResponse.Fail("Tài khoản hoặc mật khẩu không chính xác, hoặc tài khoản đang tạm thời bị khóa."));
            }

            // ── Bước 3: Xác minh mật khẩu qua UserManager (tự động xử lý BCrypt cũ + PBKDF2 mới) ──
            var result = await _userManager.CheckPasswordAsync(user, request.Password);

            if (!result)
            {
                // Identity tự động tăng AccessFailedCount và khóa tài khoản nếu đủ số lần
                await _userManager.AccessFailedAsync(user);


                return Unauthorized(ApiResponse.Fail("Tài khoản hoặc mật khẩu không chính xác, hoặc tài khoản đang tạm thời bị khóa."));
            }

            // ── Bước 4: Đăng nhập thành công ─────────────────────────────────────
            // Reset bộ đếm sai về 0
            await _userManager.ResetAccessFailedCountAsync(user);



            // Xóa cache session cũ để token validation đọc lại SecurityStamp mới ngay lập tức
            var cache = HttpContext.RequestServices.GetService<Microsoft.Extensions.Caching.Memory.IMemoryCache>();
            cache?.Remove($"UserSession_{user.Id}");

            // Cập nhật SecurityStamp → vô hiệu hóa tất cả token cũ
            await _userManager.UpdateSecurityStampAsync(user);

            // Tạo SessionId mới (duy trì tương thích với hệ thống cũ)
            user.SessionId = Guid.NewGuid().ToString();
            _userRepository.UpdateSecurityStamp(user.Id, user.SecurityStamp);

            // ── Bước 5: Sinh JWT Token ────────────────────────────────────────────
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecret    = _configuration["JWT_SECRET"]
                            ?? Environment.GetEnvironmentVariable("JWT_SECRET")
                            ?? throw new InvalidOperationException("[SECURITY] JWT_SECRET chưa được cấu hình.");
            var key = Encoding.ASCII.GetBytes(jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name,              user.Username),
                    new Claim(ClaimTypes.Role,              user.Role),
                    new Claim(ClaimTypes.NameIdentifier,    user.Id.ToString()),
                    new Claim("uid",                        user.Id.ToString()),
                    new Claim("UserId",                     user.Id.ToString()),  // Tương thích ngược với client cũ
                    // sec_stamp: SecurityStamp của Identity — dùng để vô hiệu hóa token cũ
                    new Claim("sec_stamp",                  user.SecurityStamp),
                    // Giữ claim "sid" để tương thích với token cũ còn tồn tại
                    new Claim("sid",                        user.SessionId ?? user.SecurityStamp),
                }),
                Expires           = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token       = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Gắn token vào HttpOnly Cookie để trình duyệt tự động gửi khi tải PDF
            Response.Cookies.Append("jwt_cookie", tokenString, new CookieOptions
            {
                HttpOnly = true,
                Secure   = true,
                SameSite = SameSiteMode.Strict, // Cập nhật bảo mật chống CSRF
                Expires  = DateTime.UtcNow.AddHours(24)
            });



            return Ok(ApiResponse.Ok(new
            {
                token    = tokenString,
                username = user.Username,
                fullName = user.FullName ?? user.Username,
                role     = user.Role,
                userId   = user.Id
            }));
        }

        // ─── LOGOUT ──────────────────────────────────────────────────────────────

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt_cookie");
            return Ok(ApiResponse.Ok("Đăng xuất thành công"));
        }

        // ─── CHANGE PASSWORD ─────────────────────────────────────────────────────

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId)) 
                return Unauthorized(ApiResponse.Fail("Không tìm thấy thông tin người dùng."));

            // Validation
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                return BadRequest(ApiResponse.Fail("Vui lòng nhập mật khẩu hiện tại."));
            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(ApiResponse.Fail("Mật khẩu mới không được để trống."));
            if (request.NewPassword.Length < 8)
                return BadRequest(ApiResponse.Fail("Mật khẩu phải có ít nhất 8 ký tự."));
            if (!request.NewPassword.Any(char.IsUpper))
                return BadRequest(ApiResponse.Fail("Mật khẩu phải có ít nhất 1 chữ HOA (A-Z)."));
            if (!request.NewPassword.Any(char.IsLower))
                return BadRequest(ApiResponse.Fail("Mật khẩu phải có ít nhất 1 chữ thường (a-z)."));
            if (!request.NewPassword.Any(char.IsDigit))
                return BadRequest(ApiResponse.Fail("Mật khẩu phải có ít nhất 1 chữ số (0-9)."));
            if (!request.NewPassword.Any(c => "!@#$%^&*()_+-=[]{}|;':\",./<>?".Contains(c)))
                return BadRequest(ApiResponse.Fail("Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%...)."));

            // Tìm user qua UserManager
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) 
                return NotFound(ApiResponse.Fail("Tài khoản không tồn tại."));

            // 1. Kiểm tra mật khẩu hiện tại có đúng không
            var isCurrentCorrect = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!isCurrentCorrect)
                return BadRequest(ApiResponse.Fail("Mật khẩu hiện tại không chính xác."));

            // 2. Vì một số mật khẩu cũ là PlainText/Bcrypt, RemovePasswordAsync có thể lỗi. 
            // Dùng GeneratePasswordResetTokenAsync để đặt lại pass an toàn nhất.
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

            if (resetResult.Succeeded)
            {
                // Xóa cache để token validation nhận SecurityStamp mới ngay lập tức
                var cache = HttpContext.RequestServices.GetService<Microsoft.Extensions.Caching.Memory.IMemoryCache>();
                cache?.Remove($"UserSession_{userId}");

                return Ok(ApiResponse.Ok("Đổi mật khẩu thành công. Vui lòng đăng nhập lại."));
            }

            var errors = resetResult.Errors.Select(e => e.Description).ToList();
            return BadRequest(ApiResponse.Fail("Không thể đổi mật khẩu.", errors));
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}

