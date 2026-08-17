#!/bin/bash
export SSHPASS='sMOh_1{k~*AczwlP$'
sshpass -e ssh -o StrictHostKeyChecking=no root@14.225.172.225 "cd /root/lichcongtac && git pull origin main && docker compose -p lichcongtac down && docker compose -p lichcongtac up -d --build"
