using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LichCongTac.Core.Models;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;

namespace LichCongTac.Core.Data.Repositories
{
    public class HolidayRepository
    {
        private readonly string _connectionString;

        public HolidayRepository(IConfiguration configuration)
        {
            var dbPath = Environment.GetEnvironmentVariable("DB_PATH");
            if (string.IsNullOrEmpty(dbPath))
            {
                var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "LichCongTac");
                dbPath = Path.Combine(appData, "documents.db");
            }
            _connectionString = $"Data Source={dbPath};Pooling=True;Default Timeout=30;Cache=Shared";
        }

        public async Task<List<Holiday>> GetAllAsync()
        {
            var holidays = new List<Holiday>();
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Date, Content, CreatedAt, CreatedBy, UpdatedAt FROM Holidays ORDER BY Date DESC";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                holidays.Add(MapHoliday(reader));
            }

            return holidays;
        }

        public async Task<Holiday?> GetByIdAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Date, Content, CreatedAt, CreatedBy, UpdatedAt FROM Holidays WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return MapHoliday(reader);
            }

            return null;
        }

        public async Task<Holiday?> GetHolidayByDateAsync(string date)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT Id, Date, Content, CreatedAt, CreatedBy, UpdatedAt FROM Holidays WHERE Date = @Date LIMIT 1";
            cmd.Parameters.AddWithValue("@Date", date);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return MapHoliday(reader);
            }

            return null;
        }

        public async Task<int> CreateAsync(Holiday holiday)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO Holidays (Date, Content, CreatedBy)
                VALUES (@Date, @Content, @CreatedBy);
                SELECT last_insert_rowid();";

            cmd.Parameters.AddWithValue("@Date", holiday.Date);
            cmd.Parameters.AddWithValue("@Content", holiday.Content);
            cmd.Parameters.AddWithValue("@CreatedBy", holiday.CreatedBy ?? (object)DBNull.Value);

            var id = await cmd.ExecuteScalarAsync();
            return Convert.ToInt32(id);
        }

        public async Task<bool> UpdateAsync(Holiday holiday)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE Holidays 
                SET Date = @Date, 
                    Content = @Content, 
                    UpdatedAt = datetime('now')
                WHERE Id = @Id";

            cmd.Parameters.AddWithValue("@Date", holiday.Date);
            cmd.Parameters.AddWithValue("@Content", holiday.Content);
            cmd.Parameters.AddWithValue("@Id", holiday.Id);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM Holidays WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", id);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        private Holiday MapHoliday(SqliteDataReader reader)
        {
            return new Holiday
            {
                Id = reader.GetInt32(0),
                Date = reader.GetString(1),
                Content = reader.GetString(2),
                CreatedAt = reader.IsDBNull(3) ? DateTime.MinValue : DateTime.Parse(reader.GetString(3)),
                CreatedBy = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                UpdatedAt = reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5))
            };
        }
    }
}
