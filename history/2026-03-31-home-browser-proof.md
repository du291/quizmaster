# BRACE Milestone

Milestone: `Home.BrowserProof`
Date: 2026-03-31
Status: in_progress
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): none
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
  Result: pending
  Interpretation: will reconfirm the current low-risk home behavior under deterministic component-level rendering
- Intent: prove the same home behavior through the full app route in the browser-level lane
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/home-page.backend.test.tsx\""`
  Result: pending
  Interpretation: will prove the same home contract under the full routed app in Chromium and Firefox
- Intent: probe the updated parity claim against the acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will prove that the last explicit home proof lands without regressing the broader migration baseline

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

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Workspace.CopiedLinks` is closed in substance, and `Home.feature` is the last explicit parity question still called out in `PLANS.md`.
- What remains blocked / incomplete: the browser-level home proof does not exist yet, and the acceptance evidence has not yet been rerun with that route-level proof in place.
- Current evidence or hydration notes: the existing mocked `home-page` WTR file is stable, and the current app harness already supports route-level rendering via `renderAppAt('/')`.
- Next action / cheapest proof: add `tests/wtr/backend/home-page.backend.test.tsx`, targeting the existing home behaviors through `renderAppAt('/')`, then run the targeted mocked and backend lanes.
