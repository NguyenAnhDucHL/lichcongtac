using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;

namespace LichCongTac.Core.Data.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly string _connectionString;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "DepartmentsCache";

        public AdminRepository(IConfiguration configuration, IMemoryCache cache)
        {
            _cache = cache;
            string? configConnString = configuration.GetConnectionString("DefaultConnection");
            if (!string.IsNullOrEmpty(configConnString)) { _connectionString = configConnString.Replace("Pooling=False;", ""); }
            else
            {
                string? envPath = Environment.GetEnvironmentVariable("DB_PATH");
                if (!string.IsNullOrEmpty(envPath)) { _connectionString = $"Data Source={envPath};Default Timeout=30"; }
                else
                {
                    string appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "LichCongTac");
                    _connectionString = $"Data Source={Path.Combine(appData, "documents.db")};Default Timeout=30";
                }
            }
        }

        public async Task<List<Department>> GetDepartmentsAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<Department>? cachedList) && cachedList != null)
            {
                return cachedList;
            }

            var list = new List<Department>();
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            
            // Đảm bảo bật WAL mode để tối ưu đọc/ghi đồng thời
            using (var walCmd = new SqliteCommand("PRAGMA journal_mode=WAL;", connection))
            {
                await walCmd.ExecuteNonQueryAsync();
            }

            string sql = "SELECT Id, Name, Description, IsActive FROM Departments";
            using var cmd = new SqliteCommand(sql, connection);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new Department
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Name = reader["Name"].ToString() ?? "",
                    Description = reader["Description"]?.ToString() ?? "",
                    IsActive = reader["IsActive"] != DBNull.Value ? Convert.ToInt32(reader["IsActive"]) == 1 : true
                });
            }
            
            _cache.Set(CacheKey, list, TimeSpan.FromMinutes(30)); // Cache trong 30 phút
            return list;
        }

        public async Task<int> InsertDepartmentAsync(Department d)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            using var cmd = new SqliteCommand("INSERT INTO Departments (Name, Description, IsActive) VALUES (@n, @d, @ia); SELECT last_insert_rowid();", connection);
            cmd.Parameters.AddWithValue("@n", d.Name);
            cmd.Parameters.AddWithValue("@d", d.Description);
            cmd.Parameters.AddWithValue("@ia", d.IsActive ? 1 : 0);
            int id = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            _cache.Remove(CacheKey); // Invalidate cache
            return id;
        }

        public async Task UpdateDepartmentAsync(Department d)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            using var cmd = new SqliteCommand("UPDATE Departments SET Name = @n, Description = @d, IsActive = @ia WHERE Id = @id", connection);
            cmd.Parameters.AddWithValue("@n", d.Name);
            cmd.Parameters.AddWithValue("@d", d.Description);
            cmd.Parameters.AddWithValue("@ia", d.IsActive ? 1 : 0);
            cmd.Parameters.AddWithValue("@id", d.Id);
            await cmd.ExecuteNonQueryAsync();
            _cache.Remove(CacheKey); // Invalidate cache
        }

        public async Task DeleteDepartmentAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            using var cmd = new SqliteCommand("UPDATE Departments SET IsActive = 0 WHERE Id = @id", connection);
            cmd.Parameters.AddWithValue("@id", id);
            await cmd.ExecuteNonQueryAsync();
            _cache.Remove(CacheKey); // Invalidate cache
        }
    }
}
