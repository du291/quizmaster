#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
migration_started_at=$(date +%s)

echo "[migration] Running Web Test Runner mocked suite..."
wtr_mocked_started_at=$(date +%s)
wtr_mocked_status=0
set +e
pnpm --dir "$ROOT_DIR/frontend" test:wtr:mocked
wtr_mocked_status=$?
set -e
wtr_mocked_finished_at=$(date +%s)
wtr_mocked_duration=$((wtr_mocked_finished_at - wtr_mocked_started_at))
echo "[migration] Duration wtr_mocked_seconds=${wtr_mocked_duration}"
echo "[migration] Status wtr_mocked_exit_code=${wtr_mocked_status}"

if [ "$wtr_mocked_status" -ne 0 ]; then
    migration_finished_at=$(date +%s)
    migration_duration=$((migration_finished_at - migration_started_at))
    echo "[migration] Duration migration_total_seconds=${migration_duration}"
    exit "$wtr_mocked_status"
fi

echo "[migration] Running Web Test Runner backend suite and legacy Playwright suite against backend+vite..."
integration_status=0
set +e
pnpm --dir "$ROOT_DIR/specs" exec start-server-and-test \
  "concurrently \"cd $ROOT_DIR/backend && ./gradlew bootRun\" \"cd $ROOT_DIR/frontend && pnpm dev\"" \
  "8080|5173" \
  "bash $ROOT_DIR/scripts/run-backend-wtr-and-playwright.sh"
integration_status=$?
set -e

migration_finished_at=$(date +%s)
migration_duration=$((migration_finished_at - migration_started_at))
echo "[migration] Duration migration_total_seconds=${migration_duration}"

echo "[migration] Both suites completed."

if [ "$integration_status" -ne 0 ]; then
    exit "$integration_status"
fi
