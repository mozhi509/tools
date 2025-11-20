#!/bin/bash

# JSON格式化工具修复脚本

echo "🔧 JSON格式化工具诊断和修复"
echo "================================"

# 检查服务器状态
echo "📋 检查服务器状态..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 服务器运行正常"
else
    echo "❌ 服务器未运行或不可访问"
    echo "🚀 正在启动服务器..."
    cd server && node index.js &
    SERVER_PID=$!
    sleep 3
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ 服务器启动成功 (PID: $SERVER_PID)"
    else
        echo "❌ 服务器启动失败"
    fi
    cd ..
fi

# 测试API端点
echo ""
echo "🧪 测试API端点..."

# 测试格式化
echo -n "   格式化API: "
FORMAT_RESULT=$(curl -s -X POST http://localhost:3001/api/tools/json/format \
    -H "Content-Type: application/json" \
    -d '{"json":"{\"name\":\"test\"}","indent":2}' 2>/dev/null)

if echo "$FORMAT_RESULT" | grep -q "success.*true"; then
    echo "✅ 正常"
else
    echo "❌ 异常"
    echo "   响应: $FORMAT_RESULT"
fi

# 测试验证
echo -n "   验证API: "
VALIDATE_RESULT=$(curl -s -X POST http://localhost:3001/api/tools/json/validate \
    -H "Content-Type: application/json" \
    -d '{"json":"{\"name\":\"test\"}"}' 2>/dev/null)

if echo "$VALIDATE_RESULT" | grep -q "success.*true"; then
    echo "✅ 正常"
else
    echo "❌ 异常"
    echo "   响应: $VALIDATE_RESULT"
fi

# 检查前端构建
echo ""
echo "📦 检查前端构建..."
if [ -d "client/build" ] && [ -f "client/build/index.html" ]; then
    echo "✅ 前端已构建"
else
    echo "❌ 前端未构建"
    echo "🔨 正在构建前端..."
    cd client
    npm run build
    cd ..
    if [ -d "client/build" ] && [ -f "client/build/index.html" ]; then
        echo "✅ 前端构建完成"
    else
        echo "❌ 前端构建失败"
    fi
fi

# 检查Nginx配置
echo ""
echo "🌐 检查Nginx配置..."
if command -v nginx >/dev/null 2>&1 && systemctl is-active --quiet nginx; then
    echo "✅ Nginx运行中"
    echo -n "   测试HTTP访问: "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ 正常 (200)"
    else
        echo "❌ 异常 ($HTTP_CODE)"
    fi
else
    echo "⚠️  Nginx未运行或未安装"
fi

# 运行API测试
echo ""
echo "🧪 运行API测试..."
if command -v node >/dev/null 2>&1; then
    if [ -f "test-api.js" ]; then
        echo "执行详细API测试..."
        node test-api.js
    else
        echo "❌ test-api.js 不存在"
    fi
else
    echo "⚠️  Node.js未安装"
fi

echo ""
echo "================================"
echo "🎯 诊断完成！"
echo ""
echo "💡 如果仍然有问题，请检查："
echo "   1. 浏览器控制台的错误信息"
echo "   2. 开发者工具的网络选项卡"
echo "   3. 确保所有依赖都已安装"
echo "   4. 清除浏览器缓存并刷新"