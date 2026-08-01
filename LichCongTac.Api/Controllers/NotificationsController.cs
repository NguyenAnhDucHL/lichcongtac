using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Models;
using LichCongTac.Core.Data.Repositories;
using System.Security.Claims;

namespace LichCongTac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationRepository _repository;

        public NotificationsController(NotificationRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notifications = await _repository.GetAllAsync();
            return Ok(ApiResponse<List<Notification>>.Ok(notifications));
        }

        [HttpGet("visible")]
        public async Task<IActionResult> GetVisible()
        {
            var notifications = await _repository.GetVisibleAsync();
            return Ok(ApiResponse<List<Notification>>.Ok(notifications));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var notification = await _repository.GetByIdAsync(id);
            if (notification == null) return NotFound(ApiResponse.Fail("Không tìm thấy thông báo"));
            return Ok(ApiResponse<Notification>.Ok(notification));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Notification model)
        {
            if (string.IsNullOrWhiteSpace(model.Content))
                return BadRequest(ApiResponse.Fail("Nội dung không được để trống"));

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                model.CreatedBy = userId;
            }

            var id = await _repository.AddAsync(model);
            model.Id = id;
            
            return Ok(ApiResponse<Notification>.Ok(model, "Thêm thông báo thành công"));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Notification model)
        {
            if (string.IsNullOrWhiteSpace(model.Content))
                return BadRequest(ApiResponse.Fail("Nội dung không được để trống"));

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(ApiResponse.Fail("Không tìm thấy thông báo"));

            model.Id = id;
            await _repository.UpdateAsync(model);

            return Ok(ApiResponse<Notification>.Ok(model, "Cập nhật thông báo thành công"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(ApiResponse.Fail("Không tìm thấy thông báo"));

            await _repository.DeleteAsync(id);
            return Ok(ApiResponse.Ok("Xóa thông báo thành công"));
        }
    }
}
