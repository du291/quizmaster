# BRACE Milestone Report - Question.Take.Feedback closeout

- **Status:** complete
- **Commit:** pending at report closeout
- **Summary:** Added mocked/backend WTR coverage for standalone question feedback text and multiple-choice per-answer feedback classes on `/question/:id`.

## Coverage

- Mocked WTR proves single-choice standalone questions show `Correct!` or `Incorrect!` after submission on `/question/:id`.
- Mocked WTR proves multiple-choice standalone questions show both the expected question feedback text and the per-answer `.answer-input-row` classes used by production and legacy Playwright.
- Backend WTR proves the same standalone feedback behavior against the real backend contract.
- The full migration gate proves the feedback slice does not regress the broader WTR or legacy Playwright suites; the only contradictory signal was an isolated legacy `Question.Take.NumPad` Playwright red that passed on isolated rerun and on the second full-gate attempt.

## Evidence

- `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-feedback.test.tsx"`
  Result: Chromium + Firefox green, `7 passed`, `0 failed`, `5.5s`.
- `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-feedback.backend.test.tsx\""`
  Result: Chromium + Firefox green, `7 passed`, `0 failed`, `6.5s`.
- First `bash ./scripts/test-migration.sh`
  Result: mocked WTR green, but legacy Playwright failed once on `Question.Take.NumPad` example #5 with `keyboard.press: Test ended` from `specs/src/steps/question/question-take.ts:46`.
- Isolated legacy rerun:
  - `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "bash -lc 'cd /workspaces/quizmaster/specs && pnpm exec bddgen >/dev/null && FE_PORT=5173 PW_WORKERS=1 pnpm exec playwright test .features-gen/features/take/question/Question.Take.NumPad.feature.spec.js --grep \"Example #5\"'"`
  Result: green, `1 passed`, `0 failed`.
- Second `bash ./scripts/test-migration.sh`
  Result: mocked WTR `58 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `37 passed`, `0 failed`; timings `wtr_mocked_seconds=40`, `playwright_seconds=412`, `wtr_backend_seconds=42`, `migration_total_seconds=517`.

## Remaining uncertainty

- Legacy Playwright still has low-grade race potential outside the migrated WTR slices, as shown by the first isolated `Question.Take.NumPad` red.
- Cheapest next proof: rerun `bash ./scripts/test-migration.sh` in CI or a fresh workspace and treat any repeat of the same numpad red as a pull instead of assuming it is harmless.

## Scope

- `frontend/tests/wtr/mocked/question-take-feedback.test.tsx`
- `frontend/tests/wtr/backend/question-take-feedback.backend.test.tsx`
- `PLANS.md`

## Trace

| Behavior | Risk | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone single-choice feedback text matches feature intent | Existing quiz-take tests may not cover `/question/:id` semantics | Dedicated mocked/backend WTR tests on the standalone route | Targeted mocked and backend feedback runs green in Chromium and Firefox | Low | Re-run the targeted files if standalone question feedback logic changes |
| Standalone multiple-choice per-answer classes match production semantics | Assertions could target the wrong DOM node or miss class semantics | Tests assert classes directly on `.answer-input-row`, matching production and legacy Playwright | Targeted mocked and backend feedback runs green with class assertions | Low-Medium | Inspect one failing DOM snapshot if the answer-row contract changes |
| Broader gate remains trustworthy after the slice lands | Legacy Playwright can still race outside the touched WTR slice | Used the full command of record and investigated the isolated contradictory signal before accepting the milestone | First full gate had one isolated legacy numpad red; isolated rerun passed; second full gate passed end-to-end | Low-Medium | CI or fresh-workspace rerun; pull if the same legacy red repeats |

## Objective scope evidence at original closeout

`git diff --name-status`

```text
M	PLANS.md
```

`git status --porcelain`

```text
 M PLANS.md
?? frontend/tests/wtr/backend/question-take-feedback.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-feedback.test.tsx
?? history/2026-03-23-question-take-feedback.md
```
