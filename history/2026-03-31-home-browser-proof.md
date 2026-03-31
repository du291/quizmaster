# BRACE Milestone

Milestone: `Home.BrowserProof`
Date: 2026-03-31
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-31-home-browser-proof-packaging`
Related pull(s): none
Depends on: `2026-03-30-full-wtr-parity-mission-selection`, existing mocked `home-page` WTR coverage

## BRACE Plan Snapshot

### B — Behavior
- Add lightweight app-level browser proof for `Home.feature` by exercising the home route through the full WTR app harness.
- Reconfirm that the home page shows links to create a new question and a new workspace.
- Reconfirm that the home cube changes rotation across repeated clicks under full app render.
- Keep the slice bounded to explicit `Home.feature` parity and avoid broad frontend-only closure policy work unless the route-level proof exposes a real gap.

### R — Risks (top 1–5)
1. Low / Migration credibility / parity drift: leaving `Home.feature` on component-only mocked proof keeps the repo-wide parity story slightly softer than the surrounding slices.
2. Low / Scope / sequencing drift: the last remaining parity question is easy to inflate into a general frontend-only policy debate rather than a concrete proof target.
3. Medium / Harness / gate reliability: even a low-risk static route should still prove it can pass the current command of record with the explicit browser-level evidence in place.
4. Low / Environment / external variability: route-level rotation checks depend on requestAnimationFrame timing and selector stability.

### A — Assurances
- Reuse the existing home selectors and assertions where they already prove the intended behavior.
- Render through the full app route rather than the bare component in the new browser-level proof.
- Preserve the established evidence protocol: targeted mocked green, targeted backend/browser green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - home route navigation links under WTR mocked and browser-level proof
  - home cube rotation under WTR mocked and browser-level proof
  - Chromium and Firefox evidence for the explicit home route
- Not covered:
  - final mission closeout or legacy-suite retirement policy
  - any unrelated home-page visual redesign or production refactor
  - Cheapest proof: add `tests/wtr/backend/home-page.backend.test.tsx`, rerun the existing mocked `home-page` file, then rerun the acceptance evidence

### Planned Evidence
- Intent: reconfirm the existing home behavior in the mocked WTR lane
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/home-page.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `10.3s`
  Interpretation: reconfirmed the current low-risk home behavior under deterministic component-level rendering
- Intent: prove the same home behavior through the full app route in the browser-level lane
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/home-page.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.4s`
  Interpretation: proved the same home contract under the full routed app in Chromium and Firefox
- Intent: probe the updated parity claim against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`105 passed`, `0 failed`, `wtr_mocked_seconds=74`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=395`), backend WTR (`86 passed`, `0 failed`, `wtr_backend_seconds=83`), and `migration_total_seconds=579`
  Interpretation: proved that the final explicit home proof lands without regressing the broader migration baseline

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/home-page.test.tsx`
- `frontend/tests/wtr/backend/home-page.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-home-browser-proof.md`

### Exit condition
- Existing mocked `home-page` coverage and the new backend/browser home-route proof are green in Chromium and Firefox, and the broader acceptance evidence is either green or explicitly marked `UNPROVEN` with the contradiction handled.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Home links remain explicitly proven in WTR | Low / Migration credibility / parity drift | Reuse existing selectors and rerun the current mocked file plus a routed browser-level proof | Targeted mocked `home-page` plus targeted backend `home-page` runs | Low until both lanes pass | Re-run the home files after future route-shell changes |
| Home cube rotation remains explicitly proven through the routed app | Low / Environment / external variability | Assert distinct transform states across repeated clicks under full app render | Targeted mocked `home-page` plus targeted backend `home-page` runs | Low until both lanes pass | Re-run the home files after future home-page animation or route-shell changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Medium while the retained legacy lane still has historical contradictions | If the retained legacy lane contradicts again, isolate it first before interpreting the result as slice failure |

## Execution Notes
- This milestone exists to remove the last explicit parity ambiguity without reopening broader product or harness design questions.
- The current home WTR coverage is already low-risk and stable, so the intended delta is a minimal routed browser-level proof rather than a production change.
- The full app harness was sufficient for route-level proof, so no production code or new support abstraction was needed.

## Pulls Handled During This Milestone
- None yet.

## BRACE Report

### Outcome
- Added routed browser-level WTR proof for `Home.feature` through the full app harness.
- Closed the final explicit mocked-only parity question with strong targeted evidence and a green command-of-record run.

### Coverage Achieved
- The home page links are now proven both in the existing mocked component-level lane and in a routed browser-level lane that exercises the full app shell.
- The home cube rotation is now proven through the routed app as well as the pre-existing mocked test.
- The milestone stayed bounded to explicit home-route parity and required no production changes.

### Evidence Run
- Intent: reconfirm the existing home behavior in the mocked WTR lane
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/home-page.test.tsx"`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `10.3s`
  Interpretation: strong proof that the pre-existing mocked home behavior remains stable
- Intent: prove the same home behavior through the full app route in the browser-level lane
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/home-page.backend.test.tsx\""`
  Result: Chromium + Firefox green, `2 passed`, `0 failed`, `5.4s`
  Interpretation: strong proof that the same home contract holds under the routed app in Chromium and Firefox
- Intent: probe the updated parity claim against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green with mocked WTR (`105 passed`, `0 failed`, `wtr_mocked_seconds=74`), retained Playwright (`153 passed`, `2 skipped`, `playwright_seconds=395`), backend WTR (`86 passed`, `0 failed`, `wtr_backend_seconds=83`), and `migration_total_seconds=579`
  Interpretation: strong proof that the home slice integrates cleanly into the repository baseline and leaves the mission ready for finalization

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/home-page.test.tsx`
- `frontend/tests/wtr/backend/home-page.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-31-home-browser-proof.md`

### Remaining Uncertainty
- The repo-wide parity mission still needs its explicit BRACE Final artifact and bookkeeping commit.
- The host-aware backend-WTR wrapper remains primarily proven in the local environment.
- The retained legacy lane now has three consecutive green command-of-record runs, but its older contradictory-red history still belongs in the final residuals.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Home links remain explicitly proven in WTR | Low / Migration credibility / parity drift | Reused existing selectors and reran the current mocked file plus a routed browser-level proof | Targeted mocked `home-page` plus targeted backend `home-page` runs green in Chromium and Firefox | Low | Re-run the home files after future route-shell changes |
| Home cube rotation remains explicitly proven through the routed app | Low / Environment / external variability | Asserted distinct transform states across repeated clicks under full app render | Targeted mocked `home-page` plus targeted backend `home-page` runs green in Chromium and Firefox | Low | Re-run the home files after future home-page animation or route-shell changes |
| Broader migration confidence remains current | Medium / Harness / gate reliability | Re-ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green across mocked WTR, retained Playwright, and backend WTR | Low-Medium | Re-run the command of record if any finalization bookkeeping or later environment proof changes the harness story |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - The browser-level proof was cheap enough to keep inside a single backend WTR file rather than a broader frontend-only policy change.
- Scope changes:
  - Added one routed backend WTR file; no production code or additional support layer was required.
- Decision changes:
  - `Home.feature` is now considered closed with explicit routed browser-level evidence, and the mission is ready for BRACE Final verification.

## Reusable Learning / Handoff
- For low-risk static routes, a small routed backend WTR proof can replace a lingering mocked-only ambiguity without widening the harness or production seams.

## Milestone closeout choice

- **Continue autonomously** - closed `Home.BrowserProof`, opened an explicit packaging milestone for the bookkeeping boundary, and activated the repo-wide BRACE Final milestone.
