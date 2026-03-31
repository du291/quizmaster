# BRACE Milestone

Milestone: `Workspace.RowNavigation`
Date: 2026-03-31
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-31-workspace-row-navigation-packaging`
Related pull(s): none
Depends on: `Workspace.Create`, `Question.Take.*`, `Question.Edit.GUI`, `2026-03-30-full-wtr-parity-mission-selection`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for taking and editing a question from the workspace list in `Workspace.feature`.
- Prove clicking the workspace take button reaches the question take page with the question and answers visible.
- Prove clicking the workspace edit button reaches the question edit page with the expected prepopulated question visible.
- Keep the slice bounded to row navigation; do not widen into copied-link behavior or additional edit-route validations already covered elsewhere.

### R — Risks (top 1–5)
1. Medium / Slice-level behavior integrity: row navigation spans two different route families, so weak assertions could prove URL changes without proving the destination surfaces actually loaded.
2. Medium / Scope / sequencing drift: the remaining workspace actions sit adjacent to copied-link behavior and could easily drag clipboard seams into this milestone.
3. Medium / Harness / gate reliability: the latest command of record is green again, but the retained legacy lane still has recent contradictory-red history on `Workspace.feature`.
4. Low / Environment / external variability: backend proof depends on the real workspace list, question take page, and question edit page agreeing with the mocked lane.

### A — Assurances
- Assert destination page content, not just pathname changes, after clicking workspace row actions.
- Reuse the WTR-local workspace helper for row targeting and the existing question-form/take-page selectors where they already exist.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - taking a question from the workspace list
  - editing a question from the workspace list
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - copied take/edit URLs
  - delete affordances, already closed by `Workspace.DeleteConstraints`
  - edit-route validations or post-save behavior already closed by `Question.Edit.GUI`
  - Cheapest proof: implement focused mocked and backend WTR tests for workspace row navigation, then rerun the acceptance evidence

### Planned Evidence
- Intent: prove workspace row navigation under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/workspace-row-navigation.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `4.3s`
  Interpretation: proved workspace-row navigation without backend variability
- Intent: prove the same row navigation against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-row-navigation.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.0s`
  Interpretation: proved the same row-navigation contract against the real workspace, take, and edit routes
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`103 passed`, `0 failed`, `wtr_mocked_seconds=65`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=369`), backend WTR (`82 passed`, `0 failed`, `wtr_backend_seconds=83`), and `migration_total_seconds=537`
  Interpretation: proved the new slice does not break the broader migration baseline, and the retained legacy workspace row-action scenarios stayed green throughout the run

### Planned Scope Inventory
- `frontend/tests/wtr/support/workspace-page.ts`
- `frontend/tests/wtr/mocked/workspace-row-navigation.test.tsx`
- `frontend/tests/wtr/backend/workspace-row-navigation.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-workspace-row-navigation.md`

### Exit condition
- Both targeted workspace-row-navigation files are green in Chromium and Firefox, and the broader acceptance evidence is either green or explicitly marked `UNPROVEN` with the contradiction handled.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Taking a question from the workspace list reaches the take page with the expected content | Medium / Slice-level behavior integrity | Assert both the route change and the visible question/answers after clicking the workspace row action | Targeted mocked and backend row-navigation runs | Medium until both targeted lanes pass | Re-run the row-navigation files after future workspace-row changes |
| Editing a question from the workspace list reaches the edit page with the expected prepopulated question | Medium / Slice-level behavior integrity | Assert both the route change and the visible question-edit form content after clicking the workspace row action | Targeted mocked and backend row-navigation runs | Medium until both targeted lanes pass | Re-run the row-navigation files after future workspace-row or edit-route changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-run the command of record after targeted proof and isolate the retained legacy lane first if it contradicts again | `bash ./scripts/test-migration.sh` | Medium while the retained legacy history remains recent | If the retained legacy lane disagrees again, isolate it first before interpreting the result as slice failure |

## Execution Notes
- This milestone was instantiated immediately after `Workspace.DeleteConstraints` because it closes the remaining non-clipboard workspace row actions before copied-link work.
- The existing `Question.Edit.GUI` and question-take WTR slices already prove behavior inside the destination routes, so this milestone stays focused on reaching those routes correctly from the workspace list.
- No production files changed; the slice stayed within WTR tests, a small question-take helper, and BRACE artifacts.

## Pulls Handled During This Milestone
- None yet.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for taking and editing a question directly from the workspace list.
- Closed the non-clipboard workspace row-action seam with strong targeted evidence and a green command-of-record run.

### Coverage Achieved
- The workspace route now has dedicated WTR proof that clicking the take button reaches the standalone question page with the expected question and answers visible.
- The slice now proves that clicking the edit button reaches the question edit page with the expected prepopulated form content.
- The milestone stayed bounded to row navigation and left copied-link behavior for a final follow-up slice.

### Evidence Run
- Intent: prove workspace row navigation under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/workspace-row-navigation.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `4.3s`
  Interpretation: strong proof for workspace-row navigation without backend variability
- Intent: prove the same row navigation against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-row-navigation.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.0s`
  Interpretation: strong proof for the same row-navigation contract against the real workspace, take, and edit routes
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`103 passed`, `0 failed`, `wtr_mocked_seconds=65`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=369`), backend WTR (`82 passed`, `0 failed`, `wtr_backend_seconds=83`), and `migration_total_seconds=537`
  Interpretation: strong proof that the repository baseline accepts the row-navigation slice and that the retained legacy workspace row-action scenarios did not contradict during this run

### Actual Scope Inventory
- `frontend/tests/wtr/support/question-take-page.ts`
- `frontend/tests/wtr/mocked/workspace-row-navigation.test.tsx`
- `frontend/tests/wtr/backend/workspace-row-navigation.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-workspace-row-navigation.md`

### Remaining Uncertainty
- Workspace copied take/edit URLs still remain open.
- The host-aware backend-WTR wrapper remains primarily proven in the local environment.
- The retained legacy lane now has another green command-of-record run, but its recent contradictory-red history still warrants caution if it disagrees again later.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Taking a question from the workspace list reaches the take page with the expected content | Medium / Slice-level behavior integrity | Asserted both the route change and the visible question/answers after clicking the workspace row action | Targeted mocked and backend row-navigation runs green in Chromium and Firefox | Low | Re-run the row-navigation files after future workspace-row changes |
| Editing a question from the workspace list reaches the edit page with the expected prepopulated question | Medium / Slice-level behavior integrity | Asserted both the route change and the visible question-edit form content after clicking the workspace row action | Targeted mocked and backend row-navigation runs green in Chromium and Firefox | Low | Re-run the row-navigation files after future workspace-row or edit-route changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green across mocked WTR, retained Playwright, and backend WTR | Low-Medium | Re-run the command of record after the copied-link slice and isolate the retained legacy lane first if it contradicts again |

## Delta From Plan
- New risks discovered:
  - None beyond the already-known recent contradictory-red history in the retained legacy lane.
- Assurances changed:
  - The acceptance-floor evidence strengthened from a recent green baseline to another fresh green command-of-record run with the new workspace slice included.
- Scope changes:
  - Added a small WTR-local question-take helper rather than extending the previously added workspace helper.
- Decision changes:
  - `Workspace.feature` take/edit row-action scenarios are now considered closed, and `Workspace.CopiedLinks` is the next active workspace-list slice.

## Reusable Learning / Handoff
- Keeping the workspace row-action slice separate from copied-link behavior preserved a narrow scope and avoided introducing clipboard-specific seams prematurely.
- A tiny WTR-local take-page helper was enough to prove destination content without widening production seams.

## Milestone closeout choice

- **Continue autonomously** - closed `Workspace.RowNavigation`, opened an explicit packaging milestone for the bookkeeping boundary, and activated `Workspace.CopiedLinks` as the next concrete proof target.
