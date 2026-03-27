# BRACE Milestone

Milestone: `Question.Edit.GUI`
Date: 2026-03-27
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `14aa5824`
Related pull(s): none
Depends on: `Question.Take.Image`, `Question.Take.Explanation`, `Question.Take.Feedback`, `Question.Take.NumPad`, `Question.Take.Feedback.Numerical`, `Question.Take.MultipleChoice.Score`, `Question.Take.EasyMode`, frontier selection closeout

## BRACE Plan Snapshot

### B - Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Edit.GUI.feature`.
- Prove the edit route prepopulates fields from an existing question, persists edited values, and preserves the single-choice to multiple-choice transition.
- Keep the slice bounded to the core edit GUI contract without widening into edit validations or edit-specific explanation toggling yet.

### R - Risks (top 1-5)
1. High / Slice-level behavior integrity: edit-route prepopulation and persistence use a different fetch and submit path from create, so create-route coverage does not prove the edit contract.
2. Medium / Scope / sequencing drift: it is easy to spill from `Question.Edit.GUI` into delete-answer, validation, or show-hide-explanation behavior because the UI surface is shared.
3. Medium / Harness / gate reliability: the full gate still inherits the known low-grade legacy numpad residue even though the edit slice does not touch keyboard handling.
4. Medium / Environment / external variability: backend edit proof depends on the current backend create/edit endpoints and workspace redirect path behaving consistently in the local environment.

For each risk, include tier and mission risk-area mapping where possible.

### A - Assurances
- Reuse the existing question-form DOM contract and backend question creation seam instead of introducing new production-owned seams.
- Keep the tests feature-local to the edit route and workspace redirect path; use only a small WTR-side form helper shared by the mocked and backend lanes.
- Mirror the core feature scenarios only: prepopulated fields, edit-and-reopen persistence, and single-to-multiple-choice persistence.
- Preserve the established gate protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - edit-route prepopulation for single-choice questions with explanations
  - persistence of edited question text, answers, explanations, and question explanation after save and reopen
  - persistence of the single-choice to multiple-choice transition after save and reopen
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - `Question.Edit.GUI.DeleteAnswer`
  - `Question.Edit.GUI.ShowHideExplanation`
  - `Question.Edit.GUI.Validations` and `Question.Edit.GUI.Validations.MultipleChoice`
  - Cheapest proof: land the core edit GUI slice first, then extend the same route helper to the remaining edit variants in later milestones

### Planned Evidence
- Intent: prove mocked edit-route prepopulation and persistence independent of the backend
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui.test.tsx"`
  Result: green, `3 passed`, `0 failed` in Chromium and Firefox, `45.2s`
  Interpretation: proves route-level edit behavior and workspace redirect handling under deterministic mocked responses; does not by itself prove backend endpoint wiring
- Intent: prove the same core edit behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui.backend.test.tsx\""`
  Result: green, `3 passed`, `0 failed` in Chromium and Firefox, `7.4s` after server startup
  Interpretation: proves backend fetch-by-edit-id, PATCH update, and workspace redirect behavior for the slice
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green end-to-end; mocked WTR `78 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `57 passed`, `0 failed`; `wtr_mocked_seconds=56`; `playwright_seconds=415`; `wtr_backend_seconds=59`; `migration_total_seconds=555`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and the first non-standalone milestone after standalone-question closure

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui.backend.test.tsx`
- `frontend/tests/wtr/support/question-form.ts`
- `PLANS.md`
- `history/2026-03-27-migration-frontier-selection.md`
- `history/2026-03-27-question-edit-gui.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Edit route prepopulates existing question data | High / Slice-level behavior integrity | Load the edit page from an existing saved question in mocked and backend lanes | Targeted mocked/backend `Question.Edit.GUI` runs | Low once both targeted lanes pass | Re-run the targeted edit files after future edit-route changes |
| Edited values persist after save and reopen | High / Slice-level behavior integrity | Save through the real route contract, reopen from the workspace redirect, and assert the persisted fields | Targeted mocked/backend `Question.Edit.GUI` runs | Low-Medium until both lanes prove persistence | Extend the same pattern to the remaining edit variants if they touch persistence |
| The slice stays bounded to core edit GUI behavior | Medium / Scope / sequencing drift | Limit new tests and helpers to the base edit feature behaviors | Scope inventory and artifact review | Medium | Split delete/explanation/validation variants into later milestones |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the numpad recurrence protocol only if the gate produces the known contradictory residue again |

## Execution Notes
- Added a small shared WTR helper for question-form snapshots and actions because the mocked and backend edit-route tests exercised the same DOM contract and the remaining edit variants can reuse it.
- The persistence scenarios reopen the question through the workspace redirect path instead of bypassing navigation, which proves both the PATCH contract and the post-save route behavior.
- Browser logs still emit pre-existing React key and SVG property warnings during question-form suites; they are noisy but were not introduced by this milestone.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Edit.GUI`.
- Closed the first non-standalone implementation slice after frontier selection with a green full migration gate.

### Coverage Achieved
- Edit-route prepopulation for saved questions is now proven in mocked and backend lanes.
- Persisted edits and the single-choice to multiple-choice transition are now proven after save and reopen in mocked and backend lanes.

### Evidence Run
- Intent: prove mocked edit-route prepopulation and persistence independent of the backend
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui.test.tsx"`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `45.2s`
  Interpretation: strong proof for the edit-route UI contract and workspace redirect handling under deterministic mocked responses
- Intent: prove the same core edit behavior against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui.backend.test.tsx\""`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `7.4s` after server startup
  Interpretation: strong proof for backend fetch-by-edit-id, PATCH update, and workspace redirect behavior on the edit route
- Intent: prove the slice against the current migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `78 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `57 passed`, `0 failed`; `wtr_mocked_seconds=56`; `playwright_seconds=415`; `wtr_backend_seconds=59`; `migration_total_seconds=555`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and no contradictory recurrence from the known legacy numpad residue

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui.backend.test.tsx`
- `frontend/tests/wtr/support/question-form.ts`
- `PLANS.md`
- `history/2026-03-27-migration-frontier-selection.md`
- `history/2026-03-27-question-edit-gui.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
 M PLANS.md
?? frontend/tests/wtr/backend/question-edit-gui.backend.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui.test.tsx
?? frontend/tests/wtr/support/question-form.ts
?? history/2026-03-27-migration-frontier-selection.md
?? history/2026-03-27-question-edit-gui.md
```

### Remaining Uncertainty
- The remaining edit-route variants are still open: delete answer, show/hide explanation, and validations.
- Cheapest next proof: keep the next slice inside the remaining `Question.Edit.*` family and reuse the new question-form helper.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Edit route prepopulates existing question data | High / Slice-level behavior integrity | Loaded the edit page from an existing saved question in mocked and backend lanes | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted edit files after future edit-route changes |
| Edited values persist after save and reopen | High / Slice-level behavior integrity | Saved through the real route contract, reopened from the workspace redirect, and asserted the persisted fields | Targeted mocked and backend runs green in Chromium and Firefox | Low-Medium | Extend the same reopen pattern to the remaining edit variants that change persisted state |
| The slice stayed bounded to core edit GUI behavior | Medium / Scope / sequencing drift | Limited the work to one shared WTR helper plus two feature-local test files | Only WTR-side tests, artifacts, and the live plan changed; no production code changed | Low-Medium | Keep delete/explanation/validation variants as separate milestones |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the existing numpad recurrence protocol only if a later full gate contradicts this baseline |

## Delta From Plan
- New risks discovered:
  - None
- Assurances changed:
  - Added a small shared WTR question-form helper once the same edit-route contract was repeated in both targeted lanes.
- Scope changes:
  - No production files changed; the implementation stayed entirely in WTR tests plus BRACE artifacts.
- Decision changes:
  - The next work should likely stay inside the remaining `Question.Edit.*` family before moving to a broader `make/*` or `take/quiz/*` frontier.

## Reusable Learning / Handoff
- Reopening the edited question through the workspace redirect is cheaper and stronger proof than bypassing navigation because it covers both persistence and post-save routing.
- A small WTR-side form snapshot helper is justified once both mocked and backend lanes exercise the same question-form contract and future edit variants can reuse it.

## Milestone Closeout Choice

1. **Continue autonomously** - the next slice should stay inside the remaining `Question.Edit.*` family, reusing the new helper unless evidence suggests a different frontier.
