# BRACE Milestone Report - Question.Take.Explanation closeout

This file was created on 2026-03-23 after the `history/` policy was adopted. The contents reflect the executed milestone closeout evidence from the original explanation-slice run.

- **Status:** complete
- **Commit:** `38df0657`
- **Summary:** Added mocked/backend WTR coverage for standalone question explanations and widened the shared backend question helper additively for explanation payloads.

## Coverage

- Mocked WTR proves the standalone `/question/:id` route shows the selected-answer explanation for single-choice questions and the per-answer plus question explanation for multiple-choice questions.
- Backend WTR proves the same explanation behavior against the real backend contract.
- The full migration gate proves the additive backend helper widening does not regress the broader WTR or legacy Playwright suites.

## Evidence

- `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-explanation.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `4.9s`.
- `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-explanation.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `6s`.
- `bash ./scripts/test-migration.sh`
  Result: mocked WTR `51 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `30 passed`, `0 failed`; timings `wtr_mocked_seconds=41`, `playwright_seconds=412`, `wtr_backend_seconds=44`, `migration_total_seconds=524`.

## Remaining uncertainty

- The additive helper widening is proven in the current environment, but not yet in CI or a fresh workspace.
- Cheapest next proof: rerun `bash ./scripts/test-migration.sh` in CI or a fresh workspace before widening the helper further.

## Scope

- Milestone-local scope:
  - `frontend/tests/wtr/mocked/question-take-explanation.test.tsx`
  - `frontend/tests/wtr/backend/question-take-explanation.backend.test.tsx`
  - `frontend/tests/wtr/support/backend-api.ts`
  - `PLANS.md`

## Trace

| Behavior | Risk | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone question explanation behavior matches the feature intent in mocked WTR | Explanation assertions could overfit the DOM or miss multiple-choice semantics | Mocked WTR covers both selected-answer single-choice and per-answer multiple-choice explanation behavior on the real standalone route | Mocked explanation WTR green in Chromium and Firefox | Low | Re-run the targeted mocked file if explanation rendering changes |
| Standalone question explanation behavior matches the backend contract | The backend payload shape for explanations or correct answers could differ from fixtures | Backend WTR uses the real backend with additive explanation metadata passed through the shared helper | Backend explanation WTR green in Chromium and Firefox | Low | Re-run the targeted backend file if question-create payload rules change |
| Shared backend question-helper widening does not regress the broader gate | A shared helper regression could spill beyond the explanation slice | Helper widening stayed additive and was validated by the full migration gate | Full gate green with mocked WTR, Playwright, and backend WTR all passing | Low-Medium | CI or fresh-workspace full-gate rerun |

## Objective scope evidence at original closeout

`git diff --name-status`

```text
M	PLANS.md
M	frontend/tests/wtr/support/backend-api.ts
```

`git status --porcelain`

```text
 M PLANS.md
 M frontend/tests/wtr/support/backend-api.ts
?? frontend/tests/wtr/backend/question-take-explanation.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-explanation.test.tsx
```
