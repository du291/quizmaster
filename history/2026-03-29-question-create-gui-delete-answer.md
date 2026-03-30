# BRACE Milestone

Milestone: `Question.Create.GUI.DeleteAnswer`
Date: 2026-03-29
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): none
Depends on: `Question.Create.GUI`, `Question.Create.GUI.ShowHideExplanation`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Create.GUI.DeleteAnswer.feature`.
- Prove the create form starts with three answers after adding a third answer and removes the second answer while preserving the remaining first and third answers.
- Keep the slice bounded to local create-form answer deletion; do not widen into edit-route deletion, validations, or single/multiple-choice correctness rules.

### R — Risks (top 1–5)
1. Medium / Slice-level behavior integrity: answer deletion mutates row ordering and correctness state, so vague assertions could miss the actual remaining form snapshot.
2. Medium / Scope / sequencing drift: the remaining create-question frontier still includes single/multiple-choice and validation behaviors, so it is easy to absorb adjacent logic accidentally.
3. Medium / Harness / gate reliability: the full migration gate still inherits the known low-grade legacy numpad residue even though this slice is DOM-local.
4. Low / Environment / external variability: the create route itself is backend-light on initial render, but the full gate still depends on the accepted backend/Vite baseline.

### A — Assurances
- Reuse the current create-route WTR harness and question-form snapshot helper instead of widening production seams.
- Keep assertions on the add-answer / delete-answer flow and the remaining answer snapshot only.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - adding a third answer on `/question/new`
  - deleting the second answer from the three-answer draft
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - create-form validations
  - create-form single/multiple-choice correctness transitions beyond the one local snapshot
  - Cheapest proof: close this delete-answer slice first, then choose the next create-route variant explicitly

### Planned Evidence
- Intent: prove create-form answer deletion under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-delete-answer.test.tsx"`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `6.2s`
  Interpretation: proves the delete-answer DOM contract without backend variability
- Intent: prove the same delete-answer behavior against the real backend-backed app shell
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-delete-answer.backend.test.tsx\""`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `5.1s` after server startup
  Interpretation: proves the same contract through the real backend/Vite harness
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `87 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `66 passed`, `0 failed`; `wtr_mocked_seconds=63`; `playwright_seconds=451`; `wtr_backend_seconds=74`; `migration_total_seconds=617`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: proves the new create-route slice does not break the accepted migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-delete-answer.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-delete-answer.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-delete-answer.md`

### Exit condition
- The dedicated mocked/backend create delete-answer files are green in Chromium and Firefox, the full migration gate is green or explicitly marked `UNPROVEN`, and `PLANS.md` points to the correct next action at closeout.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create form can delete the second answer from a three-answer draft | Medium / Slice-level behavior integrity | Add one extra answer, then assert the remaining answer snapshot rather than only row count | Targeted mocked and backend delete-answer runs | Medium until both targeted lanes pass | Re-run the targeted files after future create-form row changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Execution Notes
- This milestone was instantiated during the closeout of `Question.Create.GUI.ShowHideExplanation`.
- The remaining create-question variants after this slice are `SingleMulti` plus the validations family.
- Browser logs still emit the pre-existing React key warning and SVG property warnings during question-form suites; this milestone did not change that warning profile.

## Pulls Handled During This Milestone
- None.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Create.GUI.DeleteAnswer.feature`.
- Closed the create-form delete-answer slice with targeted greens plus a green full migration gate.

### Coverage Achieved
- The create form now proves a third answer can be added, the second answer can be deleted, and the remaining first and third answers stay intact.
- The delete buttons are now proven to become enabled once the third answer exists.

### Evidence Run
- Intent: prove create-form answer deletion under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-delete-answer.test.tsx"`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `6.2s`
  Interpretation: strong proof for the delete-answer DOM contract without backend variability
- Intent: prove the same delete-answer behavior against the real backend-backed app shell
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-delete-answer.backend.test.tsx\""`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `5.1s` after server startup
  Interpretation: strong proof for the same contract through the real backend/Vite harness
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `87 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `66 passed`, `0 failed`; `wtr_mocked_seconds=63`; `playwright_seconds=451`; `wtr_backend_seconds=74`; `migration_total_seconds=617`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice; no contradictory gate residue appeared

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-delete-answer.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-delete-answer.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-delete-answer.md`
- `history/2026-03-29-question-create-gui-single-multi.md`

If VCS is available, include objective scope evidence:
```text
git diff --name-status
M	PLANS.md
M	frontend/tests/wtr/support/question-form.ts

git status --porcelain
 M PLANS.md
 M frontend/tests/wtr/support/question-form.ts
?? frontend/tests/wtr/backend/question-create-gui-delete-answer.backend.test.tsx
?? frontend/tests/wtr/backend/question-create-gui-show-hide-explanation.backend.test.tsx
?? frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-delete-answer.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx
?? history/2026-03-29-question-create-gui-delete-answer.md
?? history/2026-03-29-question-create-gui-show-hide-explanation.md
?? history/2026-03-29-question-edit-gui-validations.md
```

### Remaining Uncertainty
- The remaining create-question frontier is now `SingleMulti` plus the two validation files.
- Cheapest next proof: execute `Question.Create.GUI.SingleMulti` as the next bounded mode-transition slice.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create form can delete the second answer from a three-answer draft | Medium / Slice-level behavior integrity | Added one extra answer, then asserted the remaining answer snapshot rather than only row count | Targeted mocked and backend delete-answer runs green in Chromium and Firefox | Low | Re-run the targeted files after future create-form row changes |
| Delete buttons become enabled when the draft reaches three answers | Medium / Slice-level behavior integrity | Checked all delete buttons before the delete action | Targeted mocked and backend delete-answer runs green in Chromium and Firefox | Low | Re-run the targeted files after future delete-button logic changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - None.
- Scope changes:
  - The implementation stayed in WTR tests and BRACE artifacts; no production files changed.
- Decision changes:
  - `Question.Create.GUI.DeleteAnswer` is closed, and the next active slice is `Question.Create.GUI.SingleMulti`.

## Reusable Learning / Handoff
- After a pure visibility slice closes, the next cheapest proof on the same form family can be the smallest local mutation before the larger mode-transition and validation tranches.
- The existing form snapshot helper plus one direct check on delete-button enabled state was enough for this local create-route mutation.

## Milestone Closeout Choice

- **Continue autonomously** - closed the create delete-answer milestone, instantiated `Question.Create.GUI.SingleMulti` as the next active milestone, and continued.
