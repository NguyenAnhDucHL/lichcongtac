# LC-RULE-DOCKER-DEPLOYMENT

Quy tắc này nhằm ngăn chặn các lỗi nghiêm trọng khi triển khai (deploy) nhiều dự án Docker Compose trên cùng một máy chủ (server), đặc biệt là tránh xung đột với hệ thống nền tảng Tool-Calendar.

## 1. Bối Cảnh Sự Cố
- Vào ngày 07/08/2026, một lệnh `docker-compose down` chạy thông qua script deploy trên server VNPT (không có project name) đã vô tình đánh sập các container của dự án `Tool-Calendar` (nằm ngoài thư mục dự án).
- Hậu quả: Container `nginx-proxy` chung của server khởi động lại và vướng lỗi phân giải `host.docker.internal`, dẫn đến crash loop làm sập toàn bộ hệ thống routing trên server.

## 2. Quy Tắc Bắt Buộc (Zero Tolerance)
AI Agent **TUYỆT ĐỐI TUÂN THỦ** các quy định sau khi viết script deploy hoặc chạy lệnh Docker Compose liên quan đến dự án `lichcongtac`:

1. **Luôn chỉ định tường minh Project Name (`-p`)**:
   Mọi lệnh `docker compose` (hoặc `docker-compose`) được thực thi trên server hoặc ghi vào shell script **BẮT BUỘC** phải đính kèm cờ `-p lichcongtac`.
   - **✅ ĐÚNG**: `docker compose -p lichcongtac down`
   - **✅ ĐÚNG**: `docker compose -p lichcongtac up -d`
   - **❌ SAI (BỊ CẤM)**: `docker-compose down`
   - **❌ SAI (BỊ CẤM)**: `docker compose up -d`

2. **Sử dụng Docker Compose V2**:
   Nên dùng cú pháp `docker compose` thay vì phiên bản cũ `docker-compose`.

3. **Bảo vệ Vùng Cấm Trên Server**:
   Dự án Lịch Công Tác (`/root/lichcongtac`) chỉ là một dịch vụ thành phần trên server. **Tuyệt đối không** thao tác (restart, stop, rm) vào các container độc lập khác trên server như `nginx-proxy`, `doc-coordination-system`, `doc-clamav`, `rabbitmq`.

---
**Status:** ACTIVE  
**Priority:** LEVEL 1 — Bắt buộc với mọi thao tác infra/deploy.
