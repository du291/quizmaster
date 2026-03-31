# BRACE Milestone

Milestone: `Quiz.FilterQuestions`
Date: 2026-03-30
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-31-quiz-filter-questions-packaging`
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
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `47.9s`
  Interpretation: proved route-local filter behavior without backend variability
- Intent: prove the same filter behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-filter-questions.backend.test.tsx\""`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `6.4s`
  Interpretation: proved the same filter contract against the real workspace-question list
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`99 passed`, `0 failed`, `wtr_mocked_seconds=64`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=377`), backend WTR (`78 passed`, `0 failed`, `wtr_backend_seconds=69`), and `migration_total_seconds=533`
  Interpretation: proved the new slice does not break the broader migration baseline, and the retained legacy lane no longer contradicted during this run

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
- No production files changed; the slice stayed within WTR tests and BRACE artifacts.
- Unlike the prior `Quiz.Validations` slice, the exact command of record completed fully green here, so the bounded quiz-create tranche now has a strong repository-level acceptance run in place.

## Pulls Handled During This Milestone
- None yet.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Quiz.FilterQuestions.feature`.
- Closed the bounded quiz-create filter seam with strong targeted evidence and a green command-of-record run.

### Coverage Achieved
- The create route now has dedicated WTR proof for filtering visible quiz-create questions by `2`, `Ikea`, and `nábytek`.
- The bounded quiz-create tranche is now covered across quiz creation, editing, validations, and filter behavior.
- The slice stayed route-local and did not widen into workspace list actions or production filter refactors.

### Evidence Run
- Intent: prove quiz-create filtering under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/quiz-filter-questions.test.tsx"`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `47.9s`
  Interpretation: strong proof for the filter seam without backend variability
- Intent: prove the same filter behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-filter-questions.backend.test.tsx\""`
  Result: Chromium + Firefox green, `1 passed`, `0 failed`, `6.4s`
  Interpretation: strong proof for the same filter contract against the real create route and backend wiring
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`99 passed`, `0 failed`, `wtr_mocked_seconds=64`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=377`), backend WTR (`78 passed`, `0 failed`, `wtr_backend_seconds=69`), and `migration_total_seconds=533`
  Interpretation: strong proof that the repository baseline accepts the filter slice and that the retained legacy lane did not contradict during this run

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/quiz-filter-questions.test.tsx`
- `frontend/tests/wtr/backend/quiz-filter-questions.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-30-quiz-filter-questions.md`

### Remaining Uncertainty
- The broader workspace list family is still open for delete, take, edit, and copy-link actions.
- The host-aware backend-WTR wrapper remains primarily proven in the local environment.
- The retained legacy lane now has a fresh green command-of-record run, but its recent contradictory-red history still warrants caution if it disagrees again later.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Numeric filter narrows the visible quiz-create question list correctly | Medium / Slice-level behavior integrity | Asserted the visible labels directly after setting the filter string | Targeted mocked and backend filter runs green in Chromium and Firefox | Low | Re-run the filter files after future create-form list changes |
| Text filters for `Ikea` and `nábytek` keep the expected visible questions only | Medium / Slice-level behavior integrity | Reused the shared create-form helper and asserted only the labels the legacy feature names | Targeted mocked and backend filter runs green in Chromium and Firefox | Low | Re-run the filter files after future question-list rendering changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green across mocked WTR, retained Playwright, and backend WTR | Low-Medium | Re-run the command of record after the next workspace slice and isolate the retained legacy lane first if it contradicts again |

## Delta From Plan
- New risks discovered:
  - None beyond the already-known recent contradictory-red history in the retained legacy lane.
- Assurances changed:
  - The acceptance-floor evidence strengthened from a pending contradiction protocol to a fully green command-of-record run.
- Scope changes:
  - None.
- Decision changes:
  - `Quiz.FilterQuestions.feature` is now considered closed, the bounded quiz-create tranche is exhausted, and `Workspace.DeleteConstraints` is the next active workspace-list slice.

## Reusable Learning / Handoff
- The shared WTR-local quiz-create-form helper kept the validations and filter slices aligned without widening production seams.
- The exact command of record is worth rerunning after bounded quiz-create changes even when the prior slice ended `UNPROVEN`, because the retained legacy contradiction may clear without any harness changes.

## Milestone closeout choice

- **Continue autonomously** - closed `Quiz.FilterQuestions`, opened an explicit packaging milestone for the bookkeeping boundary, and activated `Workspace.DeleteConstraints` as the next concrete proof target.
