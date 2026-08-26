using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LichCongTac.Core.Data.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly string _connectionString;

        public DepartmentRepository(IConfiguration configuration)
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
                    string appData = System.IO.Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                        "LichCongTac"
                    );
                    dbPath = System.IO.Path.Combine(appData, "documents.db");
                }
                _connectionString = $"Data Source={dbPath};Pooling=True;Default Timeout=30";
            }
        }

        private static Department MapDepartment(SqliteDataReader reader)
        {
            return new Department
            {
                Id = Convert.ToInt32(reader["Id"]),
                Name = reader["Name"]?.ToString() ?? "",
                Description = reader["Description"]?.ToString() ?? "",
                IsActive = reader["IsActive"] != DBNull.Value && Convert.ToInt32(reader["IsActive"]) == 1
            };
        }

        public async Task<List<Department>> GetAllAsync()
        {
            var list = new List<Department>();
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            using var cmd = new SqliteCommand("SELECT Id, Name, Description, IsActive FROM Departments", connection);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapDepartment(reader));
            }
            return list;
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            using var cmd = new SqliteCommand("SELECT Id, Name, Description, IsActive FROM Departments WHERE Id = @id", connection);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapDepartment(reader) : null;
        }

        public async Task<bool> CreateAsync(Department department)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                await connection.OpenAsync();
                using var cmd = new SqliteCommand(
                    "INSERT INTO Departments (Name, Description, IsActive) VALUES (@n, @d, @a)", connection);
                cmd.Parameters.AddWithValue("@n", department.Name);
                cmd.Parameters.AddWithValue("@d", department.Description ?? "");
                cmd.Parameters.AddWithValue("@a", department.IsActive ? 1 : 0);
                return await cmd.ExecuteNonQueryAsync() > 0;
            }
            catch { return false; }
        }

        public async Task<bool> UpdateAsync(Department department)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                await connection.OpenAsync();
                using var cmd = new SqliteCommand(
                    "UPDATE Departments SET Name = @n, Description = @d, IsActive = @a WHERE Id = @id", connection);
                cmd.Parameters.AddWithValue("@n", department.Name);
                cmd.Parameters.AddWithValue("@d", department.Description ?? "");
                cmd.Parameters.AddWithValue("@a", department.IsActive ? 1 : 0);
                cmd.Parameters.AddWithValue("@id", department.Id);
                return await cmd.ExecuteNonQueryAsync() > 0;
            }
            catch { return false; }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                await connection.OpenAsync();
                using var cmd = new SqliteCommand("DELETE FROM Departments WHERE Id = @id", connection);
                cmd.Parameters.AddWithValue("@id", id);
                return await cmd.ExecuteNonQueryAsync() > 0;
            }
            catch { return false; }
        }
    }
}
