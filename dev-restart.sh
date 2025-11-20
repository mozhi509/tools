#!/bin/bash
echo "重启开发服务器..."
./dev-stop.sh
sleep 2
./dev-start.sh
