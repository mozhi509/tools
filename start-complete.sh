#!/bin/bash

echo "🚀 启动完整的JSON格式化工具服务"
echo "================================"

# 停止可能冲突的服务
echo "🛑 停止现有服务..."
pkill -f "python3 -m http.server" 2>/dev/null
pkill -f "npx serve" 2>/dev/null
pkill -f "node index.js" 2>/dev/null

# 等待端口释放
sleep 2

# 启动后端服务
echo "🔧 启动后端服务..."
cd server
nohup node index.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务启动 (PID: $BACKEND_PID)"
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 测试后端
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 后端服务健康检查通过"
else
    echo "❌ 后端服务启动失败"
    exit 1
fi

# 构建前端
echo "🔨 构建前端应用..."
cd client
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi
cd ..

# 启动前端服务
echo "🌐 启动前端服务..."
cd client
python3 -m http.server 8080 --directory build > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务启动 (PID: $FRONTEND_PID)"
cd ..

# 等待前端启动
sleep 2

# 测试前端
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ 前端服务健康检查通过"
else
    echo "❌ 前端服务启动失败"
    exit 1
fi

echo ""
echo "================================"
echo "🎉 所有服务启动完成！"
echo ""
echo "📱 访问地址："
echo "   前端应用: http://localhost:8080"
echo "   后端API:  http://localhost:3001"
echo ""
echo "🔧 服务进程："
echo "   后端PID: $BACKEND_PID"
echo "   前端PID: $FRONTEND_PID"
echo ""
echo "📋 日志文件："
echo "   后端日志: logs/backend.log"
echo "   前端日志: logs/frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🧪 测试命令:"
echo "   curl -X POST http://localhost:3001/api/tools/json/format \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"json\":\"{\\\"name\\\":\\\"test\\\"}\",\"indent\":2}'"
echo ""
echo "================================"
echo "✨ JSON格式化工具已就绪！"