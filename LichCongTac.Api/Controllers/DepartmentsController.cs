using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Core.Models;
using LichCongTac.Models;
using System.Threading.Tasks;

namespace LichCongTac.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DepartmentsController(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var departments = await _departmentRepository.GetAllAsync();
            return Ok(ApiResponse.Ok(departments));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var dept = await _departmentRepository.GetByIdAsync(id);
            if (dept == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy phòng ban"));
            }
            return Ok(ApiResponse.Ok(dept));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Department department)
        {
            if (string.IsNullOrWhiteSpace(department.Name))
            {
                return BadRequest(ApiResponse.Fail("Tên phòng ban không được để trống"));
            }

            var success = await _departmentRepository.CreateAsync(department);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Lỗi khi thêm phòng ban"));
            }
            return Ok(ApiResponse.Ok("Thêm phòng ban thành công"));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Department department)
        {
            if (string.IsNullOrWhiteSpace(department.Name))
            {
                return BadRequest(ApiResponse.Fail("Tên phòng ban không được để trống"));
            }

            var existing = await _departmentRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy phòng ban"));
            }

            department.Id = id;
            var success = await _departmentRepository.UpdateAsync(department);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Lỗi khi cập nhật phòng ban"));
            }
            return Ok(ApiResponse.Ok("Cập nhật phòng ban thành công"));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _departmentRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy phòng ban"));
            }

            var success = await _departmentRepository.DeleteAsync(id);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Lỗi khi xóa phòng ban"));
            }
            return Ok(ApiResponse.Ok("Xóa phòng ban thành công"));
        }
    }
}
