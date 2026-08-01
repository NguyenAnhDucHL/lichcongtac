# Tài Liệu Hệ Thống Phần mềm Lịch Công Tác (Dành cho AI & Developer)

Tài liệu này là "Bộ não" của hệ thống, chứa các thông tin thiết yếu nhất về kiến trúc, cơ sở dữ liệu, API và các luật nghiệp vụ (Business Rules). **AI phải đọc tài liệu này trước khi chỉnh sửa code để tránh phá vỡ logic cũ.**

---

## 1. Kiến Trúc Hệ Thống (Architecture)
- **Mô hình**: Client-Server phân tách hoàn toàn (Frontend build ra static file nạp vào wwwroot).
- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui. Call API bằng `fetch`.
- **Backend**: ASP.NET Core 10.0 (MVC APIs), C#.
- **Database**: SQLite (Sử dụng ADO.NET/SqliteDataReader thủ công, **KHÔNG dùng Entity Framework**). File DB nằm tại `/app/data/documents.db` (trong Docker) hoặc `data_dump/documents.db` (trên máy Host).
- **Bảo mật**: JWT Token, BCrypt/PBKDF2 (Mật khẩu), Nginx Reverse Proxy.

---

## 2. Database Schema (Bảng Dữ Liệu)
*(Vì dùng ADO.NET thô, cấu trúc bảng cực kỳ quan trọng)*

### Bảng Hệ thống & Người dùng
- **`Users`**: `Id`, `Username`, `PasswordHash`, `FullName`, `Email`, `PhoneNumber`, `Role` (Admin, LanhDao, VanThu, CanBo), `DepartmentId`. (Hỗ trợ cột Identity: `SecurityStamp`, `NormalizedUserName`, `LockoutEnabled`, v.v.)
- **`Departments`**: Quản lý phòng ban (`Id`, `Name`, `Code`, `ParentId`).
- **`AppSettings`**: Cấu hình hệ thống.
- **`AuditLogs` & `LoginAuditLog`**: Nhật ký hoạt động và nhật ký đăng nhập.

### Bảng Nghiệp vụ (Lịch Công Tác)
- **`Schedules`**: `Id`, `Title`, `Date`, `StartTime`, `Location`, `Content`, `Presider`, `PreparingUnit`, `Participants`, `IsPublic`, `CreatedBy`. Dùng để lưu trữ các lịch tuần, sự kiện.

---

## 3. Các API Endpoints Chính

Tất cả API có prefix `/api/`. Đa số yêu cầu Header `Authorization: Bearer <token>`.

### Auth (`AuthController`)
- `POST /api/auth/login`: `{ username, password }` -> Trả về JWT Token. (Rate limit: 5 lần/phút).
- `POST /api/auth/change-password`: `{ oldPassword, newPassword }`.
- `GET /api/auth/me`: Lấy thông tin user hiện tại.

### Users (`UsersController`)
- `GET /api/users`: Lấy ds user (Bảo mật: Đã filter bỏ PasswordHash).
- `POST /api/users` / `PUT /api/users/{id}`: Thêm/Sửa user.

---

## 4. Các Business Rules Trọng Yếu (Nghiệp vụ cốt lõi)

### 4.1. Quản lý Mật khẩu & Đăng nhập
- Backend hỗ trợ 2 loại hash: Legacy Plain-text và Identity BCrypt/PBKDF2.
- Nếu User đăng nhập bằng Plain-text đúng -> Hệ thống **tự động nâng cấp (rehash)** sang BCrypt.
- Có cơ chế Rate Limiting (chặn IP 60s nếu spam login 5 lần).
- Có cơ chế Lockout của Identity (Khóa tài khoản 15 phút nếu sai mật khẩu 5 lần).

### 4.2. Quản lý Phiên bản Frontend
- Việc render các view công cộng (`/campha` hoặc `/`) hoặc Admin login (`/manager/login`) được kiểm soát trực tiếp qua Client-Side Routing (hoặc render có điều kiện trong `main.jsx`).

---

## 5. Kế Hoạch Triển Khai Tính Năng Mới
Hệ thống hiện tại đã dọn dẹp xong các tính năng Quản lý công văn cũ và đã thiết lập xong cấu trúc CSDL mới.
Các module chuẩn bị phát triển:
- API Thêm/Sửa/Xóa lịch trong `SchedulesController`.
- Giao diện Admin quản lý Lịch (`Admin/Schedules.jsx`).
- Giao diện Công khai hiển thị Lịch (`WorkSchedule.jsx` đọc từ DB thật).

- **Quản lý Thông báo**: CRUD (Thêm, Sửa, Xóa, Bật/Tắt hiển thị) sử dụng Rich Text Editor (Jodit). Thông báo được hiển thị bên dưới Lịch Công tác hàng ngày trên trang chủ, ngăn cách bởi một đường kẻ viền.
