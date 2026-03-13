# PLANS.md — WTR Migration Hydration

Purpose: persistent working memory and milestone roadmap for the WTR migration effort.

Hydrated from the current long-horizon state on 2026-03-13 using:
- `AGENTS.md`
- `BOOTSTRAP.md`
- `docs/testing/wtr-migration-pinboard.md`

---

## 1) Mission
- **Primary outcome:** Migrate Playwright-BDD coverage to WTR incrementally while keeping the legacy suite intact until parity is proven.
- **Why this matters / target function:** Improve local and CI feedback speed without losing migration stability or cross-browser confidence.
- **Success metric(s):**
  - `bash ./scripts/test-migration.sh` remains the command of record and stays repeatable.
  - WTR mocked and backend lanes pass in headless Chromium and Firefox.
  - Legacy Playwright remains green until migration completion.
  - Runtime tracking remains available for mocked WTR, backend WTR, and legacy Playwright lanes.
- **Non-goals:**
  - Removing the legacy Playwright suite before parity.
  - Forcing 1:1 scenario mapping when merged WTR tests are clearer.
  - Extracting broader production/domain helpers unless repeated duplication justifies it.

## 2) Current operating context
- **Work type:** migration
- **Current phase:** `Quiz.Bookmarks` milestone complete; next feature slice ready
- **Known current state:**
  - Migration strategy is incremental.
  - WTR coverage exists for make-flow features plus `Quiz.Bookmarks`, `Quiz.Progress`, `Quiz.Score`, `Quiz.Score.Partial`, `Quiz.Take`, `Quiz.Take.Length`, `Quiz.Timer`, and `Quiz.Welcome`, with backend smoke companions.
  - The current command of record is `bash ./scripts/test-migration.sh`.
  - The 2026-03-13 helper work is now complete: score-backend, partial-score, timer, take, and progress WTR tests all use explicit question-identity/state-proof contracts where those flows act across question boundaries.
  - The command of record now defaults the legacy Playwright lane to `PW_WORKERS=1` via `scripts/run-backend-wtr-and-playwright.sh`, with env override preserved.
  - Repeated full-gate evidence showed that worker pressure, not mandatory DB cleanup, was the decisive control: the gate passed once from a clean start and again on accumulated DB state after the same full run.
  - The remaining helper-specific residual is now the narrower timer-proof question; the next migration-facing milestone can move to `Quiz.EasyMode`.
- **Source artifacts used to hydrate this plan:**
  - user prompt(s)
  - current pinboard / notes: `docs/testing/wtr-migration-pinboard.md`
  - repo docs: `AGENTS.md`, `BOOTSTRAP.md`
  - execution evidence from the 2026-03-13 helper slices

## 3) Current Pinboard
### Accepted decisions
- Migration strategy: incremental (`Option 2`).
- Legacy Playwright-BDD in `specs/` stays intact until parity is reached.
- One repeatable command must run both suites.
- WTR migration coverage uses system-boundary mocks, plus WTR-only mocked and backend lanes.
- 1:1 scenario mapping is not required; merged WTR tests are allowed.
- Long-term BDD-style docs are not required; WTR `it(...)` descriptions are the documentation.
- Runtime tracking of WTR vs Playwright is mandatory during migration.
- Prefer low-churn shared WTR test helpers when repeated hand-built quiz/question shapes would otherwise accumulate.
- Helper harmonization is allowed to proceed in ranked slices; the highest-risk score/partial/timer tranche ran first and is now backed by executed evidence.
- The command of record defaults legacy Playwright to `PW_WORKERS=1`; explicit env override remains available for future tuning.
- DB reset stays an RCA tool, not a default step in the command of record, because the serialized gate also passed on an accumulated local DB.

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on two headless browsers: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

### Open decisions / questions
- Whether `Quiz.EasyMode` can stay feature-local in WTR or needs a stronger shared proof for quiz-level difficulty overrides across question boundaries.
- Final CI policy for dual-suite execution cadence.
- Whether timer-related helpers need stronger proof obligations than the current score-family contract.

### Required evidence before current milestone is done
- New `Quiz.EasyMode` mocked/backend coverage passes targeted checks in Chromium and Firefox.
- The command of record still passes after the milestone: `bash ./scripts/test-migration.sh`.
- Any new difficulty-override helper or seam is either proven with executed evidence or recorded as **UNPROVEN** with the cheapest next proof.
- Residual timer/helper concerns outside the easy-mode slice remain explicit rather than silently expanding the milestone.

## 4) Expertise boundary / pull preferences
Use this section to capture where the user prefers autonomy vs pull-in.

- **Product / UX:** Notify
- **Architecture / design:** Pull when design materially affects the milestone
- **Testing strategy:** Pull when evidence is weak, contradictory, or RCA-heavy
- **Debugging / RCA:** Pull on contradictory evidence or unclear root cause
- **Security / risk:** Pull on material residual risk
- **Tooling / environment:** Pull on harness or environment blockers

Learned preference from `AGENTS.md`: proceed autonomously inside an approved milestone, but pull on accepted-decision changes, material tradeoffs, failed/contradictory evidence, RCA mode, expertise areas, or environment blockers.

## 5) Validation gate(s)
- **Primary gate command / script:** `bash ./scripts/test-migration.sh`
- **What must pass after each milestone / session:**
  - mocked WTR lane in Chromium + Firefox
  - backend WTR lane in Chromium + Firefox
  - legacy Playwright lane while migration remains in progress
- **Additional targeted checks:**
  - targeted WTR files for the touched helper/test set
  - sampled reruns or loops when the change is intended to harden race-prone helpers
- **Timing / performance metrics to watch:**
  - `wtr_mocked_seconds`
  - `wtr_backend_seconds`
  - `playwright_seconds`
  - `migration_total_seconds`

## 6) Milestones
### Current milestone
- **Name:** Migrate `Quiz.EasyMode` in WTR lanes
- **Intent:** Add mocked and backend WTR coverage for quiz-level difficulty overrides, proving that quiz difficulty changes the per-question correct-answer-count behavior without widening scope unless helper proof becomes too weak.
- **Entry conditions:**
  - `Quiz.Bookmarks` is complete with targeted WTR evidence and a green command of record.
  - The command of record already encodes the proven Playwright worker setting.
- **Expected inventory / touched areas:**
  - `frontend/tests/wtr/mocked/quiz-easy-mode.test.tsx`
  - `frontend/tests/wtr/backend/quiz-easy-mode.backend.test.tsx`
  - shared WTR support helpers only if quiz-level difficulty override proof cannot stay feature-local
- **Planned evidence:**
  - targeted mocked/backend WTR runs for touched files
  - sampled rerun only if quiz-level difficulty/state transitions show race-sensitive behavior
  - full `bash ./scripts/test-migration.sh` before milestone close
- **Exit condition:**
  - `Quiz.EasyMode` mocked/backend lanes are green with executed evidence, and any difficulty-override helper residuals are explicitly recorded before moving to the next chosen slice.

### Upcoming milestones
1. Migrate `Quiz.Stats` or another adjacent take-flow slice after `Quiz.EasyMode`, depending on what the easy-mode evidence says about helper pressure.
2. Reassess whether the deferred timer-proof investigation or CI-policy decision needs to happen before the later migration batches.
3. Decide whether any slow legacy Playwright files should be split once migration pressure drops.

## 7) Risks and residuals (top only)
| ID | Risk / uncertainty | Why it matters | Current handling | Residual | Cheapest next proof | Escalation needed? |
|---|---|---|---|---|---|---|
| R1 | `Quiz.EasyMode` may need stronger proof than the current question-ready helper provides | Quiz-level difficulty overrides question-level behavior, so weak assertions could miss a wrong-state transition | Start feature-local first and reuse existing take-flow/state-proof helpers where possible | Medium | Targeted mocked/backend `Quiz.EasyMode` runs after a narrow first implementation | Pull if the slice demands broader helper work |
| R2 | Legacy Playwright stability may still vary by environment resource pressure even with the serialized gate | Could reintroduce contradictory failures in CI or on weaker dev machines | Command of record now defaults Playwright to `PW_WORKERS=1`; DB reset remains an RCA check instead of a default wipe | Low-Medium | Re-run `bash ./scripts/test-migration.sh` in the next materially different environment (fresh codespace / CI) before changing policy again | Pull if serialized runs still contradict themselves |
| R3 | Timer-related helpers may need stronger proof obligations than the current score-family contract | Timer flows cross more boundaries and may remain partially unproven even after the helper tranche | Deferred as a separate investigation | Medium | Add a focused timer-helper experiment if timer failures or weak evidence appear | Not yet |
| R4 | Later migration slices could pressure the test-support layer into broader redesign | Risks churn without clear gain and delays later feature batches | Low-churn shared helpers are preferred; broader extraction is deferred | Medium | Keep new helper work localized and compare it against a feature-local variant before landing | Pull if a broader redesign becomes necessary |
| R5 | Final CI policy and runtime budget remain undecided | Migration can succeed technically but still land in an awkward operational state | Runtime tracking stays mandatory during migration | Low for the current milestone | Keep collecting per-lane timings from the command of record | No |

## 8) Pull log
| Date/Session | Pull type | Context | Decision / advice requested | Resolution | Follow-up |
|---|---|---|---|---|---|
| 2026-03-13 | Bootstrap / planning | Shift into long-horizon BRACE mode using the current WTR migration pinboard | Approve the next milestone plan before implementation | Approved option 1: execute the highest-risk score/partial/timer helper tranche first | Reassess remaining take/progress harmonization before the next migration batch |

## 9) Milestone journal / handoff notes
| Date/Session | Milestone / slice | What changed | Evidence run | Key learning | Commit / ref |
|---|---|---|---|---|---|
| 2026-03-10 pinboard snapshot | `Quiz.Take` batch complete; timer clock seam landed | Progress, score, partial, take, and timer WTR lanes plus shared clock/test support noted as migrated | `bash ./scripts/test-migration.sh` green after DB reset; mocked/backend WTR lanes green; Playwright green | Full-suite failures after prolonged local use can be environment-state related, not necessarily code-level | `bedf33a8` and earlier commits listed in the pinboard |
| 2026-03-13 hydration | Long-horizon BRACE mode hydration | `PLANS.md` hydrated from bootstrap + current pinboard | Documentation hydration only | Current QC direction points to helper harmonization before the next migration batch | N/A |
| 2026-03-13 helper tranche | Highest-risk helper harmonization slice | Added shared `quiz-flow.ts` and aligned score-backend, partial-score, and timer WTR helpers to explicit question identity / result-transition proof | Targeted mocked/backend WTR runs green; mocked partial loop `5/5`; `bash ./scripts/test-migration.sh` green with `wtr_mocked_seconds=28`, `playwright_seconds=298`, `wtr_backend_seconds=23`, `migration_total_seconds=378` | Low-churn shared helper reuse was enough for this tranche; remaining helper residual is now concentrated in take/progress plus a narrower timer question | `da6e58ae` |
| 2026-03-13 helper completion | Remaining take/progress helper harmonization slice | Replaced thin local take/progress answer helpers with explicit question-identity/state-proof usage, and preserved backend question contracts so the shared helper can assert real identity in both lanes | Mocked `quiz-take.test.tsx` green (`4 passed`, `0 failed`) in Chromium + Firefox; mocked `quiz-progress.test.tsx` green (`2 passed`, `0 failed`); backend combined take/progress green (`4 passed`, `0 failed`); mocked take loop `3/3`; `bash ./scripts/test-migration.sh` green with `wtr_mocked_seconds=23`, `playwright_seconds=238`, `wtr_backend_seconds=22`, `migration_total_seconds=309` | The remaining take/progress outliers did not need new shared helpers; the existing `quiz-flow.ts` contract plus preserved backend fixture identity was enough, and sequential targeted WTR runs produced cleaner evidence than an ad hoc combined mocked run | `a44bc94c` |
| 2026-03-13 welcome milestone | `Quiz.Welcome` WTR migration plus gate stabilization | Added mocked/backend welcome-page WTR coverage and defaulted the migration Playwright lane to `PW_WORKERS=1` while preserving env override | Mocked `quiz-welcome.test.tsx` green (`2 passed`, `0 failed`); backend `quiz-welcome.backend.test.tsx` green (`2 passed`, `0 failed`); fresh-start `PW_WORKERS=1 bash ./scripts/test-migration.sh` green with `wtr_mocked_seconds=31`, `playwright_seconds=408`, `wtr_backend_seconds=24`, `migration_total_seconds=489`; plain `bash ./scripts/test-migration.sh` green on accumulated DB with `wtr_mocked_seconds=27`, `playwright_seconds=419`, `wtr_backend_seconds=23`, `migration_total_seconds=494` | Welcome coverage stayed feature-local, worker pressure was the decisive legacy-suite control, and destructive DB cleanup is not needed in the command of record | `4f647d24` |
| 2026-03-13 take-length milestone | `Quiz.Take.Length` WTR migration | Added mocked/backend take-length WTR coverage proving that the welcome-page count matches the served question count and score total for explicit-size and full-pool quizzes | Mocked `quiz-take-length.test.tsx` green (`2 passed`, `0 failed`) in Chromium + Firefox; backend `quiz-take-length.backend.test.tsx` green (`2 passed`, `0 failed`) in Chromium + Firefox; `bash ./scripts/test-migration.sh` green with `wtr_mocked_seconds=33`, `playwright_seconds=421`, `wtr_backend_seconds=26`, `migration_total_seconds=509` | The slice stayed feature-local, and the mocked lane should mirror the backend-trimmed quiz payload rather than re-simulate upstream selection state | `f1d45630` |
| 2026-03-13 bookmarks milestone | `Quiz.Bookmarks` WTR migration | Added mocked/backend bookmark WTR coverage for add, revisit, explicit delete, and unbookmark flows, keeping the `/questions/0` revisit nuance local to the new tests | Mocked `quiz-bookmarks.test.tsx` green (`3 passed`, `0 failed`) in Chromium + Firefox; backend `quiz-bookmarks.backend.test.tsx` green (`3 passed`, `0 failed`) in Chromium + Firefox; `bash ./scripts/test-migration.sh` green on accumulated DB with `wtr_mocked_seconds=32`, `playwright_seconds=399`, `wtr_backend_seconds=28`, `migration_total_seconds=484` | Bookmark coverage stayed feature-local; the gate passing on accumulated DB further weakens DB-state as the primary explanation for recent failures, while the occasional `5173`-already-in-use log remains a low-grade harness residue to watch | N/A (working tree) |

## 10) Patterns / systemic learnings
- Scenario parity belongs in scenario descriptions; scenario robustness belongs in helper contracts.
- When a WTR helper crosses question, navigation, timeout, storage, or evaluation boundaries, it should prove active identity/state before acting.
- Prefer low-churn shared WTR helpers over repeated hand-crafted fixture shapes.
- Preserve backend-created question identity in the test setup whenever shared helpers need to prove question ownership; discarding ids forces weaker assertions later.
- Treat persistent backend test-state accumulation as an environment-risk check during RCA before concluding the problem is code-level.
- When the legacy Playwright lane shows broad or contradictory failures under load, prove a serialized run before adding deeper product instrumentation or destructive cleanup.
- When the backend already trims or reshapes quiz payloads at the API boundary, mocked WTR tests should mirror that response contract instead of re-simulating upstream creation inputs.
- When bookmark revisit behavior uses a route variant (`/questions/0`) that the broader helper contract does not treat as canonical, keep that nuance local unless multiple slices need the same exception.

## 11) Environment / harness notes
- **Known environment constraints:** cross-browser WTR evidence must include Chromium and Firefox.
- **Known flaky infrastructure / cleanup needs:** prolonged local test use can accumulate backend DB state and distort failure diagnosis, but the current command of record stayed green on accumulated state once Playwright was serialized.
- **Harness note from 2026-03-13:** ad hoc combined direct mocked WTR runs can show transient dev-server import noise; sequential targeted runs and the command of record produced the stronger signal for helper validation.
- **Harness note from 2026-03-13 welcome milestone:** `scripts/run-backend-wtr-and-playwright.sh` now defaults the legacy Playwright lane to `PW_WORKERS=1`; keep explicit env override for future tuning.
- **Harness note from 2026-03-13 bookmarks milestone:** the combined backend+Playwright gate can still log `Port 5173 is in use, trying another one...` before backend WTR starts, even when the full gate finishes green; treat it as low-grade harness residue unless it starts correlating with failures.
- **Harness pulls that may recur:** DB reset / schema rebuild may still be useful during RCA, but it is no longer the first-line fix for the migration gate.

## 12) Resume protocol
When resuming from this file:
1. Read Mission, Current Pinboard, Validation gate, Current milestone, Risks, and the last 1–3 journal entries.
2. Restate the current pinboard and current milestone.
3. Confirm whether the next step is still valid.
4. Continue unless a pull trigger fires.
5. On milestone closeout, update this file.
