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

# 项目配置（后续命令均在项目根目录执行，避免路径错误）
PROJECT_NAME="web-toolkit"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1
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

# 加载 .env / .env.prod：需为 shell 可解析的 KEY=value（支持 export KEY=）
# 使用 set -a 自动 export，避免 export $(grep|xargs) 对空格/特殊字符出错
load_env_file() {
    local f="$1"
    if [ ! -f "$f" ]; then
        return 1
    fi
    log_info "加载环境变量: $f"
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
}

# 解析 Redis 密码：当前环境 > .env.prod > .env（仅解析单行，不 source 整文件）
resolve_redis_password() {
    if [ -n "${REDIS_PASSWORD:-}" ]; then
        printf '%s' "$REDIS_PASSWORD"
        return 0
    fi
    local f val
    for f in "$PROJECT_DIR/.env.prod" "$PROJECT_DIR/.env"; do
        [ -f "$f" ] || continue
        val=$(grep -E '^[[:space:]]*REDIS_PASSWORD=' "$f" 2>/dev/null | tail -n1 | sed 's/^[[:space:]]*REDIS_PASSWORD=//')
        if [ -n "$val" ]; then
            val="${val%$'\r'}"
            if [[ "$val" == \"*\" ]]; then val="${val#\"}"; val="${val%\"}"; fi
            if [[ "$val" == \'*\' ]]; then val="${val#\'}"; val="${val%\'}"; fi
            printf '%s' "$val"
            return 0
        fi
    done
    printf ''
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

# 停止指定端口的进程（可能多个 PID）
kill_port_process() {
    local port=$1
    local before pids pid
    before=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | sort -u | tr '\n' ' ')
    if [ -z "$before" ]; then
        return 0
    fi
    for pid in $before; do
        [ -n "$pid" ] || continue
        kill -TERM "$pid" 2>/dev/null || true
    done
    sleep 2
    pids=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | sort -u | tr '\n' ' ')
    for pid in $pids; do
        [ -n "$pid" ] || continue
        if kill -0 "$pid" 2>/dev/null; then
            kill -KILL "$pid" 2>/dev/null || true
        fi
    done
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 $port 仍有进程占用"
    else
        log_success "已停止占用端口 $port 的进程 (PID: $before)"
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

# 加载 .env.prod 优先，否则 .env（供 start-prod / start-redis / up 使用）
load_stack_env() {
    local env_file="$PROJECT_DIR/.env.prod"
    if [ ! -f "$env_file" ]; then
        env_file="$PROJECT_DIR/.env"
    fi
    if [ -f "$env_file" ]; then
        load_env_file "$env_file"
    else
        log_warning "未找到 .env.prod 或 .env，将仅使用当前 shell 已 export 的变量"
    fi
    REDIS_PORT="${REDIS_PORT:-6379}"
}

# 安装根目录 + client 依赖
install_deps() {
    log_info "安装根目录 npm 依赖..."
    npm install
    log_info "安装 client npm 依赖..."
    (cd "$PROJECT_DIR/client" && npm install)
    log_success "依赖安装完成"
}

# 构建（与 package.json build 一致）
run_build() {
    log_info "执行 npm run build（TypeScript + React）..."
    (cd "$PROJECT_DIR" && npm run build)
    log_success "构建完成"
}

# 确保本机 Redis 已监听且密码与 REDIS_PASSWORD 一致（需已设置 REDIS_PASSWORD）
ensure_redis_running() {
    if [ -z "${REDIS_PASSWORD:-}" ]; then
        log_error "需要 REDIS_PASSWORD。请在 $PROJECT_DIR/.env 或 .env.prod 中设置（见 .env.example）。"
        return 1
    fi

    if check_port "$REDIS_PORT"; then
        log_warning "Redis 端口 $REDIS_PORT 已被占用:"
        get_port_process "$REDIS_PORT"
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port_process "$REDIS_PORT"
        else
            log_warning "跳过启动 Redis，仅检测已有实例"
        fi
    fi

    if ! check_port "$REDIS_PORT"; then
        if ! command -v redis-server >/dev/null 2>&1; then
            log_error "未找到 redis-server，请先安装 Redis（如 macOS: brew install redis）"
            return 1
        fi
        log_info "启动 Redis（requirepass 来自环境变量）..."
        cat > "$LOG_DIR/redis-prod.conf" << EOF
bind 127.0.0.1
port $REDIS_PORT
daemonize yes
pidfile $LOG_DIR/redis_6379.pid
logfile $LOG_DIR/redis.log
dbfilename dump.rdb
dir $LOG_DIR/
requirepass $REDIS_PASSWORD
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename appendonly.aof
appendfsync everysec
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF
        log_info "Redis 配置文件: $LOG_DIR/redis-prod.conf（模板参考: $PROJECT_DIR/redis-prod.conf）"
        nohup redis-server "$LOG_DIR/redis-prod.conf" > "$LOG_DIR/redis-startup.log" 2>&1 &
        sleep 3
        if check_port "$REDIS_PORT"; then
            if redis-cli -h 127.0.0.1 -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping >/dev/null 2>&1; then
                log_success "Redis 已启动，密码校验通过（conf: $LOG_DIR/redis-prod.conf）"
            else
                log_error "Redis 已监听但密码认证失败"
                return 1
            fi
        else
            log_error "Redis 启动失败，见 $LOG_DIR/redis-startup.log"
            return 1
        fi
    else
        if ! redis-cli -h 127.0.0.1 -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping >/dev/null 2>&1; then
            log_error "Redis 已在运行但密码认证失败，请检查 REDIS_PASSWORD 与实例 requirepass 是否一致"
            return 1
        fi
        log_info "Redis 已在运行且密码校验通过（仓库参考: $PROJECT_DIR/redis.conf、redis-prod.conf）"
    fi
    return 0
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
    load_stack_env
    
    # 检查必要的环境变量（禁止在脚本中写死默认密码）
    if [ -z "${REDIS_PASSWORD:-}" ]; then
        log_error "start-prod 需要 REDIS_PASSWORD。请在 $PROJECT_DIR/.env.prod 或 .env 中设置（可参考 .env.example）。"
        return 1
    fi
    
    log_info "生产环境配置："
    echo "  NODE_ENV: ${NODE_ENV:-production}"
    echo "  PORT: ${PORT:-3001}"
    echo "  REDIS_HOST: ${REDIS_HOST:-127.0.0.1}"
    echo "  REDIS_PORT: ${REDIS_PORT:-6379}"
    echo "  REDIS_DB: ${REDIS_DB:-0}"
    echo "  MAX_MEMORY_RESTART: ${MAX_MEMORY_RESTART:-1G}"
    echo "  NODE_MAX_OLD_SPACE_SIZE: ${NODE_MAX_OLD_SPACE_SIZE:-1024}"
    
    # 构建 TypeScript 后端和 React 前端
    if [ ! -d "dist" ] || [ ! -d "client/build" ]; then
        log_info "未检测到构建产物，正在构建..."
        run_build
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
    
    ensure_redis_running || return 1
    
    # 启动后端服务 (使用PM2或直接启动)
    log_info "启动后端服务..."
    if command -v pm2 >/dev/null 2>&1; then
        log_info "使用PM2启动后端服务..."
        # 停止可能存在的同名进程
        pm2 delete web-toolkit 2>/dev/null || true
        sleep 2
        
        # 启动新进程
        if pm2 start ecosystem.config.js --env production; then
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
    
    log_success "生产环境后端已启动（反向代理请自行配置；可参考 docs/nginx部署示例.conf）"
    echo "   后端 API: http://localhost:$BACKEND_PORT"
    echo "   前端静态: client/build（由 Nginx/Caddy/对象存储等自行托管）"
    echo "   Redis:    redis://localhost:$REDIS_PORT"
    echo "   日志目录: $LOG_DIR/"
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

# 检查 Redis 是否设置 requirepass，以及 .env 中 REDIS_PASSWORD 是否可连接
check_redis_password() {
    echo "=========================================="
    echo "Redis 密码检查 (requirepass)"
    echo "=========================================="
    load_stack_env
    local port="${REDIS_PORT:-6379}"
    local env_pw
    env_pw=$(resolve_redis_password)

    if ! command -v redis-cli >/dev/null 2>&1; then
        log_error "未安装 redis-cli，无法检查"
        return 1
    fi
    if ! check_port "$port"; then
        log_error "127.0.0.1:$port 无监听（Redis 未启动或端口不一致）"
        echo "  提示: 检查 REDIS_PORT 与实例是否一致"
        return 1
    fi

    echo "  目标: 127.0.0.1:$port"
    if [ -n "$env_pw" ]; then
        echo "  .env/.env.prod: 已解析到 REDIS_PASSWORD（${#env_pw} 字符）"
    else
        echo "  .env/.env.prod: 未配置 REDIS_PASSWORD"
    fi
    echo ""

    # 无密码 PING
    if redis-cli -h 127.0.0.1 -p "$port" ping 2>/dev/null | grep -q PONG; then
        local req
        req=$(redis-cli -h 127.0.0.1 -p "$port" CONFIG GET requirepass 2>/dev/null | tail -n1 | tr -d '\r')
        if [ -z "$req" ]; then
            log_warning "服务端 requirepass: 未设置（允许无密码连接）"
        else
            log_success "服务端 requirepass: 已设置（非空，不在此打印）"
        fi
        if [ -n "$env_pw" ]; then
            if REDISCLI_AUTH="$env_pw" redis-cli -h 127.0.0.1 -p "$port" ping 2>/dev/null | grep -q PONG; then
                log_success "使用 .env 中的密码可正常 AUTH + PING"
            else
                log_warning "使用 .env 中的密码无法通过认证（若已设 requirepass，请对齐密码）"
            fi
        fi
        echo ""
        echo "命令自查: redis-cli -h 127.0.0.1 -p $port CONFIG GET requirepass"
        return 0
    fi

    # 无密码连不上，尝试用 .env 密码
    if [ -z "$env_pw" ]; then
        log_error "连接被拒绝或需要密码，但未配置 REDIS_PASSWORD（请在 .env 或 .env.prod 中设置）"
        return 1
    fi
    if REDISCLI_AUTH="$env_pw" redis-cli -h 127.0.0.1 -p "$port" ping 2>/dev/null | grep -q PONG; then
        log_success "Redis 需要密码，且当前 .env 中 REDIS_PASSWORD 可连接"
        local req
        req=$(REDISCLI_AUTH="$env_pw" redis-cli -h 127.0.0.1 -p "$port" CONFIG GET requirepass 2>/dev/null | tail -n1 | tr -d '\r')
        if [ -n "$req" ]; then
            echo "  CONFIG requirepass: 已设置（非空）"
        else
            echo "  CONFIG requirepass: 空（若仍要求密码，可能为 ACL 等配置）"
        fi
        echo ""
        echo "命令自查: REDISCLI_AUTH='你的密码' redis-cli -h 127.0.0.1 -p $port CONFIG GET requirepass"
        return 0
    fi

    log_error "无法连接：密码错误、端口不对或 bind 限制"
    return 1
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
    
    # 检查Redis状态详情（有密码时用 REDISCLI_AUTH，避免 -a 出现在进程参数中）
    echo ""
    echo "Redis状态:"
    if check_port $REDIS_PORT; then
        if command -v redis-cli >/dev/null 2>&1; then
            local _rp
            _rp=$(resolve_redis_password)
            if [ -n "$_rp" ]; then
                if REDISCLI_AUTH="$_rp" redis-cli -h 127.0.0.1 -p "$REDIS_PORT" ping >/dev/null 2>&1; then
                    echo -e "  Redis: ${GREEN}运行中${NC}"
                    echo "  Redis版本: $(REDISCLI_AUTH="$_rp" redis-cli -h 127.0.0.1 -p "$REDIS_PORT" info server 2>/dev/null | grep redis_version | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')"
                    local used_memory
                    used_memory=$(REDISCLI_AUTH="$_rp" redis-cli -h 127.0.0.1 -p "$REDIS_PORT" info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')
                    echo "  内存使用: ${used_memory}"
                    local connected_clients
                    connected_clients=$(REDISCLI_AUTH="$_rp" redis-cli -h 127.0.0.1 -p "$REDIS_PORT" info clients 2>/dev/null | grep connected_clients | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')
                    echo "  连接数: ${connected_clients}"
                else
                    echo -e "  Redis: ${RED}连接失败${NC}（已配置密码但认证失败或未匹配）"
                fi
            else
                if redis-cli -h 127.0.0.1 -p "$REDIS_PORT" ping >/dev/null 2>&1; then
                    echo -e "  Redis: ${GREEN}运行中${NC}"
                    echo "  Redis版本: $(redis-cli -h 127.0.0.1 -p "$REDIS_PORT" info server 2>/dev/null | grep redis_version | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')"
                    local used_memory
                    used_memory=$(redis-cli -h 127.0.0.1 -p "$REDIS_PORT" info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')
                    echo "  内存使用: ${used_memory}"
                    local connected_clients
                    connected_clients=$(redis-cli -h 127.0.0.1 -p "$REDIS_PORT" info clients 2>/dev/null | grep connected_clients | cut -d: -f2 | tr -d '\r' 2>/dev/null || echo '未知')
                    echo "  连接数: ${connected_clients}"
                else
                    echo -e "  Redis: ${RED}连接失败${NC}（若启用了 requirepass，请在环境或 .env 中设置 REDIS_PASSWORD）"
                fi
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

# 仅启动 Redis（需 .env / .env.prod 中 REDIS_PASSWORD）
start_redis_only() {
    log_info "仅启动 / 检测 Redis..."
    ensure_dirs
    load_stack_env
    if [ -z "${REDIS_PASSWORD:-}" ]; then
        log_error "需要 REDIS_PASSWORD（见 .env / .env.prod）"
        return 1
    fi
    ensure_redis_running
}

# 一键：安装依赖 → 构建 → 生产启动（含 Redis + 后端）
run_up() {
    log_info "=== 一键 up：install → build → start-prod ==="
    ensure_dirs
    install_deps
    run_build
    start_prod
}

# 显示帮助信息
show_help() {
    echo "Web工具集 服务管理脚本 (TypeScript版本 + Redis支持)"
    echo ""
    echo "用法: $0 <命令> [选项]"
    echo ""
    echo "一键 / 常用:"
    echo "  install       安装依赖（根目录 + client 的 npm install）"
    echo "  build         构建项目（npm run build：TS + React）"
    echo "  start-redis   仅启动或校验本机 Redis（读 .env / .env.prod）"
    echo "  up            一键：install → build → start-prod（含 Redis + PM2/Node）"
    echo "  down          一键停止（同 stop：PM2/端口进程/尝试停 nginx）"
    echo "  restart       一键重启生产（stop 后 start-prod，等同 restart-prod）"
    echo "  check-redis   检查 Redis 是否设置密码、.env 密码是否可连"
    echo ""
    echo "服务:"
    echo "  start-dev     启动开发环境"
    echo "  start-prod    启动生产环境 (含 Redis + 后端)"
    echo "  stop          停止所有服务（与 down 相同）"
    echo "  restart-dev   重启开发环境"
    echo "  restart-prod  重启生产环境（与 restart 相同）"
    echo "  status        查看服务状态"
    echo "  logs [type]   查看日志 (dev|prod|redis|error|out)"
    echo "  help          显示此帮助信息"
    echo ""
    echo "Redis相关环境变量:"
    echo "  REDIS_HOST     Redis服务器地址 (默认: 127.0.0.1，见 .env)"
    echo "  REDIS_PORT     Redis端口 (默认: 6379)"
    echo "  REDIS_PASSWORD start-prod / start-redis / up 必填，勿在脚本中硬编码"
    echo "  REDIS_DB       Redis数据库索引 (默认: 0)"
    echo ""
    echo "示例:"
    echo "  $0 install        # 只装依赖"
    echo "  $0 build          # 只构建"
    echo "  $0 start-redis    # 只起 Redis"
    echo "  $0 up             # 依赖 + 构建 + 生产启动（推荐首次部署）"
    echo "  $0 down           # 一键停止"
    echo "  $0 restart        # 一键重启生产"
    echo "  $0 start-prod     # 已有构建产物时启动生产"
    echo "  $0 start-dev      # 开发环境"
    echo "  $0 status"
    echo "  $0 check-redis"
    echo "  $0 logs redis"
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
    "stop"|"down")
        stop_services
        ;;
    "restart"|"restart-prod")
        restart_services "prod"
        ;;
    "restart-dev")
        restart_services "dev"
        ;;
    "status")
        check_status
        ;;
    "check-redis")
        check_redis_password
        ;;
    "logs")
        show_logs "${2:-dev}"
        ;;
    "install")
        ensure_dirs
        install_deps
        ;;
    "build")
        ensure_dirs
        run_build
        ;;
    "start-redis")
        start_redis_only
        ;;
    "up")
        run_up
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