# BRACE Milestone

Milestone: `Question.Create.GUI.ShowHideExplanation`
Date: 2026-03-29
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Create.GUI`, `Question.Edit.GUI.ShowHideExplanation`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Create.GUI.ShowHideExplanation.feature`.
- Prove the create form hides explanation inputs by default and shows them when the checkbox is toggled on.
- Keep the slice bounded to local explanation-field visibility behavior; do not widen into create-form validations, delete-answer behavior, or single/multiple-choice correctness logic.

### R — Risks (top 1–5)
1. Medium / Slice-level behavior integrity: the existing create GUI WTR file already clicks the show-explanation checkbox once, so a vague slice could duplicate proof instead of closing the actual hidden-by-default contract.
2. Medium / Scope / sequencing drift: the remaining create-question frontier still includes delete-answer, single/multiple-choice, and validations, so it is easy to absorb adjacent behavior accidentally.
3. Medium / Harness / gate reliability: the full migration gate still inherits the known low-grade legacy numpad residue even though this slice is DOM-local.
4. Low / Environment / external variability: the backend create route does not need seeded question data, but the create page still depends on the backend/Vite harness baseline staying healthy.

### A — Assurances
- Reuse the current create-route WTR harness and direct DOM queries instead of adding new production seams.
- Keep assertions on checkbox state and explanation-input visibility only.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - explanation fields hidden by default on `/question/new`
  - explanation fields visible after toggling `#show-explanation`
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - create-form validations
  - create-form answer deletion
  - create-form single/multiple-choice correctness behavior
  - Cheapest proof: close this DOM-local visibility slice first, then choose the next create-form variant explicitly

### Planned Evidence
- Intent: prove create-form explanation visibility behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx"`
  Result: pending
  Interpretation: will prove the UI contract without backend variability
- Intent: prove the same explanation visibility behavior against the real backend-backed app shell
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-show-hide-explanation.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same contract through the real backend/Vite harness
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new create-route slice does not break the accepted migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-show-hide-explanation.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-show-hide-explanation.md`

### Exit condition
- The dedicated mocked/backend create show-hide files are green in Chromium and Firefox, the full migration gate is green or explicitly marked `UNPROVEN`, and `PLANS.md` points to the correct next action at closeout.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create form hides explanation fields by default | Medium / Slice-level behavior integrity | Assert directly against checkbox state and explanation input count before any toggle | Targeted mocked and backend show-hide runs | Medium until both targeted lanes pass | Re-run the targeted files after future create-form layout changes |
| Create form shows explanation fields after the checkbox is toggled | Medium / Slice-level behavior integrity | Reuse the existing checkbox seam and assert visible explanation inputs without widening into submission behavior | Targeted mocked and backend show-hide runs | Medium until both targeted lanes pass | Re-run the targeted files after future show-explanation logic changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after the targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Execution Notes
- The create route did not require backend seeding or mock routes for this slice, so both dedicated files stayed entirely in WTR assertions over `/question/new`.
- Browser logs still emit the pre-existing React key warning and SVG property warnings during question-form suites; this milestone did not change that warning profile.

## Pulls Handled During This Milestone
- None.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Create.GUI.ShowHideExplanation.feature`.
- Closed the create-form show/hide explanation slice with targeted greens plus a green full migration gate.

### Coverage Achieved
- The create form now proves explanation inputs are hidden by default on `/question/new`.
- The create form now proves explanation inputs appear after checking `#show-explanation`.

### Evidence Run
- Intent: prove create-form explanation visibility behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.3s`
  Interpretation: strong proof for the UI contract without backend variability
- Intent: prove the same explanation visibility behavior against the real backend-backed app shell
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-show-hide-explanation.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `4.8s` after server startup
  Interpretation: strong proof for the same contract through the real backend/Vite harness
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `86 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `65 passed`, `0 failed`; `wtr_mocked_seconds=75`; `playwright_seconds=470`; `wtr_backend_seconds=77`; `migration_total_seconds=655`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice; the legacy create show/hide scenarios also passed in Playwright, and no contradictory gate residue appeared

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-show-hide-explanation.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-show-hide-explanation.md`
- `history/2026-03-29-question-create-gui-delete-answer.md`

If VCS is available, include objective scope evidence:
```text
git diff --name-status
M	PLANS.md
M	frontend/tests/wtr/support/question-form.ts

git status --porcelain
 M PLANS.md
 M frontend/tests/wtr/support/question-form.ts
?? frontend/tests/wtr/backend/question-create-gui-show-hide-explanation.backend.test.tsx
?? frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx
?? history/2026-03-29-question-create-gui-show-hide-explanation.md
?? history/2026-03-29-question-edit-gui-validations.md
```

### Remaining Uncertainty
- The remaining create-question frontier is now `DeleteAnswer`, `SingleMulti`, and the two validations files.
- Cheapest next proof: execute `Question.Create.GUI.DeleteAnswer` as the next bounded create-route mutation slice.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create form hides explanation fields by default | Medium / Slice-level behavior integrity | Asserted directly against checkbox state and explanation input count before any toggle | Targeted mocked and backend show-hide runs green in Chromium and Firefox | Low | Re-run the targeted files after future create-form layout changes |
| Create form shows explanation fields after the checkbox is toggled | Medium / Slice-level behavior integrity | Reused the existing checkbox seam and asserted visible explanation inputs without widening into submission behavior | Targeted mocked and backend show-hide runs green in Chromium and Firefox | Low | Re-run the targeted files after future show-explanation logic changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - None.
- Scope changes:
  - The implementation stayed in WTR tests and BRACE artifacts; no production files changed.
- Decision changes:
  - `Question.Create.GUI.ShowHideExplanation` is closed, and the next active slice is `Question.Create.GUI.DeleteAnswer`.

## Reusable Learning / Handoff
- Pure create-form visibility behavior can be proven through `/question/new` alone; this slice did not need API mocks or backend-created data.
- After a family closes, pick the next slice from the remaining inventory using the smallest proof that still exercises a distinct seam.

## Milestone Closeout Choice

- **Continue autonomously** - closed the create show/hide explanation milestone, instantiated `Question.Create.GUI.DeleteAnswer` as the next active milestone, and continued.
