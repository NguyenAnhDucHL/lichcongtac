using System.ComponentModel.DataAnnotations;

namespace LichCongTac.Models
{
    public class Schedule
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty; // YYYY-MM-DD
        public string? StartTime { get; set; }
        public string? Location { get; set; }
        public string? Content { get; set; }
        public string? InvitationNumber { get; set; }
        public string? Presider { get; set; }
        public string? PreparingUnit { get; set; }
        public string? Participants { get; set; }
        public int IsPublic { get; set; } = 1; // 1: Công khai, 0: Nội bộ
        public string CreatedAt { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }

    public class ScheduleCreateDto
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày diễn ra không được để trống")]
        [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Định dạng ngày phải là YYYY-MM-DD")]
        public string Date { get; set; } = string.Empty;

        public string? StartTime { get; set; }
        public string? Location { get; set; }
        public string? Content { get; set; }
        public string? InvitationNumber { get; set; }
        public string? Presider { get; set; }
        public string? PreparingUnit { get; set; }
        public string? Participants { get; set; }
        public int IsPublic { get; set; } = 1;
    }

    public class ScheduleUpdateDto : ScheduleCreateDto
    {
        public string? UpdatedAt { get; set; }
    }
}
