#!/bin/bash

# Web工具集 - 开发模式启动脚本
# 同时启动前端开发服务器和后端热重载

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目信息
PROJECT_NAME="web-toolkit"
DEPLOY_DIR="$(pwd)"

# 显示欢迎信息
show_welcome() {
    echo "==============================================="
    echo "    Web工具集 - 开发模式启动"
    echo "==============================================="
    echo ""
    echo "📋 开发模式特性:"
    echo "   ✅ 前端热重载 (React Dev Server)"
    echo "   ✅ 后端热重载 (Nodemon)"
    echo "   ✅ 开发工具集成"
    echo "   ✅ 错误信息实时显示"
    echo ""
}

# 检查开发环境
check_dev_environment() {
    log_info "检查开发环境..."
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js未安装"
        exit 1
    fi
    
    # 检查npm
    if command -v npm &> /dev/null; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm未安装"
        exit 1
    fi
    
    # 检查项目结构
    if [ ! -f "package.json" ]; then
        log_error "package.json不存在，请确保在项目根目录运行"
        exit 1
    fi
    
    # 检查concurrently是否可用
    if ! command -v concurrently &> /dev/null && ! npm list concurrently &> /dev/null; then
        log_info "安装concurrently..."
        npm install --save-dev concurrently
    fi
    
    log_success "开发环境检查通过"
}

# 安装开发依赖
install_dev_dependencies() {
    log_info "安装开发依赖..."
    
    # 安装后端依赖
    log_info "安装后端依赖..."
    npm install
    log_success "后端依赖安装完成"
    
    # 安装前端依赖
    log_info "安装前端依赖..."
    cd client
    npm install
    log_success "前端依赖安装完成"
    cd ..
    
    # 创建日志目录
    mkdir -p logs
    log_success "日志目录创建完成"
}

# 启动开发服务
start_dev_services() {
    log_info "启动开发服务..."
    
    # 检查package.json中是否有dev脚本
    if npm run | grep -q "dev"; then
        log_info "使用package.json中的dev脚本启动..."
        npm run dev
    else
        log_info "手动启动前后端开发服务器..."
        
        # 创建开发启动脚本
        cat > start-dev-services.sh << 'EOF'
#!/bin/bash
echo "启动开发服务器..."

# 启动后端开发服务器（nodemon）
echo "启动后端开发服务器..."
nodemon server/index.js &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端开发服务器
echo "启动前端开发服务器..."
cd client
npm start &
FRONTEND_PID=$!

# 保存PID
echo $BACKEND_PID > backend-dev.pid
echo $FRONTEND_PID > frontend-dev.pid

echo "开发服务器启动完成"
echo "后端: http://localhost:3001"
echo "前端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待进程
wait $BACKEND_PID $FRONTEND_PID

# 清理PID文件
rm -f backend-dev.pid frontend-dev.pid
EOF
        
        chmod +x start-dev-services.sh
        ./start-dev-services.sh
    fi
}

# 停止开发服务
stop_dev_services() {
    log_info "停止开发服务..."
    
    # 停止后台进程
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "webpack serve" 2>/dev/null || true
    
    # 清理PID文件
    rm -f backend-dev.pid frontend-dev.pid
    
    log_success "开发服务已停止"
}

# 显示开发信息
show_dev_info() {
    echo ""
    echo "==============================================="
    log_success "🚀 开发模式启动完成！"
    echo "==============================================="
    echo ""
    echo "🌐 开发服务器地址:"
    echo "   前端开发服务器: http://localhost:3000"
    echo "   后端API服务器: http://localhost:3001"
    echo "   完整应用地址: http://localhost:3000"
    echo ""
    echo "🔧 开发特性:"
    echo "   ✅ 前端热重载 - 保存代码自动刷新"
    echo "   ✅ 后端热重载 - 保存代码自动重启"
    echo "   ✅ 开发者工具 - 浏览器开发者工具"
    echo "   ✅ 错误提示 - 详细错误信息和堆栈"
    echo ""
    echo "📋 常用命令:"
    echo "   停止开发服务: Ctrl+C 或 ./dev-stop.sh"
    echo "   重启开发服务: ./dev-restart.sh"
    echo "   查看日志: ./dev-logs.sh"
    echo ""
    echo "💡 开发提示:"
    echo "   - 前端代码修改会自动刷新浏览器"
    echo "   - 后端代码修改会自动重启服务"
    echo "   - 所有修改都会实时显示在终端"
    echo "   - 使用Ctrl+C停止所有服务"
    echo ""
    echo "==============================================="
}

# 创建开发管理脚本
create_dev_scripts() {
    log_info "创建开发管理脚本..."
    
    # 开发停止脚本
    cat > dev-stop.sh << 'EOF'
#!/bin/bash
echo "停止开发服务器..."
pkill -f "nodemon" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "webpack serve" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true
rm -f backend-dev.pid frontend-dev.pid
echo "开发服务器已停止"
EOF
    
    # 开发重启脚本
    cat > dev-restart.sh << 'EOF'
#!/bin/bash
echo "重启开发服务器..."
./dev-stop.sh
sleep 2
./dev-start.sh
EOF
    
    # 开发日志脚本
    cat > dev-logs.sh << 'EOF'
#!/bin/bash
echo "查看开发日志..."
echo "后端日志:"
tail -20 logs/dev-backend.log 2>/dev/null || echo "无后端日志"
echo ""
echo "前端日志:"
tail -20 logs/dev-frontend.log 2>/dev/null || echo "无前端日志"
EOF
    
    # 生产环境对比脚本
    cat > compare-prod.sh << 'EOF'
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
EOF
    
    chmod +x dev-stop.sh dev-restart.sh dev-logs.sh compare-prod.sh
    log_success "开发管理脚本创建完成"
}

# 主函数
main() {
    show_welcome
    check_dev_environment
    install_dev_dependencies
    create_dev_scripts
    show_dev_info
    
    # 启动开发服务
    start_dev_services
}

# 信号处理 - 优雅退出
trap 'log_info "正在停止开发服务器..."; stop_dev_services; exit 0' INT TERM

# 错误处理
trap 'log_error "开发服务器启动失败"; exit 1' ERR

# 执行主函数
main "$@"