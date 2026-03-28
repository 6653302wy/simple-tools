#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/tools}"
APP_NAME="${APP_NAME:-simple-tools}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
RELOAD_NGINX="${RELOAD_NGINX:-1}"

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
curl -fsSI "http://127.0.0.1:3000/timestamp" >/dev/null

echo "[deploy] done"
