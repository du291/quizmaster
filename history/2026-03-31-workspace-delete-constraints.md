# BRACE Milestone

Milestone: `Workspace.DeleteConstraints`
Date: 2026-03-31
Status: in_progress
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
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
  Result: pending
  Interpretation: will prove workspace-list delete affordances without backend variability
- Intent: prove the same delete constraints against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-delete-constraints.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same delete contract against the real workspace-question and quiz-association wiring
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new slice does not break the broader migration baseline, subject to the retained-legacy contradiction protocol if the workspace lane disagrees again

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

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Workspace.feature` still lacks dedicated WTR coverage for deleting a question from the workspace list and hiding the delete button when a question is already used in a quiz.
- What remains blocked / incomplete: the mocked and backend WTR tests still need to be written and executed, and the acceptance evidence has not yet been rerun with workspace delete coverage in place.
- Current evidence or hydration notes: the bounded quiz-create tranche is now closed, so the remaining workspace frontier is the delete affordance plus the row navigation/copy actions.
- Next action / cheapest proof: implement `tests/wtr/mocked/workspace-delete-constraints.test.tsx`, `tests/wtr/backend/workspace-delete-constraints.backend.test.tsx`, and any minimal WTR-local workspace helper needed for stable row assertions.
