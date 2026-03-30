# BRACE Milestone

Milestone: `Question.Create.GUI.SingleMulti`
Date: 2026-03-29
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): none
Depends on: `Question.Create.GUI`, `Question.Create.GUI.ShowHideExplanation`, `Question.Create.GUI.DeleteAnswer`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Create.GUI.SingleMulti.feature`.
- Prove the create form starts in single-choice mode, preserves exactly one selected answer in single-choice mode, supports multiple selected answers in multiple-choice mode, resets multiple selections when switching back to single-choice, and shows Easy mode only when multiple choice is enabled.
- Keep the slice bounded to create-form correctness-mode transitions and Easy mode visibility; do not widen into create-form validations or submit/persistence behavior.

### R — Risks (top 1–5)
1. High / Slice-level behavior integrity: the correctness-mode transitions share stateful logic that can silently reset or preserve selections incorrectly when the mode toggle changes.
2. Medium / Scope / sequencing drift: the remaining create frontier still includes validations, so it is easy to absorb blocked-save assertions or validator behavior into this mode-transition slice.
3. Medium / Harness / gate reliability: the full migration gate still inherits the known low-grade legacy numpad residue even though this slice is form-local.
4. Low / Environment / external variability: the create route needs no seeded backend data, but the backend lane still depends on the accepted Vite/backend wrapper baseline.

### A — Assurances
- Reuse the existing create-route WTR harness and question-form snapshot helper instead of widening production seams.
- Keep assertions local to `#is-multiple-choice`, `#easy-mode`, and the answer correctness snapshot.
- Bundle the feature scenarios into one milestone because they all exercise the same mode-toggle and correctness-state seam.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - default single-choice state on `/question/new`
  - single-choice correct-answer selection and replacement
  - multiple-choice selection of more than one correct answer
  - switching from single to multiple choice while preserving one selected answer
  - switching from multiple to single choice with one selected answer preserved
  - switching from multiple to single choice with multiple selected answers reset
  - Easy mode visibility only in multiple-choice mode
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - create-form validations
  - submit / persistence behavior on the create route
  - Cheapest proof: close this mode-transition slice first, then execute the remaining validations family explicitly

### Planned Evidence
- Intent: prove create-form single/multiple-choice behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-single-multi.test.tsx"`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `10.9s`
  Interpretation: proves the create-form mode-transition contract without backend variability
- Intent: prove the same single/multiple-choice behavior against the real backend-backed app shell
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-single-multi.backend.test.tsx\""`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `5.8s` after server startup
  Interpretation: proves the same contract through the real backend/Vite harness
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `90 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `69 passed`, `0 failed`; `wtr_mocked_seconds=66`; `playwright_seconds=416`; `wtr_backend_seconds=71`; `migration_total_seconds=578`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: proves the new create-route slice does not break the accepted migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-single-multi.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-single-multi.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-single-multi.md`

### Exit condition
- The dedicated mocked/backend create single-multi files are green in Chromium and Firefox, the full migration gate is green or explicitly marked `UNPROVEN`, and `PLANS.md` points to the correct next action at closeout.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Single-choice mode keeps exactly one selected answer at a time | High / Slice-level behavior integrity | Drive answer selection changes in single mode and assert the full correctness snapshot rather than only one checked input | Targeted mocked and backend single-multi runs | Medium until both targeted lanes pass | Re-run the targeted files after future correctness-toggle changes |
| Multiple-choice mode allows more than one selected answer and exposes Easy mode | High / Slice-level behavior integrity | Toggle `#is-multiple-choice`, then assert both the answer snapshot and `#easy-mode` visibility | Targeted mocked and backend single-multi runs | Medium until both targeted lanes pass | Re-run the targeted files after future mode-toggle changes |
| Switching from multiple to single choice resets only the multi-selected state that cannot be preserved | High / Slice-level behavior integrity | Cover both the one-selected and multi-selected collapse paths in the same milestone | Targeted mocked and backend single-multi runs | Medium until both targeted lanes pass | Re-run the targeted files after future reducer/state changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Execution Notes
- This milestone was instantiated immediately after the create delete-answer closeout because `SingleMulti` is the smallest remaining create-route state-transition seam.
- The feature text has one likely wording typo in the “Switch multiple to single choice: Keep selection” scenario, but the intended behavior is still clear from the scenario title and the shared question-form implementation.
- The create route again required no backend seeding or mock GET routes for this slice, so both dedicated files stayed entirely on `/question/new`.

## Pulls Handled During This Milestone
- None.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Create.GUI.SingleMulti.feature`.
- Closed the create-form single/multiple-choice slice with targeted greens plus a green full migration gate.

### Coverage Achieved
- The create form now proves default single-choice mode, single-choice correct-answer replacement, multiple-choice multi-select behavior, and the reset path when collapsing multiple selections back to single choice.
- The create form now proves Easy mode is visible only while multiple choice is enabled.

### Evidence Run
- Intent: prove create-form single/multiple-choice behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-single-multi.test.tsx"`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `10.9s`
  Interpretation: strong proof for the create-form mode-transition contract without backend variability
- Intent: prove the same single/multiple-choice behavior against the real backend-backed app shell
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-single-multi.backend.test.tsx\""`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `5.8s` after server startup
  Interpretation: strong proof for the same contract through the real backend/Vite harness
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `90 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `69 passed`, `0 failed`; `wtr_mocked_seconds=66`; `playwright_seconds=416`; `wtr_backend_seconds=71`; `migration_total_seconds=578`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice; no contradictory gate residue appeared

### Actual Scope Inventory
- `frontend/tests/wtr/support/question-form.ts`
- `frontend/tests/wtr/mocked/question-create-gui-single-multi.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-single-multi.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-single-multi.md`
- `history/2026-03-29-question-create-gui-validations.md`

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
?? frontend/tests/wtr/backend/question-create-gui-single-multi.backend.test.tsx
?? frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-delete-answer.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-single-multi.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx
?? history/2026-03-29-question-create-gui-delete-answer.md
?? history/2026-03-29-question-create-gui-show-hide-explanation.md
?? history/2026-03-29-question-create-gui-single-multi.md
?? history/2026-03-29-question-edit-gui-validations.md
```

### Remaining Uncertainty
- The remaining create-question frontier is now the bundled validations pair: `Question.Create.GUI.Validations.feature` and `Question.Create.GUI.Validations.MultipleChoice.feature`.
- Cheapest next proof: execute one final create-route validations milestone against the shared validator seam.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Single-choice mode keeps exactly one selected answer at a time | High / Slice-level behavior integrity | Drove answer selection changes in single mode and asserted the full correctness snapshot rather than only one checked input | Targeted mocked and backend single-multi runs green in Chromium and Firefox | Low | Re-run the targeted files after future correctness-toggle changes |
| Multiple-choice mode allows more than one selected answer and exposes Easy mode | High / Slice-level behavior integrity | Toggled `#is-multiple-choice`, then asserted both the answer snapshot and `#easy-mode` visibility | Targeted mocked and backend single-multi runs green in Chromium and Firefox | Low | Re-run the targeted files after future mode-toggle changes |
| Switching from multiple to single choice resets only the multi-selected state that cannot be preserved | High / Slice-level behavior integrity | Covered both the one-selected and multi-selected collapse paths in the same milestone | Targeted mocked and backend single-multi runs green in Chromium and Firefox | Low | Re-run the targeted files after future reducer/state changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - Added small shared WTR helpers for adding an answer and waiting for correctness input-type transitions.
- Scope changes:
  - The implementation stayed in WTR tests, WTR support, and BRACE artifacts; no production files changed.
- Decision changes:
  - `Question.Create.GUI.SingleMulti` is closed, and the next active slice is the bundled create validations milestone.

## Reusable Learning / Handoff
- After the smallest local mutation slice closes, the next cheapest proof on the same form family can be the smallest shared state-transition seam before validations.
- The create-form single/multiple-choice seam can be proven cheaply with one shared helper for correctness input types; persistence is not required for this local contract.

## Milestone Closeout Choice

- **Continue autonomously** - closed the create single-multi milestone, instantiated the bundled create validations milestone, and continued.
