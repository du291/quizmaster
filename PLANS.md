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
- **Current phase:** helper harmonization milestone complete; next feature slice ready
- **Known current state:**
  - Migration strategy is incremental.
  - WTR coverage exists for make-flow features plus `Quiz.Progress`, `Quiz.Score`, `Quiz.Score.Partial`, `Quiz.Take`, and `Quiz.Timer`, with backend smoke companions.
  - The current command of record is `bash ./scripts/test-migration.sh`.
  - The 2026-03-13 helper work is now complete: score-backend, partial-score, timer, take, and progress WTR tests all use explicit question-identity/state-proof contracts where those flows act across question boundaries.
  - The remaining helper-specific residual is now the narrower timer-proof question; the next migration-facing milestone can return to new feature coverage starting with `Quiz.Welcome`.
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

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on two headless browsers: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

### Open decisions / questions
- Whether `Quiz.Welcome` should stay fully feature-local in WTR or introduce a reusable pre-start helper if the same start-page pattern repeats.
- Final CI policy for dual-suite execution cadence.
- Whether backend or legacy lanes need explicit DB cleanup discipline to avoid state-accumulation flakes.
- Whether timer-related helpers need stronger proof obligations than the current score-family contract.

### Required evidence before current milestone is done
- New `Quiz.Welcome` mocked/backend coverage passes targeted checks in Chromium and Firefox.
- The command of record still passes after the milestone: `bash ./scripts/test-migration.sh`.
- Any new welcome/start-page helper seam is either proven with executed evidence or recorded as **UNPROVEN** with the cheapest next proof.
- Residual helper concerns outside the welcome slice remain explicit rather than silently expanding the milestone.

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
- **Name:** Migrate `Quiz.Welcome` in WTR lanes
- **Intent:** Add mocked and backend WTR coverage for welcome-page behavior using the now-hardened quiz-flow helper baseline without re-expanding helper scope.
- **Entry conditions:**
  - The helper harmonization milestone is complete and green in targeted checks plus the command of record.
  - The agreed migration priority still starts with `Quiz.Welcome`.
- **Expected inventory / touched areas:**
  - `frontend/tests/wtr/mocked/quiz-welcome.test.tsx`
  - `frontend/tests/wtr/backend/quiz-welcome.backend.test.tsx`
  - shared WTR support helpers only if a low-churn welcome/start-state fix is justified
- **Planned evidence:**
  - targeted mocked/backend WTR runs for touched files
  - sampled rerun only if the welcome/start-state helper path shows race-sensitive behavior
  - full `bash ./scripts/test-migration.sh` before milestone close
- **Exit condition:**
  - `Quiz.Welcome` mocked/backend lanes are green with executed evidence, and any start-page helper residuals are explicitly recorded before moving to `Quiz.Take.Length`.

### Upcoming milestones
1. Migrate `Quiz.Take.Length` with the same mocked/backend lane structure.
2. Migrate `Quiz.Bookmarks` or another seam-heavy feature batch chosen from the current priority list.
3. Reassess whether the deferred timer-proof investigation or CI-policy decision needs to happen before the later migration batches.

## 7) Risks and residuals (top only)
| ID | Risk / uncertainty | Why it matters | Current handling | Residual | Cheapest next proof | Escalation needed? |
|---|---|---|---|---|---|---|
| R1 | `Quiz.Welcome` may need a reusable pre-start helper or start-state proof beyond the current question-flow contract | Could either cause brittle start-page assertions or widen scope into another helper redesign | Keep the next slice feature-local first; only extract if repeated welcome/start-state patterns appear | Medium | Targeted mocked/backend `Quiz.Welcome` runs after a narrow first implementation | Pull if the first slice demands broader helper changes |
| R2 | Backend or legacy flakes may be caused by accumulated local Postgres state rather than code changes | Can misattribute environment drift as migration regressions | Pinboard records DB reset as an RCA check | Medium | Reproduce after a fresh DB reset if suite-pressure failures recur | Pull if evidence stays contradictory |
| R3 | Timer-related helpers may need stronger proof obligations than the current score-family contract | Timer flows cross more boundaries and may remain partially unproven even after the helper tranche | Deferred as a separate investigation | Medium | Add a focused timer-helper experiment if timer failures or weak evidence appear | Not yet |
| R4 | Welcome or later migration slices could pressure the test-support layer into broader redesign | Risks churn without clear gain and delays later feature batches | Low-churn shared helpers are preferred; broader extraction is deferred | Medium | Keep new helper work localized and compare it against a feature-local variant before landing | Pull if a broader redesign becomes necessary |
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
| 2026-03-13 helper completion | Remaining take/progress helper harmonization slice | Replaced thin local take/progress answer helpers with explicit question-identity/state-proof usage, and preserved backend question contracts so the shared helper can assert real identity in both lanes | Mocked `quiz-take.test.tsx` green (`4 passed`, `0 failed`) in Chromium + Firefox; mocked `quiz-progress.test.tsx` green (`2 passed`, `0 failed`); backend combined take/progress green (`4 passed`, `0 failed`); mocked take loop `3/3`; `bash ./scripts/test-migration.sh` green with `wtr_mocked_seconds=23`, `playwright_seconds=238`, `wtr_backend_seconds=22`, `migration_total_seconds=309` | The remaining take/progress outliers did not need new shared helpers; the existing `quiz-flow.ts` contract plus preserved backend fixture identity was enough, and sequential targeted WTR runs produced cleaner evidence than an ad hoc combined mocked run | N/A (working tree) |

## 10) Patterns / systemic learnings
- Scenario parity belongs in scenario descriptions; scenario robustness belongs in helper contracts.
- When a WTR helper crosses question, navigation, timeout, storage, or evaluation boundaries, it should prove active identity/state before acting.
- Prefer low-churn shared WTR helpers over repeated hand-crafted fixture shapes.
- Preserve backend-created question identity in the test setup whenever shared helpers need to prove question ownership; discarding ids forces weaker assertions later.
- Treat persistent backend test-state accumulation as an environment-risk check during RCA before concluding the problem is code-level.

## 11) Environment / harness notes
- **Known environment constraints:** cross-browser WTR evidence must include Chromium and Firefox.
- **Known flaky infrastructure / cleanup needs:** prolonged local test use can accumulate backend DB state and distort failure diagnosis.
- **Harness note from 2026-03-13:** ad hoc combined direct mocked WTR runs can show transient dev-server import noise; sequential targeted runs and the command of record produced the stronger signal for helper validation.
- **Harness pulls that may recur:** DB reset / schema rebuild may be needed before concluding a full-suite failure is a product or test regression.

## 12) Resume protocol
When resuming from this file:
1. Read Mission, Current Pinboard, Validation gate, Current milestone, Risks, and the last 1–3 journal entries.
2. Restate the current pinboard and current milestone.
3. Confirm whether the next step is still valid.
4. Continue unless a pull trigger fires.
5. On milestone closeout, update this file.
