#!/bin/bash

# Web工具集 - 编译启动脚本
# 一键完成依赖安装、前端构建、服务启动

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
SERVICE_NAME="web-toolkit"
DEPLOY_DIR="$(pwd)"

# 显示欢迎信息
show_welcome() {
    echo "==============================================="
    echo "    Web工具集 - 编译启动脚本"
    echo "==============================================="
    echo ""
    echo "📋 项目信息:"
    echo "   项目名称: $PROJECT_NAME"
    echo "   项目路径: $DEPLOY_DIR"
    echo "   服务名称: $SERVICE_NAME"
    echo ""
}

# 检查环境
check_environment() {
    log_info "检查开发环境..."
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js未安装"
        echo "请先安装Node.js: https://nodejs.org/"
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
    
    if [ ! -d "server" ]; then
        log_error "server目录不存在"
        exit 1
    fi
    
    if [ ! -d "client" ]; then
        log_error "client目录不存在"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装根目录依赖
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

# 构建前端
build_frontend() {
    log_info "构建前端项目..."
    
    cd client
    
    # 检查是否有构建命令
    if ! npm run | grep -q "build"; then
        log_error "未找到build脚本"
        cd ..
        exit 1
    fi
    
    # 清理旧的构建文件
    rm -rf build dist
    
    # 执行构建
    npm run build
    
    # 检查构建结果
    if [ -d "build" ] && [ -f "build/index.html" ]; then
        log_success "前端构建完成"
        log_info "构建文件: $(du -sh build)"
    else
        log_error "前端构建失败"
        cd ..
        exit 1
    fi
    
    cd ..
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    # 检查PM2是否可用
    if command -v pm2 &> /dev/null; then
        log_info "使用PM2启动后端服务..."
        
        # 停止现有服务
        pm2 delete $SERVICE_NAME 2>/dev/null || true
        
        # 创建PM2配置
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.js',
    cwd: '$DEPLOY_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '$DEPLOY_DIR/logs/err.log',
    out_file: '$DEPLOY_DIR/logs/out.log',
    log_file: '$DEPLOY_DIR/logs/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF
        
        # 启动服务
        pm2 start ecosystem.config.js
        pm2 save
        
        log_success "PM2服务启动完成"
        
    else
        log_warning "PM2未安装，使用nohup启动..."
        
        # 停止现有进程
        if [ -f "app.pid" ]; then
            kill $(cat app.pid) 2>/dev/null || true
        fi
        
        # 使用nohup启动
        nohup node server/index.js > logs/app.log 2>&1 &
        echo $! > app.pid
        
        log_success "nohup服务启动完成"
    fi
}

# 配置Nginx（可选）
configure_nginx() {
    echo ""
    read -p "是否配置Nginx？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v nginx &> /dev/null; then
            log_info "配置Nginx..."
            
            # 检测系统类型
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                OS=$NAME
            fi
            
            BUILD_DIR="$DEPLOY_DIR/client/build"
            
            if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
                CONFIG_PATH="/etc/nginx/sites-available/$PROJECT_NAME"
                ENABLED_DIR="/etc/nginx/sites-enabled"
            else
                CONFIG_PATH="/etc/nginx/conf.d/$PROJECT_NAME.conf"
                ENABLED_DIR="/etc/nginx/conf.d"
            fi
            
            # 创建Nginx配置
            cat > $CONFIG_PATH << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    root $BUILD_DIR;
    index index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:3001/api/health;
    }
    
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
            
            # 启用配置
            if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
                ln -sf $CONFIG_PATH $ENABLED_DIR/$PROJECT_NAME
                rm -f $ENABLED_DIR/default
            fi
            
            # 测试并重启Nginx
            nginx -t && systemctl reload nginx
            
            log_success "Nginx配置完成"
            
        else
            log_warning "Nginx未安装，跳过配置"
        fi
    fi
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    
    # 等待后端服务
    BACKEND_READY=false
    for i in {1..30}; do
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            BACKEND_READY=true
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    if [ "$BACKEND_READY" = true ]; then
        log_success "后端服务已启动"
    else
        log_warning "后端服务可能未完全启动，请检查日志"
    fi
}

# 显示服务状态
show_status() {
    echo ""
    echo "==============================================="
    log_success "🎉 编译启动完成！"
    echo "==============================================="
    echo ""
    
    # 获取IP地址
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    
    echo "🌐 访问地址:"
    echo "   本地访问: http://localhost"
    echo "   外网访问: http://$SERVER_IP"
    echo "   API接口: http://localhost/api"
    echo "   健康检查: http://localhost/health"
    echo ""
    
    echo "🔧 服务管理:"
    if command -v pm2 &> /dev/null; then
        echo "   查看状态: pm2 status"
        echo "   查看日志: pm2 logs $SERVICE_NAME"
        echo "   重启服务: pm2 restart $SERVICE_NAME"
        echo "   停止服务: pm2 stop $SERVICE_NAME"
    else
        echo "   查看日志: tail -f logs/app.log"
        echo "   重启服务: kill \$(cat app.pid) && ./build-and-start.sh"
        echo "   停止服务: kill \$(cat app.pid)"
    fi
    echo ""
    
    echo "📁 重要目录:"
    echo "   前端构建: client/build/"
    echo "   后端代码: server/"
    echo "   日志文件: logs/"
    echo "   配置文件: ecosystem.config.js"
    echo ""
    
    echo "🧪 测试命令:"
    echo "   curl http://localhost"
    echo "   curl http://localhost/api/health"
    echo ""
    
    # 检查服务状态
    echo "📋 当前状态:"
    echo -n "   后端服务: "
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "$SERVICE_NAME.*online"; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
    else
        if [ -f "app.pid" ] && kill -0 $(cat app.pid) 2>/dev/null; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
    fi
    
    echo -n "   前端文件: "
    [ -f "client/build/index.html" ] && echo "✅ 已构建" || echo "❌ 未构建"
    
    echo -n "   Nginx: "
    systemctl is-active nginx 2>/dev/null && echo "✅ 运行中" || echo "⚠️  未配置/未运行"
    
    echo ""
    echo "==============================================="
}

# 创建管理脚本
create_management_scripts() {
    log_info "创建管理脚本..."
    
    # 停止脚本
    cat > stop.sh << 'EOF'
#!/bin/bash
echo "停止Web工具集服务..."
if command -v pm2 &> /dev/null; then
    pm2 stop web-toolkit
else
    if [ -f "app.pid" ]; then
        kill $(cat app.pid)
        rm -f app.pid
    fi
fi
echo "服务已停止"
EOF
    
    # 重启脚本
    cat > restart.sh << 'EOF'
#!/bin/bash
echo "重启Web工具集服务..."
if command -v pm2 &> /dev/null; then
    pm2 restart web-toolkit
else
    ./stop.sh
    ./build-and-start.sh
fi
echo "服务已重启"
EOF
    
    # 日志脚本
    cat > logs.sh << 'EOF'
#!/bin/bash
echo "查看Web工具集日志..."
if command -v pm2 &> /dev/null; then
    pm2 logs web-toolkit --lines 100
else
    tail -100 logs/app.log
fi
EOF
    
    chmod +x stop.sh restart.sh logs.sh
    log_success "管理脚本创建完成: stop.sh, restart.sh, logs.sh"
}

# 主函数
main() {
    show_welcome
    check_environment
    install_dependencies
    build_frontend
    start_backend
    configure_nginx
    wait_for_services
    show_status
    create_management_scripts
    
    log_success "所有操作完成！"
}

# 错误处理
trap 'log_error "脚本执行失败，请检查错误信息"; exit 1' ERR

# 执行主函数
main "$@"