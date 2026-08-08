namespace LichCongTac.Core.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int IsVisible { get; set; } = 1;
        public string CreatedAt { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
