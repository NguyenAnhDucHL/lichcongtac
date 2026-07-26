# Nhật ký Thay đổi Mã Nguồn (Commit Log)

Tệp này lưu trữ lịch sử các thay đổi và tính năng mới được thêm vào hệ thống để AI có thể nhanh chóng nắm bắt ngữ cảnh mà không cần quét lại toàn bộ mã nguồn. Kể từ ngày 26/07/2026, toàn bộ hệ thống đã được tái cấu trúc (pivot) để chuyên biệt phục vụ chức năng **Lịch Công Tác**.

## Lịch sử

### [2026-07-26 11:30] Dọn dẹp dự án, loại bỏ hoàn toàn các chức năng Quản lý công văn và OCR cũ
- **Mô tả**: Dự án được yêu cầu tập trung vào nghiệp vụ Lịch Công Tác. Đã tiến hành xóa toàn bộ thư mục model AI nặng (`tessdata/`, `PaddleOCR/`), gỡ các dependencies về OCR, PDF trong `LichCongTac.Core.csproj`. Ở backend, xóa toàn bộ Models, Services, Repositories và Controllers thuộc các phân hệ không dùng tới (Document, Cabinet, Notification, Stats). Ở frontend, xóa toàn bộ các trang giao diện dư thừa (Dashboard, Documents, Cabinet, v.v.), chỉ giữ lại `WorkSchedule.jsx` và `AdminLogin.jsx`.
- **Tệp thay đổi**:
  - `tessdata/*`, `PaddleOCR/*` (Xóa)
  - `LichCongTac.Core/LichCongTac.Core.csproj` (Sửa đổi)
  - Các Controllers: `DocumentsController.cs`, `Cabinet/*`, v.v. (Xóa)
  - Các Repositories và Services cũ (Xóa)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
  - Hàng loạt các file `.jsx` trong `src/pages/`, `src/cabinet/`, `src/shell/` (Xóa)
- **Lệnh git commit**: `git commit -m "chore(cleanup): dọn dẹp mã nguồn, xóa bỏ các model AI, controller, giao diện của hệ thống cũ"`

### [2026-07-26 12:45] Điều chỉnh hạ tầng và cập nhật giao diện WorkSchedule
- **Mô tả**: Thay đổi cổng chạy ứng dụng sang 59607, điều chỉnh đường dẫn tài nguyên tĩnh của Vite. Cập nhật giao diện trang chủ `WorkSchedule.jsx` bao gồm thêm banner, khôi phục menu hệ thống và loại bỏ các nội dung giữ chỗ không cần thiết.
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi: Đổi port ra 59607)
  - `LichCongTac.Api/ClientApp/vite.config.js` (Sửa đổi: Đổi `publicDir` thành `public`)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi: Thêm banner, khôi phục menu, xóa text giữ chỗ)
- **Lệnh git commit**: `git commit -m "chore(infra): đổi port sang 59607, sửa cấu hình vite publicDir và gắn banner Lịch Công Tác"`

### [2026-07-26 13:25] Dọn dẹp component cũ và thêm tính năng ẩn/hiện mật khẩu
- **Mô tả**: Xóa các file component không còn sử dụng thuộc module Quản lý văn bản cũ. Cập nhật giao diện trang Đăng nhập Quản trị: bo góc input, thêm viền và tính năng bật/tắt hiển thị mật khẩu bằng icon mắt (dùng `lucide-react`).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/DocumentRoutingTree.jsx` (Xóa)
  - `LichCongTac.Api/ClientApp/src/components/ForwardDocumentModal.jsx` (Xóa)
  - `LichCongTac.Api/ClientApp/src/pages/AdminLogin.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(auth): xóa component cũ, thêm tính năng ẩn/hiện mật khẩu AdminLogin"`

### [2026-07-26 13:35] Tái cấu trúc Database - Chuyển sang Lịch Công Tác
- **Mô tả**: Chạy migration bằng lệnh SQL để DROP toàn bộ các bảng thuộc hệ thống Quản lý văn bản cũ (`Documents`, `DocumentRoutings`, `Comments`, `CommentReactions`, `Labels`, `Notifications`, `PushSubscriptions`, `AutoRules`). Đồng thời CREATE bảng `Schedules` mới chứa các trường chuyên biệt cho Lịch Công Tác (Tên sự kiện, Thời gian, Địa điểm, Người chủ trì, Đơn vị chuẩn bị). Cập nhật `lc-rule-database-schema.md` và `SYSTEM_FEATURES.md`.
- **Tệp thay đổi**:
  - `data_dump/documents.db` (Sửa đổi cấu trúc qua SQL)
  - `LichCongTac.Core/Data/DatabaseService.cs` (Xóa bỏ logic tự động tạo lại các bảng cũ khi khởi động hệ thống)
  - `.agents/rules/lc-rule-database-schema.md` (Sửa đổi)
  - `SYSTEM_FEATURES.md` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "refactor(db): xóa bỏ bảng nghiệp vụ cũ, khởi tạo bảng Schedules mới cho Lịch Công Tác"`

### [2026-07-26 13:48] Viết API thêm/sửa/xóa Lịch Công Tác (Backend)
- **Mô tả**: Thiết lập toàn bộ layer Backend cho nghiệp vụ Lịch Công Tác bao gồm: Model (chứa DTOs), Interface, Repository thực thi truy vấn ADO.NET thô và Controller cung cấp các endpoint REST API.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Models/ScheduleModels.cs` (Mới)
  - `LichCongTac.Core/Data/Interfaces/IScheduleRepository.cs` (Mới)
  - `LichCongTac.Core/Data/Repositories/ScheduleRepository.cs` (Mới)
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Mới)
  - `LichCongTac.Api/Program.cs` (Sửa đổi: Đăng ký DI cho IScheduleRepository)
- **Lệnh git commit**: `git commit -m "feat(api): viết các REST endpoint cho Lịch công tác sử dụng ADO.NET"`
