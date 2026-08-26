using System.Threading.Tasks;
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
        public async Task<IActionResult> GetDepartments() => Ok(ApiResponse.Ok(await _adminRepo.GetDepartmentsAsync()));

        [Authorize(Roles = "Admin")]
        [HttpPost("departments")]
        public async Task<IActionResult> AddDepartment([FromBody] Department dept)
        {
            if (dept == null) return BadRequest(ApiResponse.Fail("Dữ liệu phòng ban không hợp lệ."));
            int id = await _adminRepo.InsertDepartmentAsync(dept);
            dept.Id = id;
            return Ok(ApiResponse.Ok(dept));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("departments")]
        public async Task<IActionResult> UpdateDepartment([FromBody] Department dept)
        {
            if (dept == null) return BadRequest(ApiResponse.Fail("Dữ liệu phòng ban không hợp lệ."));
            await _adminRepo.UpdateDepartmentAsync(dept);
            return Ok(ApiResponse.Ok(dept));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            await _adminRepo.DeleteDepartmentAsync(id);
            return Ok(ApiResponse.Ok("Xóa phòng ban thành công."));
        }

    }
}
