#!/bin/bash
echo "停止开发服务器..."
pkill -f "nodemon" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "webpack serve" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true
rm -f backend-dev.pid frontend-dev.pid
echo "开发服务器已停止"
