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

        public AdminController(IAdminRepository adminRepo)
        {
            _adminRepo = adminRepo;
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

    }
}
