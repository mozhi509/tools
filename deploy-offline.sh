#!/bin/bash

# Web工具集 - 完全离线部署脚本
# 适用于网络受限或无法访问GitHub的环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目信息
PROJECT_NAME="web-toolkit"
SERVICE_NAME="web-toolkit"
DEPLOY_DIR="$(pwd)"

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

# 检查是否在正确的目录
check_project_dir() {
    if [ ! -f "package.json" ]; then
        log_error "请在项目根目录运行此脚本"
        log_error "应包含package.json文件"
        exit 1
    fi
    
    if [ ! -d "server" ] || [ ! -d "client" ]; then
        log_error "项目结构不完整，缺少server或client目录"
        exit 1
    fi
    
    log_success "项目目录检查通过: $DEPLOY_DIR"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用root用户或sudo执行此脚本"
        exit 1
    fi
}

# 检查系统类型
check_system() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_warning "无法检测系统类型，使用默认配置"
        OS="Unknown"
    fi
    log_info "检测到系统: $OS $VER"
}

# 显示部署信息
show_welcome() {
    echo "==============================================="
    echo "    Web工具集 - 离线部署脚本"
    echo "==============================================="
    echo ""
    echo "📋 部署模式: 离线部署（无网络访问）"
    echo "📁 项目路径: $DEPLOY_DIR"
    echo "🖥️  系统类型: $OS"
    echo ""
}

# 更新系统（可选）
update_system() {
    echo ""
    read -p "是否更新系统包？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "更新系统包..."
        if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
            apt update && apt upgrade -y
        elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]] || [[ $OS == *"OpenCloudOS"* ]]; then
            yum update -y
        else
            log_warning "未知系统类型，跳过系统更新"
        fi
    else
        log_info "跳过系统更新"
    fi
}

# 安装Node.js（离线方式）
install_nodejs() {
    log_info "检查Node.js安装状态..."
    
    if command -v node &> /dev/null; then
        log_success "Node.js已安装: $(node --version)"
        log_info "npm版本: $(npm --version)"
    else
        log_warning "Node.js未安装"
        echo ""
        echo "📦 Node.js离线安装指南："
        echo "1. 访问 https://nodejs.org/en/download/"
        echo "2. 下载对应的Linux二进制包"
        echo "3. 解压到 /usr/local/"
        echo ""
        echo "或者使用包管理器（如果网络可用）："
        if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
            echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
            echo "  apt-get install -y nodejs"
        else
            echo "  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -"
            echo "  yum install -y nodejs"
        fi
        echo ""
        
        read -p "Node.js未安装，是否继续？(需要手动安装后才能运行应用) (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "请先安装Node.js后再运行此脚本"
            exit 1
        fi
    fi
    
    # 检查PM2
    if command -v pm2 &> /dev/null; then
        log_success "PM2已安装: $(pm2 --version)"
    else
        if command -v npm &> /dev/null; then
            log_info "安装PM2..."
            npm install -g pm2
            log_success "PM2安装完成: $(pm2 --version)"
        else
            log_warning "npm不可用，无法安装PM2"
        fi
    fi
}

# 安装Nginx
install_nginx() {
    log_info "检查Nginx安装状态..."
    
    if command -v nginx &> /dev/null; then
        log_success "Nginx已安装"
        systemctl start nginx 2>/dev/null || true
        systemctl enable nginx 2>/dev/null || true
    else
        log_warning "Nginx未安装"
        echo ""
        echo "🌐 Nginx安装指南："
        
        if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
            echo "  apt install -y nginx"
        elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]] || [[ $OS == *"OpenCloudOS"* ]]; then
            echo "  yum install -y nginx"
        else
            echo "  请根据你的系统安装Nginx"
        fi
        echo ""
        
        read -p "是否现在安装Nginx？(y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
                apt install -y nginx
            elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]] || [[ $OS == *"OpenCloudOS"* ]]; then
                yum install -y nginx
            fi
            
            systemctl start nginx
            systemctl enable nginx
            log_success "Nginx安装完成"
        else
            log_warning "跳过Nginx安装，需要手动配置"
        fi
    fi
}

# 安装依赖和构建
install_and_build() {
    log_info "安装项目依赖..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm不可用，无法安装依赖"
        return 1
    fi
    
    # 检查是否有node_modules
    if [ -d "node_modules" ]; then
        log_info "node_modules已存在，跳过根目录依赖安装"
    else
        log_info "安装根目录依赖..."
        npm install
    fi
    
    # 客户端依赖
    cd client
    if [ -d "node_modules" ]; then
        log_info "client/node_modules已存在，跳过客户端依赖安装"
    else
        log_info "安装客户端依赖..."
        npm install
    fi
    
    # 检查是否已构建
    if [ -d "build" ]; then
        log_info "前端已构建，跳过构建步骤"
    else
        log_info "构建前端项目..."
        npm run build
    fi
    
    cd ..
    log_success "依赖安装和构建完成"
}

# 配置Nginx
configure_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx未安装，跳过配置"
        return 1
    fi
    
    log_info "配置Nginx..."
    
    # 备份现有配置
    if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
        [ -f /etc/nginx/sites-enabled/default ] && mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak
        CONFIG_PATH="/etc/nginx/sites-available/$PROJECT_NAME"
    else
        [ -f /etc/nginx/conf.d/default.conf ] && mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak
        CONFIG_PATH="/etc/nginx/conf.d/$PROJECT_NAME.conf"
    fi
    
    # 创建配置
    cat > $CONFIG_PATH << EOF
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root $DEPLOY_DIR/client/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API代理
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
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:3001/api/health;
    }
}
EOF
    
    # 启用配置
    if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
        ln -sf $CONFIG_PATH /etc/nginx/sites-enabled/
    fi
    
    # 测试并重启Nginx
    nginx -t && systemctl reload nginx
    
    log_success "Nginx配置完成"
}

# 创建PM2配置文件
create_pm2_config() {
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2未安装，跳过PM2配置"
        return 1
    fi
    
    log_info "创建PM2配置文件..."
    
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
    time: true
  }]
};
EOF

    mkdir -p logs
    log_success "PM2配置文件创建完成"
}

# 启动应用
start_app() {
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2未安装，使用node直接启动"
        if command -v node &> /dev/null; then
            log_info "使用nohup启动Node.js服务..."
            nohup node server/index.js > logs/app.log 2>&1 &
            echo $! > app.pid
            log_success "应用已启动，PID: $(cat app.pid)"
        else
            log_error "Node.js不可用，无法启动应用"
            return 1
        fi
    else
        log_info "使用PM2启动应用..."
        pm2 delete $SERVICE_NAME 2>/dev/null || true
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup 2>/dev/null || log_warning "PM2 startup设置失败"
        log_success "应用已启动"
    fi
}

# 设置防火墙（可选）
setup_firewall() {
    echo ""
    read -p "是否配置防火墙开放端口？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "配置防火墙..."
        
        if command -v ufw &> /dev/null; then
            ufw allow 22/tcp
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw --force enable
        elif command -v firewall-cmd &> /dev/null; then
            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
        else
            log_warning "无法检测防火墙工具，请手动开放端口80、443、3001"
        fi
        
        log_success "防火墙配置完成"
    else
        log_info "跳过防火墙配置"
    fi
}

# 显示部署结果
show_result() {
    echo ""
    echo "==============================================="
    log_success "🎉 离线部署完成！"
    echo "==============================================="
    echo ""
    echo "📋 部署信息:"
    echo "   项目路径: $DEPLOY_DIR"
    echo "   系统类型: $OS"
    echo ""
    
    # 尝试获取服务器IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    echo "🌐 访问地址:"
    echo "   网站首页: http://$SERVER_IP"
    echo "   API地址: http://$SERVER_IP/api"
    echo "   健康检查: http://$SERVER_IP/health"
    echo ""
    
    echo "🔧 管理命令:"
    if command -v pm2 &> /dev/null; then
        echo "   查看应用状态: pm2 status"
        echo "   查看日志: pm2 logs $SERVICE_NAME"
        echo "   重启应用: pm2 restart $SERVICE_NAME"
        echo "   停止应用: pm2 stop $SERVICE_NAME"
    else
        echo "   查看日志: tail -f logs/app.log"
        echo "   停止应用: kill \$(cat app.pid)"
    fi
    echo ""
    
    echo "📁 重要文件:"
    echo "   项目配置: $DEPLOY_DIR/package.json"
    if command -v pm2 &> /dev/null; then
        echo "   PM2配置: $DEPLOY_DIR/ecosystem.config.js"
    fi
    echo "   Nginx配置: $CONFIG_PATH"
    echo "   应用日志: $DEPLOY_DIR/logs/"
    echo ""
    
    echo "==============================================="
}

# 主函数
main() {
    show_welcome
    
    check_root
    check_project_dir
    check_system
    
    update_system
    install_nodejs
    install_nginx
    install_and_build
    configure_nginx
    create_pm2_config
    start_app
    setup_firewall
    show_result
    
    log_success "所有操作完成！"
}

# 执行主函数
main "$@"