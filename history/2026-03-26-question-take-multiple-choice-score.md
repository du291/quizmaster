# BRACE Milestone

Milestone: `Question.Take.MultipleChoice.Score` closeout
Date: 2026-03-26
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Take.Feedback`, `Question.Take.NumPad`, `Question.Take.Feedback.Numerical`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for standalone partially scored multiple-choice questions on `/question/:id`.
- Prove that the question page shows the expected score label and correctness feedback for the legacy partial-score examples.

### R — Risks (top 1-5)
1. High / Standalone question behavior integrity: quiz-level partial-score coverage does not prove the standalone question-page score contract.
2. Medium / Scope / sequencing drift: a naive score test could duplicate results-page coverage without proving the question-page rendering seam.
3. Medium / Harness / gate reliability: the full migration gate could still surface unrelated legacy Playwright residue after the targeted score checks pass.

### A — Assurances
- Keep the slice feature-local on `/question/:id` and assert both `.question-feedback` and `.question-score` directly.
- Reuse the existing `(Partial Score)` title marker that already drives the product’s partial-correctness label instead of widening production code.
- Treat contradictory full-gate evidence as real: isolate the legacy residue first, then rerun the full gate before accepting the slice.

### Planned Coverage
- Covered:
  - standalone partial-score question feedback and score labels for all legacy feature examples
  - mocked and real-backend lanes in Chromium and Firefox
- Not covered:
  - results-page aggregate scoring, already covered by quiz-level score suites
  - Cheapest proof: extend quiz-level score coverage only if a future change modifies aggregate results behavior rather than the standalone question page

### Planned Evidence
- Intent: prove the standalone mocked route handles partial-score feedback and score labels across both browsers
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-multiple-choice-score.test.tsx"`
  Result: green, `6 passed`, `0 failed` in Chromium and Firefox, `11.2s`
  Interpretation: proves the mocked standalone score route renders the expected feedback and score for the legacy examples; does not by itself prove backend wiring
- Intent: prove the same standalone score behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-multiple-choice-score.backend.test.tsx\""`
  Result: green, `6 passed`, `0 failed` in Chromium and Firefox, `6.6s` after server startup
  Interpretation: proves the backend route preserves the same standalone score and feedback contract
- Intent: prove the slice against the full migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: first attempt hit one isolated legacy Chromium numpad red (`keyboard.press: Test ended`) while the score-targeted evidence stayed green; the blocker was contradictory rather than clearly score-related
  Interpretation: the first full-gate attempt was not strong enough acceptance evidence for the slice, so a recurrence loop was required

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-take-multiple-choice-score.test.tsx`
- `frontend/tests/wtr/backend/question-take-multiple-choice-score.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-multiple-choice-score.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone partial-score feedback and score render correctly | High / Standalone question behavior integrity | Add dedicated mocked/backend WTR tests on `/question/:id` | Targeted mocked and backend score runs | Low if question-page score markup changes later | Re-run the targeted score files after standalone question-page edits |
| The slice stays feature-local and avoids helper churn | Medium / Scope / sequencing drift | Reuse existing form-harness helpers and the `(Partial Score)` title marker | File inventory plus targeted score greens | Low | Reuse the same pattern for similar standalone route slices |
| Broader migration confidence remains intact | Medium / Harness / gate reliability | Run the full command of record and investigate contradictions before accepting the slice | `bash ./scripts/test-migration.sh` plus recurrence loop if needed | Low-Medium | Isolate any repeated legacy residue and rerun the full gate once |

## Execution Notes
- The score slice did not require production changes; the existing `QuestionForm` already exposed the score seam through `.question-score` and partial-correctness copy through the `(Partial Score)` question marker.
- The first full gate reproduced the known legacy Chromium numpad residue. Because the score slice did not touch numpad behavior, the acceptance path followed the existing recurrence protocol instead of claiming the slice was green prematurely.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Take.MultipleChoice.Score`.
- Closed the score slice after a contradictory full-gate red was isolated to legacy numpad and a second full gate passed.

### Coverage Achieved
- Standalone partial-score feedback and score labels on `/question/:id` now have dedicated mocked and backend WTR proof.
- The remaining apparent standalone backlog is reduced to `Question.Take.EasyMode`.

### Evidence Run
- Intent: prove mocked standalone score behavior
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-multiple-choice-score.test.tsx"`
  Result: Chromium + Firefox green, `6 passed`, `0 failed`, `11.2s`
  Interpretation: strong proof for the mocked standalone route and its score/feedback contract
- Intent: prove backend standalone score behavior
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-multiple-choice-score.backend.test.tsx\""`
  Result: Chromium + Firefox green, `6 passed`, `0 failed`, `6.6s` after server startup
  Interpretation: strong proof for the real backend contract on the standalone score route
- Intent: determine whether the first contradictory full-gate red was score-related or legacy numpad residue
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "cd /workspaces/quizmaster/specs && pnpm exec bddgen && FE_PORT=5173 PW_WORKERS=1 pnpm exec playwright test .features-gen/features/take/question/Question.Take.NumPad.feature.spec.js --project=chromium"`
  Result: green, `5 passed`, `11.0s`
  Interpretation: strong evidence that the first full-gate failure was isolated legacy numpad residue under mixed load, not a deterministic regression in the score slice
- Intent: prove the slice against the full migration acceptance floor after isolating the residue
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: second attempt green end-to-end; mocked WTR `71 passed`, `0 failed`; backend WTR `50 passed`, `0 failed`; `wtr_backend_seconds=48`; `migration_total_seconds=511`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice. By inference from the fixed 155-test Playwright suite and the cleared single numpad failure from the first attempt, the green Playwright rerun is consistent with `153 passed`, `2 skipped`; the exact summary line was not retained in the terminal capture

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-take-multiple-choice-score.test.tsx`
- `frontend/tests/wtr/backend/question-take-multiple-choice-score.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-multiple-choice-score.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
M PLANS.md
?? frontend/tests/wtr/backend/question-take-multiple-choice-score.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-multiple-choice-score.test.tsx
?? history/2026-03-26-question-take-multiple-choice-score.md
```

### Remaining Uncertainty
- `Question.Take.EasyMode` still lacks dedicated standalone WTR coverage.
- Cheapest next proof: add standalone easy-mode presence/absence tests on `/question/:id`, because the route uses `question.easyMode` directly and still lacks dedicated proof.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone partial-score feedback and score render correctly | High / Standalone question behavior integrity | Dedicated mocked/backend WTR tests on `/question/:id` | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted score files if standalone score rendering changes |
| The slice stays feature-local | Medium / Scope / sequencing drift | Reused existing question-form helpers and title marker instead of widening production code | Only the two standalone score WTR files were added for product proof | Low | Reuse the same pattern for the remaining standalone easy-mode route if it fits |
| Full migration confidence remains trustworthy despite legacy residue | Medium / Harness / gate reliability | Isolated the recurring numpad red and required a second full gate before acceptance | First full gate red on legacy numpad; isolated replay green; second full gate green | Low-Medium | Escalate if the same numpad residue repeats again in the next slice or another environment |

## Delta From Plan
- New risks discovered:
  - The known legacy Chromium numpad residue recurred under mixed-load full-gate execution.
- Assurances changed:
  - Acceptance required the explicit recurrence loop: isolated legacy replay plus a second full gate.
- Scope changes:
  - None
- Decision changes:
  - `Question.Take.EasyMode` is now the next slice because it remains the last apparent standalone route gap.

## Reusable Learning / Handoff
- Standalone partial-score proof can stay feature-local by reusing the existing question-form selection helpers and asserting `.question-feedback` plus `.question-score` directly.
- When the known legacy numpad residue reappears under mixed-load Playwright, isolate the generated numpad spec before attributing the failure to the current migration slice.
