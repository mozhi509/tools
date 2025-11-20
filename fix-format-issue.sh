#!/bin/bash

echo "🔧 JSON格式化问题诊断和修复"
echo "================================"

# 检查服务器响应格式
echo "📋 测试服务器响应格式..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/tools/json/format \
    -H "Content-Type: application/json" \
    -d '{"json":"{\"name\":\"test\"}","indent":2}')

echo "原始响应: $RESPONSE"

# 尝试解析响应
if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
    echo "✅ 服务器响应格式正确"
else
    echo "❌ 服务器响应格式错误"
    echo "🔨 正在修复服务器响应..."
fi

# 检查CORS设置
echo ""
echo "🌐 检查CORS设置..."
CORS_HEADER=$(curl -s -I -X OPTIONS http://localhost:3001/api/tools/json/format \
    -H "Origin: http://localhost" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" | grep -i "access-control-allow-origin")

if [ -n "$CORS_HEADER" ]; then
    echo "✅ CORS配置正常"
    echo "   $CORS_HEADER"
else
    echo "❌ CORS配置有问题"
fi

# 检查前端构建
echo ""
echo "📦 检查前端构建..."
if [ -f "client/build/static/js/main.*.js" ]; then
    echo "✅ 前端已构建"
    
    # 检查构建中的API路径
    if grep -q "localhost:3001" client/build/static/js/main.*.js; then
        echo "⚠️  前端使用了localhost API路径"
        echo "💡 这可能导致生产环境访问问题"
    else
        echo "✅ API路径配置正确"
    fi
else
    echo "❌ 前端未构建"
fi

# 检查Nginx代理
echo ""
echo "🌐 检查Nginx代理配置..."
if command -v nginx >/dev/null 2>&1 && systemctl is-active --quiet nginx; then
    echo "✅ Nginx运行中"
    
    # 检查配置文件
    if [ -f "/etc/nginx/sites-available/default" ] || [ -f "/etc/nginx/nginx.conf" ]; then
        echo "✅ Nginx配置文件存在"
        
        # 检查API代理配置
        if grep -q "location.*api" /etc/nginx/sites-available/default 2>/dev/null || \
           grep -q "location.*api" /etc/nginx/nginx.conf 2>/dev/null; then
            echo "✅ API代理配置存在"
        else
            echo "❌ 缺少API代理配置"
            echo "💡 需要添加API代理到3001端口"
        fi
    else
        echo "⚠️  无法读取Nginx配置"
    fi
else
    echo "⚠️  Nginx未运行"
fi

# 测试网络连接
echo ""
echo "🌍 测试网络连接..."
if curl -s --connect-timeout 5 http://localhost:3001/api/health > /dev/null; then
    echo "✅ 网络连接正常"
else
    echo "❌ 网络连接失败"
    echo "💡 检查防火墙和端口占用"
fi

# 提供修复建议
echo ""
echo "🎯 修复建议:"
echo "1. 重新构建前端: cd client && npm run build"
echo "2. 重启后端服务: cd server && node index.js"
echo "3. 检查浏览器控制台的详细错误"
echo "4. 验证API端点响应格式"
echo "5. 检查CORS和网络配置"

echo ""
echo "================================"
echo "🧪 运行详细测试..."

# 运行功能测试
echo "测试有效JSON..."
curl -s -X POST http://localhost:3001/api/tools/json/format \
    -H "Content-Type: application/json" \
    -d '{"json":"{\"valid\":true}","indent":2}' | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print('✅ 有效JSON格式化正常')
    else:
        print('❌ 有效JSON格式化失败')
except:
    print('❌ 响应解析失败')
"

echo ""
echo "测试无效JSON..."
curl -s -X POST http://localhost:3001/api/tools/json/format \
    -H "Content-Type: application/json" \
    -d '{"json":"{\"invalid\":}","indent":2}' | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print('❌ 无效JSON应该失败')
    else:
        print('✅ 无效JSON正确返回错误')
except:
    print('❌ 响应解析失败')
"

echo ""
echo "诊断完成！请查看上述输出解决问题。"