# BRACE Milestone

Milestone: `Question.Take.NumPad` closeout
Date: 2026-03-26
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Take.Image`, `Question.Take.Explanation`, `Question.Take.Feedback`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for the standalone `/question/:id` numpad keyboard path.
- Prove that `Numpad1` through `Numpad5` select the corresponding radio answer and show the expected feedback text.

### R — Risks (top 1-5)
1. High / Standalone question behavior integrity: broader quiz tests do not prove the standalone question keyboard path.
2. Medium / Harness reliability: synthetic keyboard events can miss the window listener if the mount effect is not attached yet.
3. Medium / Harness reliability: the legacy Playwright suite had prior low-grade numpad residue, so the full gate could still produce a contradictory red.

### A — Assurances
- Keep the slice feature-local with new dedicated mocked and backend tests instead of widening shared helpers.
- Drive the same window-level `keydown` seam the product uses, not a lower-level state shortcut.
- Wait for mount effects before dispatching the synthetic numpad event so the WTR test actually exercises the listener.

### Planned Coverage
- Covered:
  - standalone `/question/:id` numpad answer selection for keys `1` through `5`
  - corresponding feedback text for correct and incorrect answers
  - mocked and real-backend lanes in Chromium and Firefox
- Not covered:
  - invalid numpad keys outside the legacy feature contract
  - Cheapest proof: add a negative-case test only if product behavior around out-of-range numpad keys becomes important later

### Planned Evidence
- Intent: prove the standalone mocked route handles numpad-driven answer selection across both browsers
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-numpad.test.tsx"`
  Result: green after the listener-timing fix, `5 passed`, `0 failed` in Chromium and Firefox, `10.9s`
  Interpretation: proves the mocked standalone route responds correctly to `Numpad1`-`Numpad5`; does not by itself prove backend wiring
- Intent: prove the same numpad behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-numpad.backend.test.tsx\""`
  Result: green, `5 passed`, `0 failed` in Chromium and Firefox, `6.1s` after server startup
  Interpretation: proves the backend route preserves the same standalone numpad behavior and question contract
- Intent: prove the new slice does not regress the broader migration baseline
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green end-to-end; mocked WTR `63 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `42 passed`, `0 failed`; timings `wtr_mocked_seconds=47`, `playwright_seconds=410`, `wtr_backend_seconds=47`, `migration_total_seconds=529`
  Interpretation: proves the numpad slice fits the current full-gate baseline and the prior legacy numpad residue did not recur in this run

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-take-numpad.test.tsx`
- `frontend/tests/wtr/backend/question-take-numpad.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-numpad.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone numpad selection maps keys to answers correctly | High / Standalone question behavior integrity | Add dedicated standalone-route mocked/backend WTR tests | Targeted mocked and backend numpad runs | Low if question form markup changes later | Re-run the targeted numpad files after keyboard-path edits |
| WTR actually exercises the window keydown listener | Medium / Harness reliability | Wait for mount effects before dispatching synthetic numpad events | First red run identified the timing race; second targeted runs passed after adding `flushFrames()` | Low | Keep the wait only in tests that drive window-level effects |
| Broader gate stays trustworthy | Medium / Harness reliability | Run the full command of record after the targeted passes | `bash ./scripts/test-migration.sh` green end-to-end | Low-Medium | Re-run in CI or a fresh workspace if the legacy numpad residue returns |

## Execution Notes
- The first targeted WTR attempt exposed a test-timing race: the first synthetic keydown could arrive before `QuestionForm` attached its window listener in `useEffect`.
- The production code did not need to change; waiting a couple of animation frames before dispatching the synthetic key event was enough to exercise the intended seam reliably.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Take.NumPad`.
- Closed the slice with a green full migration gate.

### Coverage Achieved
- Standalone `/question/:id` now has dedicated WTR proof for `Numpad1` through `Numpad5`.
- The legacy Playwright `Question.Take.NumPad` feature stayed green inside the same full-gate run.

### Evidence Run
- Intent: prove mocked standalone numpad behavior after fixing the listener-timing race
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-numpad.test.tsx"`
  Result: Chromium + Firefox green, `5 passed`, `0 failed`, `10.9s`
  Interpretation: strong proof for the mocked standalone route and the synthetic-keyboard seam
- Intent: prove backend standalone numpad behavior after the same timing fix
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-numpad.backend.test.tsx\""`
  Result: Chromium + Firefox green, `5 passed`, `0 failed`, `6.1s` after server startup
  Interpretation: strong proof for the real backend contract on the standalone route
- Intent: prove the slice against the full migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `63 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `42 passed`, `0 failed`; timings `wtr_mocked_seconds=47`, `playwright_seconds=410`, `wtr_backend_seconds=47`, `migration_total_seconds=529`
  Interpretation: the full baseline is green, including the legacy numpad feature that had been low-grade residue earlier

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-take-numpad.test.tsx`
- `frontend/tests/wtr/backend/question-take-numpad.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-numpad.md`

Pre-existing unrelated staged work was already present in the repo before this milestone:
- `AGENTS.md`
- `PLANS-old`
- `history/TEMPLATE-v2.2.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
D  AGENTS.md
M  PLANS-old
MM PLANS.md
A  history/TEMPLATE-v2.2.md
?? frontend/tests/wtr/backend/question-take-numpad.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-numpad.test.tsx
?? history/2026-03-26-question-take-numpad.md
```

### Remaining Uncertainty
- The remaining standalone-question backlog is still open after numpad: `Question.Take.Feedback.Numerical`, `Question.Take.MultipleChoice.Score`, and `Question.Take.EasyMode` do not yet have dedicated WTR counterparts.
- Cheapest next proof: re-check which of those three has the least overlap with existing quiz-level WTR coverage and take it next.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone numpad selection maps keys `1`-`5` to the expected answers | High / Standalone question behavior integrity | Dedicated mocked/backend WTR tests on `/question/:id` | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted numpad files if keyboard handling changes |
| WTR drives the intended window keydown seam | Medium / Harness reliability | Waited for mount effects before dispatching the synthetic event | First targeted red isolated the timing race; second targeted runs passed after adding `flushFrames()` | Low | Reuse the same pattern for future window-level keyboard tests |
| Full migration baseline remains green | Medium / Harness reliability | Ran the full command of record after targeted passes | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | CI or fresh-workspace rerun if the old legacy residue returns |

## Delta From Plan
- New risks discovered:
  - The first synthetic keydown on a fresh WTR mount can race the `useEffect` listener attachment for window-level keyboard handlers.
- Assurances changed:
  - Added an explicit wait for mount effects before dispatching the synthetic numpad event.
- Scope changes:
  - None
- Decision changes:
  - None

## Reusable Learning / Handoff
- For WTR tests that drive window-level keyboard listeners installed in `useEffect`, wait for mount effects before dispatching the synthetic key event.
- The old isolated legacy numpad red remains a low-grade residual to watch in other environments, but it did not reproduce in the green full-gate run that closed this slice.
