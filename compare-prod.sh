#!/bin/bash
echo "对比开发环境和生产环境..."
echo ""
echo "开发环境:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo ""
echo "生产环境:"
if command -v pm2 &> /dev/null && pm2 list | grep -q "web-toolkit.*online"; then
    echo "  前端: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost')"
    echo "  后端: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost')/api"
else
    echo "  生产环境未运行"
fi
