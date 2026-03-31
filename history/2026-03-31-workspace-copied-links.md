# BRACE Milestone

Milestone: `Workspace.CopiedLinks`
Date: 2026-03-31
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-31-workspace-copied-links-packaging`
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
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.7s`
  Interpretation: proved copied-link behavior without backend variability
- Intent: prove the same copied-link behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-copied-links.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `6.3s`
  Interpretation: proved the same copied-link contract against the real workspace, take, and edit routes
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`105 passed`, `0 failed`, `wtr_mocked_seconds=79`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=422`), backend WTR (`84 passed`, `0 failed`, `wtr_backend_seconds=93`), and `migration_total_seconds=623`
  Interpretation: proved the new slice does not break the broader migration baseline, and the previously contradictory retained `Workspace.feature` copied-link scenarios stayed green during the same run

### Planned Scope Inventory
- `frontend/tests/wtr/support/clipboard-harness.ts`
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
- The narrow test-local clipboard harness was sufficient in both mocked and backend lanes, so the slice stayed within WTR support code and did not require a production-owned seam.

## Pulls Handled During This Milestone
- None yet.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for copying take and edit question URLs from the workspace list and following those URLs into the expected routes.
- Closed the final uncovered workspace-list authoring seam with strong targeted evidence and a green command-of-record run.

### Coverage Achieved
- The workspace route now has dedicated WTR proof that copying the take link produces the expected absolute URL and that following it reaches the standalone question page with the expected content.
- The slice now proves that copying the edit link produces the expected absolute URL, surfaces the existing `link copied` alert, and reaches the edit route with the expected prepopulated form.
- The milestone stayed bounded to copied-link behavior and kept clipboard simulation inside WTR-local support code instead of widening into a production seam.

### Evidence Run
- Intent: prove copied workspace links under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/workspace-copied-links.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.7s`
  Interpretation: strong proof for copied-link behavior without backend variability
- Intent: prove the same copied-link behavior against the real backend
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/workspace-copied-links.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `6.3s`
  Interpretation: strong proof for the same copied-link contract against the real workspace, take, and edit routes
- Intent: probe the slice against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`105 passed`, `0 failed`, `wtr_mocked_seconds=79`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=422`), backend WTR (`84 passed`, `0 failed`, `wtr_backend_seconds=93`), and `migration_total_seconds=623`
  Interpretation: strong proof that the repository baseline accepts the copied-link slice and that the previously contradictory retained `Workspace.feature` copied-link scenarios stayed green in the same run

### Actual Scope Inventory
- `frontend/tests/wtr/support/clipboard-harness.ts`
- `frontend/tests/wtr/mocked/workspace-copied-links.test.tsx`
- `frontend/tests/wtr/backend/workspace-copied-links.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-workspace-copied-links.md`

### Remaining Uncertainty
- `Home.feature` still lacks explicit browser-level parity proof even though its current mocked WTR coverage is low-risk and stable.
- The host-aware backend-WTR wrapper remains primarily proven in the local environment.
- The retained legacy lane now has another green command-of-record run, but its earlier contradictory-red history still warrants caution if it disagrees again later.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Copying a take-question URL yields a navigable take route with the expected content | Medium / Slice-level behavior integrity | Asserted both the copied URL payload and the visible question/answers after following it | Targeted mocked and backend copied-link runs green in Chromium and Firefox | Low | Re-run the copied-link files after future workspace-row changes |
| Copying an edit-question URL yields a navigable edit route with the expected prepopulated content | Medium / Slice-level behavior integrity | Asserted both the copied URL payload and the visible edit-form content after following it | Targeted mocked and backend copied-link runs green in Chromium and Firefox | Low | Re-run the copied-link files after future workspace-row or edit-route changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green across mocked WTR, retained Playwright, and backend WTR | Low-Medium | Re-run the command of record after the next parity slice and isolate the retained legacy lane first if it contradicts again |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - The test-local clipboard harness proved sufficient, so no production seam was needed for this slice.
- Scope changes:
  - Added a small WTR-local clipboard harness to capture `navigator.clipboard.writeText` calls and `window.alert` side effects deterministically.
- Decision changes:
  - `Workspace.feature` copied take/edit URL scenarios are now considered closed, and the workspace-list authoring frontier is closed in substance.

## Reusable Learning / Handoff
- Clipboard-heavy workspace behavior was still cheap to prove with a narrow WTR-local harness because the product contract was limited to `writeText` plus a route-following assertion.
- Following the copied URLs inside the same test kept the slice honest without requiring any production refactor.

## Milestone closeout choice

- **Continue autonomously** - closed `Workspace.CopiedLinks`, opened an explicit packaging milestone for the bookkeeping boundary, and activated `Home.BrowserProof` as the next concrete proof target.
