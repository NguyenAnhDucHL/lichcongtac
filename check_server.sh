#!/bin/bash
expect << EOF
set timeout -1
spawn ssh -o StrictHostKeyChecking=no root@14.225.172.225 "cd /root; git pull origin phonghopkhonggiayto; docker compose -f /root/docker-compose.yml up -d"
expect {
    "password:" {
        send "sMOh_1{k~*AczwlP$\r"
        exp_continue
    }
    eof
}
EOF
