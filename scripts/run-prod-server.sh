#!/usr/bin/env bash
# 生产环境启动 Node：与 loadEnv 一致，先读 .env 再由 .env.prod 覆盖，并默认 NODE_ENV=production。
# 勿裸跑 node dist/index.js（易漏 REDIS_PASSWORD 等，且与 NODE_ENV 不一致）。
# 用法: nohup bash scripts/run-prod-server.sh > ./logs/server.log 2>&1 &
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
set -a
if [[ -f "$ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env"
fi
if [[ -f "$ROOT/.env.prod" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env.prod"
fi
set +a
export NODE_ENV="${NODE_ENV:-production}"
exec node "$ROOT/dist/index.js"
