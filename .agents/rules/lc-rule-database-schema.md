---
trigger: always_on
description: "Quy tắc DB Schema — cấu trúc bảng SQLite và quy định thay đổi schema."
---

# LC-RULE-DATABASE-SCHEMA

Quy tắc này định nghĩa cấu trúc database chuẩn và quy trình thay đổi schema cho dự án LichCongTac.

> [!IMPORTANT]
> Dự án dùng **ADO.NET thủ công**. Không có migration framework. Mọi thay đổi schema phải được thực hiện thủ công qua SQL script và ghi vào `COMMIT_LOG.md`.

## 1. Schema Bảng Chuẩn

### `Users` — Người dùng
```sql
CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    FullName TEXT,
    Email TEXT,
    PhoneNumber TEXT,
    Role TEXT NOT NULL, -- 'Admin' | 'LanhDao' | 'VanThu' | 'CanBo'
    DepartmentId INTEGER,
    SecurityStamp TEXT,
    NormalizedUserName TEXT,
    LockoutEnabled INTEGER DEFAULT 1,
    AccessFailedCount INTEGER DEFAULT 0,
    LockoutEnd TEXT,      -- ISO 8601
    FailedLoginCount INTEGER DEFAULT 0,
    LockoutUntil TEXT     -- ISO 8601
);
```

### `Schedules` — Lịch công tác / Sự kiện
```sql
CREATE TABLE Schedules (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,           -- Tên lịch / Sự kiện
    Date TEXT NOT NULL,            -- Ngày diễn ra (ISO 8601: YYYY-MM-DD)
    StartTime TEXT,                -- Giờ bắt đầu (VD: "08:30")
    Location TEXT,                 -- Địa điểm
    Content TEXT,                  -- Nội dung chi tiết
    Presider TEXT,                 -- Chủ trì (Text hoặc ID)
    PreparingUnit TEXT,            -- Đơn vị chuẩn bị
    Participants TEXT,             -- Thành phần tham dự
    IsPublic INTEGER DEFAULT 1,    -- 1: Hiển thị ra trang chủ, 0: Nội bộ
    CreatedAt TEXT DEFAULT (datetime('now')),
    CreatedBy INTEGER,             -- UserId người tạo
    UpdatedAt TEXT
);
```

### Bảng phụ khác
- `Departments` — Phòng ban (`Id`, `Name`, `Code`, `ParentId`)
- `AuditLogs`, `LoginAuditLog` — Nhật ký hệ thống

## 2. Quy trình Thay đổi Schema

> [!WARNING]
> KHÔNG CÓ migration framework. Phải thực hiện thủ công theo đúng quy trình này.

**Khi cần thêm cột/bảng mới:**
1. Viết `ALTER TABLE` hoặc `CREATE TABLE` SQL.
2. Chạy trực tiếp trên DB dev: `sqlite3 data_dump/documents.db < migration.sql`.
3. Thêm SQL script vào file `fix_db.py` hoặc file migration riêng trong `data_dump/`.
4. Cập nhật `SYSTEM_FEATURES.md` phần Database Schema.
5. Ghi vào `COMMIT_LOG.md` với SQL script đầy đủ.

**Mapping JSON columns:**
```csharp
// ✅ Serialize/Deserialize thủ công
var assignedUserIds = JsonSerializer.Deserialize<List<int>>(
    reader.GetString(reader.GetOrdinal("AssignedUserIds")) ?? "[]"
);

var json = JsonSerializer.Serialize(userIds);
cmd.Parameters.AddWithValue("@AssignedUserIds", json);
```

## 3. Quy tắc Query Chuẩn

```csharp
// ✅ Pattern chuẩn cho Repository method
public async Task<Document?> GetByIdAsync(int id)
{
    using var conn = new SqliteConnection(_connectionString);
    await conn.OpenAsync();
    
    using var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT Id, SoVanBan, TenCongVan, TrichYeu, Status, Priority,
               ThoiHan, FilePath, DepartmentId, AssignedTo
        FROM Documents
        WHERE Id = @Id";
    cmd.Parameters.AddWithValue("@Id", id);
    
    using var reader = await cmd.ExecuteReaderAsync();
    if (!await reader.ReadAsync()) return null;
    
    return new Document
    {
        Id = reader.GetInt32(0),
        SoVanBan = reader.IsDBNull(1) ? null : reader.GetString(1),
        // ... map từng field
    };
}
```

---
**Status:** ACTIVE  
**Priority:** HIGH — Tham chiếu khi làm việc với DB