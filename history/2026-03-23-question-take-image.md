# BRACE Milestone Report - Question.Take.Image closeout

This file was created on 2026-03-23 after the `history/` policy was adopted. The contents reflect the executed milestone closeout evidence from the original image-slice run.

- **Status:** complete
- **Commit:** `5a4e7079`
- **Summary:** Added mocked/backend WTR coverage for standalone question image rendering and hardened backend WTR with a repo-owned host-aware Vite wrapper.

## Coverage

- Mocked WTR proves the standalone `/question/:id` route shows the configured cat image when the question text contains the cat marker and omits it otherwise.
- Backend WTR proves the same behavior against the real backend contract.
- The full migration gate proves the host-aware wrapper survives the Playwright-to-backend-WTR handoff in the command of record.

## Evidence

- `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-image.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `49.4s`.
- `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-image.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `6.6s` test runtime after server startup.
- `bash ./scripts/test-migration.sh`
  Result: mocked WTR `49 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `28 passed`, `0 failed`; timings `wtr_mocked_seconds=42`, `playwright_seconds=441`, `wtr_backend_seconds=42`, `migration_total_seconds=552`.

## Remaining uncertainty

- The host-aware wrapper is proven in the current environment, but not yet in CI or a fresh workspace.
- Cheapest next proof: rerun `bash ./scripts/test-migration.sh` in CI or a fresh workspace.

## Scope

- Milestone-local scope:
  - `frontend/tests/wtr/mocked/question-take-image.test.tsx`
  - `frontend/tests/wtr/backend/question-take-image.backend.test.tsx`
  - `frontend/tests/wtr/support/host-aware-vite-plugin.mjs`
  - `frontend/web-test-runner.config.mjs`
  - `PLANS.md`
- The original closeout happened in a broader dirty worktree. This report preserves the milestone-local behavior and the objective scope evidence from that original closeout rather than the later packaging commit.

## Trace

| Behavior | Risk | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone question image rendering works on the mocked route | The slice could hide route-specific rendering differences | Feature-local mocked WTR coverage exercises the real `/question/:id` page | Mocked image WTR green in Chromium and Firefox | Low | Re-run the targeted mocked file if the standalone question page changes |
| Standalone question image rendering works against the backend | Mocked data could miss backend payload or routing differences | Backend WTR coverage uses the real backend and the same standalone route | Backend image WTR green in Chromium and Firefox | Low | Re-run the targeted backend file if question payload rules change |
| Backend WTR survives the Playwright handoff | `localhost` host-family mismatch could still break backend WTR after Playwright | Repo-owned host-aware wrapper keeps the transient Vite listener and proxy target on the same explicit host | Full gate green after wrapper landed; prior `ETIMEDOUT ::1:5174` / `ECONNREFUSED 127.0.0.1:5174` signature did not recur | Low-Medium | CI or fresh-workspace full-gate rerun |

## Objective scope evidence at original closeout

`git diff --name-status`

```text
M	AGENTS.md
M	PLANS.md
M	frontend/web-test-runner.config.mjs
```

`git status --porcelain`

```text
 M AGENTS.md
 M PLANS.md
 M frontend/web-test-runner.config.mjs
?? PLANS-old
?? frontend/tests/wtr/backend/question-take-image.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-image.test.tsx
?? frontend/tests/wtr/support/host-aware-vite-plugin.mjs
?? init.md
```
