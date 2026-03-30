# BRACE Milestone

Milestone: `Question.Create.GUI.Validations`
Date: 2026-03-29
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): none
Depends on: `Question.Create.GUI`, `Question.Create.GUI.ShowHideExplanation`, `Question.Create.GUI.DeleteAnswer`, `Question.Create.GUI.SingleMulti`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Create.GUI.Validations.feature` and `Question.Create.GUI.Validations.MultipleChoice.feature`.
- Prove the create form surfaces the expected validation errors for empty question text, empty answers including an added empty answer, partial answer explanations, zero correct answers, and too-few correct answers in multiple-choice mode, and prove those errors clear once the draft becomes valid.
- Keep the slice bounded to create-route validation behavior; do not widen into production validator refactors or unrelated create-route persistence behavior beyond what is needed to prove validation no longer blocks submit.

### R — Risks (top 1–5)
1. High / Slice-level behavior integrity: create-form validation mixes question-level, answer-level, explanation-completeness, and correctness-cardinality rules, so shallow assertions could miss real contract gaps.
2. Medium / Scope / sequencing drift: this is the last known create-route frontier, which makes it easy to absorb broader create-submit behavior or production validator refactors by accident.
3. Medium / Harness / gate reliability: the full migration gate still inherits the known low-grade legacy numpad residue even though this slice is form-local.
4. Medium / Environment / external variability: backend proof depends on the real create-submit path and the current validator wiring behaving the same way as the mocked lane.

### A — Assurances
- Reuse the existing create-route setup plus the shared WTR question-form helpers instead of widening production seams.
- Bundle the single-choice and multiple-choice validation features into one milestone because both files sit on the same validator seam and mainly differ in field-completeness and correctness-cardinality expectations.
- Assert stable validation codes via `.alert.error[data-testid]` and use blocked-submit or successful-submit behavior only as supporting proof for whether validation still blocks the route.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - empty create-form submission
  - missing question text on create
  - missing answer text including an added empty answer
  - partial answer explanations on create
  - zero-correct-answer validation on create
  - few-correct-answers validation in create multiple-choice mode
  - clearing validation errors once the draft becomes valid
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - production validator refactors
  - broader create-route persistence assertions beyond what is needed to prove validation no longer blocks submit
  - Cheapest proof: close this final create-route validation seam, then rebuild the remaining whole-mission frontier before deciding Continue or Final

### Planned Evidence
- Intent: prove create-route validation behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-validations.test.tsx"`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `10.9s`
  Interpretation: proves validation rendering and blocked-submit behavior without backend variability
- Intent: prove the same validation behavior against the real create route
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-validations.backend.test.tsx\""`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `6.1s` after server startup
  Interpretation: proves the same validation contract against the real create-submit path and backend wiring
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `93 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `72 passed`, `0 failed`; `wtr_mocked_seconds=67`; `playwright_seconds=413`; `wtr_backend_seconds=76`; `migration_total_seconds=581`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: proves the final create-route slice does not break the accepted migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-validations.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-validations.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-29-question-create-gui-validations.md`

### Exit condition
- Both targeted validation files are green in Chromium and Firefox, the full migration gate is green or explicitly marked `UNPROVEN`, and `PLANS.md` points to the correct next action at closeout.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create form blocks save and shows the expected errors for invalid single-choice drafts | High / Slice-level behavior integrity | Drive the real create form state and assert stable validation codes rather than inferring behavior from edit-route coverage | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future validator changes |
| Create form blocks save and shows the expected cardinality errors for invalid multiple-choice drafts | High / Slice-level behavior integrity | Keep the multiple-choice rules in the same milestone so the shared validator seam and the cardinality-specific rule are proven together | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future multiple-choice validator changes |
| Validation errors clear once the draft becomes valid | High / Slice-level behavior integrity | Re-submit after fixing the invalid state and prove validation no longer blocks the route | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future submit/validator changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the recurrence protocol only if a contradictory full-gate red returns |

## Execution Notes
- This milestone was instantiated immediately after the create single-multi closeout because only the validator seam remains on the create route.
- Rebuilt repo inventory during the closeout and confirmed that `specs/features/make/question/*.feature` now has dedicated mocked/backend WTR counterparts across both the create and edit families.
- The broader command-of-record gate stayed green, so no new migration frontier was discovered during final inventory.

## Pulls Handled During This Milestone
- None.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Create.GUI.Validations.feature` and `Question.Create.GUI.Validations.MultipleChoice.feature`.
- Closed the remaining create-question frontier with targeted greens plus a green full migration gate.

### Coverage Achieved
- The create route now proves empty-form validation, added-empty-answer validation, empty-question validation, no-correct-answer validation, partial-explanation validation, and the valid resubmit path that clears those errors.
- The create route now proves multiple-choice cardinality validation and the valid resubmit path once enough answers are marked correct.
- The full `Question.Create.GUI*` family is now covered by dedicated mocked/backend WTR files.

### Evidence Run
- Intent: prove create-route validation behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-create-gui-validations.test.tsx"`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `10.9s`
  Interpretation: strong proof for validation rendering and blocked-submit behavior without backend variability
- Intent: prove the same validation behavior against the real create route
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-create-gui-validations.backend.test.tsx\""`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `6.1s` after server startup
  Interpretation: strong proof for the same validation contract against the real create-submit path
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `93 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `72 passed`, `0 failed`; `wtr_mocked_seconds=67`; `playwright_seconds=413`; `wtr_backend_seconds=76`; `migration_total_seconds=581`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and no contradictory gate residue appeared
- Intent: verify that the make-question migration frontier is exhausted
  Command / artifact: `rg --files specs/features/make/question | sort` and `rg --files frontend/tests/wtr | rg 'question-(create|edit)-gui' | sort`
  Result: all eleven `specs/features/make/question/*.feature` files now have dedicated mocked/backend WTR counterparts in the repo
  Interpretation: strong evidence that the current make-question frontier is fully closed

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-create-gui-validations.test.tsx`
- `frontend/tests/wtr/backend/question-create-gui-validations.backend.test.tsx`
- `PLANS.md`
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
?? frontend/tests/wtr/backend/question-create-gui-validations.backend.test.tsx
?? frontend/tests/wtr/backend/question-edit-gui-validations.backend.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-delete-answer.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-show-hide-explanation.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-single-multi.test.tsx
?? frontend/tests/wtr/mocked/question-create-gui-validations.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-validations.test.tsx
?? history/2026-03-29-question-create-gui-delete-answer.md
?? history/2026-03-29-question-create-gui-show-hide-explanation.md
?? history/2026-03-29-question-create-gui-single-multi.md
?? history/2026-03-29-question-create-gui-validations.md
?? history/2026-03-29-question-edit-gui-validations.md
```

### Remaining Uncertainty
- The current migration frontier is closed, but the host-aware backend-WTR wrapper is still mostly proven in the local environment rather than a materially different one.
- Legacy Playwright still carries low-grade race potential around `Question.Take.NumPad`, even though it did not recur in the latest gates.
- Cheapest next proof: rerun the command of record in CI or another fresh workspace and then decide whether the legacy Playwright lane can be downshifted or retired under a follow-on mission.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create form blocks save and shows the expected errors for invalid single-choice drafts | High / Slice-level behavior integrity | Drove the real create form state and asserted stable validation codes rather than inferring behavior from edit-route coverage | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future validator changes |
| Create form blocks save and shows the expected cardinality errors for invalid multiple-choice drafts | High / Slice-level behavior integrity | Kept the multiple-choice rules in the same milestone so the shared validator seam and the cardinality-specific rule were proven together | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future multiple-choice validator changes |
| Validation errors clear once the draft becomes valid | High / Slice-level behavior integrity | Re-submitted after fixing the invalid state and proved validation no longer blocks the route | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future submit/validator changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Re-run in CI or another fresh workspace to strengthen cross-environment confidence |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - None.
- Scope changes:
  - The implementation stayed in WTR tests and BRACE artifacts; no production files changed.
- Decision changes:
  - The full `Question.Create.GUI*` family is now considered closed, and the live control surface no longer points at another concrete migration slice.

## Reusable Learning / Handoff
- Once the create-form mode-transition seam is closed, the remaining create-route behavior naturally collapses into one final validator-focused milestone.
- On the create route, a pending-save mock in the mocked lane and real navigation in the backend lane are enough to prove that validation errors truly clear on resubmit.

## Milestone Closeout Choice

- **Emit BRACE Final** - closed the final known create-route slice, rebuilt the feature inventory, and found no remaining concrete migration proof target on the live control surface.
