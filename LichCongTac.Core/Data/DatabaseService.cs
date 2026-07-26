using Microsoft.Data.Sqlite;
using LichCongTac.Models;

namespace LichCongTac.Data
{
    public static class DatabaseService
    {
        private static string _connectionString = "";

        public static void Initialize()
        {
            string dbPath;
            string? envPath = Environment.GetEnvironmentVariable("DB_PATH");

            if (!string.IsNullOrEmpty(envPath))
            {
                dbPath = envPath;
                string? dir = Path.GetDirectoryName(dbPath);
                if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
            }
            else
            {
                string appData = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "LichCongTac"
                );
                Directory.CreateDirectory(appData);
                dbPath = Path.Combine(appData, "documents.db");
            }
            _connectionString = $"Data Source={dbPath};Pooling=True;Default Timeout=30;Cache=Shared";

            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            // Sử dụng DELETE thay vì WAL vì WAL bị lỗi "disk I/O error" trên Docker Desktop Windows
            try 
            {
                using var walCmd = new SqliteCommand("PRAGMA journal_mode=DELETE; PRAGMA synchronous=NORMAL; PRAGMA busy_timeout=5000;", connection);
                walCmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DB Warning] Could not set DELETE mode: {ex.Message}");
            }

            string createSchedulesTable = @"
                CREATE TABLE IF NOT EXISTS Schedules (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Title TEXT NOT NULL,
                    Date TEXT NOT NULL,
                    StartTime TEXT,
                    Location TEXT,
                    Content TEXT,
                    Presider TEXT,
                    PreparingUnit TEXT,
                    Participants TEXT,
                    IsPublic INTEGER DEFAULT 1,
                    CreatedAt TEXT DEFAULT (datetime('now')),
                    CreatedBy INTEGER,
                    UpdatedAt TEXT
                )";

            string createUsersTable = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Username TEXT UNIQUE,
                    PasswordHash TEXT,
                    FullName TEXT,
                    Email TEXT,
                    PhoneNumber TEXT,
                    Role TEXT,
                    DepartmentId INTEGER,
                    CreatedAt TEXT,
                    SessionId TEXT,
                    SecurityStamp TEXT DEFAULT '',
                    AccessFailedCount INTEGER DEFAULT 0,
                    LockoutEnd TEXT
                )";

            string createDepartmentsTable = @"
                CREATE TABLE IF NOT EXISTS Departments (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT,
                    Description TEXT,
                    IsActive INTEGER DEFAULT 1
                )";



            string createSettingsTable = @"
                CREATE TABLE IF NOT EXISTS AppSettings (
                    [Key] TEXT PRIMARY KEY,
                    [Value] TEXT
                )";

            string createAuditLogsTable = @"
                CREATE TABLE IF NOT EXISTS AuditLogs (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    UserId INTEGER,
                    Action TEXT,
                    Timestamp TEXT,
                    IpAddress TEXT,
                    UserAgent TEXT,
                    IsSuccess INTEGER DEFAULT 1,
                    FailReason TEXT
                )";



            new SqliteCommand(createSchedulesTable, connection).ExecuteNonQuery();
            new SqliteCommand(createUsersTable, connection).ExecuteNonQuery();
            new SqliteCommand(createDepartmentsTable, connection).ExecuteNonQuery();
            new SqliteCommand(createSettingsTable, connection).ExecuteNonQuery();
            new SqliteCommand(createAuditLogsTable, connection).ExecuteNonQuery();
            // Insert default admin if not exists
            using var checkCmd = new SqliteCommand("SELECT COUNT(*) FROM Users WHERE Role='Admin'", connection);
            long adminCount = (long)checkCmd.ExecuteScalar();
            if (adminCount == 0)
            {
                // Mật khẩu mặc định: admin
                string hash = BCrypt.Net.BCrypt.HashPassword("admin");
                string sql = @"
                    INSERT INTO Users (Username, PasswordHash, FullName, Role, CreatedAt, SecurityStamp) 
                    VALUES ('admin', @hash, 'Administrator', 'Admin', datetime('now', 'localtime'), @stamp)";
                using var insertCmd = new SqliteCommand(sql, connection);
                insertCmd.Parameters.AddWithValue("@hash", hash);
                insertCmd.Parameters.AddWithValue("@stamp", Guid.NewGuid().ToString());
                insertCmd.ExecuteNonQuery();
            }
        }
    }
}
