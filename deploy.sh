#!/bin/bash
set -euo pipefail

APP_DIR="/home/calcmate/app"
LOG_DIR="/home/calcmate/logs"

echo "=== CalcMate Deploy ==="
echo "$(date '+%Y-%m-%d %H:%M:%S')"

cd "$APP_DIR"

# Pull latest
echo "Pulling latest..."
git pull --ff-only

# Install deps if package.json changed
if git diff HEAD~1 --name-only | grep -q 'package.json'; then
  echo "package.json changed — installing deps..."
  npm install --omit=dev
  npm install -D tailwindcss
fi

# Rebuild CSS if templates or tailwind config changed
if git diff HEAD~1 --name-only | grep -qE '\.(ejs|js)$|tailwind\.config'; then
  echo "Templates changed — rebuilding CSS..."
  npx tailwindcss -i src/input.css -o public/css/tailwind.css --minify
fi

# Get PID before reload
OLD_PID=$(pm2 pid calcmate 2>/dev/null || echo "0")

# Reload
echo "Reloading PM2..."
pm2 reload calcmate --update-env

sleep 2

# Verify PID changed (hard restart if not)
NEW_PID=$(pm2 pid calcmate 2>/dev/null || echo "0")
if [ "$OLD_PID" = "$NEW_PID" ] && [ "$OLD_PID" != "0" ]; then
  echo "WARNING: PID unchanged ($OLD_PID). Hard restarting..."
  pm2 delete calcmate 2>/dev/null || true
  pm2 start ecosystem.config.js
  sleep 2
fi

# Health check
echo "Health check..."
for i in {1..5}; do
  if curl -sf http://127.0.0.1:3000/healthz > /dev/null 2>&1; then
    echo "Health check passed!"
    break
  fi
  if [ "$i" -eq 5 ]; then
    echo "HEALTH CHECK FAILED after 5 attempts!"
    exit 1
  fi
  sleep 2
done

echo "=== Deploy complete ==="
pm2 status calcmate
