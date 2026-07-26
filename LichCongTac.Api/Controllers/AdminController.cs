using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Models;
using LichCongTac.Models;
using LichCongTac.Core.Data.Interfaces;

namespace LichCongTac.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminRepository _adminRepo;
        private readonly IAuditLogRepository _auditLogRepo;

        public AdminController(IAdminRepository adminRepo, IAuditLogRepository auditLogRepo)
        {
            _adminRepo = adminRepo;
            _auditLogRepo = auditLogRepo;
        }

        // --- DEPARTMENTS ---
        [Authorize(Roles = "Admin,VanThu,LanhDao,CanBo")]
        [HttpGet("departments")]
        public IActionResult GetDepartments() => Ok(ApiResponse.Ok(_adminRepo.GetDepartments()));

        [Authorize(Roles = "Admin")]
        [HttpPost("departments")]
        public IActionResult AddDepartment([FromBody] Department dept)
        {
            if (dept == null) return BadRequest(ApiResponse.Fail("Dữ liệu phòng ban không hợp lệ."));
            int id = _adminRepo.InsertDepartment(dept);
            dept.Id = id;
            return Ok(ApiResponse.Ok(dept));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("departments")]
        public IActionResult UpdateDepartment([FromBody] Department dept)
        {
            if (dept == null) return BadRequest(ApiResponse.Fail("Dữ liệu phòng ban không hợp lệ."));
            _adminRepo.UpdateDepartment(dept);
            return Ok(ApiResponse.Ok(dept));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("departments/{id}")]
        public IActionResult DeleteDepartment(int id)
        {
            _adminRepo.DeleteDepartment(id);
            return Ok(ApiResponse.Ok("Xóa phòng ban thành công."));
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("audit-logs")]
        public IActionResult GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = _auditLogRepo.GetAuditLogs(page, pageSize);
            return Ok(ApiResponse.Ok(new { items = result.items, total = result.total }));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("clear-audit-logs")]
        public IActionResult ClearAuditLogs()
        {
            _auditLogRepo.ClearAuditLogs();
            _auditLogRepo.InsertAuditLog(null, "Quản trị viên đã dọn sạch toàn bộ nhật ký hệ thống.");
            return Ok(ApiResponse.Ok("Đã dọn sạch nhật ký hệ thống."));
        }
    }
}
