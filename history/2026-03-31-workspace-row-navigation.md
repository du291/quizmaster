# BRACE Milestone

Milestone: `Workspace.RowNavigation`
Date: 2026-03-31
Status: in_progress
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
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
  Result: pending
  Interpretation: will prove workspace-row navigation without backend variability
- Intent: prove the same row navigation against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-row-navigation.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same row-navigation contract against the real workspace, take, and edit routes
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new slice does not break the broader migration baseline, subject to the retained-legacy contradiction protocol if the workspace lane disagrees again

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

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Workspace.feature` still lacks dedicated WTR coverage for taking and editing a question directly from the workspace list.
- What remains blocked / incomplete: the mocked and backend WTR tests still need to be written and executed, and the acceptance evidence has not yet been rerun with workspace row-navigation coverage in place.
- Current evidence or hydration notes: the destructive delete seam is now closed, so the remaining workspace frontier is row navigation plus copied take/edit URLs.
- Next action / cheapest proof: implement `tests/wtr/mocked/workspace-row-navigation.test.tsx` and `tests/wtr/backend/workspace-row-navigation.backend.test.tsx`, reusing the existing workspace helper and destination-page selectors where they already exist.
