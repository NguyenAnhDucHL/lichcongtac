### [2026-08-22 10:16] Fix mobile layout trang SearchSchedule — card layout thay bảng

### [2026-08-22 10:24] Revert mobile layout trang SearchSchedule — đổi từ card sang responsive table
- **Mô tả**: Theo yêu cầu, trả lại giao diện bảng kết quả tìm kiếm trên điện thoại (bỏ card layout) và sử dụng responsive table không cuộn ngang.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(search): revert mobile layout từ card sang bảng responsive"`
- **Mô tả**: Trên mobile bảng 4 cột (STT, Ngày, Nội dung, Phòng/ban) bị tràn ngang buộc người dùng phải kéo qua lại. Giải pháp: ẩn bảng trên mobile (`hidden md:block`), thêm card layout riêng (`md:hidden`) hiển thị dạng danh sách dọc — ngày + nội dung + phòng ban theo chiều dọc, tận dụng toàn bộ chiều rộng màn hình, không cần scroll ngang.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(search): chuyển kết quả tìm kiếm sang card layout trên mobile, bỏ scroll ngang"`
### [2026-08-21 01:25] Thêm dấu gạch ngang ngăn cách lịch hôm nay và ngày mai trên mobile
- **Mô tả**: Bổ sung thẻ hr kèm khoảng cách (margin) chỉ hiển thị trên giao diện mobile (md:hidden) để ngăn cách rõ ràng giữa phần lịch công tác hôm nay và các ngày sắp tới, giúp giao diện dễ nhìn hơn.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): thêm dấu gạch ngang ngăn cách lịch hôm nay và ngày mai trên mobile"`

### [2026-08-19 11:08] Sửa triệt để lỗi "file changed as we read it" của GNU tar
- **Mô tả**: Tham số `--exclude='deploy.tar.gz'` không hoạt động trên phiên bản GNU tar của GitHub Actions (do nó báo lỗi ngay từ khâu đọc danh sách file trong thư mục hiện tại trước khi kịp exclude). Đã sửa lỗi dứt điểm bằng cách nén và xuất file `deploy.tar.gz` ra thư mục tạm `/tmp` của hệ thống, sau đó dùng lệnh `mv` chuyển nó ngược về lại thư mục gốc để upload lên server.
- **Tệp thay đổi**:
  - `.github/workflows/deploy.yml` (Sửa đổi)
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(infra): nén file ra tmp để không bị lỗi file changed as we read it"`

### [2026-08-19 11:20] Sửa lỗi cấu trúc Enterprise: Thundering Herd, SignalR Retry, Offline Toast
- **Mô tả**: Vá 3 lỗ hổng lớn về khả năng chịu lỗi của frontend:
  1. `apiClient.js`: Thêm cơ chế Promise Lock queue khi xử lý Refresh Token (tránh Thundering Herd khi 401 nhiều request cùng lúc).
  2. `SignalRContext.jsx`: Áp dụng `InfiniteRetryPolicy` (thử lại vô hạn định) thay vì bỏ cuộc sau 4 lần chập chờn mạng.
  3. `main.jsx`: Lắng nghe sự kiện `offline`/`online` từ window để hiển thị Toast cảnh báo đỏ không cho người dùng bấm Lưu khi mất kết nối mạng.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/lib/apiClient.js` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(infra): vá lỗi kiến trúc enterprise cho apiClient, signalR và xử lý offline"`

### [2026-08-19 11:06] Sửa lỗi lệnh tar trong GitHub Actions gây crash "file changed as we read it"
- **Mô tả**: Khi chạy lệnh `tar -czf deploy.tar.gz .` trên máy chủ Ubuntu của GitHub Actions (sử dụng GNU tar), công cụ nén đọc đụng đúng cái file `deploy.tar.gz` mà nó đang tạo ra, dẫn đến cảnh báo file thay đổi và trả về exit code 1 làm hỏng tiến trình deploy. Đã thêm `--exclude='deploy.tar.gz'` vào cả `deploy.yml` và `deploy_to_vnpt.sh` để khắc phục lỗi này.
- **Tệp thay đổi**:
  - `.github/workflows/deploy.yml` (Sửa đổi)
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(infra): loại trừ file nén khỏi lệnh tar để tránh lỗi file changed as we read it"`

### [2026-08-19 11:00] Thêm luồng CI/CD GitHub Actions để tự động deploy
- **Mô tả**: Dự án trước đây phải chạy script `deploy_to_vnpt.sh` bằng tay. Đã cấu hình thêm `deploy.yml` cho GitHub Actions sử dụng `appleboy/scp-action` và `appleboy/ssh-action`. Từ nay mỗi khi có code mới đẩy lên nhánh `main`, GitHub sẽ tự động nén mã nguồn và ném sang VNPT y như lệnh deploy tay.
- **Tệp thay đổi**:
  - `.github/workflows/deploy.yml` (Mới)
- **Lệnh git commit**: `git commit -m "feat(infra): thêm github actions cicd tự động deploy lên vnpt"`

### [2026-08-19 10:52] Cập nhật thuật toán đệ quy cắt thẻ p rỗng chứa style
- **Mô tả**: Regex cắt bỏ dòng trắng trước đó không bắt được các thẻ `<p>` có chứa attribute do Rich text editor sinh ra (như `<p style="..."><br></p>`). Đã thay thế bằng vòng lặp `while` đệ quy để lột bỏ tận gốc mọi thẻ `p` rỗng, thẻ `br`, thẻ `span` rỗng và khoảng trắng từ ngoài vào trong cho đến khi đoạn văn sạch sẽ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): đệ quy lột bỏ triệt để thẻ p rỗng chứa style cuối đoạn văn"`

### [2026-08-19 10:46] Dùng Javascript Regex để cắt bỏ triệt để dòng trắng do CSS :has không tương thích
- **Mô tả**: Rule CSS `[&_p:has(br:only-child)]` không hoạt động trên một số trình duyệt hoặc khi user nhập `<p>&nbsp;</p>`. Đã thay bằng Javascript Regex `cleanContent.replace(/(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+$/gi, '')` để quét và tiêu diệt mọi thẻ `<p>` rỗng ở cuối đoạn văn trước khi render HTML.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): dùng regex js thay vì css để cắt bỏ dòng trắng"`

### [2026-08-19 10:41] Chỉnh sửa khoảng cách và ẩn thẻ p thừa trong UI Lịch
- **Mô tả**: Khoảng cách giữa các ngày bị thưa do kết hợp margin (`mb-8`) và các dòng trắng sinh ra từ rich text editor (các thẻ `<p><br></p>` hoặc `<p></p>` rỗng ở cuối dòng do user bấm Enter). Đã giảm khoảng cách các ngày xuống `mb-5` và thêm rule Tailwind `[&_p:empty]:hidden [&_p:has(br:only-child)]:hidden` để tự động dọn dẹp khoảng trống thừa do user nhập lỗi.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): giảm khoảng cách giữa các ngày và ẩn dòng trắng thừa"`

### [2026-08-19 10:27] Fix lỗi trống dữ liệu ở trang 2 của AdminSchedules
- **Mô tả**: Component `ScheduleTable` vẫn giữ logic cũ là tự động cắt mảng (slice) theo trang. Do dữ liệu trả về từ server đã là trang hiện tại rồi nên lúc sang trang 2, component lấy mảng 10 phần tử cắt từ index 10 đến 20 dẫn đến trống không. Đã thêm prop `serverSide={true}` truyền từ `AdminSchedules` xuống để tắt tính năng tự cắt mảng của `ScheduleTable`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/ScheduleTable.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(admin): lỗi rỗng bảng ở trang 2 do client tự cắt mảng"`

### [2026-08-19 10:23] Chuyển trang admin quản lý lịch sang server-side pagination
- **Mô tả**: Trang `/manager/schedules` đang load toàn bộ 110+ bản ghi về client rồi mới phân trang JS (client-side). Chuyển sang server-side pagination tương tự trang public-search: thêm query params `page`, `pageSize`, `keyword` vào endpoint `GET /api/schedules`, tái dùng `SearchPaginatedAsync` đã có. Frontend `AdminSchedules.jsx` cập nhật dùng `getSchedulesPaginated()`, hiển thị đúng `totalCount` từ server, thêm ô tìm kiếm realtime với debounce 400ms. Sau khi xóa item cuối cùng của trang thì tự động quay về trang trước.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Sửa đổi — thêm page/pageSize/keyword params)
  - `LichCongTac.Api/ClientApp/src/services/admin.service.js` (Sửa đổi — thêm getSchedulesPaginated)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi — server-side pagination + search)
- **Lệnh git commit**: `git commit -m "feat(admin): chuyển trang quản lý lịch sang server-side pagination và thêm tìm kiếm"`

### [2026-08-19 10:10] Fix lỗi enterprise-grade: race condition, timeout, deduplication, exponential backoff
- **Mô tả**: Phân tích theo tiêu chuẩn hệ thống lớn (Facebook/YouTube), phát hiện 4 lỗ hổng: (1) Race condition — 3 trigger (visibilitychange + online + SignalR) cùng lúc tạo 3 fetch song song, response chậm nhất có thể ghi đè data mới hơn → thêm `fetchIdRef` để discard stale response; (2) Request deduplication — `isFetchingRef` ngăn fetch mới khi đã có fetch đang chạy; (3) Request timeout 15s — `AbortController` trong `apiClient.js` ngăn request treo vô hạn trên 2G/Captive Portal; (4) Exponential backoff — thay flat 3s thành 3s→6s→12s (tối đa 3 lần) tránh thundering herd khi server quá tải. Bonus: chỉ fetch notification/holiday khi lịch chính thành công.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/lib/apiClient.js` (Sửa đổi — thêm AbortController timeout 15s)
- **Lệnh git commit**: `git commit -m "fix(docs): race condition, request timeout, dedup và exponential backoff"`

### [2026-08-19 10:03] Fix memory leak retry timeout và tối ưu polling cho người dùng nhiều tab
- **Mô tả**: Hai fix quan trọng cho kịch bản người dùng PWA + nhiều tab: (1) Thêm `isMountedRef` guard để ngăn `setState` sau khi component unmount — tránh memory leak khi retry timeout 3s vẫn chạy sau khi user chuyển màn hình; (2) Polling 30 phút chỉ chạy khi `document.visibilityState === 'visible'` — tránh trường hợp 5-10 tab đều ẩn cùng poll song song lãng phí CPU và pin điện thoại.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(docs): ngăn memory leak retry timeout và tối ưu polling chỉ khi tab visible"`

### [2026-08-19 09:59] Bổ sung các trường hợp stale data còn thiếu
- **Mô tả**: Sau lần fix đầu tiên, phát hiện thêm 3 trường hợp chưa được xử lý: (1) BFCache — iOS Safari và Mobile Chrome khôi phục trang từ cache khi nhấn Back, `visibilitychange` không fire nhưng `pageshow` với `persisted=true` sẽ bắt được; (2) Chuyển mạng WiFi→4G không qua trạng thái offline — thêm auto-retry 1 lần sau 3 giây khi fetch thất bại, chỉ hiện lỗi sau 2 lần thất bại; (3) UTC date parsing — thêm `parseDateStr()` xử lý đúng cả date string dạng `YYYY-MM-DD` lẫn ISO UTC `YYYY-MM-DDTHH:mm:ssZ`, tránh lệch ngày khi server trả timestamp có timezone.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(docs): bổ sung xử lý BFCache, retry mạng và UTC date parsing"`

### [2026-08-19 09:54] Fix dữ liệu bị đóng băng khi để app qua đêm
- **Mô tả**: Khi người dùng để app mở qua đêm (điện thoại tắt màn hình), dữ liệu lịch công tác bị hiển thị sai ngày vì `groupAndTransform` dùng `new Date()` cứng tại thời điểm mount, không tự refresh khi ngày mới bắt đầu. Thêm 6 cơ chế bảo vệ: (1) SignalR push từ admin, (2) SignalR reconnect sau sleep/mất mạng, (3) `visibilitychange` khi quay lại tab/app, (4) `online` event khi mạng trở lại, (5) Midnight clock-tick lúc 0h01, (6) Fallback polling 30 phút. Tách `getTodayStr()` thành helper riêng để ngày luôn được tính tại thời điểm gọi.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi — thêm `onreconnected`, export `lastReconnect`)
- **Lệnh git commit**: `git commit -m "fix(docs): sửa dữ liệu lịch bị đóng băng khi để app qua đêm"`

### [2026-08-17 23:20] Tự động dọn dẹp rác (images, file thừa) sau khi deploy
- **Mô tả**: Bổ sung lệnh `docker image prune -f` vào script `deploy_to_vnpt.sh` để đảm bảo hệ thống tự động xóa các docker images cũ và các rác thải sinh ra trong quá trình build, tuân thủ quy tắc sạch sẽ môi trường deploy.
- **Tệp thay đổi**:
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore(infra): add docker image prune to deploy script to clean up junk files"`

### [2026-08-17 23:12] Chuyển đổi phân trang Server-side cho tìm kiếm
- **Mô tả**: Thay đổi chức năng tìm kiếm lịch công tác từ phân trang client-side sang server-side pagination do dữ liệu lớn. Thêm endpoint `/api/schedules/public-search` có hỗ trợ `page` và `pageSize`. Cập nhật `SearchSchedule.jsx` để fetch dữ liệu từng trang, khắc phục tình trạng bị gọi toàn bộ lịch sử khi tìm kiếm.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Interfaces/IScheduleRepository.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/ScheduleRepository.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/services/schedule.service.js` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "perf(docs): chuyển tìm kiếm lịch công tác sang server-side pagination"`

### [2026-08-12 19:50] Sửa lỗi realtime SignalR ở trang public bị chặn bởi Authorize
- **Mô tả**: Trang Public (`/campha/`) không nhận được thông báo cập nhật lịch công tác qua SignalR (`ReceiveScheduleUpdate`) do client không truyền token (vì chưa đăng nhập), trong khi `AppHub` ở Backend lại cấu hình `[Authorize]`. Điều này dẫn đến kết nối WebSocket từ trang Public bị từ chối với lỗi 401 Unauthorized. Giải pháp: Gỡ bỏ thẻ `[Authorize]` trên class `AppHub` vì Hub này chỉ dùng để nhận broadcast event chung hoặc event theo `ConnectionId`, việc không đăng nhập vẫn an toàn (những người chưa đăng nhập không được add vào group `User_{userId}`).
- **Tệp thay đổi**:
  - `LichCongTac.Api/Hubs/AppHub.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(notify): gỡ bỏ Authorize ở AppHub cho phép trang public kết nối SignalR"`

### [2026-08-09 22:31] Fix password reset logic missing empty password check and sync SecurityStamp
- **Mô tả**: Sửa lỗi chức năng cập nhật mật khẩu thất bại nhưng không báo lỗi. Nguyên nhân do `UserManager.AddPasswordAsync` từ chối cập nhật mật khẩu nếu `GetPasswordHashAsync` trả về không null. Giải pháp: Sử dụng trực tiếp `PasswordHasher.HashPassword` để hash thay vì qua `RemovePasswordAsync` và `AddPasswordAsync`. Đồng thời cập nhật `UserRepository` để lưu `SecurityStamp` từ object. Xử lý đồng bộ logout qua SignalR bằng cách ép các thiết bị khác đăng xuất.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/UsersController.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/UserRepository.cs` (Sửa đổi)
  - `LichCongTac.Api/Hubs/AppHub.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi đổi mật khẩu và đồng bộ trạng thái đăng xuất SignalR"`
### [2026-08-09 17:30] Sửa lỗi SignalR không kết nối lại sau khi đăng nhập khiến không nhận được sự kiện realtime
- **Mô tả**: Khi người dùng (như Máy B) đăng nhập thành công, vì trang web sử dụng react-router không tải lại trang, nên component `SignalRContext` (vốn chỉ chạy 1 lần lúc đầu) tiếp tục sử dụng connection cũ với token bị lỗi/rỗng thay vì kết nối lại với token mới. Hậu quả là máy B không tham gia vào `Group` SignalR của user, dẫn đến việc không nhận được sự kiện ForceLogout khi có máy khác đăng nhập đè. Đã sửa bằng cách thêm biến `token` từ `AuthContext` vào dependency array của `useEffect` trong `SignalRContext`, để nó tự động disconnect và connect lại khi token thay đổi (ví dụ: sau khi đăng nhập thành công).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): signalr reconnect khi token thay đổi để nhận force logout"`


- **Mô tả**: Khi client khởi tạo kết nối SignalR, nó không tự gửi JWT token lên server. Đã cập nhật `SignalRContext.jsx` để gửi kèm token qua `accessTokenFactory`, đồng thời cấu hình `Program.cs` đọc token từ query string `access_token` để `AppHub` có thể định danh User và đưa vào đúng group `User_{userId}`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
  - `LichCongTac.Api/Hubs/AppHub.cs` (Thêm `[Authorize]`)
- **Lệnh git commit**: `git commit -m "fix(auth): truyền token cho SignalR qua accessTokenFactory để hỗ trợ realtime force logout"`


- **Mô tả**: Đổi `window.dispatchEvent` thành `document.dispatchEvent` trong `SignalRContext.jsx` để `AuthContext` có thể bắt được sự kiện và hiển thị đúng thông báo "Tài khoản của bạn vừa được đăng nhập trên thiết bị khác" thay vì thông báo mặc định.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi frontend không bắt được sự kiện ForceLogout từ SignalR do sai DOM target"`

### [2026-08-09 16:58] Thêm tính năng đẩy (kick) thiết bị cũ realtime qua SignalR
- **Mô tả**: Bổ sung tính năng Real-time Force Logout. Khi thiết bị B đăng nhập thành công, hệ thống lập tức gửi tín hiệu `ForceLogout` qua SignalR (`AppHub`) tới `User_{userId}`. Thiết bị A (đang sử dụng) sẽ nhận được sự kiện này ngay lập tức, kích hoạt luồng `handleUnauthorized` để văng tài khoản hoặc hiển thị modal báo "Tài khoản của bạn vừa được đăng nhập trên thiết bị khác" mà không cần đợi đến lúc thực hiện một thao tác API mới.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Hubs/AppHub.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(auth): thêm tính năng đẩy thiết bị cũ ra ngay lập tức realtime qua SignalR"`

### [2026-08-09 16:45] Sửa lỗi SecurityStamp bị lệch và kích hoạt tính năng chống đăng nhập nhiều nơi (Enterprise)
- **Mô tả**: Sửa lỗi ngầm trong `UserRepository.UpdateUser` liên tục tạo `SecurityStamp` mới mỗi khi gọi `UpdateUser` (làm đè luồng của Identity khiến `tokenStamp` bị lệch và đẩy người dùng ra ngay sau khi login). Đồng thời kích hoạt lại cấu hình kiểm tra `SecurityStamp` trong `Program.cs` để thiết lập tính năng bảo mật cấp độ Enterprise: Chỉ cho phép một phiên làm việc duy nhất trên cùng một tài khoản (khi thiết bị mới đăng nhập, thiết bị cũ sẽ bị vô hiệu hóa). Cập nhật `UsersController` tạo `SecurityStamp` mới khi Admin đổi quyền người dùng.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/UserRepository.cs` (Sửa đổi)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
  - `LichCongTac.Api/Controllers/UsersController.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi lệch SecurityStamp và kích hoạt tính năng đăng nhập một phiên duy nhất"`

### [2026-08-08 08:45] Tối ưu hóa Database: Chống tấn công OOM (Tràn bộ nhớ)
- **Mô tả**: Bổ sung `LIMIT` vào tất cả các truy vấn danh sách (Schedules, Notifications, Holidays) trong Repositories bằng ADO.NET. Việc này ngăn chặn tình trạng bảng dữ liệu phình to theo thời gian gây tràn bộ nhớ server khi tải về frontend mà không giới hạn.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/ScheduleRepository.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/NotificationRepository.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/HolidayRepository.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "perf(db): thêm LIMIT cho các truy vấn danh sách để chống tràn bộ nhớ (OOM)"`

### [2026-08-08 08:39] Thêm hiển thị thông báo lỗi kết nối máy chủ ở trang chủ
- **Mô tả**: Sửa lỗi giao diện tự động hiển thị "Không có lịch công tác" và che giấu lỗi khi kết nối mạng/API thất bại (vd: khi server đang bảo trì hoặc mạng chập chờn). Thay vào đó, giờ sẽ hiển thị màn hình báo lỗi cụ thể để người dùng biết máy chủ đang tạm mất kết nối, tránh hiểu lầm là bị mất dữ liệu.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): hiển thị thông báo lỗi mạng thay vì ẩn đi và báo không có lịch khi api lỗi"`

### [2026-08-08 08:31] Cấu hình Log Rotation chống tràn bộ nhớ / ổ cứng (Production Mode)
- **Mô tả**: Bổ sung giới hạn lưu trữ log cho container `lichcongtac-backend` (tối đa 10MB/file, giữ lại 3 file) trong `docker-compose.yml`. Điều này giúp ngăn chặn file log của Docker phình to bất thường theo thời gian gây lỗi server, làm trắng website hay cạn kiệt bộ nhớ.
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "perf(infra): add log rotation limits to prevent disk and memory overflow"`

### [2026-08-08 08:25] Dọn dẹp các cấu hình ngrok thừa
- **Mô tả**: Xoá bỏ các thiết lập CORS (`.ngrok-free.dev`) và cập nhật `README.md` do hệ thống đã chạy ổn định trên server VNPT, không cần dùng ngrok tunnel.
- **Tệp thay đổi**:
  - `README.md` (Sửa đổi)
  - `LichCongTac.Api/Program.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore(infra): dọn dẹp các cấu hình ngrok không còn dùng"`

### [2026-08-07 17:45] Sửa lỗi xung đột Nginx proxy (Không tải được dữ liệu trên Zalo/Mobile)
- **Mô tả**: Bỏ container `nginx` trong `docker-compose.yml` của dự án `lichcongtac` để tránh xung đột port 80 và 443 với container `nginx-proxy` chung của máy chủ (nằm trong dự án `Tool-Calendar`). Việc xung đột khiến chứng chỉ SSL của `congvan.vpdtcampha.vn` bị trả về sai (thành `lichcongtac.vpdtcampha.vn`), dẫn đến lỗi "Không tải được dữ liệu" khi truy cập từ Zalo In-App Browser hoặc Mobile Safari.
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(infra): loại bỏ nginx nội bộ để tránh xung đột port 80/443 với nginx-proxy chung"`

# Nhật ký Thay đổi Mã Nguồn (Commit Log)

Tệp này lưu trữ lịch sử các thay đổi và tính năng mới được thêm vào hệ thống để AI có thể nhanh chóng nắm bắt ngữ cảnh mà không cần quét lại toàn bộ mã nguồn. Kể từ ngày 26/07/2026, toàn bộ hệ thống đã được tái cấu trúc (pivot) để chuyên biệt phục vụ chức năng **Lịch Công Tác**.

## Lịch sử

### [2026-08-07 18:32] Giảm khoảng cách giữa các lịch công tác
- **Mô tả**: Thu hẹp khoảng trống quá rộng giữa các lịch công tác (từ space-y-6, space-y-5 xuống space-y-3) để nhìn gọn gàng và liền mạch hơn, đồng thời đảm bảo phông chữ chuẩn Nghị định 30.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/work-schedule/components/SchedulePanels.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): giảm khoảng cách dọc giữa các lịch công tác để giao diện gọn hơn"`

### [2026-08-07 18:16] Tắt hiệu ứng nền highlight do paste từ Word
- **Mô tả**: Sửa lỗi văn bản copy từ Word vào editor giữ lại `background-color: white` khiến văn bản hiển thị ra ngoài trông giống bị bôi đen (highlight) trên nền xanh. Bổ sung `background-color: transparent !important` vào cấu hình font chung trong globals.css.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): xóa hiệu ứng background highlight lỗi khi copy từ word"`

### [2026-08-07 18:13] Chuyển đổi font chữ toàn bộ sang Times New Roman
- **Mô tả**: Sửa lại cấu hình font chữ hiển thị trên màn hình lịch công tác từ Arial sang Times New Roman cỡ 18 theo đúng yêu cầu, áp dụng đồng bộ cho cả Tiêu đề, Thời gian, Địa điểm, Số giấy mời và Nội dung chi tiết.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/work-schedule/components/SchedulePanels.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sử dụng font Times New Roman cho toàn bộ nội dung lịch hiển thị"`

### [2026-08-07 18:07] Xóa bỏ inline cho đoạn p đầu tiên để sửa lỗi khoảng cách lớn
- **Mô tả**: Sửa lỗi khoảng cách lớn giữa địa điểm và nội dung do class inline làm vỡ flow của DOM. Bỏ class inline, thay vào đó đã cấu hình margin-top/bottom nhỏ trong globals.css giúp các khối p cách nhau rất khít và đẹp mắt.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/work-schedule/components/SchedulePanels.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi khoảng trống lớn giữa tiêu đề và nội dung lịch"`

### [2026-08-07 18:04] Cập nhật CSS để đồng nhất định dạng chữ trong editor
- **Mô tả**: Sửa lỗi giao diện do RichText Editor dính inline style khiến font-size, font-family của Nội dung chi tiết hiển thị không đồng nhất. Bắt buộc !important cho toàn bộ text để về chuẩn font Arial, 18px.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): buộc font-size và font-family đồng nhất cho nội dung editor"`

### [2026-08-07 17:58] Thêm rule cấm chạy lệnh docker-compose sai
- **Mô tả**: Bổ sung luật `LC-RULE-DOCKER-DEPLOYMENT` để AI Agent luôn nhớ dùng cờ `-p lichcongtac` khi thao tác với Docker Compose, tránh làm hỏng các hệ thống proxy chung trên server như sự cố ngày hôm nay.
- **Tệp thay đổi**:
  - `.agents/rules/lc-rule-docker-deployment.md` (Mới)
  - `.agents/AGENTS.md` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "docs: thêm rule bắt buộc sử dụng cờ -p lichcongtac khi dùng docker compose"`

### [2026-08-07 17:54] Sửa lỗi Nginx proxy sập và cấu hình deploy an toàn
- **Mô tả**: 
  1. Fix lỗi `nginx-proxy` (thuộc hệ thống Tool-Calendar) bị crash loop vì không resolve được `host.docker.internal`. Đã sửa trực tiếp trên server VNPT bằng cách hardcode IP `172.17.0.1`.
  2. Cập nhật script `deploy_to_vnpt.sh` thêm cờ `-p lichcongtac` vào các lệnh `docker compose` để tránh xung đột project name với hệ thống Tool-Calendar trên server, ngăn chặn việc restart nhầm container khi deploy.
- **Tệp thay đổi**:
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(infra): chỉ định project name khi deploy để tránh conflict docker-compose"`

### [2026-08-07 17:48] Thay thế Textarea bằng RichTextEditor (mini) cho ô Địa điểm và Phòng ban
- **Mô tả**: Thay thế Textarea nhập tự do cho Địa điểm và Phòng ban bằng RichTextEditor thu nhỏ (có thanh công cụ rút gọn). Cấu hình font chữ mặc định là Times New Roman 18px để đồng bộ với khung soạn thảo chính, theo yêu cầu người dùng.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/ui/rich-text-editor.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/ScheduleForm.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/ScheduleTable.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/work-schedule/components/SchedulePanels.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(ui): thay thế textarea bằng rich text editor mini cho ô địa điểm và phòng ban"`

### [2026-08-07 17:38] Đổi font mặc định của Editor sang Times New Roman cỡ 18
- **Mô tả**: Thay đổi font chữ và cỡ chữ mặc định của khung soạn thảo Rich Text Editor (Nội dung chi tiết) sang Times New Roman và 18px theo yêu cầu. Đồng thời đã chạy lệnh SQL update trực tiếp trên database server để tự động bọc thẻ `<span style="font-family: 'Times New Roman', Times, serif; font-size: 18px;">` cho tất cả các nội dung cũ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/ui/rich-text-editor.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): đổi font chữ mặc định của khung soạn thảo sang Times New Roman cỡ 18"`


### [2026-08-07 17:08] Sửa đường dẫn deploy dứt điểm trên VNPT Server
- **Mô tả**: Gỡ bỏ cấu trúc thư mục lộn xộn cũ trong file deploy (bỏ lệnh cd Tool-Calendar-New/Tool-Calendar/lichcongtac chắp vá). Cố định vị trí triển khai duy nhất trên máy chủ VNPT tại `/root/lichcongtac`. Việc này giúp quá trình đẩy code luôn trỏ đúng về một thư mục chứa dữ liệu gốc, không bao giờ bị lỗi "mất dữ liệu" do nhảy nhầm sang thư mục khác chưa có DB nữa.
- **Tệp thay đổi**:
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(infra): cố định vị trí thư mục deploy duy nhất trên server để tránh thất thoát dữ liệu"`


### [2026-08-07 16:58] Cấu hình Nginx port 80/443 để public web
- **Mô tả**: Sửa cấu hình `docker-compose.yml` trả Nginx về port chuẩn `80:80` và `443:443` (thay vì 8081/8444) để người dùng truy cập trực tiếp tên miền `lichcongtac.vpdtcampha.vn` không bị lỗi kết nối bị từ chối (Connection Refused).
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(infra): đổi port nginx về 80 và 443 để kết nối trực tiếp tên miền"`


### [2026-08-07 16:53] Thêm footer bản quyền vào trang Quản trị (AdminLogin)
- **Mô tả**: Bổ sung thanh footer với nền xanh và nội dung "Bản quyền thuộc về UBND phường Cẩm Phả" vào trang đăng nhập hệ thống Quản trị, giúp đồng bộ thông tin bản quyền với toàn bộ nền tảng thay vì sử dụng footer cũ của hệ thống Link Strategy.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminLogin.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(auth): bổ sung thông tin bản quyền UBND phường Cẩm Phả vào trang Đăng nhập quản trị"`


### [2026-08-07 16:43] Khắc phục lỗi build .NET do file hệ thống macOS (`._*`)
- **Mô tả**: Khi dùng lệnh `tar` để đóng gói code trên macOS, hệ điều hành tự sinh ra các file AppleDouble (`._*`). Các file này bị .NET compiler trên Linux nhận diện nhầm là file mã nguồn C# nhưng định dạng nhị phân, gây ra lỗi build "is a binary file instead of a text file". Đã bổ sung `COPYFILE_DISABLE=1` và loại trừ `._*` trong script `deploy_to_vnpt.sh`.
- **Tệp thay đổi**:
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore(infra): disable macos COPYFILE generation when tar archiving"`

### [2026-08-07 16:42] Sửa script deploy để bỏ qua git trên server do Private Repo
- **Mô tả**: Sửa file `deploy_to_vnpt.sh`. Thay vì chạy `git fetch` trên server VNPT (dẫn đến lỗi do repo mới là Private nên không fetch được), script giờ đây sẽ nén code đang có trên máy bạn, tải trực tiếp qua SCP lên server và giải nén, sau đó build lại Docker. Đảm bảo những gì bạn thấy trên máy sẽ được đẩy thẳng lên server mà không vướng mắc về bản quyền hay khóa xác thực Git.
- **Tệp thay đổi**:
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore(infra): sửa script deploy để upload trực tiếp, bỏ qua git fetch trên server do private repo"`

### [2026-08-07 16:11] Thêm script deploy lên VNPT Server và bỏ qua file secret
- **Mô tả**: Viết lại script `deploy_to_vnpt.sh` để lấy thông tin kết nối SSH từ file `.deploy.env` thay vì hardcode trực tiếp vào script, nhằm tránh lộ thông tin bảo mật (credentials) khi đẩy code lên Github. Thêm `.deploy.env` vào `.gitignore` để Git không theo dõi file này.
- **Tệp thay đổi**:
  - `deploy_to_vnpt.sh` (Mới)
  - `.gitignore` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore(infra): thêm script deploy vnpt và ignore file .deploy.env"`

### [2026-08-07 15:55] Khắc phục giao diện chọn Font và Paste Text trong Tiptap Editor
- **Mô tả**: Sửa lỗi thanh công cụ (toolbar) của trình soạn thảo không hiển thị đúng "Arial" và "18px" khi người dùng nhập liệu bình thường. Thêm tính năng `transformPastedHTML` để tự động loại bỏ các định dạng `font-family` và `font-size` bị lẫn vào khi người dùng copy/paste từ nguồn khác (Word, Web...), giúp đoạn text được dán vào luôn thừa hưởng font mặc định là Arial 18px.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/ui/rich-text-editor.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): hiển thị mặc định arial 18px trên toolbar và xoá định dạng khi paste"`

### [2026-08-07 15:51] Cập nhật font chữ mặc định cho trình soạn thảo văn bản
- **Mô tả**: Thiết lập font chữ mặc định của trình soạn thảo Rich Text Editor (Tiptap) thành Arial, cỡ chữ 18px để đồng bộ giao diện hiển thị và tạo sự thuận tiện cho người dùng khi nhập liệu/copy-paste mà chưa chọn font. Thay đổi này sử dụng CSS global để thiết lập mức mặc định mà không ghi đè cài đặt của người dùng.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/styles/globals.css` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): đặt font mặc định arial 18px cho trình soạn thảo văn bản"`

### [2026-08-07 01:38] chore(infra): cập nhật cấu hình nginx port và thêm rule AI
- **Mô tả**: Thay đổi ánh xạ port của Nginx sang 8081 và 8444 trong docker-compose.yml. Bổ sung rule lc-rule-no-temporary-files.md vào AGENTS.md yêu cầu AI dọn dẹp các tệp tạm, đồng thời xóa các file tài liệu không còn sử dụng.
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi)
  - `.agents/AGENTS.md` (Sửa đổi)
  - `.agents/rules/lc-rule-no-temporary-files.md` (Mới)
  - `CODE_QUALITY.md`, `README.md`, `SYSTEM_FEATURES.md` (Xóa)
- **Lệnh git commit**: `git commit -m "chore(infra): cập nhật cấu hình nginx port và thêm rule AI"`

### [2026-08-06 23:10] Fix lỗi dropdown Font Family không hiển thị đúng font hiện tại
- **Mô tả**: Sửa lỗi ô chọn Phông chữ (Font Family) trong trình soạn thảo TipTap luôn hiển thị "Mặc định" thay vì font chữ thực tế khi click vào đoạn văn bản đã được định dạng. Nguyên nhân do giá trị trả về từ DOM chứa dấu ngoặc kép không khớp với chuỗi trong thẻ option. Đã sử dụng hàm so sánh chuỗi (bỏ ngoặc kép và đối chiếu từ khoá đầu) để sửa lỗi.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/ui/rich-text-editor.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi ô chọn font family không hiển thị đúng font hiện tại"`

### [2026-08-06 23:01] Fix lỗi không xoá trắng khung soạn thảo TipTap
- **Mô tả**: Sửa lỗi khung soạn thảo TipTap không tự reset (xoá trắng) khi React thay đổi giá trị `value` thành chuỗi rỗng (`''`), do điều kiện kiểm tra bên trong `useEffect` bị thiếu. Lỗi này làm các ô nhập liệu cũ vẫn còn khi thêm lịch công tác mới.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/ui/rich-text-editor.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi tiptap editor không xoá trắng dữ liệu khi reset form"`

### [2026-08-06 22:55] Tích hợp bộ soạn thảo TipTap thay thế Jodit
- **Mô tả**: Xoá bỏ Jodit Editor, tích hợp TipTap editor với đầy đủ tính năng chuẩn Word (Font Family, Font Size, Màu sắc, Highlight, Heading, Danh sách...). Đã việt hoá 100% Tooltip khi hover và tối ưu hoá cho mobile. Xoá các file rác như seed_db.sql, config cũ.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/ui/rich-text-editor.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/components/ui/toggle.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/features/notifications/components/NotificationForm.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/ScheduleForm.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `seed_db.sql` (Xóa)
- **Lệnh git commit**: `git commit -m "feat(ui): tích hợp tiptap editor thay thế jodit và xoá file rác"`

### [2026-08-06 17:23] Dọn dẹp các file test/nháp
- **Mô tả**: Xóa các file script dùng để test nháp (`test.cs`, `test_hash.csx`, `test_regex.cs`, `test_settings.js`) để giữ thư mục gốc gọn gàng.
- **Tệp thay đổi**:
  - `test.cs` (Xóa)
  - `test_hash.csx` (Xóa)
  - `test_regex.cs` (Xóa)
  - `test_settings.js` (Xóa)
- **Lệnh git commit**: `git commit -m "chore(infra): xóa các file script test nháp"`

### [2026-08-06 17:21] Dọn dẹp các file Python nháp
- **Mô tả**: Xóa các file script Python dùng để test/nháp (`fix_db.py`, `scratch_clean_db.py`, `scratch_rename.py`) để dọn dẹp thư mục gốc. Các file `*.md` không bị xóa do là tài liệu cấu trúc lõi của dự án.
- **Tệp thay đổi**:
  - `fix_db.py` (Xóa)
  - `scratch_clean_db.py` (Xóa)
  - `scratch_rename.py` (Xóa)
- **Lệnh git commit**: `git commit -m "chore(infra): dọn dẹp các file python nháp không sử dụng"`

### [2026-08-06 03:08] Đồng bộ DatePicker Tiếng Việt cho toàn bộ form
- **Mô tả**: Trên mobile (đặc biệt iOS Safari), thẻ `<input type="date">` mặc định sẽ hiển thị lịch theo ngôn ngữ của hệ điều hành (thường là Tiếng Anh) và không có icon rõ ràng. Đã thay thế toàn bộ `<input type="date">` còn sót lại ở trang Tìm kiếm Lịch (`SearchSchedule.jsx`) và Quản lý Ngày lễ (`HolidayComponents.jsx`) bằng thư viện `react-datepicker` để ép buộc hiển thị Tiếng Việt, có icon lịch, và hỗ trợ popup overlay ở giữa màn hình cho mobile.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi — Thay input native bằng DatePicker)
  - `LichCongTac.Api/ClientApp/src/features/holidays/components/HolidayComponents.jsx` (Sửa đổi — Thay input native bằng DatePicker)
- **Lệnh git commit**: `git commit -m "style(ui): đồng bộ sử dụng react-datepicker tiếng việt cho mọi trường ngày tháng"`


- **Mô tả**: Phát hiện lỗi nghiêm trọng — `apiClient` không bao giờ đính token từ `localStorage` vào header `Authorization: Bearer`. Tất cả API calls đều chỉ dựa vào cookie nên bị 401 ngay từ đầu, kể cả sau khi login thành công. Đây là nguyên nhân gốc rễ khiến modal "Phiên hết hạn" hiện ra ngay sau khi đăng nhập. Đã sửa: tự động đọc `auth_token` từ `localStorage` và gắn vào mọi request.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/lib/apiClient.js` (Sửa đổi — Thêm `Authorization: Bearer` header tự động từ localStorage)
- **Lệnh git commit**: `git commit -m "fix(api): thêm authorization bearer header tự động vào mọi api request từ localstorage"`


- **Mô tả**: Trước đây modal "Phiên hết hạn" hiện ra cả khi người dùng vừa mới click vào khu vực Admin từ trang công khai, gây khó chịu. Nay phân biệt 2 tình huống: (1) Đang làm việc dở trong Admin → hiện Modal tại chỗ để không mất form data. (2) Đang ở trang công khai hoặc vừa vào Admin lần đầu → redirect thẳng về trang Login. Thêm debounce 3 giây để tránh spam nhiều popup cùng lúc.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi — Logic phân luồng `handleUnauthorized` + debounce ref)
- **Lệnh git commit**: `git commit -m "feat(auth): cải tiến ux xử lý phiên hết hạn phân biệt theo context người dùng"`


- **Mô tả**: Khi người dùng cài đặt ứng dụng web ra màn hình chính (PWA/Standalone mode) trên điện thoại, trình duyệt sẽ ẩn đi thanh địa chỉ và nút Back. Điều này khiến họ bị kẹt ở trang Đăng nhập nếu lỡ tay ấn Đăng xuất. Bổ sung nút quay về trang public bên dưới form đăng nhập.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminLogin.jsx` (Sửa đổi — Thêm Link điều hướng về `/campha/`)
- **Lệnh git commit**: `git commit -m "feat(auth): thêm nút quay về lịch công tác ở trang đăng nhập hỗ trợ pwa"`


### [2026-08-06 02:35] Fix lỗi Modal "Phiên hết hạn" hiển thị vô lý khi Đăng xuất / Đăng nhập
- **Mô tả**: Bổ sung điều kiện chặn trong Global Event Listener `auth:unauthorized` của AuthContext. Nếu URL hiện tại đang ở trang Đăng nhập (`/login`) hoặc nếu LocalStorage đã bị xóa token (tức là người dùng chủ động ấn Đăng xuất) thì sẽ BỎ QUA sự kiện lỗi 401, không hiển thị cái Modal yêu cầu đăng nhập lại nữa.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi — Thêm câu lệnh IF chặn luồng `handleUnauthorized`)
- **Lệnh git commit**: `git commit -m "fix(auth): chặn hiển thị modal phiên hết hạn khi đang ở trang login hoặc khi ấn đăng xuất"`


### [2026-08-06 02:30] Fix lỗi "Sai tài khoản hoặc mật khẩu" ở Modal đăng nhập lại
- **Mô tả**: Bỏ sót logic bóc tách dữ liệu phản hồi trong Modal đăng nhập lại (AuthContext). Dù backend đăng nhập thành công và trả về `token`, `username`, `role` nhưng code cũ lại kiểm tra `if (data.user)` dẫn đến hiểu nhầm là lỗi và chặn đăng nhập. Đã sửa lại khớp với cấu trúc API.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi — Sửa logic parse response `authService.login`)
- **Lệnh git commit**: `git commit -m "fix(auth): sửa lỗi báo sai mật khẩu do đọc sai định dạng phản hồi api tại modal"`


- **Mô tả**: Bổ sung icon con mắt (`Eye` / `EyeOff` từ `lucide-react`) cho phép người dùng click để xem/ẩn mật khẩu đang gõ tại Modal đăng nhập lại khi hết hạn phiên, giúp tránh gõ sai mật khẩu.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi — Thêm state `showModalPassword` và icon toggle)
- **Lệnh git commit**: `git commit -m "feat(auth): thêm icon hiển thị mật khẩu ở modal phiên đăng nhập hết hạn"`


- **Mô tả**: Mặc định thư viện `sonner` không có nút tắt (X) trên các thông báo (toast), khiến người dùng phải đợi hết thời gian timeout mới tắt được. Fix: Thêm thuộc tính `closeButton` vào component `<Toaster />` ở root (main.jsx) để bật nút tắt cho toàn cục.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi — thêm `closeButton` vào `<Toaster />`)
- **Lệnh git commit**: `git commit -m "feat(ui): thêm nút tắt (close button) cho tất cả toast notification"`


- **Mô tả**: Khi người dùng nhấn Đăng xuất, thư viện `sonner` tạo ra một toast loading nhưng không được dismiss đúng cách khi chuyển trang, dẫn đến việc toast này quay vô tận ở màn hình Đăng nhập. Fix: Gắn ID cho toast loading và truyền ID đó cho toast success để ghi đè (resolve) nó.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi — truyền `id` vào `toast.success`)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi toast đăng xuất quay vô tận không tự tắt"`


- **Mô tả**: `apiClient.js` không tự động gắn `Content-Type: application/json` khi gửi body JSON → backend ASP.NET Core nhận request thiếu header, trả 415. Fix: tự động detect khi `body` là string (kết quả `JSON.stringify`) thì gắn header trước khi fetch.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/lib/apiClient.js` (Sửa đổi — thêm auto Content-Type header)
- **Lệnh git commit**: `git commit -m "fix(api): tự động gắn Content-Type: application/json khi body là JSON string"`


- **Mô tả**: Tìm ra 3 nguyên nhân gốc khiến trang public (WorkSchedule/SearchSchedule) không tự cập nhật khi Admin thêm lịch: (1) `/appHub` bị `RequireRateLimiting("fixed")` → 50 req/10s/IP, nhiều user qua ngrok cùng IP → bị chặn; (2) Frontend dùng `skipNegotiation:true + WebSocket only` → mobile/ngrok thường block WebSocket → không fallback được; (3) Nginx không có `location` riêng cho `/appHub` → đi qua location chung với `proxy_read_timeout 300s` → WebSocket bị đứt sau 5 phút.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Program.cs` (Sửa đổi — xóa `.RequireRateLimiting("fixed")` khỏi `MapHub`)
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi — bỏ skipNegotiation + WebSocket-only, thêm retry delays 2/5/10/30s)
  - `nginx/conf.d/default.conf` (Sửa đổi — thêm location `/appHub` và `/campha/appHub` với timeout 3600s)
- **Lệnh git commit**: `git commit -m "fix(notify): sửa SignalR bị đứt do rate limit + WebSocket-only + thiếu nginx location /appHub"`


### [2026-08-06 01:50] Refactor TOÀN BỘ Frontend theo chuẩn Bulletproof React / Feature-Sliced Design
- **Mô tả**: Tái cấu trúc toàn bộ 8 page components (tổng ~2500 dòng) thành cấu trúc Feature-Sliced Design. Mỗi page rút gọn xuống còn ~80-130 dòng bằng cách tách logic render vào `src/features/{feature}/components/`. Bổ sung `PublicLayout` dùng chung cho WorkSchedule & SearchSchedule, tránh duplicate 80+ dòng header/nav/footer. Tách `PasswordStrengthBar` thành component tái sử dụng trong `src/features/auth/components/`.

- **Tệp thay đổi**:
  - `src/features/accounts/components/AccountForm.jsx` (Mới — Form tài khoản Admin)
  - `src/features/accounts/components/AccountTable.jsx` (Mới — Bảng danh sách tài khoản)
  - `src/features/employees/components/EmployeeForm.jsx` (Mới — Form nhân viên với ZaloId)
  - `src/features/employees/components/EmployeeTable.jsx` (Mới — Bảng nhân viên)
  - `src/features/departments/components/DepartmentForm.jsx` (Mới — Form phòng ban)
  - `src/features/departments/components/DepartmentTable.jsx` (Mới — Bảng phòng ban)
  - `src/features/holidays/components/HolidayComponents.jsx` (Mới — HolidayForm + HolidayTable)
  - `src/features/notifications/components/NotificationForm.jsx` (Mới — Form thông báo + Jodit)
  - `src/features/notifications/components/NotificationTable.jsx` (Mới — Bảng + phân trang)
  - `src/features/auth/components/PasswordStrengthBar.jsx` (Mới — Tách từ AdminChangePassword)
  - `src/shared/components/PublicLayout.jsx` (Mới — Layout chung header+nav+footer công khai)
  - `src/pages/AdminAccounts.jsx` (Sửa đổi — 383→120 dòng)
  - `src/pages/AdminEmployees.jsx` (Sửa đổi — 385→122 dòng)
  - `src/pages/AdminDepartments.jsx` (Sửa đổi — 249→96 dòng)
  - `src/pages/AdminHolidays.jsx` (Sửa đổi — 265→103 dòng)
  - `src/pages/AdminNotifications.jsx` (Sửa đổi — 343→105 dòng)
  - `src/pages/AdminChangePassword.jsx` (Sửa đổi — 290→172 dòng)
  - `src/pages/WorkSchedule.jsx` (Sửa đổi — 374→178 dòng)
  - `src/pages/SearchSchedule.jsx` (Sửa đổi — 402→203 dòng)
- **Lệnh git commit**: `git commit -m "refactor(fe): tái cấu trúc toàn bộ pages theo Feature-Sliced Design (bulletproof-react)"`

### [2026-08-06 01:35] Tái cấu trúc AdminSchedules theo Feature-Sliced Design + Hiệu ứng Logout
- **Mô tả**: Tách file `AdminSchedules.jsx` khổng lồ (722 dòng) thành 3 component con độc lập theo chuẩn Bulletproof React / Feature-Sliced Design. Mỗi component con tự quản lý render của riêng mình, tránh re-render toàn trang khi thay đổi nhỏ. Đồng thời cải thiện UX đăng xuất bằng toast loading 1.5s thay vì chuyển trang đột ngột.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/ScheduleForm.jsx` (Mới — Form thêm/sửa lịch, ~230 dòng)
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/ScheduleTable.jsx` (Mới — Bảng danh sách, ~110 dòng)
  - `LichCongTac.Api/ClientApp/src/features/schedules/components/SchedulePagination.jsx` (Mới — Phân trang, ~70 dòng)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi — Rút gọn từ 722 → ~170 dòng)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi — Thêm toast loading khi logout)
- **Lệnh git commit**: `git commit -m "refactor(docs): tách AdminSchedules thành Feature-Sliced components + logout UX"`

### [2026-08-02 23:30] Tối ưu hóa truy vấn Database, loại bỏ SELECT *
- **Mô tả**: Thay thế toàn bộ các câu lệnh `SELECT *` bằng việc liệt kê rõ các cột cụ thể trong các repository (`DepartmentRepository` và `ScheduleRepository`). Điều này giúp cải thiện hiệu năng I/O bộ nhớ và tuân thủ chặt chẽ kiến trúc backend của dự án, tránh load dữ liệu dư thừa.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/DepartmentRepository.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/ScheduleRepository.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "perf(db): tối ưu truy vấn thay thế SELECT * bằng cột cụ thể trong Repositories"`

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

### [2026-08-02 22:40] Sửa lỗi hiển thị dấu hai chấm cho khoảng trắng trong lịch
- **Mô tả**: Fix lỗi render dấu hai chấm ở startTime khi giá trị trong DB là khoảng trắng.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi hiển thị khoảng trắng khi lịch không có startTime"`

### [2026-08-03 17:51] Cập nhật DatePicker thuần Việt cho lịch công tác
- **Mô tả**: Thay thế 2 input (date, time) mặc định của trình duyệt thành 1 component `react-datepicker` duy nhất để hiển thị chuẩn định dạng ngày giờ Việt Nam (Ngày/Tháng/Năm Giờ:Phút). Cài thêm thư viện `react-datepicker`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/package.json` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(ui): tích hợp react-datepicker cho quản lý lịch công tác chuẩn Việt Nam"`

### [2026-08-03 17:54] Căn lề và chỉnh màu lịch công tác
- **Mô tả**: Căn giữa tiêu đề ngày tháng của các lịch sắp tới, thay đổi màu sắc và tăng kích thước chữ của các mục: thời gian (đỏ), số giấy mời (xanh lục), địa điểm (xanh lam) để dễ nhìn hơn cho người lớn tuổi.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): can giua tieu de ngay va doi mau cac truong chi tiet"`

### [2026-08-04 14:41] Cập nhật đường dẫn DB và ignore launchSettings.json
- **Mô tả**: Sửa DB_PATH trong launchSettings.json về đúng thư mục của máy cục bộ và đưa tệp này vào .gitignore để tránh conflict đường dẫn cục bộ khi deploy ở các máy khác nhau.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Properties/launchSettings.json` (Xóa khỏi git track)
  - `.gitignore` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore: sua db path va ignore launchSettings.json tranh conflict local"`

### [2026-08-05 20:52] Triển khai tính năng Realtime Update với SignalR
- **Mô tả**: Bổ sung lại cấu hình SignalR trên backend và tích hợp vào frontend qua hook `useSignalR.js`. Tính năng giúp giao diện người dùng và Admin tự động tải lại dữ liệu (Lịch công tác, Ngày lễ) mỗi khi có thay đổi (Create/Update/Delete) mà không cần reload trang.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Hubs/AppHub.cs` (Mới)
  - `LichCongTac.Api/Program.cs` (Sửa đổi: Thêm AddSignalR và MapHub)
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Sửa đổi: Gọi sự kiện ReceiveScheduleUpdate qua IHubContext)
  - `LichCongTac.Api/Controllers/HolidaysController.cs` (Sửa đổi: Gọi sự kiện ReceiveHolidayUpdate qua IHubContext)
  - `LichCongTac.Api/ClientApp/src/hooks/useSignalR.js` (Mới)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi: Lắng nghe SignalR event)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi: Lắng nghe SignalR event)
  - `LichCongTac.Api/ClientApp/src/pages/AdminHolidays.jsx` (Sửa đổi: Lắng nghe SignalR event)
- **Lệnh git commit**: `git commit -m "feat(api, ui): implement real-time data updates via SignalR for schedules and holidays"`

### [2026-08-05 20:56] Tái cấu trúc (Refactor) Real-time Updates bằng React Context
- **Mô tả**: Áp dụng chuẩn công nghiệp cho tính năng realtime bằng cách sử dụng Global Context (`SignalRProvider`). Thay vì mỗi component tự tạo 1 kết nối (gây nghẽn mạng), nay toàn bộ hệ thống sử dụng chung 1 kết nối duy nhất qua Context. Các components chỉ cần lắng nghe sự thay đổi của biến state (`lastScheduleUpdate`, `lastHolidayUpdate`) để cập nhật UI.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/hooks/useSignalR.js` (Xóa)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi: Bọc toàn app bằng SignalRProvider)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi: Sử dụng context)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi: Sử dụng context)
  - `LichCongTac.Api/ClientApp/src/pages/AdminHolidays.jsx` (Sửa đổi: Sử dụng context)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi: Sử dụng context)
- **Lệnh git commit**: `git commit -m "refactor(ui): apply global context for signalr connections to optimize performance"`

### [2026-08-05 21:05] Đại tu Kiến trúc Frontend (Best Practice)
- **Mô tả**: Áp dụng chuẩn công nghiệp (Best Practice) cho Frontend:
  1. Tích hợp `react-router-dom` v6, thay thế toàn bộ logic điều hướng nguyên thủy bằng `window.location`. Hệ thống đã chính thức trở thành Single Page Application (SPA).
  2. Áp dụng `AuthContext` (Global State) để quản lý token và thông tin người dùng, loại bỏ việc đọc trực tiếp `localStorage` thủ công ở hàng loạt các component.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Mới)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi: Tích hợp Router và AuthProvider)
  - `LichCongTac.Api/ClientApp/src/pages/*` (Sửa đổi: Dùng useAuth và useNavigate trên toàn bộ trang Admin và Public)
  - `LichCongTac.Api/ClientApp/src/components/AdminHeader.jsx` (Sửa đổi: Chuyển thẻ `a` sang `<Link>`)
  - `LichCongTac.Api/ClientApp/src/lib/push-notifications.js` (Sửa đổi: Nhận token từ hàm thay vì đọc localStorage trực tiếp)
- **Lệnh git commit**: `git commit -m "refactor(ui): implement react-router-dom and auth context for spa architecture"`

### [2026-08-05 21:18] Cấu hình chiến lược gộp mã (Merge Strategy) an toàn cho Commit Log
- **Mô tả**: Thiết lập thuộc tính `merge=union` cho tệp `COMMIT_LOG.md` trong `.gitattributes`. Điều này ngăn chặn vĩnh viễn việc Git tự động xóa bỏ các dòng log khi có hai nhánh cùng ghi thêm văn bản vào cuối tệp. Git sẽ luôn giữ lại cả hai phần bổ sung thay vì ưu tiên nhánh remote.
- **Tệp thay đổi**:
  - `.gitattributes` (Sửa đổi: Bổ sung cấu hình merge cho COMMIT_LOG.md)
- **Lệnh git commit**: `git commit -m "chore(git): configure union merge strategy for COMMIT_LOG.md to prevent append conflicts"`
### [2026-08-05 22:00] Khắc phục 3 Lỗi Ẩn (Hidden Bugs) Nghiêm trọng
- **Mô tả**: Xử lý triệt để 3 lỗi tiềm ẩn trong kiến trúc có thể gây sập hệ thống:
  1. Fix `database is locked` của SQLite bằng cách kích hoạt chế độ WAL (Write-Ahead Logging) và đặt Timeout=5.
  2. Implement cơ chế **Refresh Token** (cả Backend và Frontend) để duy trì phiên đăng nhập mà không bị out đột ngột khi JWT hết hạn (7 ngày cho refresh, 24 giờ cho JWT).
  3. Implement **Optimistic Concurrency Write** để chống ghi đè dữ liệu. Thêm trường `UpdatedAt` vào quy trình update `Schedules`, check version ở DB bằng `datetime` và tự động trả `409 Conflict` về frontend khi 2 người dùng sửa cùng 1 lúc, hiển thị thông báo yêu cầu tải lại trang.
- **Tệp thay đổi**:
  - `data_dump/documents.db` (Sửa đổi: bật chế độ WAL và thêm cột RefreshToken vào bảng Users)
  - `LichCongTac.Core/Models/UserModels.cs` (Sửa đổi: thêm RefreshToken fields)
  - `LichCongTac.Core/Data/Interfaces/IUserRepository.cs` (Sửa đổi: thêm UpdateRefreshToken)
  - `LichCongTac.Core/Data/Repositories/UserRepository.cs` (Sửa đổi: thêm logic UpdateRefreshToken)
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi: thêm endpoint /refresh và generate refresh token)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi: quản lý refresh_token)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi: tự động làm mới token trên interceptor khi nhận lỗi 401)
  - `LichCongTac.Api/ClientApp/src/pages/AdminLogin.jsx` (Sửa đổi: lưu trữ refreshToken)
  - `LichCongTac.Core/Models/ScheduleModels.cs` (Sửa đổi: thêm trường UpdatedAt vào UpdateDto)
  - `LichCongTac.Core/Models/UpdateResult.cs` (Mới: Enum trả về các trường hợp update)
  - `LichCongTac.Core/Data/Interfaces/IScheduleRepository.cs` (Sửa đổi: thay đổi return type)
  - `LichCongTac.Core/Data/Repositories/ScheduleRepository.cs` (Sửa đổi: logic Optimistic Concurrency Check)
  - `LichCongTac.Api/Controllers/SchedulesController.cs` (Sửa đổi: trả 409 Conflict)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi: truyền UpdatedAt vào payload update)
- **Lệnh git commit**: `git commit -m "fix(core): xử lý triệt để lỗi khóa database, bổ sung refresh token và optimistic concurrency"`


### [2026-08-05 22:05] Cải tiến Trải nghiệm người dùng: Modal Đăng nhập tại chỗ
- **Mô tả**: Sửa đổi hành vi khi hết hạn toàn bộ token (cả access token và refresh token). Thay vì sử dụng `window.location.href` để điều hướng ép buộc về trang đăng nhập làm mất toàn bộ dữ liệu đang nhập dở trong state, hệ thống nay sẽ hiển thị một Modal đăng nhập (Popup) ngay tại giao diện hiện tại. Người dùng có thể đăng nhập lại ngay lập tức và tiếp tục bấm "Lưu" form mà không bị mất bất kỳ dữ liệu nào.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi: Thêm component Modal Đăng nhập nội tuyến)
- **Lệnh git commit**: `git commit -m "feat(auth): hiển thị modal đăng nhập tại chỗ khi hết hạn phiên thay vì redirect để giữ nguyên dữ liệu form"`

### [2026-08-05 22:25] Nâng cấp cảnh giới Request Queue cho Hệ thống Auth
- **Mô tả**: Implement tính năng Hàng đợi Request (Request Queue) cho Modal Đăng nhập. Ở phiên bản trước, khi token hết hạn và người dùng đăng nhập lại qua Modal, họ vẫn phải bấm nút "Lưu" thêm một lần nữa. Với bản nâng cấp này:
  1. Khi gặp lỗi 401, Interceptor sẽ đóng băng luồng `fetch` bằng một `Promise` và tống request bị lỗi vào Hàng đợi.
  2. Phát sự kiện `auth:unauthorized` để hiện Modal Đăng nhập.
  3. Sau khi người dùng gõ Pass và ấn Login, Modal phát sự kiện `auth:login_success` kèm theo Token mới.
  4. Interceptor bắt được sự kiện này, lấy Token mới gắn đè vào Header của các Request đang bị đóng băng và tự động "bung" chúng chạy tiếp.
  Người dùng hoàn toàn không cần thao tác lại, dữ liệu tự động lưu và báo thành công.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi: Khởi tạo failedRequestQueue và Promise wrapper)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi: Bổ sung phát sự kiện auth:login_success và auth:login_cancel)
- **Lệnh git commit**: `git commit -m "feat(auth): implement request queue to auto retry failed requests after modal login"`

### [2026-08-05 23:05] Nâng cấp Bảo mật Session (HttpOnly Refresh Token & Token Revocation)
- **Mô tả**: Vá hoàn toàn lỗ hổng bảo mật liên quan đến vòng đời của Refresh Token:
  1. Gắn Refresh Token vào HttpOnly Cookie thay vì trả về qua JSON (Chống tấn công XSS).
  2. Bổ sung cơ chế Revoke Token: Thu hồi (xóa) Refresh Token trong DB khi người dùng gọi API Đăng xuất hoặc Đổi mật khẩu. Chống lỗ hổng "Ghost Session" khi mật khẩu đã đổi nhưng Token cũ vẫn sống.
  3. Cập nhật Interceptor trên Frontend: Tự động đính kèm HttpOnly Cookie khi gọi `/api/auth/refresh` và loại bỏ hoàn toàn `localStorage` cho refresh token.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi: Đổi luồng trả cookie, thêm [Authorize] và logic Revoke cho Logout/ChangePassword)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi: Gỡ bỏ localStorage.setItem('refresh_token'), gọi API Logout ngầm)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi: Đọc cookie ngầm, thêm credentials: 'include')
- **Lệnh git commit**: `git commit -m "security(auth): move refresh token to httponly cookie and revoke token in db on logout/password change"`

### [2026-08-05 23:08] Thêm tính năng Cảnh báo Đăng nhập Đồng thời (Concurrent Login)
- **Mô tả**: Xử lý kịch bản hai người dùng đăng nhập cùng một tài khoản. Khi người thứ 2 đăng nhập thành công, hệ thống tự động đổi `SecurityStamp` và `RefreshToken` trong DB. Khi người thứ 1 thao tác, Token cũ bị từ chối (401), hệ thống cố gắng chạy Refresh Token nhưng phát hiện Token không khớp trong DB -> Trả về thông báo lỗi cụ thể. Frontend bắt thông báo này và hiển thị lên Modal Đăng nhập tại chỗ để cảnh báo người dùng.
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi: Bắt lỗi RefreshToken không khớp)
  - `LichCongTac.Api/ClientApp/src/main.jsx` (Sửa đổi: Đọc error message từ refresh api và đẩy vào event)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi: Nhận thông báo linh động từ event detail)
- **Lệnh git commit**: `git commit -m "feat(auth): display specific warning message on concurrent login via modal"`

### [2026-08-05 23:11] Tinh chỉnh câu thông báo Concurrent Login
- **Mô tả**: Thay đổi câu chữ cảnh báo đăng nhập đồng thời thành ngôn ngữ thân thiện, dễ hiểu hơn dành cho người lớn tuổi ("Tài khoản của bạn vừa được đăng nhập trên một máy tính hoặc điện thoại khác. Vui lòng đăng nhập lại để tiếp tục làm việc ở máy này.").
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi: Đổi nội dung chuỗi trả về)
- **Lệnh git commit**: `git commit -m "style(auth): update concurrent login message to be friendlier"`

### [2026-08-05 23:13] Tinh chỉnh câu thông báo Concurrent Login
- **Mô tả**: Rút gọn thông báo "trên máy tính hoặc điện thoại khác" thành "trên thiết bị khác".
- **Tệp thay đổi**:
  - `LichCongTac.Api/Controllers/AuthController.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(auth): shorten concurrent login message to thiet bi khac"`

### [2026-08-06 00:43] Refactor toàn bộ Frontend dùng Services và apiClient
- **Mô tả**: Loại bỏ toàn bộ `fetch` thủ công trong các components. Áp dụng kiến trúc Repository Pattern cho Frontend, phân tách logic API ra các file services (`admin.service.js`, `schedule.service.js`, `auth.service.js`, `notification.service.js`) dùng chung thư viện `apiClient.js`. Đảm bảo tự động đính kèm token, xử lý refresh token và chuẩn hóa response `ApiResponse<T>`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/services/admin.service.js` (Mới/Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/services/schedule.service.js` (Mới/Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/services/auth.service.js` (Mới/Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/services/notification.service.js` (Mới/Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminAccounts.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminEmployees.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminDepartments.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminHolidays.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminNotifications.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminChangePassword.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/AdminLogin.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/contexts/AuthContext.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/lib/push-notifications.js` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/lib/apiClient.js` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "refactor(api): chuyển toàn bộ frontend sang dùng apiClient và services pattern"`
# # #   [ 2 0 2 6 - 0 8 - 0 6   1 1 : 1 6 ]   F i x   u n s t a b l e   s c h e d u l e   l i s t   a n d   s t o p   b r o w s e r   c a c h i n g 
 -   * * M    t * * :   T t   b   m   c a   t r  n h   d u y t   c h o   A P I   p u b l i c - s c h e d u l e   t r o n g   a p i C l i e n t . j s     t r  n h   v i c   t i   l i   c  c   l c h      b   x  a   h o c   s a   ( g  y   r a   h i n   t n g   t h n h   t h o n g   h i n   c  c   l c h   s a i   n h   1 1 7 5 ) .   C p   n h t   h  m   s o r t   t r o n g   W o r k S c h e d u l e . j s x     c    c   c h   f a l l b a c k   s a n g   s p   x p   t h e o   I d   n u   t h i   g i a n   b n g   n h a u ,   g i  p   d a n h   s  c h   k h  n g   b   ' n h y   l u n g   t u n g ' . 
 -   * * T p   t h a y   i * * : 
     -   L i c h C o n g T a c . A p i / C l i e n t A p p / s r c / l i b / a p i C l i e n t . j s   ( S a   i ) 
     -   L i c h C o n g T a c . A p i / C l i e n t A p p / s r c / p a g e s / W o r k S c h e d u l e . j s x   ( S a   i ) 
 -   * * L n h   g i t   c o m m i t * * :   " g i t   c o m m i t   - m   ' f i x ( a p i ) :   d i s a b l e   b r o w s e r   c a c h i n g   f o r   s c h e d u l e   a p i   a n d   i m p l e m e n t   s t a b l e   s o r t   i n   W o r k S c h e d u l e . j s x ' 
 
 " 
 
 
### [2026-08-06 12:10] Fix Database Schema cho tinh nang Login
- **Mo ta**: Fix loi SQL exception 'no such column: u.RefreshToken' do bang Users thieu cot RefreshToken va RefreshTokenExpiryTime. Da them truc tiep vao DB.
- **Tep thay doi**:
  - data_dump/documents.db (Sua doi schema)
  - COMMIT_LOG.md (Cap nhat log)
- **Lenh git commit**: git commit -m "fix(db): them cot RefreshToken vao bang Users"

### [2026-08-06 22:00] Dọn dẹp file thừa
- **Mô tả**: Xóa file `seed_db.sql` và `Program.cs` gốc không thuộc thư mục code dự án (file nháp) theo yêu cầu của user. Đã xóa cả trên máy Mac và server.
- **Tệp thay đổi**:
  - `seed_db.sql` (Xóa)
  - `Program.cs` (Xóa)
- **Lệnh git commit**: `git commit -m "chore: dọn dẹp các file thừa theo yêu cầu"`

### [2026-08-08 09:36] Fix NotificationRepository crash and update deploy script
- **Mô tả**: Sửa lỗi crash (SQLite Error 1: 'no such column: UpdatedAt') trong hệ thống Lịch Công Tác. Xóa cột UpdatedAt khỏi câu truy vấn SELECT trong NotificationRepository do bảng Notifications không có cột này. Đồng thời update file deploy_to_vnpt.sh không dùng 'docker compose down' để đảm bảo an toàn cho nginx.
- **Tệp thay đổi**:
  - `LichCongTac.Core/Data/Repositories/NotificationRepository.cs` (Sửa đổi)
  - `deploy_to_vnpt.sh` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(notifications): remove missing UpdatedAt column from SQL queries"`

### [2026-08-08 09:45] Add UpdatedAt to Notifications table
- **Mô tả**: Thiết kế DB chuẩn chỉnh theo yêu cầu, thêm cột UpdatedAt vào bảng Notifications của Lịch Công Tác để lưu vết thời gian sửa đổi (về sau có thể hiển thị trên giao diện).
- **Tệp thay đổi**:
  - `data_dump/documents.db` (Sửa đổi schema SQLite)
  - `LichCongTac.Core/Models/Notification.cs` (Sửa đổi)
  - `LichCongTac.Core/Data/Repositories/NotificationRepository.cs` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(notifications): add UpdatedAt column to track modification time"`

### [2026-08-09 21:35] Fix SignalR context and Update UI Text
- **Mô tả**: Xử lý triệt để lỗi race condition trong SignalR và bắt lỗi 401 Unauthorized khi reconnect để hiển thị modal đăng nhập lại; Đồng thời đổi nhãn menu "HOME" thành "TRANG CHỦ".
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/contexts/SignalRContext.jsx` (Sửa đổi)
  - `LichCongTac.Api/ClientApp/src/shared/components/PublicLayout.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): change HOME to TRANG CHỦ and fix signalr 401 reconnect"`

### [2026-08-11 10:30] Reduce spacing in WorkSchedule UI
- **Mô tả**: Giảm khoảng cách (dãn dòng) giữa các dòng trong lịch công tác. Đổi `leading-relaxed` thành `leading-snug`, giảm margin của các thẻ `<p>` bên trong `.prose` và giảm khoảng cách giữa các khối `space-y-3` thành `space-y-2` để giao diện trông gọn gàng hơn.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): reduce line height and spacing in work schedule"`

### [2026-08-11 10:39] Aggressively reduce WorkSchedule margins
- **Mô tả**: Fix lỗi dãn dòng quá rộng bằng cách force 0 margin cho tất cả các thẻ `<p>`, `<ul>`, `<ol>`, `<li>` bên trong `.prose` của nội dung lịch công tác bằng arbitrary variants của Tailwind. Giảm tiếp `leading-snug` thành `leading-tight`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): force zero margin on schedule content to fix spacing"`

### [2026-08-11 10:48] Remove prose class from WorkSchedule
- **Mô tả**: Bỏ hoàn toàn class `.prose` khỏi giao diện hiển thị Lịch Công Tác do `@tailwindcss/typography` tự động override line-height và margin. Sử dụng CSS thô (`[&_p]:m-0`) và thêm style cơ bản cho list để đoạn văn nội dung dính sát hoàn toàn lên dòng phía trên, giữ nguyên `leading-tight`.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): remove prose to fix excessive spacing in schedule content"`
### [2026-08-17 23:33] Fix UI rendering logic for SearchSchedule
- **Mô tả**: Sửa lỗi trang Tìm kiếm không render dữ liệu (do parse sai response từ api).
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "fix(ui): sửa lỗi hiển thị kết quả tìm kiếm lịch công tác"`
### [2026-08-17 23:39] Fix DatePicker overflow issue in SearchSchedule
- **Mô tả**: Bỏ thuộc tính `overflow-hidden` ở thẻ form để popup DatePicker không bị cắt mất phần dưới.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/SearchSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): sửa lỗi popup lịch chọn ngày bị cắt lẹm ở trang tìm kiếm"`
### [2026-08-19 15:23] Trim whitespace for Giấy mời số and remove trailing/leading empty lines in Nội dung chi tiết
- **Mô tả**: Khi người dùng nhập liệu form Quản trị lịch, đôi khi họ vô tình nhập thừa khoảng trắng ở Giấy mời số hoặc để lại dòng trống ở Nội dung chi tiết. Thêm logic xóa khoảng trắng và dòng trống ở đầu/cuối của 2 trường này trước khi submit.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/AdminSchedules.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "feat(admin): tự động trim Giấy mời số và xóa dòng trống trong Nội dung chi tiết"`

### [2026-08-20 15:44] Thêm giới hạn tài nguyên Docker
- **Mô tả**: Bổ sung `mem_limit` và `cpus` cho lichcongtac-backend để chống OOM server.
- **Tệp thay đổi**:
  - `docker-compose.yml` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "chore(infra): add docker resource limits for backend"`
### [2026-08-21 00:01] Cập nhật hiển thị thứ cho mục Hôm nay
- **Mô tả**: Bổ sung hiển thị ngày trong tuần (Thứ hai, Thứ ba...) cho nhãn Hôm nay trên trang lịch công tác để hiển thị chi tiết giống với yêu cầu.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "style(ui): bổ sung hiển thị thứ trong tuần cho mục hôm nay trên trang lịch công tác"`
### [2026-08-25 10:05] Cập nhật logic múi giờ lấy lịch công tác
- **Mô tả**: Ép sử dụng múi giờ Việt Nam (Asia/Ho_Chi_Minh) cho frontend để đồng nhất khái niệm "Hôm nay" không phụ thuộc múi giờ thiết bị và truyền tham số startDate, endDate để tối ưu hóa truy vấn Backend.
- **Tệp thay đổi**:
  - `LichCongTac.Api/ClientApp/src/pages/WorkSchedule.jsx` (Sửa đổi)
- **Lệnh git commit**: `git commit -m "perf(schedule): ép múi giờ Việt Nam và truyền params lấy lịch công tác"`
