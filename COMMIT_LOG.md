# Nhật ký Thay đổi Mã Nguồn (Commit Log)

Tệp này lưu trữ lịch sử các thay đổi và tính năng mới được thêm vào hệ thống để AI có thể nhanh chóng nắm bắt ngữ cảnh mà không cần quét lại toàn bộ mã nguồn. Kể từ ngày 26/07/2026, toàn bộ hệ thống đã được tái cấu trúc (pivot) để chuyên biệt phục vụ chức năng **Lịch Công Tác**.

## Lịch sử

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
