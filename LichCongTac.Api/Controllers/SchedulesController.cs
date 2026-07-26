using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Core.Models;
using LichCongTac.Models;
using System.Security.Claims;

namespace LichCongTac.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepository;

        public SchedulesController(IScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

        [HttpGet("public-schedule")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicSchedules([FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            IEnumerable<Schedule> schedules;
            if (!string.IsNullOrEmpty(startDate) && !string.IsNullOrEmpty(endDate))
            {
                schedules = await _scheduleRepository.GetByDateRangeAsync(startDate, endDate, includeInternal: false);
            }
            else
            {
                schedules = await _scheduleRepository.GetAllAsync(includeInternal: false);
            }
            return Ok(ApiResponse<IEnumerable<Schedule>>.Ok(schedules));
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllSchedules([FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            IEnumerable<Schedule> schedules;
            if (!string.IsNullOrEmpty(startDate) && !string.IsNullOrEmpty(endDate))
            {
                schedules = await _scheduleRepository.GetByDateRangeAsync(startDate, endDate, includeInternal: true);
            }
            else
            {
                schedules = await _scheduleRepository.GetAllAsync(includeInternal: true);
            }
            return Ok(ApiResponse<IEnumerable<Schedule>>.Ok(schedules));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
            {
                return NotFound(ApiResponse.Fail($"Không tìm thấy lịch công tác #{id}"));
            }
            return Ok(ApiResponse<Schedule>.Ok(schedule));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateSchedule([FromBody] ScheduleCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.Fail("Dữ liệu không hợp lệ", errors));
            }

            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? createdBy = int.TryParse(userIdString, out var uid) ? uid : null;

            var schedule = new Schedule
            {
                Title = dto.Title,
                Date = dto.Date,
                StartTime = dto.StartTime,
                Location = dto.Location,
                Content = dto.Content,
                Presider = dto.Presider,
                PreparingUnit = dto.PreparingUnit,
                Participants = dto.Participants,
                IsPublic = dto.IsPublic,
                CreatedBy = createdBy
            };

            var id = await _scheduleRepository.CreateAsync(schedule);
            schedule.Id = id;
            
            return Ok(ApiResponse<Schedule>.Ok(schedule, "Tạo lịch công tác thành công"));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] ScheduleUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.Fail("Dữ liệu không hợp lệ", errors));
            }

            var existing = await _scheduleRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail($"Không tìm thấy lịch công tác #{id}"));
            }

            existing.Title = dto.Title;
            existing.Date = dto.Date;
            existing.StartTime = dto.StartTime;
            existing.Location = dto.Location;
            existing.Content = dto.Content;
            existing.Presider = dto.Presider;
            existing.PreparingUnit = dto.PreparingUnit;
            existing.Participants = dto.Participants;
            existing.IsPublic = dto.IsPublic;

            var success = await _scheduleRepository.UpdateAsync(existing);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Cập nhật thất bại"));
            }

            return Ok(ApiResponse.Ok("Cập nhật lịch công tác thành công"));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var existing = await _scheduleRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse.Fail($"Không tìm thấy lịch công tác #{id}"));
            }

            var success = await _scheduleRepository.DeleteAsync(id);
            if (!success)
            {
                return BadRequest(ApiResponse.Fail("Xóa thất bại"));
            }

            return Ok(ApiResponse.Ok("Xóa lịch công tác thành công"));
        }
    }
}
