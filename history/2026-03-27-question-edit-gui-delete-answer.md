# BRACE Milestone

Milestone: `Question.Edit.GUI.DeleteAnswer`
Date: 2026-03-27
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Edit.GUI`, `Question.Edit.GUI.ShowHideExplanation`, frontier selection closeout

## BRACE Plan Snapshot

### B - Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Edit.GUI.DeleteAnswer.feature`.
- Prove the edit route starts with three enabled delete buttons for a prepopulated three-answer question and removes the third answer while preserving the first two answer rows.
- Keep the slice bounded to edit-route answer deletion without widening into validation behavior or persistence-through-save.

### R - Risks (top 1-5)
1. High / Slice-level behavior integrity: answer deletion mutates answer ordering and correct-answer indexes, so existing edit-route coverage does not prove the delete contract.
2. Medium / Scope / sequencing drift: the same question form also owns validations, show/hide explanation, and persistence, making it easy to widen the slice unintentionally.
3. Medium / Harness / gate reliability: the full gate still inherits the known low-grade legacy numpad residue even though this slice is route-local and does not touch keyboard handling.
4. Medium / Environment / external variability: backend proof depends on the real edit fetch path seeding the expected three-answer question consistently.

For each risk, include tier and mission risk-area mapping where possible.

### A - Assurances
- Reuse the existing edit-route loader and question-form helper instead of widening production seams.
- Keep assertions local to the answer-row DOM, delete-button enabled state, and remaining form snapshot.
- Mirror only the legacy delete-answer scenario for this milestone.
- Preserve the established gate protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - prepopulated edit form with three enabled delete buttons
  - deleting the third answer from a saved single-choice question
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - persistence after delete-and-save
  - `Question.Edit.GUI.Validations` and `Question.Edit.GUI.Validations.MultipleChoice`
  - Cheapest proof: close the route-local delete slice first, then decide whether the remaining validations should stay bundled

### Planned Evidence
- Intent: prove edit-route answer deletion under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui-delete-answer.test.tsx"`
  Result: green, `1 passed`, `0 failed` in Chromium and Firefox, `5.2s`
  Interpretation: proves the delete-answer DOM contract independent of backend wiring; does not by itself prove the real edit fetch path
- Intent: prove the same delete-answer behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui-delete-answer.backend.test.tsx\""`
  Result: green, `1 passed`, `0 failed` in Chromium and Firefox, `6.0s` after server startup
  Interpretation: proves the same delete-answer contract when the question is loaded through the real backend edit API
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green end-to-end; mocked WTR `82 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `61 passed`, `0 failed`; `wtr_mocked_seconds=58`; `playwright_seconds=430`; `wtr_backend_seconds=67`; `migration_total_seconds=582`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and no recurrence from the known legacy numpad residue during this gate

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui-delete-answer.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui-delete-answer.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-27-question-edit-gui-delete-answer.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Edit form starts with three enabled delete buttons for a saved three-answer question | High / Slice-level behavior integrity | Load the saved question in mocked and backend lanes and assert the initial delete-button state | Targeted mocked/backend delete-answer runs | Low-Medium until both targeted lanes pass | Re-run the targeted files after future edit-form row changes |
| Deleting the third answer removes only that row and preserves the remaining answers | High / Slice-level behavior integrity | Assert against the remaining answer rows and correctness state after clicking the third delete button | Targeted mocked/backend delete-answer runs | Low-Medium until both targeted lanes pass | Extend the same pattern to persistence later only if a future slice needs it |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the numpad recurrence protocol only if a later full gate contradicts this baseline |

## Execution Notes
- No helper expansion was needed; the delete-answer contract was strong enough through the existing form snapshot plus direct checks on `.answer-delete-button`.
- Browser logs still emit the pre-existing React key warning and SVG property warnings during question-form suites; this milestone did not change that noise profile.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Edit.GUI.DeleteAnswer`.
- Closed the edit-route delete-answer slice with targeted greens plus a green full migration gate.

### Coverage Achieved
- Edit-route delete buttons are now proven to start enabled for a saved three-answer question.
- Deleting the third answer is now proven to remove only that row while preserving the remaining answer texts, explanations, and correctness state.

### Evidence Run
- Intent: prove edit-route answer deletion under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui-delete-answer.test.tsx"`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `5.2s`
  Interpretation: strong proof for the route-local delete contract without backend variability
- Intent: prove the same delete-answer behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui-delete-answer.backend.test.tsx\""`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `6.0s` after server startup
  Interpretation: strong proof for the same delete-answer contract when the question is loaded through the real backend edit API
- Intent: prove the slice against the current migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `82 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `61 passed`, `0 failed`; `wtr_mocked_seconds=58`; `playwright_seconds=430`; `wtr_backend_seconds=67`; `migration_total_seconds=582`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and the known legacy numpad residue did not recur in this run

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui-delete-answer.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui-delete-answer.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-27-question-edit-gui-delete-answer.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
 M PLANS.md
?? frontend/tests/wtr/backend/question-edit-gui-delete-answer.backend.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-delete-answer.test.tsx
?? history/2026-03-27-question-edit-gui-delete-answer.md
```

### Remaining Uncertainty
- The remaining edit-family frontier is now the single-choice and multiple-choice validation files.
- Cheapest next proof: decide whether to keep the two validation files bundled as one final edit-family milestone, then add mocked/backend WTR coverage for that validation slice.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Edit form starts with three enabled delete buttons for a saved three-answer question | High / Slice-level behavior integrity | Loaded the saved question in mocked and backend lanes and asserted the initial delete-button state | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted files after future edit-form row changes |
| Deleting the third answer removes only that row and preserves the remaining answers | High / Slice-level behavior integrity | Asserted against the remaining answer rows and correctness state after clicking the third delete button | Targeted mocked and backend runs green in Chromium and Firefox | Low | Extend the same pattern to persistence later only if a future slice needs it |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the numpad recurrence protocol only if a later full gate contradicts this baseline |

## Delta From Plan
- New risks discovered:
  - None
- Assurances changed:
  - None
- Scope changes:
  - The implementation stayed entirely in WTR tests plus BRACE artifacts; no production files changed.
- Decision changes:
  - The remaining edit-family choice is no longer between multiple variants; only the validation files remain after delete-answer.

## Reusable Learning / Handoff
- Route-local edit mutations that do not submit can stay feature-local; the existing form snapshot plus one direct DOM assertion was enough.
- After closing `Question.Edit.GUI`, `ShowHideExplanation`, and `DeleteAnswer`, the edit-family frontier is now narrow enough that the final validation tranche can be chosen explicitly as the next proof target.

## Milestone Closeout Choice

1. **Continue autonomously** - the remaining validation files are now the next explicit edit-family proof target.
