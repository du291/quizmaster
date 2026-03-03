#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[migration] Running Web Test Runner suite (frontend)..."
pnpm --dir "$ROOT_DIR/frontend" test:wtr

echo "[migration] Running legacy Playwright suite (specs) against backend+vite..."
pnpm --dir "$ROOT_DIR/specs" exec start-server-and-test \
  "concurrently \"cd $ROOT_DIR/backend && ./gradlew bootRun\" \"cd $ROOT_DIR/frontend && pnpm dev\"" \
  "8080|5173" \
  "cross-env FE_PORT=5173 pnpm --dir $ROOT_DIR/specs test:playwright"

echo "[migration] Both suites completed."
