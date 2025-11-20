#!/bin/bash

# Web工具集 - 统一启动脚本
# 提供多种启动方式选择

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# 显示启动菜单
show_menu() {
    echo "==============================================="
    echo "    Web工具集 - 启动菜单"
    echo "==============================================="
    echo ""
    echo "  ${CYAN}1${NC}) 生产模式启动"
    echo "  ${CYAN}2${NC}) 开发模式启动"
    echo "  ${CYAN}3${NC}) 快速重启生产服务"
    echo "  ${CYAN}4${NC}) 查看服务状态"
    echo "  ${CYAN}5${NC}) 停止所有服务"
    echo "  ${CYAN}6${NC}) 查看管理脚本"
    echo "  ${CYAN}0${NC}) 退出"
    echo ""
    echo "==============================================="
}

# 生产模式启动
start_production() {
    echo ""
    log_info "启动生产模式..."
    
    if [ -f "./build-and-start.sh" ]; then
        ./build-and-start.sh
    else
        log_error "build-and-start.sh 不存在"
    fi
}

# 开发模式启动
start_development() {
    echo ""
    log_info "启动开发模式..."
    
    if [ -f "./dev-start.sh" ]; then
        ./dev-start.sh
    else
        log_error "dev-start.sh 不存在"
    fi
}

# 快速重启
restart_production() {
    echo ""
    log_info "快速重启生产服务..."
    
    if [ -f "./restart.sh" ]; then
        ./restart.sh
    else
        log_error "restart.sh 不存在，请先运行生产模式"
    fi
}

# 查看服务状态
show_status() {
    echo ""
    echo "==============================================="
    echo "    服务状态检查"
    echo "==============================================="
    echo ""
    
    # 获取IP地址
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    
    echo "🌐 网络访问:"
    echo "   外网IP: $SERVER_IP"
    echo "   本地地址: http://localhost"
    echo ""
    
    echo "🔧 服务状态:"
    
    # 检查生产服务
    echo -n "   生产服务: "
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "web-toolkit.*online"; then
            echo "✅ 运行中 (PM2)"
            pm2 list | grep web-toolkit | sed 's/^/     /'
        else
            echo "❌ 未运行"
        fi
    elif [ -f "app.pid" ] && kill -0 $(cat app.pid) 2>/dev/null; then
        echo "✅ 运行中 (nohup)"
        echo "     PID: $(cat app.pid)"
    else
        echo "❌ 未运行"
    fi
    
    # 检查开发服务
    echo -n "   开发服务: "
    if pgrep -f "react-scripts start" > /dev/null && pgrep -f "nodemon" > /dev/null; then
        echo "✅ 运行中"
        echo "     前端: http://localhost:3000"
        echo "     后端: http://localhost:3001"
    else
        echo "❌ 未运行"
    fi
    
    # 检查Nginx
    echo -n "   Nginx服务: "
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "✅ 运行中"
        echo -n "     监听端口: "
        netstat -tlnp | grep ':80\s.*nginx' > /dev/null && echo "80" || echo "未监听80"
    else
        echo "❌ 未运行"
    fi
    
    echo ""
    echo "📁 文件状态:"
    echo -n "   前端构建: "
    [ -f "client/build/index.html" ] && echo "✅ 已构建" || echo "❌ 未构建"
    
    echo -n "   后端代码: "
    [ -f "server/index.js" ] && echo "✅ 存在" || echo "❌ 不存在"
    
    echo -n "   日志目录: "
    [ -d "logs" ] && echo "✅ 存在" || echo "❌ 不存在"
    
    echo ""
    echo "🔗 访问地址:"
    echo "   生产环境: http://$SERVER_IP"
    echo "   开发环境: http://localhost:3000"
    echo "   API接口: http://localhost/api"
    echo ""
    echo "==============================================="
}

# 停止所有服务
stop_all_services() {
    echo ""
    log_info "停止所有服务..."
    
    # 停止生产服务
    if command -v pm2 &> /dev/null; then
        log_info "停止PM2服务..."
        pm2 stop web-toolkit 2>/dev/null || true
    fi
    
    if [ -f "app.pid" ]; then
        log_info "停止nohup服务..."
        kill $(cat app.pid) 2>/dev/null || true
        rm -f app.pid
    fi
    
    # 停止开发服务
    log_info "停止开发服务..."
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "concurrently" 2>/dev/null || true
    
    # 清理PID文件
    rm -f backend-dev.pid frontend-dev.pid
    
    log_success "所有服务已停止"
}

# 显示管理脚本
show_scripts() {
    echo ""
    echo "==============================================="
    echo "    管理脚本列表"
    echo "==============================================="
    echo ""
    echo "📜 生产环境脚本:"
    echo "   ${CYAN}build-and-start.sh${NC}    - 生产模式启动"
    echo "   ${CYAN}stop.sh${NC}              - 停止生产服务"
    echo "   ${CYAN}restart.sh${NC}           - 重启生产服务"
    echo "   ${CYAN}logs.sh${NC}              - 查看生产日志"
    echo ""
    echo "📜 开发环境脚本:"
    echo "   ${CYAN}dev-start.sh${NC}         - 开发模式启动"
    echo "   ${CYAN}dev-stop.sh${NC}          - 停止开发服务"
    echo "   ${CYAN}dev-restart.sh${NC}       - 重启开发服务"
    echo "   ${CYAN}dev-logs.sh${NC}          - 查看开发日志"
    echo "   ${CYAN}compare-prod.sh${NC}      - 对比环境"
    echo ""
    echo "📜 维护脚本:"
    echo "   ${CYAN}fix-permissions.sh${NC}    - 修复权限问题"
    echo "   ${CYAN}quick-path-fix.sh${NC}     - 快速路径修复"
    echo "   ${CYAN}force-fix.sh${NC}         - 强制修复配置"
    echo "   ${CYAN}deploy-offline.sh${NC}     - 离线部署"
    echo ""
    echo "==============================================="
}

# 主循环
main() {
    while true; do
        show_menu
        echo -n "请选择操作 [0-6]: "
        read -r choice
        echo ""
        
        case $choice in
            1)
                start_production
                ;;
            2)
                start_development
                ;;
            3)
                restart_production
                ;;
            4)
                show_status
                ;;
            5)
                stop_all_services
                ;;
            6)
                show_scripts
                ;;
            0)
                echo "👋 再见！"
                exit 0
                ;;
            *)
                log_warning "无效选择，请输入 0-6"
                ;;
        esac
        
        echo ""
        echo -n "按回车键继续..."
        read -r
        echo ""
    done
}

# 执行主函数
main "$@"