#!/bin/bash
echo "查看开发日志..."
echo "后端日志:"
tail -20 logs/dev-backend.log 2>/dev/null || echo "无后端日志"
echo ""
echo "前端日志:"
tail -20 logs/dev-frontend.log 2>/dev/null || echo "无前端日志"
