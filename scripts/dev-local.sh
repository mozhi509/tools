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

if command -v docker >/dev/null 2>&1; then
  echo "[dev-local] 未检测到 redis-server，使用 Docker 在本机端口 ${REDIS_PORT} 启动 Redis…"
  docker rm -f web-toolkit-redis-local 2>/dev/null || true
  docker run -d --name web-toolkit-redis-local -p "${REDIS_PORT}:6379" redis:7-alpine
  cleanup() {
    docker stop web-toolkit-redis-local >/dev/null 2>&1 || true
    docker rm web-toolkit-redis-local >/dev/null 2>&1 || true
  }
  trap cleanup EXIT INT TERM
  npm run dev
  cleanup
  exit 0
fi

echo "[dev-local] 错误：未找到 redis-server 且未安装 Docker。"
echo "  macOS: brew install redis"
echo "  或安装 Docker 后重试。"
exit 1
