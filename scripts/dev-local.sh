#!/usr/bin/env bash
# 本地一键：Redis（若未监听） + 后端 + 前端（npm run dev）
# 用法：在项目根目录执行  npm run dev:local  或  bash scripts/dev-local.sh

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
REDIS_PORT="${REDIS_PORT:-6379}"

if lsof -Pi :"${REDIS_PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "[dev-local] 端口 ${REDIS_PORT} 已有服务监听（通常为 Redis），直接启动前后端…"
  exec npm run dev
fi

if command -v redis-server >/dev/null 2>&1; then
  echo "[dev-local] 本机启动 redis-server + npm run dev（Ctrl+C 一并结束）"
  exec npx concurrently -k -n redis,web -c red,cyan \
    "redis-server --port ${REDIS_PORT}" \
    "npm run dev"
fi

echo "[dev-local] 错误：未找到 redis-server，无法在本机启动 Redis。"
echo "  macOS: brew install redis && brew services start redis"
echo "  Linux: apt/yum 安装 redis-server 或从源码安装后重试。"
exit 1
