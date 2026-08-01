using System;

namespace LichCongTac.Core.Models
{
    public class Holiday
    {
        public int Id { get; set; }
        public string Date { get; set; } // Format: YYYY-MM-DD
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
