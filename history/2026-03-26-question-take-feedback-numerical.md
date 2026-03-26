# BRACE Milestone

Milestone: `Question.Take.Feedback.Numerical` closeout
Date: 2026-03-26
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Take.Feedback`, `Question.Take.NumPad`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for the standalone `/test-numerical-question` route.
- Prove that numerical answers show the expected correctness feedback on the question page for both correct and incorrect inputs.

### R — Risks (top 1-5)
1. High / Standalone question behavior integrity: quiz-level coverage does not prove the standalone numerical route.
2. Medium / Scope / sequencing drift: the dedicated `/test-numerical-question` route could be skipped because it does not share the main `/question/:id` path shape.
3. Medium / Harness / gate reliability: even after targeted greens, the full migration gate could still reveal unrelated legacy or backend-WTR residue.

### A — Assurances
- Keep the slice feature-local with direct route rendering instead of widening shared helpers.
- Assert the question title, number input, and feedback text so the test proves the standalone page contract rather than only the backend response.
- Preserve the full migration gate as the acceptance floor after the targeted numerical checks pass.

### Planned Coverage
- Covered:
  - standalone numerical-question route feedback for incorrect and correct answers
  - mocked and real-backend lanes in Chromium and Firefox
- Not covered:
  - non-numeric validation and input-format edge cases outside the legacy feature contract
  - Cheapest proof: add focused numerical input-format cases if product behavior around decimals, blanks, or invalid text becomes important later

### Planned Evidence
- Intent: prove the standalone mocked route handles numerical answers and feedback across both browsers
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-feedback-numerical.test.tsx"`
  Result: green, `2 passed`, `0 failed` in Chromium and Firefox, `10.3s`
  Interpretation: proves the mocked standalone numerical route shows the expected feedback for the feature examples; does not by itself prove backend wiring
- Intent: prove the same standalone numerical behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-feedback-numerical.backend.test.tsx\""`
  Result: green, `2 passed`, `0 failed` in Chromium and Firefox, `5.1s` after server startup
  Interpretation: proves the backend route preserves the same standalone numerical feedback contract
- Intent: prove the new slice does not regress the broader migration baseline
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green end-to-end; mocked WTR `65 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `44 passed`, `0 failed`; timings `wtr_mocked_seconds=48`, `playwright_seconds=412`, `wtr_backend_seconds=52`, `migration_total_seconds=537`
  Interpretation: proves the numerical slice fits the current full-gate baseline and did not trigger new contradictory residue

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-take-feedback-numerical.test.tsx`
- `frontend/tests/wtr/backend/question-take-feedback-numerical.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-feedback-numerical.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone numerical feedback works on the question page | High / Standalone question behavior integrity | Add dedicated mocked and backend WTR tests for `/test-numerical-question` | Targeted mocked and backend numerical runs | Low if route wiring changes later | Re-run the targeted numerical files after standalone question-page edits |
| The dedicated route stays feature-local without helper churn | Medium / Scope / sequencing drift | Use existing form harness helpers and direct route rendering | File inventory plus targeted numerical greens | Low | Reuse the same pattern if another special standalone route remains |
| Broader migration confidence stays intact | Medium / Harness / gate reliability | Run the full command of record after the targeted passes | `bash ./scripts/test-migration.sh` | Low-Medium | Re-run in CI or a fresh workspace if contradictory failures appear later |

## Execution Notes
- The remaining standalone inventory was rechecked before implementation; numerical was the thinnest uncovered seam because it had no existing WTR counterpart and exercised its own route.
- No production or shared test-helper changes were needed; the existing form harness helpers were enough to prove the route-level contract directly.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Take.Feedback.Numerical`.
- Closed the numerical slice with a green full migration gate.

### Coverage Achieved
- Standalone numerical feedback on `/test-numerical-question` now has dedicated mocked and backend WTR proof.
- The remaining standalone backlog is reduced to `Question.Take.MultipleChoice.Score` and `Question.Take.EasyMode`.

### Evidence Run
- Intent: prove mocked standalone numerical feedback behavior
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-feedback-numerical.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `10.3s`
  Interpretation: strong proof for the mocked standalone route and its direct question-page feedback contract
- Intent: prove backend standalone numerical feedback behavior
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-feedback-numerical.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.1s` after server startup
  Interpretation: strong proof for the real backend contract on the standalone numerical route
- Intent: prove the slice against the current migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `65 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `44 passed`, `0 failed`; timings `wtr_mocked_seconds=48`, `playwright_seconds=412`, `wtr_backend_seconds=52`, `migration_total_seconds=537`
  Interpretation: the full dual-suite baseline remains green after adding the numerical route coverage

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-take-feedback-numerical.test.tsx`
- `frontend/tests/wtr/backend/question-take-feedback-numerical.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-feedback-numerical.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
M PLANS.md
?? frontend/tests/wtr/backend/question-take-feedback-numerical.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-feedback-numerical.test.tsx
?? history/2026-03-26-question-take-feedback-numerical.md
```

### Remaining Uncertainty
- `Question.Take.MultipleChoice.Score` and `Question.Take.EasyMode` still do not have dedicated standalone WTR counterparts.
- Cheapest next proof: take the standalone score slice next, because quiz-level partial-score coverage does not yet prove question-page score rendering.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone numerical feedback works for correct and incorrect answers | High / Standalone question behavior integrity | Dedicated mocked/backend WTR tests on `/test-numerical-question` | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted numerical files if the standalone numerical page changes |
| The special standalone route stays feature-local | Medium / Scope / sequencing drift | Reused existing form harness helpers without widening shared fixtures | Only the two numerical WTR files were added for product proof | Low | Apply the same pattern to future special standalone routes when possible |
| Full migration baseline remains green | Medium / Harness / gate reliability | Ran the full command of record after the targeted passes | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Re-run in CI or a fresh workspace if contradictory residue appears later |

## Delta From Plan
- New risks discovered:
  - None
- Assurances changed:
  - None
- Scope changes:
  - None
- Decision changes:
  - None

## Reusable Learning / Handoff
- Special standalone routes like `/test-numerical-question` can usually be proven feature-locally with the existing form harness helpers.
- The next best remaining standalone gap is `Question.Take.MultipleChoice.Score`; `Question.Take.EasyMode` still has stronger quiz-level overlap.
