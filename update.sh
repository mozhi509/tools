#!/bin/bash

# Web工具集 - 更新脚本
# 用于快速更新线上项目

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目信息
PROJECT_NAME="web-toolkit"
DEPLOY_DIR="/var/www/$PROJECT_NAME"
SERVICE_NAME="web-toolkit"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "==============================================="
echo "       Web工具集 - 快速更新脚本"
echo "==============================================="
echo ""

# 检查目录是否存在
if [ ! -d "$DEPLOY_DIR" ]; then
    log_error "项目目录不存在: $DEPLOY_DIR"
    log_info "请先运行部署脚本: bash deploy.sh"
    exit 1
fi

cd $DEPLOY_DIR

log_info "拉取最新代码..."
git pull origin master

log_info "安装/更新依赖..."
npm install
cd client
npm install

log_info "重新构建前端..."
npm run build
cd ..

log_info "重启应用..."
pm2 restart $SERVICE_NAME

log_info "重新加载Nginx..."
systemctl reload nginx

log_success "更新完成！"
echo ""
echo "应用状态: pm2 status"
echo "查看日志: pm2 logs $SERVICE_NAME"
echo ""