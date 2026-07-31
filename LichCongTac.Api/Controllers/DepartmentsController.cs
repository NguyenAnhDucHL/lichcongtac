using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Core.Models;
using LichCongTac.Models;

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
        public IActionResult GetAll()
        {
            var departments = _departmentRepository.GetAll();
            return Ok(ApiResponse.Ok(departments));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var dept = _departmentRepository.GetById(id);
            if (dept == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy phòng ban"));
            }
            return Ok(ApiResponse.Ok(dept));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public IActionResult Create([FromBody] Department department)
        {
            if (string.IsNullOrWhiteSpace(department.Name))
            {
                return BadRequest(ApiResponse.Fail("Tên phòng ban không được để trống"));
            }

            var success = _departmentRepository.Create(department);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Lỗi khi thêm phòng ban"));
            }
            return Ok(ApiResponse.Ok("Thêm phòng ban thành công"));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Department department)
        {
            if (string.IsNullOrWhiteSpace(department.Name))
            {
                return BadRequest(ApiResponse.Fail("Tên phòng ban không được để trống"));
            }

            var existing = _departmentRepository.GetById(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy phòng ban"));
            }

            department.Id = id;
            var success = _departmentRepository.Update(department);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Lỗi khi cập nhật phòng ban"));
            }
            return Ok(ApiResponse.Ok("Cập nhật phòng ban thành công"));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var existing = _departmentRepository.GetById(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy phòng ban"));
            }

            var success = _departmentRepository.Delete(id);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Lỗi khi xóa phòng ban"));
            }
            return Ok(ApiResponse.Ok("Xóa phòng ban thành công"));
        }
    }
}
