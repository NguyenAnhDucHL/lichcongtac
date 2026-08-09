using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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
        private readonly IHubContext<LichCongTac.Api.Hubs.AppHub> _hubContext;

        public AuthController(
            IConfiguration configuration,
            IUserRepository userRepository,
            UserManager<User> userManager,
            IHubContext<LichCongTac.Api.Hubs.AppHub> hubContext)
        {
            _configuration  = configuration;
            _userRepository = userRepository;
            _userManager    = userManager;
            _hubContext     = hubContext;
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

            // Generate Refresh Token
            var refreshToken = GenerateRefreshToken();
            var refreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Refresh token valid for 7 days
            _userRepository.UpdateRefreshToken(user.Id, refreshToken, refreshTokenExpiryTime);

            // Gắn token vào HttpOnly Cookie để trình duyệt tự động gửi khi tải PDF
            Response.Cookies.Append("jwt_cookie", tokenString, new CookieOptions
            {
                HttpOnly = true,
                Secure   = true,
                SameSite = SameSiteMode.Strict, // Cập nhật bảo mật chống CSRF
                Expires  = DateTime.UtcNow.AddHours(24)
            });

            // Gắn Refresh Token vào HttpOnly Cookie (Chuẩn Enterprise)
            Response.Cookies.Append("refresh_cookie", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure   = true,
                SameSite = SameSiteMode.Strict,
                Expires  = refreshTokenExpiryTime
            });

            // Bắn tín hiệu ForceLogout tới các kết nối hiện tại của user (trên thiết bị cũ)
            await _hubContext.Clients.Group($"User_{user.Id}").SendAsync("ForceLogout", "Tài khoản của bạn vừa được đăng nhập trên thiết bị khác.");

            return Ok(ApiResponse.Ok(new
            {
                token    = tokenString,
                username = user.Username,
                fullName = user.FullName ?? user.Username,
                role     = user.Role,
                userId   = user.Id
            }));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var refreshToken = Request.Cookies["refresh_cookie"];
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(refreshToken))
                return BadRequest(ApiResponse.Fail("Token không hợp lệ."));

            var principal = GetPrincipalFromExpiredToken(request.Token);
            if (principal == null)
                return BadRequest(ApiResponse.Fail("Token không hợp lệ hoặc đã bị hỏng."));

            var username = principal.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return BadRequest(ApiResponse.Fail("Token không chứa thông tin người dùng."));

            var user = await _userManager.FindByNameAsync(username);
            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return Unauthorized(ApiResponse.Fail("Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."));

            if (user.RefreshToken != refreshToken)
                return Unauthorized(ApiResponse.Fail("Tài khoản của bạn vừa được đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại để tiếp tục làm việc ở máy này."));

            // Sinh Token mới
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecret = _configuration["JWT_SECRET"] ?? Environment.GetEnvironmentVariable("JWT_SECRET");
            var key = Encoding.ASCII.GetBytes(jwtSecret!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(principal.Claims), // Kế thừa toàn bộ claims cũ
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var newToken = tokenHandler.CreateToken(tokenDescriptor);
            var newTokenString = tokenHandler.WriteToken(newToken);
            
            var newRefreshToken = GenerateRefreshToken();
            var newRefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _userRepository.UpdateRefreshToken(user.Id, newRefreshToken, newRefreshTokenExpiryTime);

            Response.Cookies.Append("jwt_cookie", newTokenString, new CookieOptions
            {
                HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Expires = DateTime.UtcNow.AddHours(24)
            });

            Response.Cookies.Append("refresh_cookie", newRefreshToken, new CookieOptions
            {
                HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Expires = newRefreshTokenExpiryTime
            });

            return Ok(ApiResponse.Ok(new
            {
                token = newTokenString
            }));
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var jwtSecret = _configuration["JWT_SECRET"] ?? Environment.GetEnvironmentVariable("JWT_SECRET");
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret!)),
                ValidateLifetime = false // Quan trọng: Bỏ qua kiểm tra thời hạn để có thể đọc được token đã hết hạn
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
                if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                    throw new SecurityTokenException("Invalid token");

                return principal;
            }
            catch
            {
                return null;
            }
        }


        // ─── LOGOUT ──────────────────────────────────────────────────────────────

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdStr, out int userId))
            {
                _userRepository.UpdateRefreshToken(userId, null, null);
            }

            Response.Cookies.Delete("jwt_cookie");
            Response.Cookies.Delete("refresh_cookie");
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

                // Thu hồi Refresh Token
                _userRepository.UpdateRefreshToken(userId, null, null);

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

    public class RefreshTokenRequest
    {
        public string Token { get; set; } = "";
    }
}

