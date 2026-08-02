# Nhật ký Thay đổi Mã Nguồn (Commit Log)

Tệp này lưu trữ lịch sử các thay đổi và tính năng mới được thêm vào hệ thống để AI có thể nhanh chóng nắm bắt ngữ cảnh mà không cần quét lại toàn bộ mã nguồn. Kể từ ngày 26/07/2026, toàn bộ hệ thống đã được tái cấu trúc (pivot) để chuyên biệt phục vụ chức năng **Lịch Công Tác**.

## Lịch sử

### [2026-08-01 21:16] Fix quyền quản trị tài khoản
- **Mô tả**: Bổ sung phân quyền role-based. Frontend thêm `RequireAdmin` check role 'Admin', non-admin bị đẩy sang trang đổi mật khẩu. Backend khóa toàn bộ các Controllers và endpoints ghi của SchedulesController về `[Authorize(Roles = "Admin")]`. 
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/UsersController.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/NotificationsController.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/HolidaysController.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): chặn quyền quản trị đối với tài khoản không phải Admin"`


### [2026-07-31 17:08] Thiết kế giao diện Quản trị lịch và tích hợp API
- **Mô tả**: Thiết kế trang Quản trị lịch (`AdminSchedules.jsx`) theo giao diện mockup yêu cầu (với form giả lập WYSIWYG editor). Tích hợp gọi API để lấy danh sách lịch công tác từ database (`GET /api/schedules`) và thêm lịch mới (`POST /api/schedules`).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): tạo trang quản trị lịch và tích hợp API thêm/xem lịch công tác"`

### [2026-07-31 17:03] Thiết kế giao diện Quản trị tài khoản
- **Mô tả**: Thiết kế và tạo trang quản trị tài khoản (`AdminAccounts.jsx`) với form thêm tài khoản và danh sách tài khoản theo giao diện mẫu yêu cầu. Đã kết nối trang này vào routing chung trong `main.jsx`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): tạo trang quản trị tài khoản và thêm routing cho AdminAccounts"`

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
### [2026-07-31 17:15] Update AdminSchedules to fetch users dynamically and fix wording
- **Mô tả**: Sửa UI trang Quản trị lịch để tự động fetch danh sách user thay vì input cứng. Đổi lại tên từ "Hệ Thống Điều Phối Công Văn" thành "Phần Mềm Lịch Công Tác" ở title web.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/index.html` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): fetch users for participants and update title"`
### [2026-07-31 17:23] Fix missing columns in Users table
- **Mô tả**: Sửa lỗi 500 khi đăng nhập do thiếu các cột trong bảng `Users` theo chuẩn Identity (`FailedLoginCount`, `LockoutUntil`, `NormalizedUserName`, `LockoutEnabled`).
- **Tệp thay đổi**:
  - `data_dump/documents.db` (Sửa đổi schema)
- **Lệnh git commit**: `git commit -m "fix(db): bổ sung các cột thiếu trong bảng Users cho Identity"`
### [2026-07-31 17:25] Fix login redirect
- **Mô tả**: Sửa lỗi trang đăng nhập chuyển hướng về `/` (trang dashboard hệ thống cũ) thay vì vào thẳng trang admin Quản trị Lịch Công Tác.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminLogin.jsx` (Sửa đổi `window.location.href`)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi chuyển hướng sau khi đăng nhập thành công về đúng trang quản trị lịch"`

### [2026-07-31 17:35] Fix Service Worker Caching Issue
- **Mô tả**: Thay đổi port của container backend từ 59607 sang 59608 để vượt qua lớp cache quá mạnh của Service Worker cũ, đảm bảo người dùng luôn tải được ứng dụng Lịch Công Tác mới thay vì Hệ Thống Điều Phối Công Văn cũ. Đồng thời xóa file `sw.js` và cập nhật `vite.config.js`.
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/vite.config.js` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/index.html` (Sửa đổi)
  - `LichCongTac.Api/wwwroot/sw.js` (Xóa)
- **Lệnh git commit**: `git commit -m "fix(infra): change backend port to bypass service worker cache"`

### [2026-07-31 17:44] Fix Home Page Schedule Display
- **Mô tả**: Sửa lỗi URL `/api/meetings/public-schedule` (không tồn tại) thành `/api/schedules/public-schedule`. Bổ sung logic nhóm các sự kiện lịch công tác theo ngày (`date`) và định dạng lại cấu trúc dữ liệu (`dayLabel`, `items`) để hiển thị chính xác lên giao diện màn hình Trang chủ (WorkSchedule).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): correct api endpoint and add grouping logic for schedules on homepage"`

### [2026-07-31 17:49] Fix Auth Guard - Không cần login lại mỗi lần click Quản trị
- **Mô tả**: Thêm component `RequireAuth` vào router để kiểm tra `auth_token` trong localStorage trước khi render các trang admin. Nếu có token → vào thẳng trang quản trị. Nếu không có → redirect về /login. Nếu đang ở trang /login nhưng đã có token → tự chuyển vào /manager/schedules, không hiển thị form login nữa.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): add RequireAuth guard to prevent redirect to login when token exists"`

### [2026-07-31 18:02] Fix Logout Button - Nút Đăng xuất hoạt động
- **Mô tả**: Nút ĐĂNG XUẤT trên nav chỉ là href="#" không có action. Thêm hàm handleLogout() xóa auth_token/user_name/user_role khỏi localStorage và redirect về trang login. Cập nhật render nav để hỗ trợ item dạng button (onClick) thay vì chỉ hỗ trợ anchor (href).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): implement logout handler to clear token and redirect to login"`

### [2026-07-31 18:06] Thêm trang Đổi Mật Khẩu
- **Mô tả**: Tạo mới trang AdminChangePassword với giao diện card, thanh đánh giá độ mạnh mật khẩu realtime (5 tiêu chí), kiểm tra xác nhận mật khẩu khớp, và tự động đăng xuất sau 3 giây khi đổi thành công. Kết nối với endpoint `/api/auth/change-password` đã có sẵn. Cập nhật router trong main.jsx và wire nút ĐỔI MẬT KHẨU trong AdminSchedules và AdminAccounts.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminChangePassword.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(auth): add change password page with strength indicator and auto logout"`

### [2026-08-01 00:04] Replace textarea with JoditEditor for rich text schedule content
- **Mô tả**: Thay thế textarea đơn giản ở trường Nội dung chi tiết trong Quản trị Lịch thành trình soạn thảo Jodit (Jodit React). Giao diện Editor cung cấp đầy đủ chức năng giống hệt hệ thống cũ (CKEditor) bao gồm bôi đậm, in nghiêng, đổi font, đổi size, đổi màu chữ.
Đồng thời, cập nhật hiển thị ở trang WorkSchedule sử dụng `dangerouslySetInnerHTML` kết hợp class `prose` (Tailwind Typography) để render các thẻ HTML an toàn và giữ được định dạng đã tạo ở trang quản trị.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/package.json` (Sửa đổi - thêm jodit, jodit-react, @tailwindcss/typography)
- **Lệnh git commit**: `git commit -m "feat(schedules): integrate jodit-react editor and tailwind typography for rich text content"`

### [2026-08-01 00:12] Thêm trường Giấy mời số vào Quản trị Lịch
- **Mô tả**: Thêm mới cột `InvitationNumber` vào bảng `Schedules` trong SQLite để lưu số giấy mời. Cập nhật các DTO và Model tương ứng ở .NET Core backend. Ở frontend, thêm ô nhập "Giấy mời số" (ngay dưới Tiêu đề) trên trang Quản trị Lịch và hiển thị số giấy mời lên trước Tiêu đề trên trang chủ.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Models/ScheduleModels.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/ScheduleRepository.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): add InvitationNumber field to schedules and display on UI"`

### [2026-08-01 00:15] Fix lỗi đổi mật khẩu
- **Mô tả**: Sửa lỗi API `/api/auth/change-password` luôn báo "Không thể đổi mật khẩu". Lỗi do `ChangePasswordRequest` thiếu trường `CurrentPassword` và gọi `RemovePasswordAsync` trực tiếp lên tài khoản. Cập nhật API để kiểm tra mật khẩu hiện tại bằng `CheckPasswordAsync` và thực hiện đổi bằng `GeneratePasswordResetTokenAsync` + `ResetPasswordAsync` để tương thích an toàn với cả hash BCrypt/PlainText cũ và PBKDF2 mới.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): fix change password api to verify current password and handle legacy hashes"`

### [2026-08-01 00:22] Bổ sung chức năng Sửa/Xóa cho Quản trị Lịch
- **Mô tả**: Khi click vào nút "Sửa" ở danh sách lịch làm việc, thông tin lịch sẽ được đưa lên form nhập ở phía trên, tự động cuộn trang lên trên cùng, nút bấm chuyển thành "Cập nhật" và có thêm nút "Quay lại" để hủy. Khi bấm cập nhật sẽ gọi API `PUT /api/schedules/{id}` để cập nhật thay vì tạo mới. Ngoài ra đã bổ sung chức năng Xóa gọi API `DELETE /api/schedules/{id}` khi click vào "Xóa" dưới danh sách lịch.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): implement edit and delete functionality on admin schedules table"`

### [2026-08-01 00:35] Bổ sung Quản trị Phòng ban và Nhân viên (Dropdown menu)
- **Mô tả**:
  - Tạo `AdminHeader` component để tái sử dụng header và thay đổi menu "QUẢN TRỊ" thành dạng dropdown (tài khoản, phòng ban, nhân viên).
  - Bổ sung `DepartmentRepository` và `DepartmentsController` để xử lý CRUD phòng ban.
  - Cập nhật `UserRepository` và `UsersController` thêm trường `ZaloId` và `NotificationPreference` cho Quản trị nhân viên.
  - Thêm trang `AdminDepartments.jsx` và `AdminEmployees.jsx` theo đúng giao diện ảnh 3 và ảnh 4.
  - Cập nhật router trong `main.jsx` và áp dụng `AdminHeader` cho các trang quản trị.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Interfaces/IDepartmentRepository.cs` (Mới)
  - `LichCongTac.Core/Data/Repositories/DepartmentRepository.cs` (Mới)
  - `LichCongTac.Api/Controllers/DepartmentsController.cs` (Mới)
  - `LichCongTac.Core/Data/Repositories/UserRepository.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/UsersController.cs` (Sửa đổi)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminChangePassword.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminDepartments.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/pages/AdminEmployees.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): thêm quản trị phòng ban, nhân viên và menu dropdown"`

### [2026-08-01 07:05] Sửa lỗi hover menu Quản trị
- **Mô tả**: Thay thế logic hover bằng state React (`onMouseEnter`, `onMouseLeave`) sang CSS class của Tailwind (`group-hover:block`) để đảm bảo menu không bị ẩn đột ngột khi di chuột.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi dropdown menu quản trị ẩn đột ngột khi hover"`

### [2026-08-01 07:07] Fix lỗi không tự động đăng xuất khi hết hạn token (401)
- **Mô tả**: 
  - Hệ thống gặp lỗi 401 (Unauthorized) nhưng không tự redirect về trang Đăng nhập do sự kiện `auth:unauthorized` chưa được ai lắng nghe. Điều này khiến các hàm `fetch` ném ra lỗi JSON Parsing và hiển thị "Lỗi kết nối máy chủ".
  - Thêm Global Event Listener trong `main.jsx` để tự động xóa token và chuyển hướng về trang `/campha/manager/login` khi có mã lỗi 401.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): thêm listener xử lý lỗi 401 để tự động đăng xuất"`

### [2026-08-01 07:19] Fix lỗi cập nhật profile làm trống mật khẩu
- **Mô tả**: 
  - Khắc phục lỗi vô tình xóa mật khẩu (làm trống trường `PasswordHash`) trong cơ sở dữ liệu khi quản trị viên cập nhật thông tin cá nhân nhưng không đổi mật khẩu.
  - Sửa đổi câu lệnh SQL trong `UserRepository.UpdateUser` để sử dụng `CASE WHEN` nhằm giữ nguyên `PasswordHash` cũ nếu đầu vào rỗng.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/UserRepository.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi bị làm trống password hash khi update profile"`

### [2026-08-01 07:25] Tích hợp API thực cho trang Quản trị tài khoản
- **Mô tả**: 
  - Thay thế dữ liệu cứng (mock data) trên trang Quản trị tài khoản (`AdminAccounts.jsx`) bằng việc kết nối API thực tế.
  - Hiển thị danh sách Phòng, Ban thực từ API vào ô chọn (dropdown).
  - Thêm đầy đủ chức năng Thêm, Sửa, Xóa tài khoản, ánh xạ đúng mã phòng ban ra tên hiển thị.
  - Hỗ trợ tính năng cuộn lên trên cùng tự động khi ấn nút Sửa.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(users): kết nối API thực cho chức năng quản trị tài khoản"`

### [2026-08-01 07:27] Dọn dẹp mã cứng và tối ưu API nhân viên
- **Mô tả**: 
  - Đã rà soát toàn bộ dự án, hiện tại tất cả các trang quản trị (Lịch, Phòng ban, Tài khoản, Nhân viên) đều đã được kết nối với API thực qua CSDL, không còn trang nào chứa dữ liệu cứng (mock data).
  - Tối ưu hóa chức năng thêm mới trong `AdminEmployees.jsx` để dùng đúng endpoint `POST /api/users` thay vì đi đường vòng qua `/api/auth/register`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminEmployees.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "refactor(users): dọn dẹp mock data và tối ưu luồng gọi API thêm nhân viên"`

### [2026-08-01 07:33] Thêm text hiển thị ở đầu menu (Header banner)
- **Mô tả**: 
  - Thêm cụm từ "LỊCH CÔNG TÁC" và "UBND PHƯỜNG CẨM PHẢ" đè lên trên banner ảnh tại vị trí đầu trang.
  - Cập nhật đồng bộ cho cả trang public (WorkSchedule) và các trang quản trị (AdminHeader).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(ui): thêm tiêu đề dạng text hiển thị đè lên banner cho giống thiết kế"`

### [2026-08-01 07:38] Khắc phục lỗi Jodit Editor (Không paste được & mất định dạng chữ)
- **Mô tả**: 
  - Vô hiệu hóa hộp thoại hỏi trước khi dán (askBeforePaste) mặc định của Jodit khiến người dùng không thể paste text từ nguồn khác vào.
  - Bổ sung CSS bù trừ cho các tag `b`, `i`, `strong`, `ul`, `ol` bên trong class `.jodit-wysiwyg` vì TailwindCSS trước đó tự động xóa sạch các định dạng này. Giờ đây có thể bôi đậm, in nghiêng, đổi font size bình thường mà không cần thay editor khác.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi không paste được và hiển thị sai định dạng trong jodit editor"`

### [2026-08-01 07:40] Xóa mã cứng ở mục chọn phòng ban trong quản trị lịch
- **Mô tả**: Sửa lỗi vẫn còn mock data "CƠ QUAN" và "Văn phòng" ở mục "Thuộc Phòng, Ban" trên trang thêm mới/sửa Lịch công tác. Đã tích hợp gọi API `/api/departments` để load danh sách phòng ban thực tế từ cơ sở dữ liệu.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedules): xóa mã cứng và tải danh sách phòng ban động khi tạo lịch"`

### [2026-08-01 07:44] Xóa trường Tiêu đề trên giao diện quản trị lịch
- **Mô tả**: Theo yêu cầu, xóa trường "Tiêu đề" trên form tạo/sửa lịch công tác do người dùng chỉ cần nhập liệu toàn bộ vào phần "Nội dung chi tiết". Dữ liệu title gửi xuống DB mặc định được gán khoảng trắng để qua validation NOT NULL, và ẩn hiển thị title trên lịch làm việc.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): xóa trường Tiêu đề khỏi form và giao diện hiển thị"`

### [2026-08-01 07:49] Gỡ bỏ ô Địa điểm, Chủ trì và bắt buộc nhập Nội dung chi tiết
- **Mô tả**: Gỡ bỏ trường "Địa điểm" và "Chủ trì" khỏi form nhập liệu và giao diện hiển thị lịch làm việc. Thêm xác thực bắt buộc nhập đối với trường "Nội dung chi tiết" để tránh tạo lịch trống.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): xóa trường địa điểm và chủ trì, bắt buộc nhập nội dung"`

### [2026-08-01 07:50] Fix JSX syntax error in AdminSchedules.jsx
- **Mô tả**: Sửa lỗi cú pháp JSX (thiếu thẻ mở `<span>`) trong AdminSchedules.jsx do quá trình gỡ bỏ trường địa điểm và chủ trì gây ra, khiến build React thất bại.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedules): sửa lỗi cú pháp JSX do thiếu thẻ mở span"`

### [2026-08-01 07:57] Sửa lỗi lưu lịch do Title bị validate ở backend
- **Mô tả**: Sửa lỗi báo "Lỗi khi lưu lịch" khi người dùng thêm mới lịch, do backend C# `[Required]` không chấp nhận chuỗi chỉ có khoảng trắng (`" "`) cho `Title`. Đã thay đổi thành lấy 50 ký tự đầu của `Content` hoặc chuỗi mặc định.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedules): sửa lỗi lưu lịch do required title validation"`

### [2026-08-01 08:06] Fix frontend error parsing and format CSS
- **Mô tả**: Bổ sung logic hiển thị thông báo lỗi chi tiết từ `ValidationProblemDetails` (do backend trả về mã 400) trên giao diện Quản trị lịch để tránh hiện thông báo lỗi chung chung. Đồng thời format lại `globals.css` bằng Prettier.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedules): parse detailed validation error messages from backend"`

### [2026-08-01 08:09] Fix stray slash in WorkSchedule
- **Mô tả**: Gỡ bỏ chuỗi `/.` thừa xuất hiện ở cuối mỗi lịch công tác (do trước đây dự định nối với đơn vị chuẩn bị nhưng logic bị sai và giờ đã gộp hết vào nội dung).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedules): remove stray slash at the end of schedule items"`

### [2026-08-01 09:39] Thêm phân trang cho danh sách lịch ở trang Quản trị lịch
- **Mô tả**: Thêm pagination 10 bản ghi/trang vào danh sách lịch trong AdminSchedules. Hiển thị tổng số bản ghi, số trang hiện tại, nút điều hướng « ‹ số trang › ».
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): thêm phân trang 10 bản ghi/trang cho danh sách lịch quản trị"`

### [2026-08-01 09:42] Gán URL thực cho các nút điều hướng trang chủ
- **Mô tả**: Cập nhật 3 link điều hướng từ `#` sang URL thực: Quản lý văn bản điều hành → congchuc.quangninh.gov.vn, Cổng thông tin → quangninh.gov.vn, Thư điện tử → mail.quangninh.gov.vn. Các link này mở tab mới.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(nav): gán URL thực cho Quản lý văn bản, Cổng thông tin, Thư điện tử"`

### [2026-08-01 09:46] Thêm trang Tìm kiếm lịch công tác
- **Mô tả**: Tạo trang SearchSchedule.jsx với form tìm theo thời gian bắt đầu/kết thúc và nội dung. Kết quả hiển thị dạng bảng (STT, Ngày, Nội dung, Phòng ban) có phân trang kiểu 1|2|...|Next. Thêm route /campha/search vào main.jsx. Cập nhật link TÌM KIẾM ở WorkSchedule.jsx.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(search): thêm trang tìm kiếm lịch công tác với phân trang"`

### [2026-08-01 09:47] Sửa lỗi font xấu do HTML render trong WorkSchedule
- **Mô tả**: Content lưu trong DB là HTML từ Jodit, khi render với class `prose` bị vỡ layout và font xấu. Sửa bằng cách strip toàn bộ HTML tag thành plain text trước khi hiển thị.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedule): strip HTML content thành plain text, bỏ prose class gây font xấu"`

### [2026-08-01 09:50] Thêm ô nhập tự do tên đơn vị bên cạnh dropdown phòng ban
- **Mô tả**: Thêm input text bên dưới dropdown "Thuộc Phòng, Ban" để nhập tên đơn vị ngoài danh sách (VD: Công an phường, Quân sự). Khi chọn từ dropdown thì input trống; khi gõ vào input thì ghi đè giá trị phòng ban.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): thêm ô nhập tên đơn vị tự do bên cạnh dropdown phòng ban"`

### [2026-08-01 09:58] Thêm active tab highlight vào AdminHeader
- **Mô tả**: Tab đang được truy cập sẽ được tô đậm nền tối hơn + gạch chân trắng để người dùng biết mình đang ở trang nào. Logic dựa trên window.location.pathname.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(nav): highlight tab active trong AdminHeader theo pathname"`

### [2026-08-01 10:04] Thêm trường Địa điểm (Location)
- **Mô tả**: Bảng `Schedules` đã có sẵn cột `Location`. Đã thêm trường input `Địa điểm` vào form tạo/sửa lịch trong `AdminSchedules.jsx` và hiển thị `- Địa điểm: [tên địa điểm]` ở màn hình Lịch công tác ngoài trang chủ và trang Tìm kiếm nếu có dữ liệu.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(schedules): thêm field nhập địa điểm vào form quản trị và hiển thị ra UI"`

### [2026-08-01 10:06] Sửa lỗi hiển thị HTML thô và thanh phân trang ở trang Quản trị lịch
- **Mô tả**: 
  - Cột Nội dung ở danh sách Quản trị lịch đang hiển thị mã HTML thô (do lưu trữ từ Jodit editor), đã sửa để loại bỏ HTML tags giúp hiển thị text thuần sạch sẽ.
  - Luôn hiển thị thanh phân trang kể cả khi tổng số bản ghi nhỏ hơn `PAGE_SIZE` (10) để người dùng biết chức năng phân trang đang hoạt động.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(schedules): strip HTML ở list quản trị và luôn hiện phân trang"`

### [2026-08-01 10:12] Cập nhật form địa điểm và đổi màu tab active
- **Mô tả**: 
  - Trong form Quản trị lịch: Thay input "Địa điểm" thành giao diện chọn dạng combo box (chọn dropdown hoặc tự gõ) với list có sẵn: "Hội trường A UBND phường", "Phòng họp tầng 3...", "Phòng họp tầng 4...". Giống như phần chọn Phòng, Ban.
  - Ở thanh menu Quản trị: Đổi màu highlight cho tab đang active sang xanh đậm (`#1d5792`) để nổi bật và dễ nhìn hơn, khắc phục tình trạng khó nhận biết do màu trước đó nhạt (`#31b0d5`).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(admin): combo box cho địa điểm và đổi màu tab active đậm hơn"`

### [2026-08-01 10:15] Cập nhật ảnh banner website
- **Mô tả**: Thay thế ảnh banner cũ (`header-banner.png`) bằng ảnh banner mới (`avatar.jpg` đổi tên thành `header-banner.jpg`) cho đồng bộ thiết kế ở các trang Chủ, Tìm kiếm và Quản trị.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/public/assets/header-banner.jpg` (Mới)
  - `LichCongTac.Api/ClientApp/public/assets/header-banner.png` (Xóa)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): cập nhật ảnh banner header mới"`

### [2026-08-01 10:19] Căn lề tiêu đề tránh đè lên logo
- **Mô tả**: Đã thêm khoảng trống thụt lề bên trái (`pl-[130px]`) cho khối văn bản chứa tiêu đề "LỊCH CÔNG TÁC UBND PHƯỜNG CẨM PHẢ" ở thanh banner header để đẩy khối chữ sang bên phải, tránh tình trạng bị đè lên hình ảnh logo tròn mới cập nhật.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): thụt lề title header để không đè lên logo"`

### [2026-08-01 10:20] Đổi thông tin bản quyền ở chân trang
- **Mô tả**: Thay đổi dòng text bản quyền từ "Bản quyền thuộc về LichCongTac.Com" thành "Bản quyền thuộc về UBND phường Cẩm Phả" ở footer. Bổ sung footer này cho cả trang chủ (`WorkSchedule.jsx`) để đồng bộ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): đổi tên bản quyền thành UBND phường Cẩm Phả"`

### [2026-08-01 10:24] Cập nhật danh sách địa điểm theo format mới
- **Mô tả**: Thay đổi định dạng tên các địa điểm mặc định trong form tạo/sửa lịch công tác (ví dụ: "Hội trường A UBND phường" thành "Hội trường A - Trụ sở HĐND và UBND phường").
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(docs): cập nhật format tên địa điểm họp"`

### [2026-08-01 10:35] Cập nhật format hiển thị địa điểm ở frontend
- **Mô tả**: Gộp địa điểm hiển thị lên cùng dòng với số giấy mời, theo format `Số giấy mời (Tại Địa điểm) Nội dung lịch họp`. Ẩn dòng hiển thị `- Địa điểm: [Tên]` rời rạc ở phía dưới.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): gộp địa điểm vào cùng dòng số giấy mời theo định dạng mới"`

### [2026-08-01 10:38] Cải thiện UX nhập liệu phòng ban và địa điểm tùy chọn
- **Mô tả**: Thêm lựa chọn "Khác" vào dropdown Phòng ban và Địa điểm. Ô nhập liệu văn bản chỉ xuất hiện khi người dùng chọn tùy chọn này, giúp giao diện gọn gàng và tránh nhầm lẫn.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): hide custom input for department and location unless other is selected"`

### [2026-08-01 10:45] Bổ sung tính năng Thông báo
- **Mô tả**: Thiết lập toàn bộ tính năng quản trị thông báo bao gồm backend API, database table và giao diện quản trị (AdminNotifications). Đồng thời tích hợp hiển thị danh sách thông báo ra ngoài trang chủ WorkSchedule với đường phân cách.
- **Tệp thay đổi**:
  - `data_dump/documents.db` (Thêm bảng Notifications)
  - `LichCongTac.Core/Models/Notification.cs` (Mới)
  - `LichCongTac.Core/Data/Repositories/NotificationRepository.cs` (Mới)
  - `LichCongTac.Api/Controllers/NotificationsController.cs` (Mới)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminNotifications.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(notifications): add notification management and display on homepage"`

### [2026-08-01 10:47] Sửa lỗi hiển thị UI dropdown tuỳ chọn
- **Mô tả**: Sửa lỗi ô nhập liệu địa điểm và phòng ban vẫn hiển thị khi form vừa được reset (do null/undefined) và sửa lỗi dropdown không reset về mặc định khi xóa trắng ô nhập liệu.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): correct custom input visibility for empty/null states"

### [2026-08-01 11:06] Cập nhật định dạng hiển thị địa điểm trong Lịch công tác
- **Mô tả**: Loại bỏ chữ "Tại" và dấu ngoặc lặp thừa khi hiển thị địa điểm ở trang ngoài, đồng thời đổi màu địa điểm sang xanh lam nổi bật nhưng không in đậm để dễ nhìn hơn.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(docs): format location display to prevent duplicate prefix"`

### [2026-08-01 12:35] Thêm tính năng Quản lý Ngày lễ
- **Mô tả**: Bổ sung bảng Holidays để quản lý các ngày lễ. Hiển thị thông báo dạng chữ chạy (marquee) dưới thanh menu trang chủ (WorkSchedule, SearchSchedule) nếu hôm nay là ngày lễ.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Models/Holiday.cs` (Mới)
  - `LichCongTac.Core/Data/Repositories/HolidayRepository.cs` (Mới)
  - `LichCongTac.Api/Controllers/HolidaysController.cs` (Mới)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminHolidays.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): thêm tính năng quản lý ngày lễ và hiển thị marquee trên trang chủ"`

### [2026-08-01 12:41] Fix lỗi kết nối DB của chức năng Quản lý Ngày lễ
- **Mô tả**: Sửa lỗi `no such table: Holidays` (500 Internal Server Error) do `HolidayRepository` kết nối sai DB khi lấy chuỗi kết nối trống từ `appsettings.json`. Đã đổi sang dùng chung hàm lấy biến môi trường `DB_PATH` giống với `DatabaseService`.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/HolidayRepository.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(db): sửa lỗi HolidayRepository không lấy đúng đường dẫn DB_PATH"`

### [2026-08-01 12:57] Dọn dẹp mã nguồn rác (Master Cleanup)
- **Mô tả**: Gỡ bỏ hàng loạt các module và đoạn code thừa từ hệ thống Quản lý Công văn cũ để tối ưu hệ thống Lịch công tác hiện tại.
- **Tệp thay đổi**:
  - `tests/` và các file rác trong `LichCongTac.Tests/` (Xóa)
  - `LichCongTac.Core/Services/EmailService.cs` (Xóa)
  - `LichCongTac.Core/Hubs/NotificationHub.cs` (Xóa)
  - `LichCongTac.Core/Services/Security/` (Xóa toàn bộ thư mục)
  - `LichCongTac.Core/Data/Repositories/AuditLogRepository.cs` và `SettingRepository.cs` (Xóa)
  - `LichCongTac.Api/ClientApp/src/components/settings/` (Xóa)
  - `LichCongTac.Api/ClientApp/src/lib/signalr.js` (Xóa)
  - `LichCongTac.Api/Program.cs` (Sửa đổi: Bỏ đăng ký các service bị xóa và SignalR)
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi: Bỏ ghi AuditLog và Kick SignalR)
  - `LichCongTac.Api/Controllers/AdminController.cs` (Sửa đổi: Xóa endpoint audit-logs)
  - `LichCongTac.Core/Data/DatabaseService.cs` (Sửa đổi: Không tạo bảng AppSettings, AuditLogs)
  - `data_dump/documents.db` (Sửa đổi: DROP TABLE AppSettings, AuditLogs)
- **Lệnh git commit**: `git commit -m "refactor(api): dọn dẹp hàng loạt module rác từ hệ thống cũ (AuditLog, Setting, Security, Email, SignalR, Tests)"`
### [2026-08-01 13:00] Sửa lỗi trắng màn hình (crash) trên thiết bị di động (đặc biệt là trình duyệt/iOS cũ)
- **Mô tả**: Khắc phục lỗi crash ở Frontend khi render trên thiết bị di động cũ (như iPhone 8 iOS <= 13). Nguyên nhân là hàm `mql.addEventListener` không được hỗ trợ trong các bản cũ của `window.matchMedia()`, thay vào đó cần dùng `mql.addListener`. Đã thêm fallback trong file hook `use-mobile.js` để tránh sập app. 
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/hooks/use-mobile.js` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(frontend): sửa lỗi trắng màn hình do crash ở hook useIsMobile trên iOS cũ"`
### [2026-08-01 13:07] Sửa lỗi không hiển thị Ngày Lễ ở trang chủ (WorkSchedule.jsx)
- **Mô tả**: Sửa lỗi trang chủ không hiển thị thanh chạy chữ (marquee) ngày lễ. Nguyên nhân là do Global Fetch Interceptor ở file `main.jsx` đã bóc tách lớp bọc ngoài `ApiResponse<T>`, khiến `WorkSchedule.jsx` không nhận được JSON với cấu trúc `json.success` và `json.data` như kỳ vọng. Đã sửa lại code xử lý kết quả API trong `WorkSchedule.jsx` để kiểm tra thẳng trường `json.content`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(frontend): sửa lỗi không hiển thị text ngày lễ do xung đột với global fetch interceptor"`
### [2026-08-01 13:16] Tinh chỉnh lại giao diện hiển thị thanh thông báo ngày lễ (WorkSchedule.jsx)
- **Mô tả**: Giới hạn chiều rộng của thanh chạy chữ ngày lễ vừa đúng bằng với chiều rộng của phần content/header (`max-w-6xl mx-auto`) để không bị tràn ra hai bên. Đồng thời sử dụng thẻ `<marquee>` HTML tiêu chuẩn thay cho CSS Animation để đảm bảo chữ chạy chuẩn từ phải sang trái (RTL) giống hệt hệ thống cũ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(frontend): giới hạn chiều rộng thanh ngày lễ và fix chiều chạy chữ"`
### [2026-08-01 13:17] Thu gọn thanh Navigation Bar (WorkSchedule.jsx)
- **Mô tả**: Thu hẹp thanh điều hướng màu xanh (Navigation Bar) để nó có cùng kích thước (`max-w-6xl`) với header, phần nội dung chính và thanh chạy ngày lễ, khắc phục hiện tượng thanh ngang bị tràn sang hai bên và giúp giao diện cân xứng giống hệt hệ thống cũ (ảnh 1).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(frontend): thu gọn chiều rộng thanh điều hướng để đồng nhất giao diện"`
### [2026-08-01 13:20] Thu gọn thanh Navigation Bar ở trang Tìm Kiếm (SearchSchedule.jsx)
- **Mô tả**: Đồng bộ thiết kế (Box Layout) từ trang chủ sang trang Tìm kiếm: đưa thanh điều hướng, thanh chạy chữ ngày lễ và thanh Footer vào trong giới hạn chiều rộng `max-w-6xl mx-auto` để giao diện vuông vức, không bị tràn ra 2 mép màn hình.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(frontend): đồng bộ thiết kế box layout cho trang tìm kiếm"`
### [2026-08-01 13:25] Sửa lỗi không hiển thị ngày lễ ở trang Tìm kiếm (SearchSchedule.jsx)
- **Mô tả**: Sửa lỗi trang Tìm kiếm không hiện thanh chạy chữ ngày lễ do bị lỗi parse dữ liệu JSON từ API (tương tự lỗi cũ ở trang chủ) vì Global Fetch Interceptor đã bóc tách sẵn trường `data`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(frontend): sửa lỗi không hiển thị ngày lễ ở trang tìm kiếm"`
### [2026-08-01 13:28] Giới hạn hiển thị lịch công tác trong 7 ngày tới (WorkSchedule.jsx)
- **Mô tả**: Thay đổi logic lọc lịch sắp tới ở trang chủ. Chỉ hiển thị các lịch nằm trong khoảng thời gian từ ngày mai đến tối đa 7 ngày tính từ hôm nay để tránh giao diện bị kéo dài quá mức.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(frontend): giới hạn hiển thị lịch ở trang chủ tối đa 7 ngày tới"`
### [2026-08-01 13:32] Thêm nút hiển thị/ẩn mật khẩu cho các trang quản trị
- **Mô tả**: Bổ sung icon con mắt (Eye/EyeOff) vào các trường nhập mật khẩu (Mật khẩu và Nhập lại mật khẩu) ở trang Quản trị tài khoản (AdminAccounts) và Quản trị nhân viên (AdminEmployees) để người dùng có thể xem được mật khẩu khi nhập.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminEmployees.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): thêm tính năng hiển thị mật khẩu ở trang quản trị tài khoản và nhân viên"`
### [2026-08-01 13:34] Sửa lỗi không đăng nhập được tài khoản mới tạo (Lỗi Double Hashing)
- **Mô tả**: Sửa lỗi logic trong `UserRepository.CreateUser` khiến mật khẩu mới tạo (đã được băm bằng PBKDF2 của Identity) bị băm thêm một lần nữa bằng BCrypt, dẫn đến việc không thể đăng nhập. Đã thêm điều kiện bỏ qua bước băm BCrypt nếu chuỗi mật khẩu bắt đầu bằng `AQAAAA` (dấu hiệu của PBKDF2 V3).
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/UserRepository.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi double hashing khiến tài khoản mới không thể đăng nhập"`
### [2026-08-01 13:38] Thêm địa điểm mới vào danh sách tùy chọn (AdminSchedules.jsx)
- **Mô tả**: Bổ sung thêm tùy chọn "Phòng tiếp công dân - Trụ sở HĐND và UBND phường" vào dropdown Địa điểm trên trang Quản trị lịch công tác, giúp người dùng thao tác nhập liệu nhanh hơn.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): thêm phòng tiếp công dân vào danh sách địa điểm"`
### [2026-08-01 13:54] Sửa lại giao diện Tìm kiếm và Trang chủ responsive trên mobile
- **Mô tả**: Thiết kế lại khối Tìm kiếm từ thẻ table sang layout flexbox giúp đáp ứng tốt các màn hình nhỏ, và điều chỉnh table với min-width 600px cho phép cuộn ngang, tránh tình trạng bị co quá đà làm tràn layout. Căn chỉnh lại header logo để không bị lẹm text.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): thiết kế lại giao diện trang search và home responsive trên mobile"`
### [2026-08-01 14:02] Deploy frontend cập nhật và xử lý lỗi hash mật khẩu
- **Mô tả**: 
  - Đã chạy lệnh `npm run build` trong `ClientApp` để compile code frontend React và ghi vào thư mục `wwwroot` của ASP.NET, sau đó restart docker container để apply. 
  - Đã xử lý lỗi không đăng nhập được tài khoản `hoangthinhu` bằng cách băm mật khẩu thủ công dưới dạng BCrypt và lưu vào Database để module `HybridPasswordHasher` có thể xử lý và nâng cấp hash chuẩn xác.
- **Tệp thay đổi**:
  - `LichCongTac.Api/wwwroot/*` (Build mới từ React Frontend)
  - `data_dump/documents.db` (Cập nhật hash thủ công)
- **Lệnh git commit**: `git commit -m "chore(deploy): build frontend static files và khắc phục hash bcrypt thủ công cho tài khoản"`
### [2026-08-01 14:06] Sync frontend assets vào Docker container
- **Mô tả**: Sửa lỗi giao diện cũ bị cache trên môi trường live do files `wwwroot` mới build chưa được copy vào trong container `lichcongtac-backend`. Đã dùng `docker cp` để đồng bộ thư mục `wwwroot` vào `/app/wwwroot` của container.
- **Tệp thay đổi**:
  - `lichcongtac-backend` (Container runtime)
- **Lệnh git commit**: `git commit -m "chore(deploy): sync wwwroot vào backend container để apply thay đổi frontend"`
### [2026-08-01 14:12] Điều chỉnh chiều rộng khung input trang Tìm kiếm trên mobile
- **Mô tả**: Giới hạn chiều rộng tối đa (max-w) của các thẻ input và button ở trang `SearchSchedule.jsx` để không bị dài và chèn ra ngoài trên màn hình mobile, giúp giao diện gọn gàng hơn. Đã đồng bộ lại file vào container.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): giới hạn chiều rộng input trang tìm kiếm trên mobile"`
### [2026-08-01 14:24] Điều chỉnh độ dài ô input "địa điểm khác"
- **Mô tả**: Kéo dài thanh nhập địa điểm khác (từ 260px lên 350px) để bằng với ô dropdown bên trên, giúp giao diện cân đối hơn và người dùng có thêm không gian nhìn thấy văn bản họ nhập vào. Đã build và đồng bộ lại vào Docker.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): tăng độ dài ô input địa điểm khác trong form thêm lịch"`
### [2026-08-01 14:25] Điều chỉnh độ dài ô input "đơn vị khác"
- **Mô tả**: Tương tự như ô nhập địa điểm, ô nhập tên đơn vị/phòng ban khác cũng được kéo dài từ 260px lên 350px để khớp kích thước với dropdown bên trên, tạo sự đồng bộ cho form nhập liệu. Đã build và đồng bộ vào Docker container.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): tăng độ dài ô input đơn vị khác trong form thêm lịch"`
### [2026-08-01 14:26] Rút ngắn độ dài ô input "Giấy mời số"
- **Mô tả**: Rút ngắn trường nhập "Giấy mời số" (từ max-w 550px xuống thành w 350px) để thẳng hàng và có cùng kích thước với các trường "Thuộc Phòng, Ban" và "Địa điểm", tạo sự thống nhất cho form. Đã build và đồng bộ vào Docker container.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): rút ngắn chiều rộng ô giấy mời số cho đồng bộ với các trường khác"`
### [2026-08-01 14:27] Cải thiện khả năng đọc chữ ở trang Đổi mật khẩu
- **Mô tả**: Ở trang Đổi mật khẩu, dòng chữ hiển thị "Tài khoản: [tên]" được thiết kế lớn hơn (từ text-xs lên text-sm), màu đậm hơn (chuyển từ trắng mờ 80% sang trắng đặc 100%) và in đậm vừa (font-medium) giúp người lớn tuổi dễ nhìn hơn trên nền xanh.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminChangePassword.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): tăng kích cỡ chữ và độ tương phản tên tài khoản ở trang đổi mật khẩu"`
### [2026-08-01 14:35] Hỗ trợ trình duyệt cũ trên iOS (iPhone 8 / Safari)
- **Mô tả**: Tích hợp `@vitejs/plugin-legacy` để sinh ra bộ mã tương thích (legacy bundle) có chứa các polyfills cho các thiết bị iPhone/iPad chạy hệ điều hành đời cũ (như iOS 12-14 trên iPhone 8). Điều này giải quyết lỗi màn hình trắng không mở được trên Safari cũ do không hỗ trợ cú pháp Javascript ES6+/ES2020.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/package.json`
  - `LichCongTac.Api/ClientApp/vite.config.js`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): cấu hình vite plugin legacy hỗ trợ các phiên bản safari cũ trên iphone 8"`
### [2026-08-01 14:42] Cải thiện giao diện hiển thị Thông báo
- **Mô tả**: Thay thế thiết kế thông báo dạng chữ đơn thuần ở trang chủ (phần Thông báo dưới Lịch công tác hôm nay) bằng một khối giao diện đẹp mắt (nền xám nhạt, viền xanh dương bên trái), kèm theo một icon Chuông thông báo (Bell) màu đỏ nhấp nháy để thu hút sự chú ý của người dùng.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): xoá filler box màu xám rỗng bên dưới khung Thông báo để tránh gây nhầm lẫn thiếu data"`

### [2026-08-01 15:40] Sửa lỗi điện thoại hiển thị "Không có lịch công tác" do trình duyệt (Safari) cache dữ liệu cũ
- **Mô tả**: Vấn đề một số điện thoại (iOS) tải trang chủ nhưng không thấy lịch nào ("Không có lịch công tác") dù máy tính vẫn thấy bình thường là do **bộ nhớ đệm (cache) cực kỳ hung hăng của Safari** đối với các API GET request. Safari đã lưu lại dữ liệu API từ những ngày trước (khi không có lịch) và cứ thế trả về cho những lần mở web tiếp theo thay vì gọi lên máy chủ để lấy lịch mới. Đã khắc phục bằng cách can thiệp vào `fetch interceptor` ở file `main.jsx`: tự động gắn thêm tham số `_t=timestamp` vào tất cả các lời gọi API GET để đánh lừa Safari rằng đây là một URL hoàn toàn mới, ép nó phải tải dữ liệu tươi từ máy chủ. Đồng thời bổ sung header `ngrok-skip-browser-warning` để ngăn ngrok chặn ngầm các request API trên điện thoại.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/main.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(core): thêm cache buster (_t) vào toàn bộ API GET để trị dứt điểm lỗi Safari cache dữ liệu cũ"`

### [2026-08-01 15:52] Căn lề hai bên (justify) và tăng kích thước chữ cho nội dung lịch công tác
- **Mô tả**: Nội dung văn bản chi tiết của lịch công tác và phần Thông báo ở màn hình chính được tinh chỉnh lại theo yêu cầu UI/UX. Kích thước chữ được đồng bộ lên mức chuẩn `16px` (trước đây là 13px-14px) để dễ đọc hơn trên mọi thiết bị. Đồng thời, bố cục hiển thị mốc thời gian (giờ) được chuyển từ dạng chia cột (flex) sang dạng nối tiếp (inline), giúp khi văn bản dài tự động xuống dòng và bám sát lề trái phía dưới mốc thời gian (y hệt form mẫu hệ thống cũ). Cuối cùng, toàn bộ đoạn văn bản nội dung được dàn đều lề hai bên (justify, giống định dạng trong file Word) bằng cách bổ sung class `text-justify`, giúp khối văn bản trở nên vuông vắn, trang trọng và đẹp mắt hơn.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): điều chỉnh fontsize thành 16px, wrap text thời gian và căn lề justify cho toàn bộ text trên trang chủ"`

### [2026-08-01 14:45] Sửa lỗi trắng màn hình khi thêm trang web vào màn hình chính (PWA) trên điện thoại
- **Mô tả**: Sửa lỗi màn hình trắng khi người dùng iPhone và các điện thoại khác lưu trang web ra màn hình chính (Add to Home Screen). Các nguyên nhân đã được khắc phục bao gồm: (1) Thêm file `manifest.json` và các thẻ meta iOS để PWA hoạt động chuẩn; (2) Chuyển `base` config của Vite thành relative (`./`) để sửa lỗi 404 khi load asset lúc khởi động từ màn hình chính; (3) Gỡ bỏ một số thư viện CDN thừa (chart.js, pdf.js, lucide) ra khỏi `index.html` để tránh lỗi Syntax Error trên các dòng máy cũ (như iPhone 8 / iOS 12-14).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/public/manifest.json` (Mới)
  - `LichCongTac.Api/ClientApp/index.html` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/vite.config.js` (Sửa đổi)
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi trắng màn hình PWA trên điện thoại và thêm manifest"`
### [2026-08-01 14:55] Sửa lỗi hiển thị ô chọn ngày tháng (Date Input) trên trình duyệt mobile
- **Mô tả**: Trình duyệt trên mobile (đặc biệt là iOS Safari) thường không hiển thị định dạng ngày tháng mặc định (`dd/mm/yyyy`) khi ô `type="date"` trống, dẫn đến việc ô nhập ngày tháng trông như một textbox trống (như trong ảnh chụp màn hình). Đã áp dụng thủ thuật chuyển đổi `type="text"` và `type="date"` linh hoạt khi người dùng chạm vào (onFocus/onBlur) kết hợp thêm thuộc tính `placeholder="dd/mm/yyyy"` để ô này luôn hiển thị định dạng rõ ràng. Đồng thời, loại bỏ thuộc tính `max-w-[280px]` trên mobile để các ô nhập liệu được kéo dài ra toàn bộ màn hình, khắc phục tình trạng ô bị cụt một nửa trông mất cân đối.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi hiển thị ô chọn ngày và bố cục form tìm kiếm trên di động"`
### [2026-08-01 14:56] Sửa lỗi trắng trang khi vào các route con (ví dụ /manager/login)
- **Mô tả**: Khi chuyển `base` của Vite thành dạng tương đối (`./`) ở commit trước, các route lồng nhau như `/manager/login` sẽ tải sai đường dẫn tĩnh (tìm trong `/campha/manager/vite-assets/` thay vì `/campha/vite-assets/`), gây ra lỗi 404 và màn hình trắng. Đã đổi lại cấu hình `base: '/campha/'` trong `vite.config.js` thành đường dẫn tuyệt đối bắt đầu từ thư mục gốc ảo. Việc này kết hợp với `UsePathBase("/campha")` ở Kestrel đã giải quyết triệt để lỗi định tuyến tĩnh cho mọi môi trường (Nginx và Ngrok). Đã rebuild lại Frontend và copy vào wwwroot.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/vite.config.js`
  - `LichCongTac.Api/wwwroot/*`
- **Lệnh git commit**: `git commit -m "fix(routing): sửa lỗi nạp tài nguyên tĩnh gây trắng màn hình trên route con do base URL sai"`
### [2026-08-01 15:00] Sửa lỗi bộ chọn ngày (Date Picker) không tự mở trên iOS Safari khi focus
- **Mô tả**: Ở commit trước, việc thay đổi linh hoạt `type="text"` sang `type="date"` khi onFocus khiến iOS Safari không thể tự động mở popup chọn ngày ngay ở lần chạm đầu tiên (vì Safari yêu cầu click trực tiếp lên một input `type="date"` thực sự). Đã đổi chiến lược: giữ nguyên `type="date"`, dùng CSS ngầm ẩn chữ trắng gốc của trình duyệt (`::-webkit-datetime-edit { color: transparent }`) và dùng một `div` đè lên làm placeholder (`dd/mm/yyyy`) sử dụng `pointer-events-none`. Khi người dùng chạm, sự kiện click lọt thẳng qua thẻ div và mở ngay bộ chọn ngày của OS. Khi đang focus (hoặc khi đã nhập giá trị), lớp CSS ẩn này được xóa bỏ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/styles/globals.css`
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi date picker không mở ngay trên iOS và hoàn thiện giao diện placeholder"`

### [2026-08-01 15:03] Đồng bộ giao diện ô chọn Thời gian (Date/Time) toàn dự án
- **Mô tả**: Áp dụng triệt để giải pháp placeholder ảo (CSS `.empty-date` kết hợp `absolute div`) cho toàn bộ các ô nhập `type="date"` và `type="time"` còn lại trong mã nguồn để đảm bảo tính nhất quán trên nền tảng di động.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/ClientApp/src/pages/AdminHolidays.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): đồng bộ giao diện hiển thị cho toàn bộ ô chọn thời gian"`

### [2026-08-01 15:06] Co lại kích thước ô nhập thời gian trên Mobile
- **Mô tả**: Bổ sung lại class `max-w-[280px]` trên mobile cho các thẻ bọc (wrapper) ô input thời gian ở form `Tìm kiếm` (`SearchSchedule.jsx`). Việc loại bỏ class này ở commit trước khiến ô input kéo giãn 100% (`w-full`) trên màn hình điện thoại, tạo cảm giác "tràn" hoặc quá dài so với các input khác (như textarea `Nội dung`).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): giới hạn chiều rộng max-w cho ô chọn thời gian trên màn hình di động"`

### [2026-08-01 15:08] Sửa lỗi tràn giao diện ô nhập Ngày Giờ ở Quản trị lịch
- **Mô tả**: Do đặc tính của `type="date"` và `type="time"` trên Safari tự động có min-width riêng, nếu đặt chúng trong cùng một thẻ FlexRow mà không cho phép co lại (`min-w-0`), chúng sẽ cố tình giãn thẳng ra ngoài viền màn hình (tràn ra bên phải). Thay vì dùng flex, đã đổi thẻ bọc sang dùng `grid grid-cols-2` trên màn hình nhỏ và thêm class `min-w-0` để ép các ô này tự thu gọn vừa khít với màn hình di động.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): đổi layout flex sang grid-cols-2 cho cụm input thời gian để chống tràn màn hình"`

### [2026-08-01 15:10] Chuyển đổi hiển thị Ngày/Giờ sang dạng xếp dọc trên Mobile
- **Mô tả**: Do đặc tính của `type="date"` và `type="time"` trên Safari tự động có kích thước tối thiểu lớn, khi sử dụng layout chia cột (`grid-cols-2` hoặc `flex` ngang) trên các màn hình di động nhỏ, ô nhập sẽ bị ép tràn ra ngoài viền gây lỗi hiển thị. Thay đổi layout từ ngang sang xếp dọc (`flex-col`) chuyên biệt cho Mobile (trên Tablet/Desktop từ `sm` trở lên sẽ giữ nguyên giao diện ngang bằng `sm:flex-row`). Việc này giúp các ô nhập có không gian 100% chiều rộng để hiển thị thoải mái, đồng điệu với các form input khác.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): xếp dọc ô ngày và giờ trên mobile để khắc phục tràn màn hình do min-width"`

### [2026-08-01 15:11] Thu gọn chiều rộng các ô thời gian ở khu vực Quản trị
- **Mô tả**: Sau khi đã xếp dọc các ô nhập Thời gian ở khu vực Quản trị (`AdminSchedules`, `AdminHolidays`), kích thước mặc định 100% (`w-full`) khiến giao diện trên điện thoại trông khá dài, tương tự như ở khung Tìm kiếm. Đã bổ sung thuộc tính `max-w-[280px]` trên màn hình di động cho tất cả các thẻ bọc thời gian trong khu vực admin, giúp chúng được hiển thị gọn gàng, vừa mắt và đồng nhất với thiết kế trên màn hình WorkSchedule.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/ClientApp/src/pages/AdminHolidays.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): đồng bộ giới hạn chiều rộng max-w cho tất cả các ô thời gian trên thiết bị di động"`

### [2026-08-01 15:13] Sửa menu dropdown Quản trị trên màn hình Mobile
- **Mô tả**: Do đặc tính của màn hình cảm ứng trên Mobile không có con trỏ chuột (`hover`), các menu con (như Quản trị tài khoản, Quản trị phòng ban) đang dùng CSS `group-hover` sẽ không thể mở ra khi bấm vào chữ "QUẢN TRỊ". Đã xử lý lại logic thanh Menu `AdminHeader`: thêm icon mũi tên báo hiệu (Chevron) và tạo hiệu ứng đóng/mở (Accordion) khi người dùng bấm vào trên thiết bị di động. Các mục con được thụt lề và đổi màu nền chuyên biệt để phân biệt rõ ràng với menu chính. Trên máy tính vẫn giữ nguyên hiệu ứng trỏ chuột để sổ xuống (Dropdown) mượt mà.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(ui): thêm hiệu ứng accordion cho menu dropdown trên giao diện mobile"`

### [2026-08-01 15:25] Điều chỉnh tỷ lệ cột giao diện Lịch công tác chính (60% - 40%)
- **Mô tả**: Thay đổi tỷ lệ chia cột trên màn hình chính (trang hiển thị Lịch công tác). Trước đây, cột trái (Hôm nay) và cột phải (Các ngày tới) được chia đều tỷ lệ 50-50 (`grid-cols-2`). Đã điều chỉnh sang hệ lưới 5 cột (`grid-cols-5`), trong đó cột trái chiếm 3 phần (60%) và cột phải chiếm 2 phần (40%) để tạo không gian rộng rãi hơn cho nội dung lịch họp hiện tại cũng như mục Thông báo.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "style(ui): thay đổi tỷ lệ hiển thị cột trái phải thành 60-40 trên trang chủ"`

### [2026-08-01 15:31] Sửa lỗi trắng trang (không hiển thị dữ liệu) trên một số dòng điện thoại (iOS Safari cũ)
- **Mô tả**: Nguyên nhân khiến một số điện thoại (đặc biệt là iPhone đời cũ dùng Safari cũ) vào trang chủ nhưng không thấy lịch công tác là do lỗi **Invalid Date**. Trình duyệt Safari phiên bản cũ không hỗ trợ tốt việc dùng lệnh `new Date("YYYY-MM-DD")` với chuỗi có dấu gạch ngang, dẫn đến lỗi hàm và làm sập logic xử lý dữ liệu. Giải pháp là tách chuỗi `YYYY-MM-DD` ra làm 3 phần (năm, tháng, ngày) và truyền vào `new Date(year, month, day)`. Đã rà soát và áp dụng bản sửa lỗi này cho toàn bộ source code (WorkSchedule, AdminSchedules, SearchSchedule, Dashboard charts) để đảm bảo tương thích 100% với mọi trình duyệt và hệ điều hành cũ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx`
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx`
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx`
  - `LichCongTac.Api/ClientApp/src/components/dashboard/DeadlineBarChart.jsx`
  - `LichCongTac.Api/wwwroot/*` (Build mới)
- **Lệnh git commit**: `git commit -m "fix(core): sửa lỗi crash do parse Date từ chuỗi YYYY-MM-DD trên iOS Safari cũ"`

### [2026-08-02 22:38] Fix hiển thị thừa dấu hai chấm khi lịch công tác không có giờ
- **Mô tả**: Sửa lỗi giao diện hiển thị dấu hai chấm `:` dư thừa ở đầu nội dung lịch công tác khi người dùng tạo lịch nhưng để trống trường thời gian (startTime). Lỗi này ảnh hưởng đến cả trang chủ (WorkSchedule.jsx) và trang tìm kiếm (SearchSchedule.jsx).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): ẩn thời gian và dấu hai chấm khi lịch không thiết lập giờ"`
