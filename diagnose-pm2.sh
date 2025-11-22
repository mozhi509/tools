#!/bin/bash

# PM2 生产环境问题诊断脚本
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

echo "=========================================="
echo "PM2 生产环境问题诊断脚本"
echo "=========================================="

# 1. 检查 PM2 是否安装
log_info "检查 PM2 安装状态..."
if command -v pm2 >/dev/null 2>&1; then
    log_success "PM2 已安装: $(pm2 -v)"
else
    log_error "PM2 未安装"
    echo "请运行: npm install -g pm2"
    exit 1
fi

# 2. 检查当前工作目录
log_info "当前工作目录: $(pwd)"
log_info "当前用户: $(whoami)"
log_info "用户HOME: $HOME"

# 3. 检查必要文件
log_info "检查必要文件..."
files_to_check=(
    "./dist/index.js"
    "./client/build/index.html"
    "./package.json"
    "./ecosystem.config.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file"
    else
        log_error "✗ $file (缺失)"
    fi
done

# 4. 检查日志目录
log_info "检查日志目录..."
if [ -d "./logs" ]; then
    log_success "日志目录存在: ./logs"
    log_info "日志目录权限: $(ls -la ./logs | head -1)"
else
    log_warning "日志目录不存在，将自动创建"
    mkdir -p ./logs
    log_info "已创建日志目录: ./logs"
fi

# 5. 检查依赖
log_info "检查 Node.js 模块依赖..."
if [ -d "./node_modules" ]; then
    log_success "node_modules 目录存在"
    log_info "模块数量: $(ls -1 ./node_modules | wc -l)"
else
    log_error "node_modules 目录不存在"
    log_info "请运行: npm install --production"
fi

# 6. 检查端口占用
log_info "检查端口占用情况..."
BACKEND_PORT=3001
if command -v netstat >/dev/null 2>&1; then
    if netstat -tlnp | grep ":$BACKEND_PORT.*LISTEN" >/dev/null; then
        log_warning "端口 $BACKEND_PORT 已被占用:"
        netstat -tlnp | grep ":$BACKEND_PORT.*LISTEN"
    else
        log_success "端口 $BACKEND_PORT 可用"
    fi
else
    log_warning "netstat 命令不可用，无法检查端口"
fi

# 7. 检查生态系统配置
log_info "检查 PM2 生态系统配置..."
if [ -f "./ecosystem.config.js" ]; then
    log_success "ecosystem.config.js 存在"
    echo "配置内容:"
    cat ./ecosystem.config.js
else
    log_error "ecosystem.config.js 不存在"
fi

# 8. 尝试手动启动测试
log_info "尝试手动启动测试..."
if [ -f "./dist/index.js" ]; then
    log_info "测试直接运行: node ./dist/index.js"
    timeout 5s node ./dist/index.js || log_warning "启动测试超时（正常，因为服务会持续运行）"
else
    log_error "无法测试，dist/index.js 不存在"
fi

# 9. PM2 进程检查
log_info "检查 PM2 进程状态..."
pm2 list

# 10. PM2 日志检查
log_info "检查最近的 PM2 日志..."
if pm2 logs web-toolkit --lines 10 --nostream 2>/dev/null; then
    log_success "PM2 日志获取成功"
else
    log_warning "无法获取 PM2 日志"
fi

echo ""
echo "=========================================="
echo "诊断完成"
echo "=========================================="

# 提供解决方案
echo ""
echo "常见解决方案:"
echo "1. 如果 PM2 未安装: npm install -g pm2"
echo "2. 如果文件缺失: npm run build"
echo "3. 如果依赖缺失: npm install --production"
echo "4. 如果端口占用: pm2 stop web-toolkit; pm2 delete web-toolkit"
echo "5. 重启服务: pm2 restart ecosystem.config.js"
echo ""