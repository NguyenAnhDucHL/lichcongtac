using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Models;
using LichCongTac.Core.Models;

namespace LichCongTac.Core.Data.Repositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly string _connectionString;

        public ScheduleRepository(IConfiguration configuration)
        {
            string? configConnString = configuration.GetConnectionString("DefaultConnection");
            if (!string.IsNullOrEmpty(configConnString))
            {
                _connectionString = configConnString;
            }
            else
            {
                string dbPath;
                string? envPath = Environment.GetEnvironmentVariable("DB_PATH");
                if (!string.IsNullOrEmpty(envPath))
                {
                    dbPath = envPath;
                }
                else
                {
                    string appData = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                        "LichCongTac"
                    );
                    dbPath = Path.Combine(appData, "documents.db");
                }
                _connectionString = $"Data Source={dbPath};Pooling=True;Default Timeout=30";
            }
        }

        private Schedule MapReaderToSchedule(SqliteDataReader reader)
        {
            return new Schedule
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Date = reader.GetString(reader.GetOrdinal("Date")),
                StartTime = reader.IsDBNull(reader.GetOrdinal("StartTime")) ? null : reader.GetString(reader.GetOrdinal("StartTime")),
                Location = reader.IsDBNull(reader.GetOrdinal("Location")) ? null : reader.GetString(reader.GetOrdinal("Location")),
                Content = reader.IsDBNull(reader.GetOrdinal("Content")) ? null : reader.GetString(reader.GetOrdinal("Content")),
                InvitationNumber = reader.IsDBNull(reader.GetOrdinal("InvitationNumber")) ? null : reader.GetString(reader.GetOrdinal("InvitationNumber")),
                Presider = reader.IsDBNull(reader.GetOrdinal("Presider")) ? null : reader.GetString(reader.GetOrdinal("Presider")),
                PreparingUnit = reader.IsDBNull(reader.GetOrdinal("PreparingUnit")) ? null : reader.GetString(reader.GetOrdinal("PreparingUnit")),
                Participants = reader.IsDBNull(reader.GetOrdinal("Participants")) ? null : reader.GetString(reader.GetOrdinal("Participants")),
                IsPublic = reader.GetInt32(reader.GetOrdinal("IsPublic")),
                CreatedAt = reader.GetString(reader.GetOrdinal("CreatedAt")),
                CreatedBy = reader.IsDBNull(reader.GetOrdinal("CreatedBy")) ? null : reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt")) ? null : reader.GetString(reader.GetOrdinal("UpdatedAt"))
            };
        }

        public async Task<IEnumerable<Schedule>> GetAllAsync(bool includeInternal = false)
        {
            var schedules = new List<Schedule>();
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Title, Date, StartTime, Location, Content, InvitationNumber, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt FROM Schedules";
            if (!includeInternal)
            {
                cmd.CommandText += " WHERE IsPublic = 1";
            }
            cmd.CommandText += " ORDER BY Date DESC, StartTime DESC LIMIT 1000";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                schedules.Add(MapReaderToSchedule(reader));
            }

            return schedules;
        }

        public async Task<IEnumerable<Schedule>> GetByDateRangeAsync(string startDate, string endDate, bool includeInternal = false)
        {
            var schedules = new List<Schedule>();
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Title, Date, StartTime, Location, Content, InvitationNumber, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt FROM Schedules WHERE Date >= @StartDate AND Date <= @EndDate";
            cmd.Parameters.AddWithValue("@StartDate", startDate);
            cmd.Parameters.AddWithValue("@EndDate", endDate);

            if (!includeInternal)
            {
                cmd.CommandText += " AND IsPublic = 1";
            }
            cmd.CommandText += " ORDER BY Date ASC, StartTime ASC LIMIT 1000";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                schedules.Add(MapReaderToSchedule(reader));
            }

            return schedules;
        }

        public async Task<(IEnumerable<Schedule> Items, int TotalCount)> SearchPaginatedAsync(string? startDate, string? endDate, string? keyword, int page, int pageSize, bool includeInternal = false)
        {
            var schedules = new List<Schedule>();
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            string whereClause = "1=1";
            if (!includeInternal)
            {
                whereClause += " AND IsPublic = 1";
            }

            using var cmd = conn.CreateCommand();
            if (!string.IsNullOrEmpty(startDate))
            {
                whereClause += " AND Date >= @StartDate";
                cmd.Parameters.AddWithValue("@StartDate", startDate);
            }
            if (!string.IsNullOrEmpty(endDate))
            {
                whereClause += " AND Date <= @EndDate";
                cmd.Parameters.AddWithValue("@EndDate", endDate);
            }
            if (!string.IsNullOrEmpty(keyword))
            {
                whereClause += " AND (LOWER(Content) LIKE @Keyword OR LOWER(Title) LIKE @Keyword OR LOWER(InvitationNumber) LIKE @Keyword)";
                cmd.Parameters.AddWithValue("@Keyword", $"%{keyword.ToLower()}%");
            }

            using var countCmd = conn.CreateCommand();
            countCmd.CommandText = $"SELECT COUNT(1) FROM Schedules WHERE {whereClause}";
            foreach (SqliteParameter param in cmd.Parameters)
            {
                countCmd.Parameters.AddWithValue(param.ParameterName, param.Value);
            }
            int totalCount = Convert.ToInt32(await countCmd.ExecuteScalarAsync());

            cmd.CommandText = $"SELECT Id, Title, Date, StartTime, Location, Content, InvitationNumber, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt FROM Schedules WHERE {whereClause} ORDER BY Date DESC, StartTime DESC LIMIT @PageSize OFFSET @Offset";
            cmd.Parameters.AddWithValue("@PageSize", pageSize);
            cmd.Parameters.AddWithValue("@Offset", (page - 1) * pageSize);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                schedules.Add(MapReaderToSchedule(reader));
            }

            return (schedules, totalCount);
        }

        public async Task<Schedule?> GetByIdAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Title, Date, StartTime, Location, Content, InvitationNumber, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt FROM Schedules WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return MapReaderToSchedule(reader);
            }
            return null;
        }

        public async Task<int> CreateAsync(Schedule schedule)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO Schedules (Title, Date, StartTime, Location, Content, InvitationNumber, Presider, PreparingUnit, Participants, IsPublic, CreatedBy)
                VALUES (@Title, @Date, @StartTime, @Location, @Content, @InvitationNumber, @Presider, @PreparingUnit, @Participants, @IsPublic, @CreatedBy);
                SELECT last_insert_rowid();";

            cmd.Parameters.AddWithValue("@Title", schedule.Title);
            cmd.Parameters.AddWithValue("@Date", schedule.Date);
            cmd.Parameters.AddWithValue("@StartTime", schedule.StartTime ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Location", schedule.Location ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Content", schedule.Content ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@InvitationNumber", schedule.InvitationNumber ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Presider", schedule.Presider ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PreparingUnit", schedule.PreparingUnit ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Participants", schedule.Participants ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsPublic", schedule.IsPublic);
            cmd.Parameters.AddWithValue("@CreatedBy", schedule.CreatedBy ?? (object)DBNull.Value);

            var result = await cmd.ExecuteScalarAsync();
            return Convert.ToInt32(result);
        }

        public async Task<UpdateResult> UpdateAsync(Schedule schedule, string? expectedUpdatedAt = null)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE Schedules
                SET Title = @Title,
                    Date = @Date,
                    StartTime = @StartTime,
                    Location = @Location,
                    Content = @Content,
                    InvitationNumber = @InvitationNumber,
                    Presider = @Presider,
                    PreparingUnit = @PreparingUnit,
                    Participants = @Participants,
                    IsPublic = @IsPublic,
                    UpdatedAt = datetime('now')
                WHERE Id = @Id 
                AND (@ExpectedUpdatedAt IS NULL OR UpdatedAt = @ExpectedUpdatedAt OR (UpdatedAt IS NULL AND @ExpectedUpdatedAt = ''))";

            cmd.Parameters.AddWithValue("@Id", schedule.Id);
            cmd.Parameters.AddWithValue("@Title", schedule.Title);
            cmd.Parameters.AddWithValue("@Date", schedule.Date);
            cmd.Parameters.AddWithValue("@StartTime", schedule.StartTime ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Location", schedule.Location ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Content", schedule.Content ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@InvitationNumber", schedule.InvitationNumber ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Presider", schedule.Presider ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PreparingUnit", schedule.PreparingUnit ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Participants", schedule.Participants ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsPublic", schedule.IsPublic);
            cmd.Parameters.AddWithValue("@ExpectedUpdatedAt", expectedUpdatedAt ?? (object)DBNull.Value);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            if (rowsAffected > 0) return UpdateResult.Success;

            // Nếu update không thành công, kiểm tra xem bản ghi còn tồn tại không
            using var checkCmd = conn.CreateCommand();
            checkCmd.CommandText = "SELECT COUNT(1) FROM Schedules WHERE Id = @Id";
            checkCmd.Parameters.AddWithValue("@Id", schedule.Id);
            var exists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) > 0;

            return exists ? UpdateResult.ConcurrencyConflict : UpdateResult.NotFound;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM Schedules WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", id);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }
}
