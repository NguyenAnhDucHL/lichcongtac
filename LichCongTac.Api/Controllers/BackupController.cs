using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Core.Models;

namespace LichCongTac.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class BackupController : ControllerBase
    {
        private readonly IDocumentRepository _documentRepository;

        public BackupController(IDocumentRepository documentRepository)
        {
            _documentRepository = documentRepository;
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export()
        {
            try
            {
                byte[] csvData = await _documentRepository.ExportDocumentsToCsvAsync();
                string fileName = $"LichCongTac_Backup_{DateTime.Now:yyyyMMdd_HHmm}.csv";

                return File(csvData, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.Fail($"Lỗi xuất dữ liệu: {ex.Message}"));
            }
        }
    }
}
