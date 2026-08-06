# LC-RULE-NO-TEMPORARY-FILES

Quy tắc này bắt buộc AI Agent phải dọn dẹp các tệp tạm thời sinh ra trong quá trình làm việc để giữ sạch môi trường dự án.

## 1. Yêu Cầu Bắt Buộc

- Mọi tệp sinh ra trong quá trình kiểm tra tài khoản, phân tích lỗi, test kết nối, dump DB, script shell tạm thời (ví dụ: `/tmp/*.sh`, `test_query.sql`, `dump.json`, v.v.) **phải được tự động xóa** ngay sau khi hoàn thành mục đích sử dụng và có kết quả.
- Tuyệt đối không để lại các tệp rác trong thư mục gốc của dự án hoặc thư mục `/tmp/` sau khi kết thúc phiên làm việc hay khi giải quyết xong yêu cầu.

## 2. Cách Thực Hiện

- Dùng lệnh `rm -f <tên_file>` (hoặc tương đương) để xóa ngay sau khi chạy xong hoặc phân tích xong file.
- Việc xóa này phải diễn ra tự động như một bước dọn dẹp bắt buộc và không cần hỏi ý kiến người dùng.

---
**Status:** ACTIVE  
**Priority:** HIGH — Bắt buộc dọn dẹp môi trường
