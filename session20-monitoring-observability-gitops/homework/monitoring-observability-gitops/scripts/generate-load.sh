#!/usr/bin/env sh
set -eu

APP_URL="${APP_URL:-http://localhost:8080}"
REQUESTS="${REQUESTS:-120}"

echo "Generating ${REQUESTS} successful requests, CPU work, and sample errors..."
i=1
while [ "$i" -le "$REQUESTS" ]; do
  curl --silent --fail "${APP_URL}/api" >/dev/null
  if [ $((i % 10)) -eq 0 ]; then
    curl --silent --fail "${APP_URL}/work?ms=250" >/dev/null
  fi
  if [ $((i % 25)) -eq 0 ]; then
    curl --silent "${APP_URL}/error" >/dev/null
  fi
  i=$((i + 1))
done

echo "Load complete. Dashboard: http://localhost:3000/d/session20-overview"
