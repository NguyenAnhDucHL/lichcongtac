using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Models;

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
                _connectionString = $"Data Source={dbPath};Pooling=False;Default Timeout=30";
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
            cmd.CommandText = "SELECT Id, Title, Date, StartTime, Location, Content, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt, InvitationNumber FROM Schedules";
            if (!includeInternal)
            {
                cmd.CommandText += " WHERE IsPublic = 1";
            }
            cmd.CommandText += " ORDER BY Date DESC, StartTime DESC";

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
            cmd.CommandText = "SELECT Id, Title, Date, StartTime, Location, Content, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt, InvitationNumber FROM Schedules WHERE Date >= @StartDate AND Date <= @EndDate";
            cmd.Parameters.AddWithValue("@StartDate", startDate);
            cmd.Parameters.AddWithValue("@EndDate", endDate);

            if (!includeInternal)
            {
                cmd.CommandText += " AND IsPublic = 1";
            }
            cmd.CommandText += " ORDER BY Date ASC, StartTime ASC";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                schedules.Add(MapReaderToSchedule(reader));
            }

            return schedules;
        }

        public async Task<Schedule?> GetByIdAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Title, Date, StartTime, Location, Content, Presider, PreparingUnit, Participants, IsPublic, CreatedAt, CreatedBy, UpdatedAt, InvitationNumber FROM Schedules WHERE Id = @Id";
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

        public async Task<bool> UpdateAsync(Schedule schedule)
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
                WHERE Id = @Id";

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

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
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
