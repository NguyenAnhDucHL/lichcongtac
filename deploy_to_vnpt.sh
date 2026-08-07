#!/bin/bash

# Đọc thông tin từ file .deploy.env
if [ ! -f ".deploy.env" ]; then
    echo "Lỗi: Không tìm thấy file .deploy.env. Vui lòng tạo file với VNPT_HOST, VNPT_USER, VNPT_PASS"
    exit 1
fi

source .deploy.env

echo "Đang triển khai lên VNPT Server ($VNPT_HOST)..."

# Nén code (bỏ qua các thư mục không cần thiết)
echo "Đang đóng gói mã nguồn..."
export COPYFILE_DISABLE=1
tar --exclude='.git' --exclude='node_modules' --exclude='bin' --exclude='obj' --exclude='.env' --exclude='data_dump' --exclude='._*' -czf deploy.tar.gz .

echo "Đang tải mã nguồn lên VNPT Server ($VNPT_HOST)..."
expect << EOF
set timeout -1
spawn scp -o StrictHostKeyChecking=no deploy.tar.gz $VNPT_USER@$VNPT_HOST:/root/
expect {
    "password:" {
        send "$VNPT_PASS\r"
        exp_continue
    }
    eof
}
EOF

echo "Đang giải nén và khởi động lại Docker trên Server..."
expect << EOF
set timeout -1
spawn ssh -o StrictHostKeyChecking=no $VNPT_USER@$VNPT_HOST "mkdir -p /root/lichcongtac; cd /root/lichcongtac; tar -xzf /root/deploy.tar.gz; docker-compose down; docker compose down; docker compose build; docker compose up -d; rm /root/deploy.tar.gz"
expect {
    "password:" {
        send "$VNPT_PASS\r"
        exp_continue
    }
    eof
}
EOF

# Xóa file nén cục bộ
rm deploy.tar.gz

echo "Triển khai hoàn tất!"
