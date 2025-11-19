#!/bin/bash

# Web工具集 - 腾讯云轻量级服务器一键部署脚本
# 作者: mozhi509
# 版本: 1.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="web-toolkit"
REPO_URL="https://github.com/mozhi509/tools.git"
DEPLOY_DIR="/var/www/$PROJECT_NAME"
SERVICE_NAME="web-toolkit"

# 日志函数
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
        log_error "无法检测系统类型"
        exit 1
    fi
    log_info "检测到系统: $OS $VER"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
        apt update && apt upgrade -y
    elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]]; then
        yum update -y
    else
        log_warning "未知系统类型，跳过系统更新"
    fi
}

# 安装Node.js
install_nodejs() {
    log_info "安装Node.js..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
            apt-get install -y nodejs
        elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]]; then
            yum install -y nodejs npm
        fi
    else
        log_info "Node.js已安装: $(node --version)"
    fi
    
    # 安装PM2
    npm install -g pm2
    
    # 验证安装
    log_success "Node.js版本: $(node --version)"
    log_success "npm版本: $(npm --version)"
    log_success "PM2版本: $(pm2 --version)"
}

# 安装Nginx
install_nginx() {
    log_info "安装Nginx..."
    if ! command -v nginx &> /dev/null; then
        if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
            apt install -y nginx
        elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]]; then
            yum install -y nginx
        fi
    else
        log_info "Nginx已安装"
    fi
    
    # 启动并启用Nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx安装完成"
}

# 安装Git
install_git() {
    log_info "安装Git..."
    if ! command -v git &> /dev/null; then
        if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
            apt install -y git
        elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Rocky"* ]]; then
            yum install -y git
        fi
    else
        log_info "Git已安装: $(git --version)"
    fi
}

# 创建部署目录
create_deploy_dir() {
    log_info "创建部署目录: $DEPLOY_DIR"
    mkdir -p $DEPLOY_DIR
    cd $DEPLOY_DIR
}

# 克隆项目
clone_project() {
    log_info "克隆项目从GitHub..."
    if [ -d ".git" ]; then
        log_info "项目已存在，拉取最新代码..."
        git pull origin master
    else
        git clone $REPO_URL .
    fi
}

# 安装依赖和构建
install_and_build() {
    log_info "安装项目依赖..."
    
    # 安装根目录依赖
    npm install
    
    # 安装客户端依赖
    cd client
    npm install
    
    # 构建客户端
    log_info "构建前端项目..."
    npm run build
    
    cd ..
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."
    
    cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
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

    # 启用站点
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    
    # 测试并重启Nginx
    nginx -t
    systemctl restart nginx
    
    log_success "Nginx配置完成"
}

# 创建PM2配置文件
create_pm2_config() {
    log_info "创建PM2配置文件..."
    
    cat > $DEPLOY_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.js',
    cwd: '$DEPLOY_DIR',
    instances: 'max',
    exec_mode: 'cluster',
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

    # 创建日志目录
    mkdir -p $DEPLOY_DIR/logs
}

# 启动应用
start_app() {
    log_info "启动应用..."
    
    # 停止现有进程
    pm2 delete $SERVICE_NAME 2>/dev/null || true
    
    # 启动新进程
    cd $DEPLOY_DIR
    pm2 start ecosystem.config.js
    
    # 保存PM2配置
    pm2 save
    pm2 startup
    
    log_success "应用启动完成"
}

# 设置防火墙
setup_firewall() {
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
        log_warning "无法检测防火墙工具，请手动开放端口80和443"
    fi
    
    log_success "防火墙配置完成"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "==============================================="
    log_success "🎉 部署完成！"
    echo "==============================================="
    echo ""
    echo "📋 部署信息:"
    echo "   项目路径: $DEPLOY_DIR"
    echo "   网站地址: http://$(curl -s ifconfig.me)"
    echo "   API地址: http://$(curl -s ifconfig.me)/api"
    echo ""
    echo "🔧 管理命令:"
    echo "   查看应用状态: pm2 status"
    echo "   查看日志: pm2 logs $SERVICE_NAME"
    echo "   重启应用: pm2 restart $SERVICE_NAME"
    echo "   停止应用: pm2 stop $SERVICE_NAME"
    echo ""
    echo "📁 重要文件:"
    echo "   PM2配置: $DEPLOY_DIR/ecosystem.config.js"
    echo "   Nginx配置: /etc/nginx/sites-available/$PROJECT_NAME"
    echo "   应用日志: $DEPLOY_DIR/logs/"
    echo ""
    echo "==============================================="
}

# 主函数
main() {
    echo "==============================================="
    echo "    Web工具集 - 腾讯云轻量级服务器部署脚本"
    echo "==============================================="
    echo ""
    
    check_root
    check_system
    
    log_info "开始部署..."
    
    update_system
    install_nodejs
    install_nginx
    install_git
    create_deploy_dir
    clone_project
    install_and_build
    configure_nginx
    create_pm2_config
    start_app
    setup_firewall
    show_deployment_info
    
    log_success "所有操作完成！"
}

# 执行主函数
main "$@"