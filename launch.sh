#!/usr/bin/env bash
# Nakshatra Business Advisory — local CMS launcher (Linux / macOS / Git Bash)
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-3000}"
URL="http://localhost:${PORT}"
ADMIN_URL="${URL}/admin"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install it from https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run, this may take a minute)..."
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  else
    npm install
  fi
fi

open_browser() {
  sleep 2
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 &
  fi
}

echo ""
echo "  Nakshatra Business Advisory — local CMS"
echo "  ----------------------------------------"
echo "  Site  :  ${URL}"
echo "  Admin :  ${ADMIN_URL}"
echo "  Press Ctrl+C to stop."
echo ""

open_browser &
exec node server.js
