# LC-RULE-SENIOR-DEVELOPER-GUIDELINES

Quy tắc này tổng hợp 20 năm kinh nghiệm phát triển web và server-side. AI Agent **phải** lấy quy tắc này làm tiêu chuẩn cốt lõi khi tạo tính năng mới, sửa lỗi hoặc deploy, nhằm tránh tuyệt đối các "bom nổ chậm" trong vận hành thực tế.

## 1. Hạ tầng & Deploy (Infrastructure & Deployment)
- **Log Rotation**: Mọi container Docker phải cấu hình log rotation (`max-size: 10m`, `max-file: 3`) để tránh file log phình to làm đầy ổ cứng server, dẫn đến sập web (nginx content length mismatch).
- **Tránh Xung Đột Cổng (Port Conflict)**: Không bao giờ bind cứng port 80/443 ở container cục bộ nếu server đã có Reverse Proxy tổng (ví dụ Nginx Proxy Manager). Phải thiết kế project theo cấu trúc mạng lưới (docker networks) phù hợp.
- **Dọn Dẹp Server (Disk Space)**: Trước khi deploy bản mới, luôn lưu ý dung lượng máy chủ. Cảnh báo user nếu có nguy cơ đầy ổ (do cache build hoặc docker images cũ). Cấm mọi tính năng upload file không có rào chắn dung lượng tối đa.

## 2. Quản lý Bộ nhớ & Tối ưu Backend (C# & DB)
- **Tuyệt đối không rò rỉ kết nối DB (Connection Leaks)**: Khi dùng ADO.NET, **BẮT BUỘC** phải bọc `SqliteConnection`, `SqliteCommand`, `SqliteDataReader` trong khối `using`. Quên điều này sẽ làm server sập sau vài ngày do cạn kiệt Connection Pool.
- **Tránh tải dữ liệu hàng loạt không kiểm soát (OOM - Out of Memory)**: Không bao giờ trả về toàn bộ dữ liệu bảng (VD: `.ToList()` toàn bộ user, toàn bộ log). Phải luôn phân trang (Pagination) hoặc giới hạn số dòng (LIMIT/TOP).
- **Phòng chống N+1 Queries**: Khi load một danh sách (Ví dụ: danh sách công văn), cấm chạy vòng lặp for/foreach để query chi tiết từng dòng. Phải dùng `JOIN` hoặc query gộp ngay từ DB.
- **Bắt mọi ngoại lệ (Global Exception Handling)**: Không bao giờ để lỗi chưa bắt (Unhandled Exception) rò rỉ ra ngoài API, dẫn đến API crash. Phải có Global Middleware để luôn trả về `ApiResponse<T>.Fail()`.

## 3. Quản lý Vòng đời & UX Frontend (React/JS)
- **Chống rò rỉ bộ nhớ UI (Memory/Event Leaks)**: Mọi `useEffect` đăng ký event (SignalR, setInterval, addEventListener) **BẮT BUỘC** phải có hàm cleanup `return () => {...}` để dọn dẹp khi component Unmount.
- **Xử lý Graceful Degradation (Che chắn lỗi UI)**: Khi gọi API thất bại (mất mạng, server bảo trì), không bao giờ hiển thị màn hình trắng hoặc thông báo sai sự thật (vd: "Không có dữ liệu"). Phải bắt lỗi `catch` và hiển thị Error Box rõ ràng cho user.
- **Chống thao tác chập chờn (Debounce & Disable)**: Mọi form submit hoặc nút lưu dữ liệu phải disable ngay lập tức (loading state) sau lần click đầu tiên để tránh duplicate requests (người dùng bấm spam 10 lần). Các ô tìm kiếm phải có Debounce.

## 4. Bảo mật (Security & Secrets)
- Cấm để API Key, Connection String, Password nguyên bản trong mã nguồn.
- Validate chặt chẽ dữ liệu đầu vào. Đề phòng XSS khi render nội dung có HTML (chỉ dùng `dangerouslySetInnerHTML` khi đã sanitize hoặc tin tưởng tuyệt đối nguồn dữ liệu).

> [!WARNING]
> Mọi dòng code AI Agent sinh ra phải đi qua bộ lọc của 4 nguyên tắc trên. Bất kỳ đoạn code nào vi phạm sẽ bị đánh giá là **FAIL**.

---
**Status:** ACTIVE — KINH NGHIỆM TỐI THƯỢNG
**Priority:** LEVEL 0 — Ưu tiên cao nhất
