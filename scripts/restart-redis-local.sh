#!/usr/bin/env bash
# 本地重启 Redis（使用项目根目录 redis.conf）
# 用法：在项目根执行  bash scripts/restart-redis-local.sh
#
# 若使用 Homebrew 管理 Redis，会先尝试: brew services stop redis
# 再本进程启动 redis-server；若你希望始终用 brew，可改用: brew services restart redis

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
CONF="$ROOT/redis.conf"

if [ ! -f "$CONF" ]; then
  echo "未找到 $CONF"
  exit 1
fi

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi
REDIS_PORT="${REDIS_PORT:-6379}"
PASS="${REDIS_PASSWORD:-123456}"

echo "[restart-redis] 配置: $CONF  端口: $REDIS_PORT  密码: .env 中 REDIS_PASSWORD（默认 123456）"

if command -v brew >/dev/null 2>&1; then
  echo "[restart-redis] 尝试停止 Homebrew 托管的 redis（避免与手动启动冲突）…"
  brew services stop redis 2>/dev/null || true
  sleep 2
fi

if lsof -Pi :"${REDIS_PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "[restart-redis] 端口 ${REDIS_PORT} 仍被占用，尝试 redis-cli SHUTDOWN（无密码）…"
  redis-cli -p "${REDIS_PORT}" SHUTDOWN NOSAVE 2>/dev/null || true
  sleep 2
fi

if lsof -Pi :"${REDIS_PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "[restart-redis] 仍占用，尝试带密码 SHUTDOWN…"
  redis-cli -p "${REDIS_PORT}" -a "${PASS}" SHUTDOWN NOSAVE 2>/dev/null || true
  sleep 2
fi

if lsof -Pi :"${REDIS_PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "[restart-redis] 仍无法释放端口，请手动: brew services stop redis  或 活动监视器结束 redis-server"
  exit 1
fi

mkdir -p /tmp/redis-data
echo "[restart-redis] 启动: redis-server $CONF --pidfile /tmp/redis_6379.pid --requirepass <来自 .env> --daemonize yes"
redis-server "$CONF" \
  --pidfile /tmp/redis_6379.pid \
  --requirepass "$PASS" \
  --daemonize yes

sleep 1
if redis-cli -p "${REDIS_PORT}" -a "${PASS}" ping 2>/dev/null | grep -q PONG; then
  echo "[restart-redis] 成功: redis-cli -p ${REDIS_PORT} -a *** ping -> PONG"
else
  echo "[restart-redis] 检测失败，请执行: redis-cli -p ${REDIS_PORT} ping"
  exit 1
fi
