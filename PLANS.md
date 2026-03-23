# PLANS.md — BRACE v2.1 Hydrated Plan

Purpose: persistent working memory and route for the WTR migration effort.

Hydrated on 2026-03-23 from the current long-horizon state using:
- `AGENTS.md`
- `init.md`
- prior plan history in `PLANS-old`
- current pinboard in `docs/testing/wtr-migration-pinboard.md`
- current worktree state, including untracked `Question.Take.Image` WTR tests

Note: `PLANS-old` references `BOOTSTRAP.md`, but that file is not present in the current checkout. The migrated plan below therefore relies on the surviving repo artifacts and the transferred history in `PLANS-old`.

---

## 1) BRACE Mission

### Primary mission
- **Outcome:** Continue the incremental Playwright-BDD to WTR migration, close the in-flight `Question.Take.Image` slice with executed evidence, and preserve the legacy Playwright suite until parity is proven.
- **Why this matters / target function:** Improve local and CI feedback speed without losing migration stability, cross-browser confidence, or a repeatable command of record.
- **Success metric(s):**
  - `bash ./scripts/test-migration.sh` remains the command of record and stays repeatable.
  - WTR mocked and backend lanes pass in headless Chromium and Firefox.
  - Legacy Playwright remains green until migration completion.
  - Runtime tracking remains available for mocked WTR, backend WTR, and legacy Playwright lanes.
  - The current `Question.Take.Image` slice closes with a recorded harness decision backed by executed evidence or an explicit **UNPROVEN** residual.
- **Non-goals:**
  - Removing the legacy Playwright suite before parity.
  - Forcing 1:1 scenario mapping when merged WTR tests are clearer.
  - Extracting broader production/domain helpers unless repeated duplication justifies it.

### Current operating context
- **Work type:** migration
- **Current phase:** Mission approved on 2026-03-23. `Question.Take.Image` is packaged in commit `5a4e7079`, `Question.Take.Explanation` is packaged in commit `38df0657`, the `history/` reporting workflow is now in place, and the next standalone-question milestone has not yet been selected.
- **Execution mode:** autonomous milestones after Mission approval
- **Source artifacts used to hydrate this plan:**
  - current request / prompt
  - `init.md`
  - prior BRACE artifact: `PLANS-old`
  - repo docs / notes: `AGENTS.md`, `docs/testing/wtr-migration-pinboard.md`
  - current repo state, including committed `Question.Take.Image` WTR coverage and the repo-local backend-WTR host hardening
  - historical note from `PLANS-old`: `BOOTSTRAP.md` was previously referenced but is absent in this checkout

### Mission-level behavior / risks / route
- **Top behavior(s):**
  - Keep migration incremental and evidence-driven.
  - Preserve legacy Playwright coverage while WTR parity is incomplete.
  - Carry the completed `Question.Take.Image` slice forward as the acceptance baseline for later take-flow work.
  - Keep the command of record trustworthy across mocked WTR, backend WTR, and legacy Playwright lanes.
- **Top mission risks / assumptions:**
  - The repo-local host-aware wrapper is proven in the current environment, but not yet in a materially different environment such as CI or a fresh workspace.
  - The additive backend question-helper widening used by `Question.Take.Explanation` is proven in the current environment, but future standalone-question slices may need a broader payload contract.
  - Legacy Playwright may still show resource-pressure sensitivity outside the already-proven `PW_WORKERS=1` control.
  - Timer-related helper proof remains narrower than the broader score-family contract.
  - Final CI cadence and runtime budget are still open policy decisions.
- **Initial route / milestone sequence:**
  1. Choose the next remaining standalone question slice after explanation.
  2. Keep using `bash ./scripts/test-migration.sh` as the validation gate and watch the host-aware wrapper in later environments.
  3. Write each completed milestone report to `history/` and reference that file from the milestone commit message.
  4. Reassess deferred timer-proof and CI-policy decisions as needed.
- **Validation gate(s):**
  - `bash ./scripts/test-migration.sh`
  - targeted mocked/backend WTR runs for touched files in Chromium and Firefox
  - sampled reruns or loops when the change is intended to harden race-prone helpers or harness behavior
- **Pull conditions that should interrupt autonomy:**
  - A repo-local harness design choice materially changes the route or blast radius.
  - Contradictory evidence remains after the chosen backend-WTR hardening step.
  - CI cadence or runtime-policy decisions start blocking further migration slices.
  - An external tool, service, or environment issue blocks the validation gate.

### Mission approval state
- **Approved?** yes
- **If not, what decision is still needed?** N/A

---

## 2) Current Pinboard

### Accepted decisions
- Migration strategy is incremental.
- Legacy Playwright-BDD in `specs/` stays intact until parity is reached.
- One repeatable command must run both suites.
- WTR migration coverage uses system-boundary mocks, plus WTR-only mocked and backend lanes.
- 1:1 scenario mapping is not required; merged WTR tests are allowed.
- Long-term BDD-style docs are not required; WTR `it(...)` descriptions are the documentation.
- Runtime tracking of WTR vs Playwright is mandatory during migration.
- Prefer low-churn shared WTR test helpers when repeated hand-built quiz/question shapes would otherwise accumulate.
- Helper harmonization is allowed to proceed in ranked slices; the highest-risk score/partial/timer tranche and remaining take/progress tranche are already backed by executed evidence.
- The command of record defaults the legacy Playwright lane to `PW_WORKERS=1`; explicit env override remains available for future tuning.
- DB reset stays an RCA tool, not a default step in the command of record, because the serialized gate has already passed on accumulated local DB state.
- Backend WTR now uses a repo-local host-aware Vite wrapper so the transient Vite listener and the proxy target stay on the same explicit host (`127.0.0.1` by default) instead of relying on `localhost`.
- Each completed BRACE milestone gets a full report file under `history/`, and milestone commit messages reference that file.

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on two headless browsers: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

### Open decisions / questions
- Final CI policy for dual-suite execution cadence.
- Whether timer-related helpers need stronger proof obligations than the current score-family contract.
- Which remaining standalone question slice should follow `Question.Take.Explanation`.

### Required evidence before current milestone is done
- The `Question.Take.Image` closeout evidence remains the baseline for the next slice:
  - mocked image WTR green in Chromium and Firefox
  - backend image WTR green in Chromium and Firefox
  - `bash ./scripts/test-migration.sh` green after the host-aware wrapper landed
- `Question.Take.Explanation` closeout evidence now joins that baseline:
  - mocked explanation WTR green in Chromium and Firefox
  - backend explanation WTR green in Chromium and Firefox
  - `bash ./scripts/test-migration.sh` green after the additive backend question-helper widening
- If a later slice touches backend-WTR harness behavior again, rerun the command of record and compare against the current green baseline rather than treating the wrapper as permanently proven.
- Residual timer/helper concerns outside the image slice remain explicit rather than silently expanding future milestones.

---

## 3) Expertise boundary

Mark only **Autonomous** or **Pull**.

- **Product / UX:** Autonomous
- **Architecture / design:** Pull
- **Testing strategy:** Autonomous
- **Debugging / RCA:** Pull
- **Security / risk:** Autonomous
- **System / harness design:** Pull
- **Environment / external blockers:** Pull

---

## 4) Validation gate(s)

- **Primary gate command / script:** `bash ./scripts/test-migration.sh`
- **What must pass after each milestone / session:**
  - mocked WTR lane in Chromium and Firefox
  - backend WTR lane in Chromium and Firefox
  - legacy Playwright lane while migration remains in progress
- **Additional targeted checks:**
  - targeted WTR files for the touched helper/test set
  - instrumented reruns or loops when the change is intended to harden race-prone helpers or harness behavior
- **Timing / performance metrics to watch:**
  - `wtr_mocked_seconds`
  - `wtr_backend_seconds`
  - `playwright_seconds`
  - `migration_total_seconds`

---

## 5) Current milestone

### BRACE Milestone (current)
- **Name:** `Question.Take.Explanation` closeout (complete)
- **Status:** complete on 2026-03-23; next slice selection pending
- **Intent / behavior:** Add mocked and backend WTR coverage for single-question explanation display on `/question/:id`, covering selected-answer explanation for single choice plus per-answer and question explanation for multiple choice.
- **Entry conditions:**
  - `Question.Take.Image` is committed in `5a4e7079` with a green command of record and repo-local backend-WTR host hardening.
  - The command of record already encodes the proven Playwright worker setting.
  - Standalone-question mocked/backend patterns already exist via the image slice.
- **Expected inventory / touched areas:**
  - `frontend/tests/wtr/mocked/question-take-explanation.test.tsx`
  - `frontend/tests/wtr/backend/question-take-explanation.backend.test.tsx`
  - `frontend/tests/wtr/support/backend-api.ts` if backend question creation needs additive explanation/correct-answer options
  - `PLANS.md`
- **Top risks:**
  - The additive backend helper widening is proven in the current environment, but not yet in a materially different environment such as CI.
  - Future standalone question slices may want to widen the shared backend question-helper further than the current explanation-friendly contract.
  - Broader feedback or numpad concerns must stay separate so the explanation slice remains feature-local.
- **Planned assurances:**
  - Keep backend helper changes additive and backwards-compatible with existing simple `createQuestionInBackend(...)` callers.
  - Reuse the standalone question route and existing fixture fields instead of inventing a broader seam.
  - Preserve the executed image baseline and the green full gate as the acceptance floor.
  - Keep legacy Playwright tests unchanged.
- **Planned evidence:**
  - `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-take-explanation.test.tsx"`
  - `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-take-explanation.backend.test.tsx\""`
  - `bash ./scripts/test-migration.sh`
- **Exit condition:** met on 2026-03-23. `Question.Take.Explanation` mocked/backend lanes are green, the additive backend helper widening is proven by executed evidence, and the full gate remains green.

### Upcoming milestones
1. Choose the next remaining standalone-question slice after explanation, likely `Question.Take.Feedback` or `Question.Take.NumPad`.
2. Decide whether future standalone question slices should keep using the additive shared backend question-helper or switch to local creators when payload needs diverge.
3. Reassess whether the deferred timer-proof investigation or CI-policy decision needs to happen before later migration batches.

---

## 6) Risks and residuals (top only)

Keep only the risks that matter for steering.

| ID | Risk / uncertainty | Why it matters | Current handling | Residual | Cheapest next proof | Pull class if escalation needed |
|---|---|---|---|---|---|---|
| R1 | The repo-local host-aware wrapper is proven in the current environment, but not yet in a materially different environment such as CI or a fresh workspace | The `localhost`/address-family seam could still reappear elsewhere even though it is fixed locally now | Wrapper landed in repo-owned test infrastructure and the full gate is green in the current environment | Low-Medium | Re-run `bash ./scripts/test-migration.sh` in CI or a fresh workspace before declaring the seam fully retired | BRACE Pull |
| R2 | The additive backend question-helper widening is only proven in the current environment | A helper contract that looks stable locally could still expose API-shape assumptions in CI or a fresh workspace | Targeted mocked/backend explanation runs are green and the full gate is green after the helper change | Low-Medium | Re-run `bash ./scripts/test-migration.sh` in CI or a fresh workspace before widening the helper further | BRACE Pull |
| R3 | Legacy Playwright stability may still vary by environment resource pressure even with the serialized gate | Contradictory failures in CI or weaker dev environments could re-open RCA | Command of record defaults Playwright to `PW_WORKERS=1`; DB reset remains RCA-only | Low-Medium | Re-run `bash ./scripts/test-migration.sh` in a materially different environment before changing policy again | BRACE Pull |
| R4 | Timer-related helpers may still need stronger proof obligations than the current score-family contract | Timer flows cross more boundaries and may remain partially unproven after the explanation slice closes | Deferred as a separate investigation | Medium | Add a focused timer-helper experiment if timer failures or weak evidence appear | BRACE Pull |
| R5 | Final CI policy and runtime budget remain undecided | Migration can succeed technically but still land with awkward operational cadence | Runtime tracking remains mandatory during migration | Low for the current milestone | Keep collecting per-lane timings from the command of record and decide later | BRACE Pull |

---

## 7) Pull log

Use this for actual human-facing interruptions.

| Date/Session | Pull class | Context | Evidence / facts | Decision or action requested | Resolution | Follow-up |
|---|---|---|---|---|---|---|
| 2026-03-13 | BRACE Pull | Shift into long-horizon planning using the migration pinboard | Bootstrap plan proposed the highest-risk helper tranche first | Approve the next milestone plan before implementation | Approved: run the highest-risk score/partial/timer helper tranche first | Reassess remaining take/progress harmonization before the next migration batch |
| 2026-03-23 | System Pull | `Question.Take.Image` targeted WTR was green but one earlier full gate failed in backend WTR | Failure signature included `ETIMEDOUT ::1:5174` and `ECONNREFUSED 127.0.0.1:5174`; sampled ownership showed the WTR process bringing up `::1:5174` while the plugin proxied to `http://localhost:${vitePort}` | Choose whether to harden backend WTR with a repo-local host-aware Vite wrapper or with a broader harness split | Resolved: use a repo-local host-aware Vite wrapper that binds and proxies on the same explicit host (`127.0.0.1` by default) | Targeted image checks and `bash ./scripts/test-migration.sh` were green after the wrapper landed; watch for recurrence in CI or a fresh workspace |

---

## 8) Milestone journal / handoff notes

Short milestone closeouts only. These are the running history and lookup layer.

| Date/Session | Milestone / slice | What changed | Evidence run | Key learning / decision | Commit / ref |
|---|---|---|---|---|---|
| 2026-03-10 pinboard snapshot | `Quiz.Take` batch complete; timer clock seam landed | Progress, score, partial, take, and timer WTR lanes plus shared clock/test support noted as migrated | `bash ./scripts/test-migration.sh` green after DB reset; mocked/backend WTR lanes green; Playwright green | Full-suite failures after prolonged local use can be environment-state related, not necessarily code-level | `bedf33a8` and earlier commits listed in the pinboard |
| 2026-03-13 hydration | Long-horizon BRACE hydration | Prior `PLANS.md` was hydrated from bootstrap plus the pinboard | Documentation hydration only | QC direction pointed to helper harmonization before the next migration batch | N/A |
| 2026-03-13 helper tranche | Highest-risk helper harmonization slice | Added shared `quiz-flow.ts` and aligned score-backend, partial-score, and timer WTR helpers to explicit question identity and result-transition proof | Targeted mocked/backend WTR runs green; mocked partial loop `5/5`; `bash ./scripts/test-migration.sh` green with `wtr_mocked_seconds=28`, `playwright_seconds=298`, `wtr_backend_seconds=23`, `migration_total_seconds=378` | Low-churn shared helper reuse was enough for this tranche; remaining helper residual concentrated in take/progress plus a narrower timer question | `da6e58ae` |
| 2026-03-13 helper completion | Remaining take/progress helper harmonization slice | Replaced thin local take/progress answer helpers with explicit question-identity/state-proof usage and preserved backend question contracts | Mocked `quiz-take.test.tsx` and `quiz-progress.test.tsx` green in Chromium and Firefox; backend combined take/progress green; mocked take loop `3/3`; full gate green with `migration_total_seconds=309` | Existing `quiz-flow.ts` plus preserved backend fixture identity was enough; sequential targeted WTR runs were cleaner evidence than ad hoc combined mocked runs | `a44bc94c` |
| 2026-03-13 welcome milestone | `Quiz.Welcome` WTR migration plus gate stabilization | Added mocked/backend welcome-page WTR coverage and defaulted the migration Playwright lane to `PW_WORKERS=1` while preserving env override | Targeted welcome tests green; fresh-start and accumulated-state full gates green with `migration_total_seconds=489` and `494` | Welcome stayed feature-local, worker pressure was the decisive legacy-suite control, and destructive DB cleanup is not needed in the command of record | `4f647d24` |
| 2026-03-13 take-length milestone | `Quiz.Take.Length` WTR migration | Added mocked/backend take-length WTR coverage proving that welcome-page count matches served question count and score total | Targeted take-length tests green in Chromium and Firefox; full gate green with `migration_total_seconds=509` | The slice stayed feature-local, and mocked coverage should mirror the backend-trimmed quiz payload rather than re-simulate upstream selection state | `f1d45630` |
| 2026-03-13 bookmarks milestone | `Quiz.Bookmarks` WTR migration | Added mocked/backend bookmark WTR coverage for add, revisit, explicit delete, and unbookmark flows | Targeted bookmark tests green in Chromium and Firefox; full gate green on accumulated DB with `migration_total_seconds=484` | Bookmark coverage stayed feature-local; accumulated-DB success further weakened DB-state as the primary explanation for recent failures | `58d9304d` |
| 2026-03-13 easy-mode milestone | `Quiz.EasyMode` WTR migration | Added mocked/backend easy-mode WTR coverage proving quiz-level difficulty overrides preserve correct-answer-count visibility | Targeted easy-mode tests green in Chromium and Firefox; full gate green on accumulated DB with `migration_total_seconds=500` | Difficulty-override proof stayed feature-local and did not require widening shared navigation helpers | `d49e5765` |
| 2026-03-13 stats milestone | `Quiz.Stats` WTR migration | Added mocked/backend stats WTR coverage for empty stats, score history, and duration rendering using the existing clock seam plus real session storage | Targeted stats tests green in Chromium and Firefox; full gate green on accumulated DB with `migration_total_seconds=501` | The existing clock seam was enough for deterministic duration proof, and no new storage seam was required | `a60728d6` |
| 2026-03-13 regression milestone | `QuizRegression` WTR migration | Added mocked/backend regression WTR coverage for first-question clean state, unanswered next-question state, reload reset, and restart-from-results reset semantics | Targeted regression tests green in Chromium and Firefox; full gate green on accumulated DB with `migration_total_seconds=513` | Reload/reset proof stayed feature-local through real route remounts with no new storage seam | N/A (working tree at that time) |
| 2026-03-23 image milestone RCA | `Question.Take.Image` plus backend-WTR harness diagnosis | Added mocked/backend image WTR coverage in the working tree and instrumented the Playwright-to-backend-WTR handoff after an earlier red gate | Targeted mocked image WTR green (`2 passed`, `0 failed`); targeted backend image WTR green (`2 passed`, `0 failed`); two instrumented integration reruns green | The image slice stayed feature-local and DB accumulation is not the primary explanation for the red gate; the current residual is concentrated in the plugin seam between `localhost:${vitePort}` and the IPv6-only transient Vite listener | N/A (working tree, decision pending) |
| 2026-03-23 image milestone closeout | `Question.Take.Image` WTR migration plus backend-WTR hardening | Added repo-owned `host-aware-vite-plugin.mjs`, switched WTR config to use it, and kept the image tests feature-local | Mocked image targeted green in Chromium + Firefox (`2 passed`, `0 failed`, `49.4s`); backend image targeted green in Chromium + Firefox (`2 passed`, `0 failed`, `6.6s` after server startup); full gate green with `wtr_mocked_seconds=42`, `playwright_seconds=441`, `wtr_backend_seconds=42`, `migration_total_seconds=552` | The failure mode was a harness proxy-host seam, not an image-feature bug; pinning the Vite listener and proxy to the same explicit host was sufficient without a broader harness split | `5a4e7079` |
| 2026-03-23 explanation milestone closeout | `Question.Take.Explanation` WTR migration | Added mocked/backend explanation WTR coverage for selected-answer explanation in single choice plus per-answer and question explanation in multiple choice, and widened the shared backend question helper additively for explanation payloads | Mocked explanation targeted green in Chromium + Firefox (`2 passed`, `0 failed`, `4.9s`); backend explanation targeted green in Chromium + Firefox (`2 passed`, `0 failed`, `6s`); full gate green with `wtr_mocked_seconds=41`, `playwright_seconds=412`, `wtr_backend_seconds=44`, `migration_total_seconds=524` | The explanation slice stayed feature-local on the standalone question route, and the additive helper widening was sufficient without touching legacy Playwright or the backend-WTR wrapper | `38df0657` |
| 2026-03-23 history bootstrap | BRACE history/reporting workflow | Added `history/`, backfilled full report files for the recent image and explanation milestones, and updated repo docs so future milestone commits reference a milestone file | Documentation/reporting only; no product tests run | `PLANS.md` remains the concise lookup layer, while full milestone reports now live in `history/` and future milestone commits should reference them directly | N/A (working tree) |

---

## 9) Milestone artifact index (optional)

| Milestone | Artifact path / ref | Why it may matter later |
|---|---|---|
| Pre-v2.1 transferred history | `PLANS-old` | Source of the migrated plan state, prior journal, and pre-hydration pull history |
| BRACE history bootstrap | `history/2026-03-23-brace-history-bootstrap.md` | Records when the one-file-per-milestone reporting workflow and commit-message reference rule became repo policy |
| `Question.Take.Image` closeout | `history/2026-03-23-question-take-image.md` | Full milestone report for the image slice, including the backend-WTR host-aware hardening evidence |
| `Question.Take.Explanation` closeout | `history/2026-03-23-question-take-explanation.md` | Full milestone report for the explanation slice, including the additive backend-helper widening evidence |

---

## 10) Patterns / systemic learnings

Use this for things that should influence future work.

- Scenario parity belongs in scenario descriptions; scenario robustness belongs in helper contracts.
- When a WTR helper crosses question, navigation, timeout, storage, or evaluation boundaries, it should prove active identity/state before acting.
- Prefer low-churn shared WTR helpers over repeated hand-crafted fixture shapes.
- Preserve backend-created question identity in test setup whenever shared helpers need to prove question ownership; discarding ids forces weaker assertions later.
- Treat persistent backend test-state accumulation as an environment-risk check during RCA before concluding the problem is code-level.
- When the legacy Playwright lane shows broad or contradictory failures under load, prove a serialized run before adding deeper product instrumentation or destructive cleanup.
- When the backend already trims or reshapes quiz payloads at the API boundary, mocked WTR tests should mirror that response contract instead of re-simulating upstream creation inputs.
- When bookmark revisit behavior uses a route variant (`/questions/0`) that the broader helper contract does not treat as canonical, keep that nuance local unless multiple slices need the same exception.
- Quiz-level difficulty overrides can be proven by asserting the rendered correct-answer-count contract per question; they did not require widening the shared navigation helpers.
- Reuse existing production seams before introducing new ones; the clock seam was sufficient to prove stats duration while preserving real session-storage behavior.
- Quiz reload/reset semantics can be proven with real app remounts at the same route; that was strong enough for the current regression slice without inventing a dedicated storage seam.
- When a third-party harness proxies to `localhost`, capture the actual listener address before treating the problem as generic port contention; `localhost` vs `::1` / `127.0.0.1` ambiguity can be the real seam.
- When that seam is confirmed, prefer a repo-owned wrapper that keeps the listener and proxy on the same explicit host instead of relying on `localhost` resolution order.
- After each completed milestone, write the full BRACE report to `history/YYYY-MM-DD-<milestone-slug>.md`.
- Package each completed milestone in a commit whose subject is a one-line summary and whose body references the milestone report path.

---

## 11) System / environment notes

### Repo-local system / harness notes
- Cross-browser WTR evidence must include Chromium and Firefox.
- Sequential targeted WTR runs and the command of record have been stronger evidence than ad hoc combined direct mocked runs.
- `scripts/run-backend-wtr-and-playwright.sh` defaults the legacy Playwright lane to `PW_WORKERS=1`; keep explicit env override for future tuning.
- The combined backend+Playwright gate can still log `Port 5173 is in use, trying another one...` before backend WTR starts, even when the full gate finishes green; treat it as low-grade residue unless it starts correlating with failures.
- Current backend-WTR hardening: `frontend/tests/wtr/support/host-aware-vite-plugin.mjs` now keeps the transient Vite listener and the proxy on the same explicit host (`127.0.0.1` by default).
- The old backend-WTR seam was the third-party plugin proxying to `http://localhost:${vitePort}` while the transient Vite listener bound on a specific address family; that seam is now locally hardened, but should still be watched in CI and fresh environments.

### External environment notes
- Prolonged local test use can accumulate backend DB state and distort failure diagnosis, but current evidence says DB accumulation is not the primary explanation for the latest backend-WTR failure.
- DB reset and schema rebuild remain RCA tools, not default steps in the command of record.
- If contradictory failures return in a materially different environment, capture them before widening the harness or policy response.

---

## 12) Resume protocol

When resuming from this file:
1. read BRACE Mission, Current Pinboard, Validation gate(s), Current milestone, Risks, and the last 1–3 journal entries
2. restate the current pinboard and current milestone
3. check whether a recent milestone report exists in `history/` for the latest completed slice
4. confirm whether the next step is still valid
5. continue autonomously only after Mission approval, unless a pull condition fires
6. after milestone closeout, update current milestone, residuals, journal, pull log, and the milestone artifact index as needed


---

## 13) BRACE Final scaffold

Populate near the end of the run.

- **Mission result:**
- **Explicit pull decisions that shaped the work:**
- **Major autonomous milestone work that happened without pulls:**
- **Evidence of success:**
- **Remaining residuals / unknowns:**
- **Recommended next work / proof:**
