#!/usr/bin/env bash

set -euo pipefail

SSH_TARGET="${SSH_TARGET:-vps1}"
APP_DIR="${APP_DIR:-/var/www/tools}"
APP_NAME="${APP_NAME:-simple-tools}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/6653302wy/simple-tools.git}"
RELOAD_NGINX="${RELOAD_NGINX:-1}"

ssh "$SSH_TARGET" "
set -euo pipefail
sudo mkdir -p '$APP_DIR'
sudo chown -R \$(whoami):\$(whoami) '$APP_DIR'
if [ ! -d '$APP_DIR/.git' ]; then
  git clone '$REPO_URL' '$APP_DIR'
fi
cd '$APP_DIR'
git fetch origin '$BRANCH'
git checkout '$BRANCH'
git pull --ff-only origin '$BRANCH'
APP_DIR='$APP_DIR' APP_NAME='$APP_NAME' BRANCH='$BRANCH' RELOAD_NGINX='$RELOAD_NGINX' bash scripts/server-deploy.sh
"
