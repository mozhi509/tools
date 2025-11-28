#!/bin/bash

# Web工具集 生产/测试环境管理脚本 (TypeScript版本)
# 支持启动、停止、重启、状态查看等功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="web-toolkit"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_DIR/app.pid"
LOG_DIR="$PROJECT_DIR/logs"

# 端口配置
BACKEND_PORT=3001
FRONTEND_PORT=3000
NGINX_PORT=80
REDIS_PORT=6379

# 进程名称
BACKEND_PROCESS="node"
FRONTEND_PROCESS="node"
NGINX_PROCESS="nginx"
REDIS_PROCESS="redis"

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

# 创建必要的目录
ensure_dirs() {
    mkdir -p "$LOG_DIR"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 获取占用端口的进程信息
get_port_process() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN | grep LISTEN
}

# 停止指定端口的进程
kill_port_process() {
    local port=$1
    local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
    if [ -n "$pid" ]; then
        kill -TERM $pid 2>/dev/null || true
        sleep 2
        # 如果进程仍在运行，强制杀死
        if kill -0 $pid 2>/dev/null; then
            kill -KILL $pid 2>/dev/null || true
        fi
        log_success "已停止占用端口 $port 的进程 (PID: $pid)"
    fi
}

# 等待端口释放
wait_for_port() {
    local port=$1
    local timeout=$2
    local count=0
    while check_port $port && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count + 1))
    done
    if check_port $port; then
        log_error "端口 $port 在 $timeout 秒内未能释放"
        return 1
    fi
}

# 启动开发环境
start_dev() {
    log_info "启动开发环境 (TypeScript)..."
    
    ensure_dirs
    
    # 检查端口是否被占用
    if check_port $BACKEND_PORT; then
        log_warning "后端端口 $BACKEND_PORT 已被占用:"
        get_port_process $BACKEND_PORT
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port_process $BACKEND_PORT
        else
            log_error "无法启动后端服务，端口被占用"
            return 1
        fi
    fi
    
    if check_port $FRONTEND_PORT; then
        log_warning "前端端口 $FRONTEND_PORT 已被占用:"
        get_port_process $FRONTEND_PORT
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port_process $FRONTEND_PORT
        else
            log_error "无法启动前端服务，端口被占用"
            return 1
        fi
    fi
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装后端依赖..."
        npm install
    fi
    
    if [ ! -d "client/node_modules" ]; then
        log_info "安装前端依赖..."
        cd client && npm install && cd ..
    fi
    
    # 启动服务
    log_info "启动开发服务器..."
    nohup npm run dev > "$LOG_DIR/dev.log" 2>&1 &
    echo $! > "$PID_FILE"
    
    # 等待服务启动（增加等待时间）
    log_info "等待服务启动..."
    for i in {1..15}; do
        sleep 2
        if check_port $BACKEND_PORT && check_port $FRONTEND_PORT; then
            # 额外检查服务是否真正可用
            if curl -s http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1 && \
               curl -s -I http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
                break
            fi
        fi
        log_info "等待中... ($i/15)"
    done
    
    if check_port $BACKEND_PORT && check_port $FRONTEND_PORT; then
        # 最终确认服务可用性
        if curl -s http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1 && \
           curl -s -I http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            log_success "开发环境启动成功!"
            echo "   后端API:  http://localhost:$BACKEND_PORT"
            echo "   前端页面: http://localhost:$FRONTEND_PORT"
            echo "   日志文件: $LOG_DIR/dev.log"
        else
            log_warning "端口已监听但服务可能仍在启动中，请稍后访问"
            echo "   后端API:  http://localhost:$BACKEND_PORT"
            echo "   前端页面: http://localhost:$FRONTEND_PORT"
            echo "   日志文件: $LOG_DIR/dev.log"
        fi
    else
        log_error "开发环境启动失败，请检查日志: $LOG_DIR/dev.log"
        return 1
    fi
}

# 启动生产环境
start_prod() {
    log_info "启动生产环境 (TypeScript)..."
    
    ensure_dirs
    
    # 加载环境变量
    if [ -f ".env" ]; then
        log_info "加载环境变量..."
        export $(grep -v '^#' .env | xargs)
    fi
    
    # 构建 TypeScript 后端和 React 前端
    if [ ! -d "dist" ] || [ ! -d "client/build" ]; then
        log_info "构建项目..."
        npm run build
    fi
    
    # 检查端口是否被占用
    if check_port $REDIS_PORT; then
        log_warning "Redis端口 $REDIS_PORT 已被占用:"
        get_port_process $REDIS_PORT
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port_process $REDIS_PORT
        else
            log_warning "跳过Redis服务启动"
        fi
    fi
    
    if check_port $BACKEND_PORT; then
        log_warning "后端端口 $BACKEND_PORT 已被占用:"
        get_port_process $BACKEND_PORT
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port_process $BACKEND_PORT
        else
            log_error "无法启动后端服务，端口被占用"
            return 1
        fi
    fi
    
    if check_port $NGINX_PORT; then
        log_warning "Nginx端口 $NGINX_PORT 已被占用:"
        get_port_process $NGINX_PORT
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port_process $NGINX_PORT
        else
            log_error "无法启动Nginx，端口被占用"
            return 1
        fi
    fi
    
    # 启动Redis服务（如果可用）
    if ! check_port $REDIS_PORT; then
        if command -v redis-server >/dev/null 2>&1; then
            log_info "启动Redis服务..."
            if [ -f "redis.conf" ]; then
                nohup redis-server redis.conf > "$LOG_DIR/redis.log" 2>&1 &
            else
                nohup redis-server --port $REDIS_PORT --daemonize yes > "$LOG_DIR/redis.log" 2>&1 &
            fi
            sleep 2
            if check_port $REDIS_PORT; then
                log_success "Redis服务启动成功"
            else
                log_warning "Redis服务启动失败，将继续启动后端服务"
            fi
        else
            log_info "Redis未安装，跳过Redis服务"
        fi
    fi
    
    # 启动后端服务 (使用PM2或直接启动)
    log_info "启动后端服务..."
    if command -v pm2 >/dev/null 2>&1; then
        log_info "使用PM2启动后端服务..."
        # 停止可能存在的同名进程
        pm2 delete web-toolkit 2>/dev/null || true
        sleep 2
        
        # 启动新进程
        if pm2 start ecosystem.config.js; then
            log_success "PM2启动成功"
            # 等待启动
            sleep 3
            # 检查状态
            pm2 status
        else
            log_error "PM2启动失败，尝试直接启动"
            NODE_ENV=production nohup node dist/index.js > "$LOG_DIR/prod.log" 2>&1 &
            echo $! > "$PID_FILE"
            log_info "直接启动后端服务"
        fi
    else
        log_warning "PM2未安装，使用直接启动方式"
        NODE_ENV=production nohup node dist/index.js > "$LOG_DIR/prod.log" 2>&1 &
        echo $! > "$PID_FILE"
        log_info "直接启动后端服务"
    fi
    
    # 等待后端服务启动
    sleep 3
    
    # 启动Nginx (如果配置存在)
    if [ -f "nginx.conf" ] && command -v nginx >/dev/null 2>&1; then
        log_info "启动Nginx..."
        nginx -c "$PROJECT_DIR/nginx.conf"
        sleep 2
        
        if check_port $NGINX_PORT; then
            log_success "生产环境启动成功!"
            echo "   Web服务:  http://localhost:$NGINX_PORT"
            echo "   后端API:  http://localhost:$BACKEND_PORT"
            echo "   Redis:    redis://localhost:$REDIS_PORT"
            echo "   日志文件: $LOG_DIR/"
        else
            log_warning "Nginx启动失败，但后端服务可用"
            echo "   后端API: http://localhost:$BACKEND_PORT"
            echo "   Redis:   redis://localhost:$REDIS_PORT"
        fi
    else
        log_warning "Nginx未配置或未安装，仅启动后端服务"
        echo "   后端API: http://localhost:$BACKEND_PORT"
        echo "   Redis:   redis://localhost:$REDIS_PORT"
        echo "   可以直接访问 client/build/index.html"
    fi
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    
    # 停止PM2管理的进程
    if command -v pm2 >/dev/null 2>&1; then
        pm2 delete $PROJECT_NAME 2>/dev/null || true
        log_info "已停止PM2管理的进程"
    fi
    
    # 停止基于PID文件的进程
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            kill -TERM $pid 2>/dev/null || true
            sleep 2
            if kill -0 $pid 2>/dev/null; then
                kill -KILL $pid 2>/dev/null || true
            fi
            log_info "已停止PID文件记录的进程 (PID: $pid)"
        fi
        rm -f "$PID_FILE"
    fi
    
    # 停止占用相关端口的进程
    kill_port_process $REDIS_PORT
    kill_port_process $BACKEND_PORT
    kill_port_process $FRONTEND_PORT
    kill_port_process $NGINX_PORT
    
    # 停止Nginx
    if command -v nginx >/dev/null 2>&1; then
        nginx -s quit 2>/dev/null || true
        log_info "已停止Nginx"
    fi
    
    log_success "所有服务已停止"
}

# 重启服务
restart_services() {
    local mode=${1:-"dev"}
    stop_services
    sleep 2
    if [ "$mode" = "prod" ]; then
        start_prod
    else
        start_dev
    fi
}

# 查看服务状态
check_status() {
    echo "=========================================="
    echo "服务状态检查 (TypeScript版本)"
    echo "=========================================="
    
    # 检查端口状态
    echo ""
    echo "端口状态:"
    for port in $REDIS_PORT $BACKEND_PORT $FRONTEND_PORT $NGINX_PORT; do
        if check_port $port; then
            echo -e "  端口 $port: ${GREEN}运行中${NC}"
            get_port_process $port | sed 's/^/    /'
        else
            echo -e "  端口 $port: ${RED}未运行${NC}"
        fi
    done
    
    # 检查Redis状态详情
    echo ""
    echo "Redis状态:"
    if check_port $REDIS_PORT; then
        if command -v redis-cli >/dev/null 2>&1; then
            if redis-cli -p $REDIS_PORT ping >/dev/null 2>&1; then
                local redis_info=$(redis-cli -p $REDIS_PORT info server 2>/dev/null | head -5)
                echo -e "  Redis: ${GREEN}运行中${NC}"
                echo "  Redis版本: $(redis-cli -p $REDIS_PORT info server 2>/dev/null | grep redis_version | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')"
                local used_memory=$(redis-cli -p $REDIS_PORT info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')
                echo "  内存使用: ${used_memory}"
                local connected_clients=$(redis-cli -p $REDIS_PORT info clients 2>/dev/null | grep connected_clients | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')
                echo "  连接数: ${connected_clients}"
            else
                echo -e "  Redis: ${RED}连接失败${NC}"
            fi
        else
            echo -e "  Redis: ${YELLOW}运行中但redis-cli未安装${NC}"
        fi
    else
        echo -e "  Redis: ${RED}未运行${NC}"
    fi
    
    # 检查PM2状态
    if command -v pm2 >/dev/null 2>&1; then
        echo ""
        echo "PM2进程状态:"
        pm2 list $PROJECT_NAME 2>/dev/null | grep $PROJECT_NAME || echo "  没有找到PM2管理的进程"
    fi
    
    # 检查PID文件
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            echo ""
            echo "PID文件进程: ${GREEN}运行中${NC} (PID: $pid)"
        else
            echo ""
            echo "PID文件进程: ${RED}已停止${NC}"
        fi
    fi
    
    # 检查Nginx状态
    if command -v nginx >/dev/null 2>&1; then
        echo ""
        if pgrep nginx > /dev/null; then
            echo -e "Nginx状态: ${GREEN}运行中${NC}"
        else
            echo -e "Nginx状态: ${RED}未运行${NC}"
        fi
    fi
    
    echo ""
    echo "=========================================="
}

# 查看日志
show_logs() {
    local service=${1:-"dev"}
    local log_file=""
    
    case $service in
        "dev")
            log_file="$LOG_DIR/dev.log"
            ;;
        "prod")
            log_file="$LOG_DIR/prod.log"
            ;;
        "redis")
            log_file="$LOG_DIR/redis.log"
            ;;
        "error")
            log_file="$LOG_DIR/err.log"
            ;;
        "out")
            log_file="$LOG_DIR/out.log"
            ;;
        *)
            log_error "未知的服务类型: $service"
            echo "可用选项: dev, prod, redis, error, out"
            return 1
            ;;
    esac
    
    if [ -f "$log_file" ]; then
        echo "显示 $service 日志 (最后50行):"
        echo "=========================================="
        tail -50 "$log_file"
        echo "=========================================="
        echo "完整日志文件: $log_file"
    else
        log_warning "日志文件不存在: $log_file"
    fi
}

# 显示帮助信息
show_help() {
    echo "Web工具集 服务管理脚本 (TypeScript版本 + Redis支持)"
    echo ""
    echo "用法: $0 <命令> [选项]"
    echo ""
    echo "命令:"
    echo "  start-dev     启动开发环境"
    echo "  start-prod    启动生产环境 (包含Redis)"
    echo "  stop          停止所有服务"
    echo "  restart-dev   重启开发环境"
    echo "  restart-prod  重启生产环境"
    echo "  status        查看服务状态"
    echo "  logs [type]   查看日志 (dev|prod|redis|error|out)"
    echo "  build         构建项目 (TypeScript编译 + React构建)"
    echo "  help          显示此帮助信息"
    echo ""
    echo "Redis相关环境变量:"
    echo "  REDIS_HOST     Redis服务器地址 (默认: localhost)"
    echo "  REDIS_PORT     Redis端口 (默认: 6379)"
    echo "  REDIS_PASSWORD Redis密码 (默认: 空)"
    echo "  REDIS_DB       Redis数据库索引 (默认: 0)"
    echo ""
    echo "示例:"
    echo "  $0 start-dev      # 启动开发环境"
    echo "  $0 start-prod     # 启动生产环境 (含Redis)"
    echo "  $0 build          # 构建项目"
    echo "  $0 restart-prod   # 重启生产环境"
    echo "  $0 status         # 查看服务状态"
    echo "  $0 logs redis     # 查看Redis日志"
    echo ""
}

# 主逻辑
case "${1:-}" in
    "start-dev")
        start_dev
        ;;
    "start-prod")
        start_prod
        ;;
    "stop")
        stop_services
        ;;
    "restart-dev")
        restart_services "dev"
        ;;
    "restart-prod")
        restart_services "prod"
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs "${2:-dev}"
        ;;
    "build")
        log_info "构建 TypeScript 项目..."
        npm run build
        log_success "项目构建完成"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "错误: 未知命令 '${1:-}'"
        echo ""
        show_help
        exit 1
        ;;
esac