# BRACE Milestone

Milestone: `Workspace.CopiedLinks`
Date: 2026-03-31
Status: in_progress
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): none
Depends on: `Workspace.RowNavigation`, `Question.Take.*`, `Question.Edit.GUI`, `2026-03-30-full-wtr-parity-mission-selection`

## BRACE Plan Snapshot

### B — Behavior
- Add dedicated mocked and backend WTR coverage for copied take/edit question URLs from the workspace list in `Workspace.feature`.
- Prove copying the take-question URL yields a navigable question route that shows the question and answers when followed.
- Prove copying the edit-question URL yields a navigable edit route that shows the question edit page when followed.
- Keep the slice bounded to copied-link behavior; do not widen into already-closed row navigation or broader clipboard refactors unless a direct mock clearly proves too brittle.

### R — Risks (top 1–5)
1. Medium / Slice-level behavior integrity: copied-link behavior touches clipboard I/O plus route-following, so weak assertions could prove one half of the contract while missing the other.
2. Medium / Scope / sequencing drift: clipboard behavior is the first workspace slice that touches a browser boundary directly, making it easy to drift into generalized infrastructure work.
3. Medium / Harness / gate reliability: the latest command of record is green again, but the retained legacy lane still has recent contradictory-red history on `Workspace.feature`.
4. Low / Environment / external variability: backend proof depends on the browser test environment allowing a stable enough clipboard simulation to mirror production behavior honestly.

### A — Assurances
- Start with the narrowest viable clipboard simulator in WTR tests and only introduce a production seam if direct simulation shows real drift or brittleness.
- Assert both the copied URL content and the destination-page content after following that URL.
- Preserve the established evidence protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - copying a take-question URL from the workspace list and following it
  - copying an edit-question URL from the workspace list and following it
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - delete or row-navigation behavior, already closed by earlier workspace slices
  - generalized clipboard refactors unless direct test simulation proves insufficient
  - Cheapest proof: implement focused mocked and backend copied-link tests, then rerun the acceptance evidence

### Planned Evidence
- Intent: prove copied workspace links under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/workspace-copied-links.test.tsx"`
  Result: pending
  Interpretation: will prove copied-link behavior without backend variability
- Intent: prove the same copied-link behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-copied-links.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same copied-link contract against the real workspace, take, and edit routes
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove the new slice does not break the broader migration baseline, subject to the retained-legacy contradiction protocol if the workspace lane disagrees again

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/workspace-copied-links.test.tsx`
- `frontend/tests/wtr/backend/workspace-copied-links.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-workspace-copied-links.md`

### Exit condition
- Both targeted workspace-copied-links files are green in Chromium and Firefox, and the broader acceptance evidence is either green or explicitly marked `UNPROVEN` with the contradiction handled.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Copying a take-question URL yields a navigable take route with the expected content | Medium / Slice-level behavior integrity | Assert both the copied URL payload and the visible question/answers after following it | Targeted mocked and backend copied-link runs | Medium until both targeted lanes pass | Re-run the copied-link files after future workspace-row changes |
| Copying an edit-question URL yields a navigable edit route with the expected prepopulated content | Medium / Slice-level behavior integrity | Assert both the copied URL payload and the visible edit-form content after following it | Targeted mocked and backend copied-link runs | Medium until both targeted lanes pass | Re-run the copied-link files after future workspace-row or edit-route changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-run the command of record after targeted proof and isolate the retained legacy lane first if it contradicts again | `bash ./scripts/test-migration.sh` | Medium while the retained legacy history remains recent | If the retained legacy lane disagrees again, isolate it first before interpreting the result as slice failure |

## Execution Notes
- This milestone was instantiated immediately after `Workspace.RowNavigation` because it is the last remaining uncovered workspace-list behavior.
- `infrastructure-seams` review identified clipboard as a seam candidate, but the initial plan is to try a narrow test-local simulator first because the current product contract is only `writeText(string)` plus route-following; introduce a production seam only if that proves brittle.

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Workspace.feature` still lacks dedicated WTR coverage for copying take/edit question URLs and following them.
- What remains blocked / incomplete: the mocked and backend WTR tests still need to be written and executed, and the acceptance evidence has not yet been rerun with copied-link coverage in place.
- Current evidence or hydration notes: delete constraints and row navigation are now closed, so clipboard behavior is the only remaining uncovered workspace-list seam.
- Next action / cheapest proof: implement `tests/wtr/mocked/workspace-copied-links.test.tsx` and `tests/wtr/backend/workspace-copied-links.backend.test.tsx`, starting with a narrow clipboard simulator in test code and escalating to a production seam only if the direct simulation proves too brittle.
