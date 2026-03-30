# BRACE Milestone

Milestone: `Quiz.FilterQuestions`
Date: 2026-03-30
Status: in_progress
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): none
Depends on: `Quiz.CreateNew`, `Quiz.Validations`, `2026-03-30-full-wtr-parity-mission-selection`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for `Quiz.FilterQuestions.feature`.
- Prove the create-quiz form filters the visible question list correctly for numeric, Ikea, and `nábytek` filter inputs.
- Keep the slice bounded to route-local filter behavior; do not widen into validator behavior, workspace list actions, or production filter refactors.

### R — Risks (top 1–5)
1. Medium / Slice-level behavior integrity: the filter seam is narrower than validations, but it depends on question-list rendering and string matching behavior that can still drift silently if assertions are weak.
2. Medium / Scope / sequencing drift: the quiz-create route is now almost closed, which makes it easy to absorb unrelated workspace-list behavior by accident.
3. Medium / Harness / gate reliability: the exact command of record still carries contradictory legacy Playwright residue outside the touched WTR slice.
4. Low / Environment / external variability: backend proof depends on the real workspace-question list arriving in a stable enough shape to exercise the filter UI.

### A — Assurances
- Reuse the shared WTR-local quiz-create-form helper introduced during `Quiz.Validations`.
- Assert only visible question labels for the filter input values the legacy feature names, rather than widening into form submission or workspace navigation.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh` with the contradiction protocol if legacy Playwright disagrees again.

### Planned Coverage
- Covered:
  - filtering visible quiz-create questions by `2`
  - filtering visible quiz-create questions by `Ikea`
  - filtering visible quiz-create questions by `nábytek`
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - quiz-create defaults and validations, already closed by `Quiz.Validations`
  - broader workspace list actions
  - production filter refactors
  - Cheapest proof: implement focused mocked and backend WTR tests for `Quiz.FilterQuestions`, then rerun the acceptance evidence

### Planned Evidence
- Intent: prove quiz-create filtering under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/quiz-filter-questions.test.tsx"`
  Result: pending
  Interpretation: will prove route-local filter behavior without backend variability
- Intent: prove the same filter behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-filter-questions.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same filter contract against the real workspace-question list
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new slice does not break the broader migration baseline, subject to the existing contradiction protocol on the retained legacy lane

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/quiz-filter-questions.test.tsx`
- `frontend/tests/wtr/backend/quiz-filter-questions.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-30-quiz-filter-questions.md`

### Exit condition
- Both targeted `Quiz.FilterQuestions` files are green in Chromium and Firefox, and the broader acceptance evidence is either green or explicitly marked `UNPROVEN` with the contradiction handled.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Numeric filter narrows the visible quiz-create question list correctly | Medium / Slice-level behavior integrity | Assert the visible labels directly after setting the filter string | Targeted mocked and backend filter runs | Medium until both targeted lanes pass | Re-run the filter files after future create-form list changes |
| Text filters for `Ikea` and `nábytek` keep the expected visible questions only | Medium / Slice-level behavior integrity | Reuse the shared create-form helper and assert only the labels the legacy feature names | Targeted mocked and backend filter runs | Medium until both targeted lanes pass | Re-run the filter files after future question-list rendering changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-run the acceptance evidence after targeted proof and apply the contradiction protocol if the retained legacy lane disagrees again | `bash ./scripts/test-migration.sh` | Medium while the retained legacy contradiction remains unresolved | If the retained legacy lane disagrees again, isolate it first before interpreting the result as slice failure |

## Execution Notes
- This milestone was instantiated immediately after `Quiz.Validations` because it closes the last bounded quiz-create seam before the broader workspace list family.

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Quiz.FilterQuestions.feature` has no dedicated WTR coverage yet, while the create-form filter input and the shared quiz-create-form helper already exist in the repo.
- What remains blocked / incomplete: the mocked and backend WTR tests still need to be written and executed, and the acceptance evidence has not yet been rerun with filter coverage in place.
- Current evidence or hydration notes: `Quiz.Validations` closed with strong slice-level evidence, so the remaining create-route frontier is now the visible-question filter seam only.
- Next action / cheapest proof: implement `tests/wtr/mocked/quiz-filter-questions.test.tsx` and `tests/wtr/backend/quiz-filter-questions.backend.test.tsx`, then run the targeted commands above.
