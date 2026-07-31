using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using LichCongTac.Core.Data.Interfaces;
using LichCongTac.Models;
using System;
using System.Collections.Generic;

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
                _connectionString = $"Data Source={dbPath};Pooling=False;Default Timeout=30";
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

        public List<Department> GetAll()
        {
            var list = new List<Department>();
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            using var cmd = new SqliteCommand("SELECT * FROM Departments", connection);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(MapDepartment(reader));
            }
            return list;
        }

        public Department? GetById(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            using var cmd = new SqliteCommand("SELECT * FROM Departments WHERE Id = @id", connection);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = cmd.ExecuteReader();
            return reader.Read() ? MapDepartment(reader) : null;
        }

        public bool Create(Department department)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                connection.Open();
                using var cmd = new SqliteCommand(
                    "INSERT INTO Departments (Name, Description, IsActive) VALUES (@n, @d, @a)", connection);
                cmd.Parameters.AddWithValue("@n", department.Name);
                cmd.Parameters.AddWithValue("@d", department.Description ?? "");
                cmd.Parameters.AddWithValue("@a", department.IsActive ? 1 : 0);
                return cmd.ExecuteNonQuery() > 0;
            }
            catch { return false; }
        }

        public bool Update(Department department)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                connection.Open();
                using var cmd = new SqliteCommand(
                    "UPDATE Departments SET Name = @n, Description = @d, IsActive = @a WHERE Id = @id", connection);
                cmd.Parameters.AddWithValue("@n", department.Name);
                cmd.Parameters.AddWithValue("@d", department.Description ?? "");
                cmd.Parameters.AddWithValue("@a", department.IsActive ? 1 : 0);
                cmd.Parameters.AddWithValue("@id", department.Id);
                return cmd.ExecuteNonQuery() > 0;
            }
            catch { return false; }
        }

        public bool Delete(int id)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                connection.Open();
                using var cmd = new SqliteCommand("DELETE FROM Departments WHERE Id = @id", connection);
                cmd.Parameters.AddWithValue("@id", id);
                return cmd.ExecuteNonQuery() > 0;
            }
            catch { return false; }
        }
    }
}
