#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
playwright_workers="${PW_WORKERS:-1}"

playwright_started_at=$(date +%s)
echo "[migration] Playwright PW_WORKERS=${playwright_workers}"
set +e
FE_PORT=5173 PW_WORKERS="$playwright_workers" pnpm --dir "$ROOT_DIR/specs" test:playwright
playwright_status=$?
set -e
playwright_finished_at=$(date +%s)
playwright_duration=$((playwright_finished_at - playwright_started_at))
echo "[migration] Duration playwright_seconds=${playwright_duration}"
echo "[migration] Status playwright_exit_code=${playwright_status}"

if [ "$playwright_status" -ne 0 ]; then
    exit "$playwright_status"
fi

backend_wtr_started_at=$(date +%s)
set +e
pnpm --dir "$ROOT_DIR/frontend" test:wtr:backend
backend_wtr_status=$?
set -e
backend_wtr_finished_at=$(date +%s)
backend_wtr_duration=$((backend_wtr_finished_at - backend_wtr_started_at))
echo "[migration] Duration wtr_backend_seconds=${backend_wtr_duration}"
echo "[migration] Status wtr_backend_exit_code=${backend_wtr_status}"

if [ "$backend_wtr_status" -ne 0 ]; then
    exit "$backend_wtr_status"
fi
