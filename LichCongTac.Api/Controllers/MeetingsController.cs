using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Data.Repositories;
using LichCongTac.Models;

namespace LichCongTac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingsController : ControllerBase
    {
        private readonly IMeetingRepository _meetingRepo;

        public MeetingsController(IMeetingRepository meetingRepo)
        {
            _meetingRepo = meetingRepo;
        }

        [HttpGet("public-schedule")]
        public async Task<IActionResult> GetPublicSchedule()
        {
            try
            {
                var meetings = await _meetingRepo.GetAllAsync();
                
                var today = DateTime.Today;
                // Get meetings from Monday of current week to next weeks
                var diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                var startOfWeek = today.AddDays(-1 * diff).Date;

                var upcomingMeetings = meetings
                    .Where(m => m.StartTime.Date >= startOfWeek)
                    .OrderBy(m => m.StartTime)
                    .ToList();

                var grouped = upcomingMeetings
                    .GroupBy(m => m.StartTime.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("dd/MM/yyyy"),
                        DayLabel = GetVietnameseDayOfWeek(g.Key),
                        IsToday = g.Key == today,
                        Items = g.Select(m => new
                        {
                            Id = m.Id,
                            Title = m.Title,
                            StartTime = m.StartTime.ToString("HH:mm"),
                            Presider = m.Presider,
                            Location = m.Location ?? m.RoomName,
                            Content = m.Content,
                            Status = m.Status,
                            OrganizingUnit = m.OrganizingUnit,
                            PreparingUnit = m.PreparingUnit
                        }).ToList()
                    })
                    .OrderBy(g => DateTime.ParseExact(g.Date, "dd/MM/yyyy", null))
                    .ToList();

                return Ok(new { success = true, data = grouped });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private string GetVietnameseDayOfWeek(DateTime date)
        {
            return date.DayOfWeek switch
            {
                DayOfWeek.Monday => "Thứ hai",
                DayOfWeek.Tuesday => "Thứ ba",
                DayOfWeek.Wednesday => "Thứ tư",
                DayOfWeek.Thursday => "Thứ năm",
                DayOfWeek.Friday => "Thứ sáu",
                DayOfWeek.Saturday => "Thứ bảy",
                DayOfWeek.Sunday => "Chủ nhật",
                _ => ""
            };
        }
    }
}
