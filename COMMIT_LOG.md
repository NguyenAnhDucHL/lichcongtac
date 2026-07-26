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
