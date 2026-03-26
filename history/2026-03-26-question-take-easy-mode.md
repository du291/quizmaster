# BRACE Milestone

Milestone: `Question.Take.EasyMode` closeout
Date: 2026-03-26
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Take.Image`, `Question.Take.Explanation`, `Question.Take.Feedback`, `Question.Take.NumPad`, `Question.Take.Feedback.Numerical`, `Question.Take.MultipleChoice.Score`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for standalone easy-mode correct-answer count behavior on `/question/:id`.
- Prove the standalone route shows or hides `.correct-answers-count` correctly for the four legacy feature shapes.

### R — Risks (top 1-5)
1. High / Standalone question behavior integrity: quiz-level easy-mode coverage does not prove the standalone route branch because `/question/:id` passes no `quizDifficulty`.
2. Medium / Scope / sequencing drift: a naive test could reuse quiz-level cases without directly proving the standalone route’s presence/absence contract.
3. Medium / Harness / gate reliability: the recurring legacy numpad residue could still reappear during the full gate even though easy mode does not touch keyboard handling.

### A — Assurances
- Keep the slice feature-local on `/question/:id` and assert `.correct-answers-count` directly before any answer submission.
- Reuse the legacy feature shapes but bind them to standalone question fixtures instead of quiz difficulty overrides.
- Preserve the full-gate recurrence protocol while still requiring the command of record for acceptance.

### Planned Coverage
- Covered:
  - standalone multiple-choice easy mode with 3 correct answers
  - standalone multiple-choice easy mode with 2 correct answers
  - standalone multiple-choice easy mode off
  - standalone single-choice no-count behavior
  - mocked and real-backend lanes in Chromium and Firefox
- Not covered:
  - quiz difficulty override behavior, already covered by the quiz-level easy-mode suites
  - Cheapest proof: extend the quiz-level easy-mode suites only if a later change modifies difficulty overrides instead of standalone question behavior

### Planned Evidence
- Intent: prove the standalone mocked route handles easy-mode count visibility across both browsers
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-easy-mode.test.tsx"`
  Result: green, `4 passed`, `0 failed` in Chromium and Firefox, `9.0s`
  Interpretation: proves the mocked standalone route shows and hides `.correct-answers-count` correctly for the feature shapes; does not by itself prove backend wiring
- Intent: prove the same standalone easy-mode behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-easy-mode.backend.test.tsx\""`
  Result: green, `4 passed`, `0 failed` in Chromium and Firefox, `5.1s` after server startup
  Interpretation: proves the backend route preserves the same standalone easy-mode count contract
- Intent: prove the slice against the full migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green end-to-end; mocked WTR `75 passed`, `0 failed`; backend WTR `54 passed`, `0 failed`; `wtr_mocked_seconds=48`; `wtr_backend_seconds=51`; `migration_total_seconds=517`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and the closed standalone-question backlog. By inference from the fixed 155-test Playwright suite and the stable skip pattern from prior runs, the green Playwright rerun is consistent with `153 passed`, `2 skipped`; the exact summary line was not retained in the terminal capture

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-take-easy-mode.test.tsx`
- `frontend/tests/wtr/backend/question-take-easy-mode.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-easy-mode.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone easy-mode count visibility is correct | High / Standalone question behavior integrity | Add dedicated mocked/backend WTR tests on `/question/:id` | Targeted mocked and backend easy-mode runs | Low if easy-mode markup changes later | Re-run the targeted easy-mode files after standalone question-page edits |
| The slice stays feature-local | Medium / Scope / sequencing drift | Assert initial render state directly and avoid quiz-level helper churn | File inventory plus targeted easy-mode greens | Low | Reuse the same pattern for similar standalone display-only route slices |
| Broader migration confidence remains intact | Medium / Harness / gate reliability | Run the full command of record after targeted passes | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the numpad recurrence protocol again only if the same contradictory residue returns |

## Execution Notes
- The standalone route branch was simpler than the quiz-level easy-mode tests because it depends only on `question.easyMode` and `state.isMultipleChoice`; no answer submission or quiz navigation was required.
- Inventory verification after the targeted passes showed that every `specs/features/take/question/Question.Take.*` feature file now has dedicated mocked and backend WTR counterparts.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Take.EasyMode`.
- Closed the dedicated standalone `Question.Take.*` backlog with a green full migration gate.

### Coverage Achieved
- Standalone easy-mode correct-answer count behavior on `/question/:id` now has dedicated mocked and backend WTR proof.
- The dedicated standalone `Question.Take.*` feature inventory now appears fully covered in WTR.

### Evidence Run
- Intent: prove mocked standalone easy-mode behavior
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-easy-mode.test.tsx"`
  Result: Chromium + Firefox green, `4 passed`, `0 failed`, `9.0s`
  Interpretation: strong proof for the mocked standalone route and its initial-render count visibility contract
- Intent: prove backend standalone easy-mode behavior
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-easy-mode.backend.test.tsx\""`
  Result: Chromium + Firefox green, `4 passed`, `0 failed`, `5.1s` after server startup
  Interpretation: strong proof for the real backend contract on the standalone easy-mode route
- Intent: prove the slice against the current migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `75 passed`, `0 failed`; backend WTR `54 passed`, `0 failed`; `wtr_mocked_seconds=48`; `wtr_backend_seconds=51`; `migration_total_seconds=517`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice. By inference from the fixed 155-test Playwright suite and the stable skip pattern from prior runs, the green Playwright rerun is consistent with `153 passed`, `2 skipped`; the exact summary line was not retained in the terminal capture
- Intent: prove the dedicated standalone question backlog is now closed
  Command / artifact: inventory comparison between `specs/features/take/question/Question.Take.*` and `frontend/tests/wtr/**/question-take-*.{test.tsx,backend.test.tsx}`
  Result: each standalone `Question.Take.*` feature now has both mocked and backend WTR counterparts
  Interpretation: strong evidence that the dedicated standalone question backlog is closed, though broader migration work remains outside this tranche

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-take-easy-mode.test.tsx`
- `frontend/tests/wtr/backend/question-take-easy-mode.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-26-question-take-easy-mode.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
M PLANS.md
?? frontend/tests/wtr/backend/question-take-easy-mode.backend.test.tsx
?? frontend/tests/wtr/mocked/question-take-easy-mode.test.tsx
?? history/2026-03-26-question-take-easy-mode.md
```

### Remaining Uncertainty
- The next non-standalone migration frontier is not selected yet.
- Cheapest next proof: rebuild the remaining overall feature inventory against `frontend/tests/wtr/` and choose the next highest-value non-standalone slice.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone easy-mode count visibility is correct | High / Standalone question behavior integrity | Dedicated mocked/backend WTR tests on `/question/:id` | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted easy-mode files if standalone easy-mode rendering changes |
| The slice stays feature-local | Medium / Scope / sequencing drift | Asserted initial render state directly without widening quiz helpers | Only the two standalone easy-mode WTR files were added for product proof | Low | Reuse the same pattern for future standalone display-only route checks |
| Full migration baseline remains green | Medium / Harness / gate reliability | Ran the full command of record after targeted passes | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Use the existing numpad recurrence protocol again only if contradictory legacy residue returns |

## Delta From Plan
- New risks discovered:
  - None
- Assurances changed:
  - None
- Scope changes:
  - The standalone `Question.Take.*` backlog is now closed, so the next milestone shifts from implementation to broader frontier selection.
- Decision changes:
  - The next step is broader migration inventory remapping rather than another standalone question slice.

## Reusable Learning / Handoff
- Standalone easy-mode proof can stay feature-local and does not require answer submission; asserting `.correct-answers-count` presence and absence on initial render is enough for the route-level contract.
- Once all dedicated standalone question slices are closed, the migration map needs to be rebuilt from the wider `specs/features/` inventory instead of continuing from the old standalone backlog.
