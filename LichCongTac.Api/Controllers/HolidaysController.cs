using System;
using System.Threading.Tasks;
using LichCongTac.Core.Data.Repositories;
using LichCongTac.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using LichCongTac.Api.Hubs;

namespace LichCongTac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HolidaysController : ControllerBase
    {
        private readonly HolidayRepository _holidayRepository;
        private readonly IHubContext<AppHub> _hubContext;

        public HolidaysController(HolidayRepository holidayRepository, IHubContext<AppHub> hubContext)
        {
            _holidayRepository = holidayRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var holidays = await _holidayRepository.GetAllAsync();
            return Ok(ApiResponse<object>.Ok(holidays));
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayHoliday()
        {
            // Get today's date in Vietnam time (or system local)
            // Using standard approach
            var todayStr = DateTime.Now.ToString("yyyy-MM-dd");
            var holiday = await _holidayRepository.GetHolidayByDateAsync(todayStr);
            
            return Ok(ApiResponse<object>.Ok(holiday));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] HolidayDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Date) || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(ApiResponse.Fail("Ngày và nội dung không được để trống"));
            }

            // Simple validation
            if (!DateTime.TryParse(request.Date, out _))
            {
                return BadRequest(ApiResponse.Fail("Định dạng ngày không hợp lệ"));
            }

            int? userId = null;
            if (int.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id))
            {
                userId = id;
            }

            var holiday = new Holiday
            {
                Date = request.Date,
                Content = request.Content,
                CreatedBy = userId
            };

            var newId = await _holidayRepository.CreateAsync(holiday);
            holiday.Id = newId;

            await _hubContext.Clients.All.SendAsync("ReceiveHolidayUpdate");

            return Ok(ApiResponse<Holiday>.Ok(holiday));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] HolidayDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Date) || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(ApiResponse.Fail("Ngày và nội dung không được để trống"));
            }

            var existing = await _holidayRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy ngày lễ"));
            }

            existing.Date = request.Date;
            existing.Content = request.Content;

            var success = await _holidayRepository.UpdateAsync(existing);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Cập nhật thất bại"));
            }

            await _hubContext.Clients.All.SendAsync("ReceiveHolidayUpdate");

            return Ok(ApiResponse<Holiday>.Ok(existing));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _holidayRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail("Không tìm thấy ngày lễ"));
            }

            var success = await _holidayRepository.DeleteAsync(id);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Xóa thất bại"));
            }

            await _hubContext.Clients.All.SendAsync("ReceiveHolidayUpdate");

            return Ok(ApiResponse.Ok("Xóa ngày lễ thành công"));
        }
    }

    public class HolidayDto
    {
        public string Date { get; set; }
        public string Content { get; set; }
    }
}
