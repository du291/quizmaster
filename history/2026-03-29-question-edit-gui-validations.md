# BRACE Milestone

Milestone: `Question.Edit.GUI.Validations`
Date: 2026-03-29
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): `2026-03-29 BRACE v2.4 upgrade approval (approved)`
Depends on: `Question.Edit.GUI`, `Question.Edit.GUI.ShowHideExplanation`, `Question.Edit.GUI.DeleteAnswer`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Edit.GUI.Validations.feature` and `Question.Edit.GUI.Validations.MultipleChoice.feature`.
- Prove the edit form surfaces the expected validation errors for empty question text, empty answer text / explanation combinations, zero correct answers, and too-few correct answers in multiple-choice mode.
- Keep the slice bounded to route-local validation behavior; do not widen into create-form validation migration, production validator refactors, or unrelated question-form architecture changes unless repeated duplication makes that unavoidable.

### R — Risks (top 1–5)
1. High / Slice-level behavior integrity: validation behavior mixes question-level, answer-level, and correctness-cardinality rules, so shallow assertions could miss real contract gaps.
2. Medium / Scope / sequencing drift: this is the last edit-family frontier, which makes it easy to absorb create-form validations or broader question-form refactors by accident.
3. Medium / Harness / gate reliability: the full migration gate still inherits the known low-grade legacy numpad residue even though this slice is form-local.
4. Medium / Control-surface consistency: BRACE v2.4 changed the live control surface, so the resumed milestone must stay aligned with the actual repo inventory and the last completed product commit.
5. Medium / Environment / external variability: backend proof depends on the real edit-question fetch path and current validation payload shape behaving the same way as the mocked lane.

### A — Assurances
- Reuse the existing edit-route setup and `frontend/tests/wtr/support/question-form.ts` helpers instead of widening production seams.
- Bundle the single-choice and multiple-choice validation scenarios into one milestone because both features sit on the same validator seam and differ mainly in correctness-cardinality expectations.
- Mirror the legacy feature expectations with direct assertions against visible validation messages or stable error-state behavior while proving save remains blocked on invalid input.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - empty question validation on edit
  - empty answer / explanation validation on edit
  - zero-correct-answer validation on edit
  - few-correct-answers validation in edit multiple-choice mode
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - `Question.Create.GUI.Validations*`
  - production validator refactors or broader question-form helper redesign
  - Cheapest proof: if edit validations expose duplicated assertion patterns, decide later whether create-form migration should reuse a WTR-local helper rather than widening this milestone

### Planned Evidence
- Intent: prove edit validation behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui-validations.test.tsx"`
  Result: pending
  Interpretation: will prove validation rendering and blocked-save behavior without backend variability
- Intent: prove the same validation behavior against the real backend edit route
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui-validations.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same validation contract against the real edit-question fetch path and backend wiring
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new validation slice does not break the accepted migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx`
- `frontend/tests/wtr/support/question-form.ts`
- `PLANS.md`
- `history/2026-03-29-question-edit-gui-validations.md`

### Exit condition
- Both targeted validation files are green in Chromium and Firefox, the full migration gate is green or explicitly marked `UNPROVEN`, and `PLANS.md` points to the correct next action at closeout.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Edit form blocks save and shows the expected errors for an empty single-choice submission | High / Slice-level behavior integrity | Drive the real edit form state and assert the resulting validation output instead of inferring behavior from create-form coverage | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future form-validator changes |
| Edit form blocks save and shows the expected errors for an empty multiple-choice submission with too few correct answers | High / Slice-level behavior integrity | Keep the multiple-choice scenario in the same milestone so the shared seam and the cardinality-specific rule are proven together | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future multiple-choice validator changes |
| Full migration confidence remains intact after the final edit-family slice | Medium / Harness / gate reliability | Run the command of record after the targeted proof and apply the known recurrence protocol only if the full gate contradicts the targeted runs | `bash ./scripts/test-migration.sh` | Low-Medium | Isolated legacy rerun plus a second full gate only if a contradictory red returns |

## Execution Notes
- The milestone reused the existing edit-route setup and extended the shared WTR form helper with correctness toggling and validation-alert reads instead of widening production seams.
- Browser logs still emit the pre-existing React key warning and SVG property warnings during question-form suites; this milestone did not change that warning profile.

## Pulls Handled During This Milestone
### Pull 1
- Type: `BRACE Pull`
- Trigger: BRACE v2.4 changed the live control surface while `PLANS.md` was blank, so mission continuity and next-action validity required rehydration and approval.
- Question / decision needed: Approve the migrated BRACE v2.4 control surface and this pending validation milestone before substantive work resumes.
- Resolution: Approved
- Impact on milestone: The milestone moved from pending hydration into active implementation without changing scope.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Edit.GUI.Validations.feature` and `Question.Edit.GUI.Validations.MultipleChoice.feature`.
- Closed the remaining edit-question frontier with targeted greens plus a green full migration gate.

### Coverage Achieved
- The edit route now proves the single-choice invalid-submission case for empty question text plus missing answer text / explanation pairs.
- The edit route now proves the multiple-choice invalid-submission case for empty question text, missing answer text / explanation pairs, zero correct answers, and too-few correct answers.
- The full `Question.Edit.GUI*` family is now covered by dedicated mocked/backend WTR files.

### Evidence Run
- Intent: prove edit validation behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui-validations.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `43s`
  Interpretation: strong proof for route-local validation rendering and blocked-save behavior without backend variability
- Intent: prove the same validation behavior against the real backend edit route
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui-validations.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.7s` after server startup
  Interpretation: strong proof for the same validation contract when the question is loaded through the real backend edit API
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `84 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `63 passed`, `0 failed`; `wtr_mocked_seconds=59`; `playwright_seconds=402`; `wtr_backend_seconds=63`; `migration_total_seconds=549`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice; the new edit-validation parity also passed in legacy Playwright, and the known legacy numpad residue did not recur

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx`
- `frontend/tests/wtr/support/question-form.ts`
- `PLANS.md`
- `history/2026-03-29-question-edit-gui-validations.md`
- `history/2026-03-29-question-create-gui-show-hide-explanation.md`

If VCS is available, include objective scope evidence:
```text
git diff --name-status
M	PLANS.md
M	frontend/tests/wtr/support/question-form.ts

git status --porcelain
 M PLANS.md
 M frontend/tests/wtr/support/question-form.ts
?? frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx
?? history/2026-03-29-question-create-gui-show-hide-explanation.md
?? history/2026-03-29-question-edit-gui-validations.md
```

### Remaining Uncertainty
- The remaining make-question frontier is now entirely on the create route: `DeleteAnswer`, `ShowHideExplanation`, `SingleMulti`, and the two validations files.
- Cheapest next proof: execute `Question.Create.GUI.ShowHideExplanation` as the next bounded create-route slice.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Edit form blocks save and shows the expected errors for an empty single-choice submission | High / Slice-level behavior integrity | Drove the real edit form state and asserted the resulting validation alerts by stable `data-testid` codes | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future validator changes |
| Edit form blocks save and shows the expected errors for an empty multiple-choice submission with too few correct answers | High / Slice-level behavior integrity | Kept the multiple-choice scenario in the same milestone so the shared seam and the cardinality-specific rules were proven together | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future multiple-choice validator changes |
| Full migration confidence remains intact after the final edit-family slice | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the known recurrence protocol only if a future full gate contradicts this baseline |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - Added small WTR-local helper support for toggling answer correctness and reading validation alert codes.
- Scope changes:
  - The implementation stayed in WTR tests, WTR support, and BRACE artifacts; no production files changed.
- Decision changes:
  - The full edit-question family is now considered closed, and the next active slice is `Question.Create.GUI.ShowHideExplanation`.

## Reusable Learning / Handoff
- Validation behavior on the question form can be asserted cheaply and robustly through `.alert.error[data-testid]` without depending on brittle layout selectors.
- The shared WTR question-form helper is now strong enough to drive both correctness toggling and validation assertions across future question-form milestones.
- After this slice, the edit-question family is fully covered, so the remaining make-question work is entirely on the create route.

## Milestone Closeout Choice

- **Continue autonomously** - closed the edit-validations milestone, instantiated `Question.Create.GUI.ShowHideExplanation` as the next active milestone, and paused at a clean milestone boundary.
