# BRACE Milestone

Milestone: `Quiz.Validations`
Date: 2026-03-30
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-30-quiz-validations-packaging`
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
  Result: Chromium + Firefox green, `4 passed`, `0 failed`, `5.5s`
  Interpretation: proved create-route defaults and validation behavior without backend variability
- Intent: prove the same defaults and validator behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-validations.backend.test.tsx\""`
  Result: Chromium + Firefox green, `4 passed`, `0 failed`, `6.8s` after server startup
  Interpretation: proved the same validator contract against the real create route and backend wiring
- Intent: prove the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: `UNPROVEN` after mocked WTR green (`98 passed`, `0 failed`, `wtr_mocked_seconds=74`) and legacy Playwright contradiction on `Workspace.feature` (`152 passed`, `1 failed`, `2 skipped`, `playwright_seconds=439`) before the combined script reached backend WTR
  Interpretation: the combined gate did not deliver authoritative slice-level acceptance evidence because an unrelated retained legacy test contradicted

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
- No production files changed; the slice stayed entirely within WTR tests, a small WTR-local create-form helper, and BRACE artifacts.
- The full command-of-record remained contradictory because of an unrelated legacy Playwright workspace failure, so the acceptance-floor result is recorded as `UNPROVEN` rather than green.

## Pulls Handled During This Milestone
- None yet.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Quiz.Validations.feature`.
- Closed the bounded quiz-create validation seam with strong targeted evidence and whole-lane WTR greens, while marking the combined acceptance floor `UNPROVEN` because of unrelated legacy Playwright residue.

### Coverage Achieved
- The create route now has dedicated WTR proof for default title/description/time-limit/pass-score values and visible workspace questions.
- The slice now proves empty-form validation, too-many-randomized-questions validation, score-above-max validation, negative and above-max time-limit validation, and clearing time/score fields back to zero.
- The bounded quiz-create validator seam is now covered independently from the previously closed `Quiz.CreateNew` and `Quiz.Edit` slices.

### Evidence Run
- Intent: prove create-form defaults and validator behavior under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/quiz-validations.test.tsx"`
  Result: Chromium + Firefox green, `4 passed`, `0 failed`, `5.5s`
  Interpretation: strong proof for the validator seam without backend variability
- Intent: prove the same defaults and validator behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-validations.backend.test.tsx\""`
  Result: Chromium + Firefox green, `4 passed`, `0 failed`, `6.8s` after server startup
  Interpretation: strong proof for the same validator contract against the real create route
- Intent: verify that the full backend WTR lane still accepts the repository after the new slice
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/**/*.test.tsx\""`
  Result: Chromium + Firefox green, `77 passed`, `0 failed`, `82.1s` after server startup
  Interpretation: strong proof that the full backend WTR lane accepts the repository with the new slice in place
- Intent: probe the contradictory retained legacy failure from the command of record
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "PW_WORKERS=1 FE_PORT=5173 pnpm --dir /workspaces/quizmaster/specs exec playwright test features/make/workspace/Workspace.feature.spec.js --grep \"Show edited question in a workspace\""`
  Result: Chromium green, `1 passed`, `0 failed`, `3.9s`
  Interpretation: the retained legacy contradiction appears unrelated to the touched WTR slice, so the acceptance-floor red is classified as contradictory residue rather than slice failure
- Intent: prove the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: `UNPROVEN` after mocked WTR green (`98 passed`, `0 failed`, `wtr_mocked_seconds=74`) and a retained legacy Playwright contradiction on `Workspace.feature` (`152 passed`, `1 failed`, `2 skipped`, `playwright_seconds=439`) before the combined script reached backend WTR
  Interpretation: the exact command of record remains contradictory because of retained legacy residue and should not be over-claimed as green

### Actual Scope Inventory
- `frontend/tests/wtr/support/quiz-create-form.ts`
- `frontend/tests/wtr/mocked/quiz-validations.test.tsx`
- `frontend/tests/wtr/backend/quiz-validations.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-30-quiz-validations.md`

### Remaining Uncertainty
- `Quiz.FilterQuestions.feature` still leaves the broader quiz-authoring tranche open.
- The exact command of record remains `UNPROVEN` until the legacy Playwright contradiction either recurs clearly enough for RCA or stops recurring across fresh reruns.
- `Workspace.feature` remains the larger heterogeneous authoring family once the bounded quiz-create slices are exhausted.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Create-quiz defaults stay visible and stable | High / Slice-level behavior integrity | Asserted the initial field values and visible workspace question list directly from the form | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future create-form changes |
| Invalid create-quiz drafts block submit and show the expected validation codes | High / Slice-level behavior integrity | Drove invalid drafts from the real create form and asserted stable validation codes | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future validator changes |
| Clearing numeric fields to zero remains non-error behavior | High / Slice-level behavior integrity | Asserted both the absence of validation errors and the normalized field values after clearing | Targeted mocked and backend validation runs green in Chromium and Firefox | Low | Re-run the validation files after future numeric-input changes |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the full mocked WTR lane, the full backend WTR lane, and probed the contradictory retained Playwright scenario directly | Whole-lane WTR greens plus isolated retained Playwright rerun green, but the exact command of record still contradicted once | Medium | Re-run `bash ./scripts/test-migration.sh` after or alongside the next slice and reapply the contradiction protocol if the retained legacy lane disagrees again |

## Delta From Plan
- New risks discovered:
  - The retained legacy Playwright lane contradicted once on `Workspace.feature`, so the command of record is currently `UNPROVEN` rather than green.
- Assurances changed:
  - Strengthened evidence by rerunning the full backend WTR lane and isolating the contradictory retained Playwright scenario after the combined gate failed.
- Scope changes:
  - Added a small WTR-local create-form helper to keep the validator and future filter slices aligned.
- Decision changes:
  - `Quiz.Validations.feature` is now considered closed on slice-level evidence, and `Quiz.FilterQuestions` is the next active quiz-authoring slice.

## Reusable Learning / Handoff
- For quiz-create WTR slices, a small shared create-form helper keeps the route-local assertions consistent across validator and filter milestones.
- When the combined gate contradicts on a retained legacy scenario outside the touched slice, isolate that scenario once before classifying the acceptance floor; if it passes in isolation, mark the full gate `UNPROVEN` rather than attributing the red to the new slice.

## Milestone closeout choice

- **Continue autonomously** - closed `Quiz.Validations`, opened an explicit packaging milestone for the bookkeeping boundary, and activated `Quiz.FilterQuestions` as the next concrete proof target.
