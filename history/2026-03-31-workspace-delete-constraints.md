# BRACE Milestone

Milestone: `Workspace.DeleteConstraints`
Date: 2026-03-31
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-31-workspace-delete-constraints-packaging`
Related pull(s): none
Depends on: `Workspace.Create`, `Question.Edit.GUI`, `Quiz.CreateNew`, `2026-03-30-full-wtr-parity-mission-selection`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for the workspace question-delete seam in `Workspace.feature`.
- Prove deleting a standalone question removes it from the workspace list and leaves the empty workspace state visible.
- Prove a question already used in a quiz shows no delete button on the workspace list.
- Keep the slice bounded to workspace list delete affordances; do not widen into take/edit/copy-link actions or production workspace refactors.

### R — Risks (top 1–5)
1. High / Slice-level behavior integrity: delete affordances are destructive and also depend on quiz association state, so shallow assertions could overclaim coverage while missing real regressions.
2. Medium / Scope / sequencing drift: the workspace list mixes delete, take, edit, and copy-link actions, making it easy to accidentally absorb adjacent row-action behavior into this milestone.
3. Medium / Harness / gate reliability: the latest command of record is green again, but the retained legacy lane still has recent contradictory-red history on `Workspace.feature`.
4. Low / Environment / external variability: backend proof depends on the real workspace-question and quiz-association wiring agreeing with the mocked lane.

### A — Assurances
- Keep the slice focused on delete-button visibility and delete-resulting list state rather than broad workspace navigation.
- Reuse WTR-local helpers where they reduce DOM duplication, but keep them test-local and workspace-focused.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - deleting a standalone question from the workspace list
  - showing the empty workspace state after the only question is deleted
  - hiding the delete button for a question already used in a quiz
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - take-question navigation from the workspace list
  - edit-question navigation from the workspace list
  - copied take/edit URLs
  - production workspace refactors
  - Cheapest proof: implement focused mocked and backend WTR tests for workspace delete constraints, then rerun the acceptance evidence

### Planned Evidence
- Intent: prove workspace delete constraints under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/workspace-delete-constraints.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `3.9s`
  Interpretation: proved workspace-list delete affordances without backend variability
- Intent: prove the same delete constraints against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-delete-constraints.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.1s`
  Interpretation: proved the same delete contract against the real workspace-question and quiz-association wiring
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`101 passed`, `0 failed`, `wtr_mocked_seconds=64`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=374`), backend WTR (`80 passed`, `0 failed`, `wtr_backend_seconds=71`), and `migration_total_seconds=529`
  Interpretation: proved the new slice does not break the broader migration baseline, and the retained legacy workspace lane stayed green throughout the run

### Planned Scope Inventory
- `frontend/tests/wtr/support/workspace-page.ts`
- `frontend/tests/wtr/mocked/workspace-delete-constraints.test.tsx`
- `frontend/tests/wtr/backend/workspace-delete-constraints.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-workspace-delete-constraints.md`

### Exit condition
- Both targeted workspace-delete files are green in Chromium and Firefox, and the broader acceptance evidence is either green or explicitly marked `UNPROVEN` with the contradiction handled.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Deleting a standalone question removes it from the workspace list and leaves the empty state visible | High / Slice-level behavior integrity | Assert the row disappearance and resulting empty-state shape directly on the workspace page | Targeted mocked and backend delete-constraint runs | Medium until both targeted lanes pass | Re-run the delete files after future workspace-list changes |
| Questions already used in a quiz show no delete button | High / Slice-level behavior integrity | Assert the delete affordance absence directly from the rendered workspace row while leaving the question visible | Targeted mocked and backend delete-constraint runs | Medium until both targeted lanes pass | Re-run the delete files after future workspace-row changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-run the command of record after targeted proof and isolate the retained legacy lane first if it contradicts again | `bash ./scripts/test-migration.sh` | Medium while the retained legacy history remains recent | If the retained legacy lane disagrees again, isolate it first before interpreting the result as slice failure |

## Execution Notes
- This milestone was instantiated immediately after `Quiz.FilterQuestions` because it is the narrowest remaining workspace-list seam and avoids clipboard-specific harness work for now.
- The existing `Question.Edit.GUI` WTR slice already subsumes `Workspace.feature` scenario `Show edited question in a workspace`, so this milestone stays focused on delete constraints only.
- No production files changed; the slice stayed within WTR tests, a small workspace-page helper, and BRACE artifacts.

## Pulls Handled During This Milestone
- None yet.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for the workspace delete affordance and in-quiz guard from `Workspace.feature`.
- Closed the destructive workspace-list seam with strong targeted evidence and a green command-of-record run.

### Coverage Achieved
- The workspace route now has dedicated WTR proof for deleting a standalone question from the list and observing the empty-state result.
- The slice now proves that questions already used in a quiz stay visible but do not expose a delete button.
- The milestone stayed bounded to delete affordances and left take/edit/copy row actions for follow-up slices.

### Evidence Run
- Intent: prove workspace delete constraints under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/workspace-delete-constraints.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `3.9s`
  Interpretation: strong proof for workspace delete affordances without backend variability
- Intent: prove the same delete constraints against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-delete-constraints.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.1s`
  Interpretation: strong proof for the same delete contract against the real workspace-question and quiz-association wiring
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`101 passed`, `0 failed`, `wtr_mocked_seconds=64`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=374`), backend WTR (`80 passed`, `0 failed`, `wtr_backend_seconds=71`), and `migration_total_seconds=529`
  Interpretation: strong proof that the repository baseline accepts the delete slice and that the retained legacy workspace scenarios did not contradict during this run

### Actual Scope Inventory
- `frontend/tests/wtr/support/workspace-page.ts`
- `frontend/tests/wtr/mocked/workspace-delete-constraints.test.tsx`
- `frontend/tests/wtr/backend/workspace-delete-constraints.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-workspace-delete-constraints.md`

### Remaining Uncertainty
- Workspace row navigation and copied-link actions still remain open.
- The host-aware backend-WTR wrapper remains primarily proven in the local environment.
- The retained legacy lane now has another green command-of-record run, but its recent contradictory-red history still warrants caution if it disagrees again later.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Deleting a standalone question removes it from the workspace list and leaves the empty state visible | High / Slice-level behavior integrity | Asserted the row disappearance and resulting empty-state shape directly on the workspace page | Targeted mocked and backend delete-constraint runs green in Chromium and Firefox | Low | Re-run the delete files after future workspace-list changes |
| Questions already used in a quiz show no delete button | High / Slice-level behavior integrity | Asserted the delete affordance absence directly from the rendered workspace row while leaving the question visible | Targeted mocked and backend delete-constraint runs green in Chromium and Firefox | Low | Re-run the delete files after future workspace-row changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green across mocked WTR, retained Playwright, and backend WTR | Low-Medium | Re-run the command of record after the next workspace slice and isolate the retained legacy lane first if it contradicts again |

## Delta From Plan
- New risks discovered:
  - None beyond the already-known recent contradictory-red history in the retained legacy lane.
- Assurances changed:
  - The acceptance-floor evidence strengthened from a recent green baseline to another fresh green command-of-record run with the new workspace slice included.
- Scope changes:
  - Added a small WTR-local workspace-page helper to keep row assertions stable and reusable for follow-up workspace slices.
- Decision changes:
  - `Workspace.feature` delete scenarios are now considered closed, and `Workspace.RowNavigation` is the next active workspace-list slice.

## Reusable Learning / Handoff
- A tiny WTR-local workspace helper is enough to stabilize row-level assertions without widening production seams.
- The workspace delete affordance can be covered honestly without clipboard work by separating destructive actions from the remaining copied-link scenarios.

## Milestone closeout choice

- **Continue autonomously** - closed `Workspace.DeleteConstraints`, opened an explicit packaging milestone for the bookkeeping boundary, and activated `Workspace.RowNavigation` as the next concrete proof target.
