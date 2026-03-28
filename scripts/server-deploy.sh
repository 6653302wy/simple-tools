#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/tools}"
APP_NAME="${APP_NAME:-simple-tools}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
RELOAD_NGINX="${RELOAD_NGINX:-1}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/timestamp}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-30}"
HEALTHCHECK_INTERVAL="${HEALTHCHECK_INTERVAL:-2}"

cd "$APP_DIR"

echo "[deploy] fetching ${REMOTE}/${BRANCH}"
git fetch "$REMOTE" "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only "$REMOTE" "$BRANCH"

echo "[deploy] installing dependencies"
pnpm install --prod=false --frozen-lockfile

echo "[deploy] building application"
pnpm build

echo "[deploy] restarting pm2 app: ${APP_NAME}"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
else
    pm2 start ecosystem.config.cjs --update-env
fi

pm2 save

if [[ "$RELOAD_NGINX" == "1" ]]; then
    echo "[deploy] validating nginx"
    sudo nginx -t
    sudo systemctl reload nginx
fi

echo "[deploy] health check"
healthcheck_ok=0

for attempt in $(seq 1 "$HEALTHCHECK_RETRIES"); do
    if curl -fsSI "$HEALTHCHECK_URL" >/dev/null; then
        healthcheck_ok=1
        break
    fi

    echo "[deploy] waiting for app to become healthy (${attempt}/${HEALTHCHECK_RETRIES})"
    sleep "$HEALTHCHECK_INTERVAL"
done

if [[ "$healthcheck_ok" != "1" ]]; then
    echo "[deploy] health check failed"
    pm2 describe "$APP_NAME" || true
    pm2 logs "$APP_NAME" --lines 50 --nostream || true
    exit 1
fi

echo "[deploy] done"
