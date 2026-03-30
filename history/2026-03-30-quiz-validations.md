# BRACE Milestone

Milestone: `Quiz.Validations`
Date: 2026-03-30
Status: in_progress
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): none
Depends on: `Quiz.CreateNew`, `Quiz.Edit`, `2026-03-30-full-wtr-parity-mission-selection`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Quiz.Validations.feature`.
- Prove the create-quiz form shows the expected defaults and validation errors for empty title, too-few selected questions, too-many randomized questions, pass-score overflow, invalid time limits, and clearing score/time-limit fields back to zero.
- Keep the slice bounded to quiz create-route defaults and validator behavior; do not widen into filter-only behavior, workspace list actions, or production validator refactors.

### R — Risks (top 1–5)
1. High / Slice-level behavior integrity: the quiz create form mixes defaults, number-field normalization, selection cardinality, and randomized-count rules, so shallow assertions could miss real contract gaps.
2. Medium / Scope / sequencing drift: quiz-create filter behavior sits immediately adjacent to the validator seam and could easily bleed into this slice.
3. Medium / Harness / gate reliability: the full migration gate still inherits the host-aware backend wrapper baseline and low-grade legacy Playwright residue.
4. Medium / Environment / external variability: backend proof depends on the real create route, current numeric-input behavior, and current validator wiring agreeing with the mocked lane.

### A — Assurances
- Reuse the existing `Quiz.CreateNew` helpers and create-form selectors rather than widening production seams.
- Bundle the default-values and validation scenarios into one milestone because they sit on the same create-form validator seam.
- Assert stable validation codes and visible field values directly from the create form, using successful submit only where it proves validation has cleared.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - default quiz-create form values and visible workspace questions
  - empty-form submission errors
  - too-many-randomized-questions validation
  - pass-score-above-max validation
  - negative and above-max time-limit validation
  - clearing time limit and pass score to zero without errors
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - filter-only behavior from `Quiz.FilterQuestions.feature`
  - broader workspace list actions
  - production validator refactors
  - Cheapest proof: implement focused mocked and backend WTR tests for `Quiz.Validations`, then run `bash ./scripts/test-migration.sh`

### Planned Evidence
- Intent: prove create-form defaults and validator behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/quiz-validations.test.tsx"`
  Result: pending
  Interpretation: will prove create-route defaults and validation behavior without backend variability
- Intent: prove the same defaults and validator behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-validations.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same validator contract against the real create route and backend wiring
- Intent: prove the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new slice does not break the accepted migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/quiz-validations.test.tsx`
- `frontend/tests/wtr/backend/quiz-validations.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-30-quiz-validations.md`

### Exit condition
- Both targeted `Quiz.Validations` files are green in Chromium and Firefox, the full migration gate is green or explicitly marked `UNPROVEN`, and `PLANS.md` points to the correct next action at closeout.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create-quiz defaults stay visible and stable | High / Slice-level behavior integrity | Assert the initial field values and visible workspace question list directly from the form | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future create-form changes |
| Invalid create-quiz drafts block submit and show the expected validation codes | High / Slice-level behavior integrity | Drive invalid drafts from the real create form and assert stable validation codes rather than inferring behavior from Playwright only | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future validator changes |
| Clearing numeric fields to zero remains non-error behavior | High / Slice-level behavior integrity | Assert both the absence of validation errors and the normalized field values after clearing | Targeted mocked and backend validation runs | Medium until both targeted lanes pass | Re-run the validation files after future numeric-input changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the contradiction protocol only if the full gate conflicts with targeted proof |

## Execution Notes
- This milestone was instantiated immediately after the `Quiz.Edit` closeout because the validator seam is the highest-risk remaining quiz-authoring behavior on the create route.

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Quiz.Validations.feature` has no dedicated WTR coverage yet, while the quiz create form, validators, and current `Quiz.CreateNew` WTR tests already exist in the repo.
- What remains blocked / incomplete: the mocked and backend WTR tests still need to be written and executed, and the full migration gate has not yet been rerun with quiz-validation coverage in place.
- Current evidence or hydration notes: repo inspection shows the create form already exposes the field IDs, validation codes, and question list needed for the feature; `Quiz.Edit` closed cleanly, so this slice can stay on the same quiz-authoring seam without widening into workspace flows.
- Next action / cheapest proof: implement `tests/wtr/mocked/quiz-validations.test.tsx` and `tests/wtr/backend/quiz-validations.backend.test.tsx`, then run the targeted commands above.
