using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using LichCongTac.Core.Models;
using System.Text.Json;

namespace LichCongTac.Core.Data.Repositories
{
    public class NotificationRepository
    {
        private readonly string _connectionString;

        public NotificationRepository(IConfiguration configuration)
        {
            string? configConnString = configuration.GetConnectionString("DefaultConnection");

            if (!string.IsNullOrEmpty(configConnString))
            {
                _connectionString = configConnString;
            }
            else
            {
                string? envPath = Environment.GetEnvironmentVariable("DB_PATH");
                string dbPath = !string.IsNullOrEmpty(envPath) ? envPath : "data_dump/documents.db";
                _connectionString = $"Data Source={dbPath}";
            }
        }

        public async Task<List<Notification>> GetAllAsync()
        {
            var results = new List<Notification>();
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT Id, Content, IsVisible, CreatedAt, CreatedBy, UpdatedAt 
                FROM Notifications 
                ORDER BY Id DESC LIMIT 200";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new Notification
                {
                    Id = reader.GetInt32(0),
                    Content = reader.GetString(1),
                    IsVisible = reader.GetInt32(2),
                    CreatedAt = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                    CreatedBy = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                    UpdatedAt = reader.IsDBNull(5) ? null : reader.GetString(5)
                });
            }

            return results;
        }

        public async Task<List<Notification>> GetVisibleAsync()
        {
            var results = new List<Notification>();
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT Id, Content, IsVisible, CreatedAt, CreatedBy, UpdatedAt 
                FROM Notifications 
                WHERE IsVisible = 1
                ORDER BY Id DESC LIMIT 100";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new Notification
                {
                    Id = reader.GetInt32(0),
                    Content = reader.GetString(1),
                    IsVisible = reader.GetInt32(2),
                    CreatedAt = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                    CreatedBy = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                    UpdatedAt = reader.IsDBNull(5) ? null : reader.GetString(5)
                });
            }

            return results;
        }

        public async Task<Notification?> GetByIdAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT Id, Content, IsVisible, CreatedAt, CreatedBy, UpdatedAt 
                FROM Notifications
                WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) return null;

            return new Notification
            {
                Id = reader.GetInt32(0),
                Content = reader.GetString(1),
                IsVisible = reader.GetInt32(2),
                CreatedAt = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                CreatedBy = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                UpdatedAt = reader.IsDBNull(5) ? null : reader.GetString(5)
            };
        }

        public async Task<int> AddAsync(Notification notification)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO Notifications (Content, IsVisible, CreatedBy)
                VALUES (@Content, @IsVisible, @CreatedBy);
                SELECT last_insert_rowid();";
            
            cmd.Parameters.AddWithValue("@Content", notification.Content);
            cmd.Parameters.AddWithValue("@IsVisible", notification.IsVisible);
            cmd.Parameters.AddWithValue("@CreatedBy", notification.CreatedBy ?? (object)DBNull.Value);

            var id = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            return id;
        }

        public async Task UpdateAsync(Notification notification)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE Notifications 
                SET Content = @Content, IsVisible = @IsVisible, UpdatedAt = datetime('now', 'localtime')
                WHERE Id = @Id";
            
            cmd.Parameters.AddWithValue("@Id", notification.Id);
            cmd.Parameters.AddWithValue("@Content", notification.Content);
            cmd.Parameters.AddWithValue("@IsVisible", notification.IsVisible);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task DeleteAsync(int id)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM Notifications WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", id);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
