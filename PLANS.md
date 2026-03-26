# PLANS.md — BRACE v2.2 Hydrated Plan

Purpose: persistent working memory and route for the WTR migration effort.

Hydrated on 2026-03-26 from:
- current request and `BOOTSTRAP_PROMPT-v2.2.md`
- chat-provided `AGENTS.md` v2.2 instructions; the tracked repo `AGENTS.md` is currently staged for deletion in the worktree
- prior hydrated plan state in `PLANS-old`
- recent milestone reports in `history/`
- current git history through `dc1ca936`
- current worktree status, including the v2.2 `PLANS.md` stub and `history/TEMPLATE-v2.2.md`

---

## 1) BRACE Mission

### Primary mission
- **Outcome:** Continue the incremental Playwright-BDD to WTR migration, preserve the legacy Playwright suite until parity is proven, and close the next remaining standalone `Question.Take.*` slice with executed evidence.
- **Why this matters / target function:** Improve local and CI feedback speed without losing migration stability, route-level behavior confidence, or a repeatable command of record.
- **Success metric(s):**
  - `bash ./scripts/test-migration.sh` remains the command of record and stays repeatable.
  - WTR mocked and backend lanes pass in headless Chromium and Firefox.
  - Legacy Playwright remains green until migration completion.
  - Runtime tracking remains available for mocked WTR, backend WTR, and legacy Playwright lanes.
  - Each completed migration slice closes with a milestone report and a VCS commit reference.
  - The next standalone `Question.Take.*` slice closes with targeted mocked/backend evidence plus a green full gate, or an explicit **UNPROVEN** residual if the gate cannot be closed safely.
- **Non-goals:**
  - Removing the legacy Playwright suite before parity.
  - Forcing 1:1 scenario mapping when merged WTR tests are clearer.
  - Extracting broader production/domain helpers unless repeated duplication justifies it.
  - Treating this BRACE v2.2 upgrade as approval to resume implementation automatically.

### Current operating context
- **Work type:** migration
- **Current phase:** BRACE v2.2 is active. `Question.Take.Image` is committed in `5a4e7079`, `Question.Take.Explanation` in `38df0657`, the history/reporting workflow in `bdc97c10`, `Question.Take.Feedback` in `dc1ca936`, `Question.Take.NumPad` in `2e0e0ced`, `Question.Take.Feedback.Numerical` in `59f52606`, and `Question.Take.MultipleChoice.Score` is now evidence-complete in the working tree with targeted mocked/backend greens plus a green second full migration gate after an isolated legacy numpad replay.
- **Execution mode:** autonomous milestones after upgrade approval
- **Source artifacts used to hydrate this plan:**
  - current request / prompt
  - `BOOTSTRAP_PROMPT-v2.2.md`
  - prior BRACE artifact: `PLANS-old`
  - milestone reports in `history/`
  - current git log / status

### Mission approval state
- **Approved?** yes; base migration mission approved on 2026-03-23, BRACE v2.2 upgrade approved on 2026-03-26
- **If not, what decision is still needed?** N/A

---

## 2) Mission risk areas

Keep only the 3-7 areas that materially matter for this run.

| Risk area | Default tier | Why it matters | Assurance guidance |
|---|---|---|---|
| Migration credibility / parity drift | High | A stale or incomplete plan can misstate what is already proven and what still needs migration. | Anchor each milestone to committed artifacts, current history reports, and executed gates; pull if the parity map becomes ambiguous. |
| Standalone question behavior integrity | High | `/question/:id` slices have route-specific behavior that broader quiz-flow tests do not automatically prove. | Require dedicated mocked and backend WTR evidence for standalone routes before claiming parity. |
| Harness / gate reliability | High | Backend-WTR host seams and residual legacy Playwright race noise can hide or mimic regressions. | Preserve the host-aware wrapper baseline, keep Playwright serialized by default, and investigate contradictory full-gate reds before accepting a slice. |
| Environment / external variability | Medium | CI or a fresh workspace may behave differently from the locally proven environment. | Treat cross-environment contradictions as real until explained; keep DB reset as RCA only, not a default gate step. |
| Scope / sequencing drift | Medium | The next remaining standalone question slice is open, and selecting the wrong one wastes time or duplicates coverage. | Re-check the remaining feature inventory before implementation and record the mapping explicitly in milestone history. |

Tiers:
- **High** — possible mission failure or loss of credibility
- **Medium** — degradation, detour, or local breakage
- **Low** — annoyance, nuisance, or bounded rework

---

## 3) Expertise / direction preferences

Mark only **Autonomous** or **Pull**.

| Area | Mode | Notes |
|---|---|---|
| Product / UX | Autonomous | Existing feature behavior should be preserved unless evidence shows ambiguity. |
| Architecture / design | Pull | Material helper, route, or migration-structure changes should be escalated. |
| Testing strategy | Autonomous | Feature-local evidence strategy may proceed without interruption. |
| Debugging / RCA | Pull | Contradictory reds or unclear root causes should be escalated once local evidence stalls. |
| Security / risk | Autonomous | No security-specific policy change is currently blocking the migration. |
| System / harness design | Pull | Repo-local harness changes still cross the user’s stated decision boundary. |
| Environment / external blockers | Pull | External blockers should be escalated with a concrete action request. |

Rule: a pull is required if either tier guidance or expertise preference requires it.

---

## 4) Current pinboard

### Accepted decisions
- Migration strategy is incremental.
- Legacy Playwright-BDD in `specs/` stays intact until parity is reached.
- One repeatable command must run both suites.
- WTR migration coverage uses system-boundary mocks plus WTR-only mocked and backend lanes.
- 1:1 scenario mapping is not required; merged WTR tests are allowed.
- Long-term BDD-style docs are not required; WTR `it(...)` descriptions are the documentation.
- Runtime tracking of WTR vs Playwright is mandatory during migration.
- Prefer low-churn shared WTR test helpers when repeated hand-built quiz/question shapes would otherwise accumulate.
- Helper harmonization is already proven for the higher-risk quiz-flow slices; standalone question slices may stay feature-local unless repeated duplication justifies widening a shared seam.
- The command of record defaults the legacy Playwright lane to `PW_WORKERS=1`; explicit env override remains available for future tuning.
- DB reset stays an RCA tool, not a default step in the command of record.
- Backend WTR uses the repo-local host-aware Vite wrapper so the transient Vite listener and the proxy target stay on the same explicit host (`127.0.0.1` by default).
- Each completed BRACE milestone gets a full report file under `history/`, and milestone commit messages reference that report path.

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on two headless browsers: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

### Open decisions / questions
- Whether any standalone `Question.Take.*` gap remains after `Question.Take.EasyMode`; current evidence says easy mode is the last open standalone route seam because `/question/:id` uses `question.easyMode` without the quiz difficulty override branch.
- Final CI policy for dual-suite execution cadence.
- Whether timer-related helpers need stronger proof obligations than the current score-family contract.

### Required evidence before current milestone is done
- `PLANS.md` must reflect the committed post-feedback baseline through `dc1ca936`.
- `Question.Take.NumPad` now joins the acceptance baseline:
  - mocked numpad WTR green in Chromium and Firefox
  - backend numpad WTR green in Chromium and Firefox
  - `bash ./scripts/test-migration.sh` green with the legacy numpad Playwright feature also passing inside the same run
- `Question.Take.Feedback.Numerical` now joins the acceptance baseline:
  - mocked numerical-feedback WTR green in Chromium and Firefox
  - backend numerical-feedback WTR green in Chromium and Firefox
  - `bash ./scripts/test-migration.sh` green with the legacy Playwright lane still passing inside the same run
- `Question.Take.MultipleChoice.Score` now joins the acceptance baseline:
  - mocked standalone score WTR green in Chromium and Firefox
  - backend standalone score WTR green in Chromium and Firefox
  - first full gate red was isolated to the recurring legacy Playwright numpad residue; the isolated numpad replay passed `5/5`, and the second `bash ./scripts/test-migration.sh` rerun exited green
- The next implementation milestone is `Question.Take.EasyMode` and must still prove targeted mocked/backend WTR green in Chromium and Firefox plus `bash ./scripts/test-migration.sh`.
- If a later slice touches backend-WTR harness behavior again, rerun the full gate and compare against the current host-aware wrapper baseline.
- If the next full gate repeats the legacy Playwright numpad red again, escalate with the accumulated recurrence evidence instead of silently accepting it.

---

## 5) Validation gate(s)

- **Primary gate command / script:** `bash ./scripts/test-migration.sh`
- **What must pass after each milestone / session:**
  - mocked WTR lane in Chromium and Firefox
  - backend WTR lane in Chromium and Firefox
  - legacy Playwright lane while migration remains in progress
- **Additional targeted checks:**
  - targeted WTR files for the touched helper/test set
  - isolated legacy reruns when the full gate produces a contradictory red
  - instrumented reruns or loops when the change is intended to harden race-prone helpers or harness behavior
- **Timing / performance metrics to watch:**
  - `wtr_mocked_seconds`
  - `wtr_backend_seconds`
  - `playwright_seconds`
  - `migration_total_seconds`

---

## 6) Current milestone

### BRACE Milestone (current)
- **Name:** `Question.Take.EasyMode`
- **Intent / behavior:** Add dedicated mocked and backend WTR coverage for standalone easy-mode correct-answer count behavior on `/question/:id`, proving the question-level `easyMode` branch without the quiz difficulty override layer.
- **Entry conditions:**
  - `Question.Take.Image`, `Question.Take.Explanation`, and `Question.Take.Feedback` are already committed with milestone reports.
  - `Question.Take.NumPad` is committed in `2e0e0ced`.
  - `Question.Take.Feedback.Numerical` is committed in `59f52606`.
  - `Question.Take.MultipleChoice.Score` is evidence-complete with targeted mocked/backend greens, an isolated legacy numpad replay green, and a green second full gate.
  - `Question.Take.EasyMode` remains the last apparent standalone gap because `QuestionTakePage` passes no `quizDifficulty`, so the quiz-level easy-mode tests do not prove the standalone route branch directly.
- **Expected inventory / touched areas:**
  - `frontend/tests/wtr/mocked/question-take-easy-mode.test.tsx`
  - `frontend/tests/wtr/backend/question-take-easy-mode.backend.test.tsx`
  - `PLANS.md`
  - `history/2026-03-26-question-take-easy-mode.md`
- **Top risks (with tiers / mission-area mapping):**
  - Existing quiz-level easy-mode WTR coverage could create false confidence about standalone `/question/:id` correct-answer count behavior. (High / Standalone question behavior integrity)
  - The standalone route only exercises the `question.easyMode` branch, so naive reuse of the quiz tests could miss the absence/presence contract for single-choice vs multiple-choice questions. (Medium / Scope drift)
  - The full gate could still surface the recurring legacy numpad residue again after the targeted easy-mode tests are green. (Medium / Harness / gate reliability)
- **Planned assurances:**
  - Keep the slice feature-local on `/question/:id` and assert both presence and absence of `.correct-answers-count` directly on the standalone question page.
  - Reuse existing quiz-level easy-mode evidence only as overlap context, not as proof of standalone parity.
  - Preserve the full-gate recurrence protocol: targeted greens first, then the command of record, escalating only if the numpad residue persists after isolation.
- **Planned evidence:**
  - direct inspection of the standalone feature spec vs current `QuestionForm` easy-mode branch and quiz-level overlap
  - targeted mocked/backend WTR runs for the new standalone easy-mode files
  - `bash ./scripts/test-migration.sh`
- **Exit condition:** met when the standalone easy-mode route has dedicated mocked/backend coverage, the full gate is green, and the milestone report plus commit are recorded
- **Expected commit shape:** one milestone commit referencing the easy-mode report path

### Upcoming milestones
1. Implement mocked and backend WTR coverage for `Question.Take.EasyMode` while keeping helper churn feature-local unless repetition justifies widening a shared seam.
2. Run targeted evidence plus `bash ./scripts/test-migration.sh`, write the easy-mode milestone report, commit the slice, and update residuals.
3. Reassess whether the standalone `Question.Take.*` backlog is fully closed and continue unless a pull condition fires.

---

## 7) Risks and residuals (top only)

Keep only the risks that matter for steering.

| ID | Risk / uncertainty | Tier | Mission risk area | Why it matters | Current handling | Residual | Cheapest next proof | Pull class if escalation needed |
|---|---|---|---|---|---|---|---|---|
| R1 | Quiz-level easy-mode coverage could still hide a standalone `/question/:id` easy-mode gap now that the score slice is closed. | High | Standalone question behavior integrity | The standalone route uses `question.easyMode` directly and does not traverse the quiz difficulty override branch. | Take `Question.Take.EasyMode` next with dedicated standalone mocked/backend tests. | Medium until the standalone easy-mode slice is closed. | Add standalone presence/absence assertions for `.correct-answers-count`, then rerun the full gate. | BRACE Pull |
| R2 | Legacy Playwright still has low-grade race potential around `Question.Take.NumPad`, and it recurred once during the score milestone before clearing on isolation and rerun. | Medium | Harness / gate reliability | The recurrence could still be either load-related residue or a real regression signal in another environment. | Keep the recurrence protocol explicit: isolated legacy rerun first, then a second full gate before accepting the slice. | Low-Medium | Re-run the full gate in CI or a fresh workspace; if the same failure repeats again, escalate with the accumulated evidence. | BRACE Pull |
| R3 | The host-aware backend-WTR wrapper is proven locally but not yet in a materially different environment. | Medium | Environment / external variability | CI or a fresh workspace could surface a new listener/proxy seam. | Keep the current wrapper as the baseline and compare future contradictory evidence against it. | Medium | Run the command of record in CI or a fresh workspace after the next slice. | System Pull |
| R4 | Timer/helper proof remains narrower than the overall quiz-flow contract. | Medium | Standalone question behavior integrity | Future timer-related changes could reach beyond the currently proven score-family helper contract. | Keep the residual explicit instead of silently assuming the timer concern is closed. | Medium | Add a focused timer-helper experiment only if a later slice touches timer-sensitive behavior. | BRACE Pull |
| R5 | Repo-local `AGENTS.md` is no longer the active control source because instructions moved to `$HOME/.codex`. | Low | Environment / external variability | Future resumes need the right control source and should not treat the staged repo deletion as accidental breakage. | Record the system-wide source explicitly in plan notes and resume protocol context. | Low | Confirm future resumes still load the system-wide instructions first. | Environment Pull |

---

## 8) Pull log

Use this for actual human-facing interruptions.

| Date/Session | Pull class | Context | Evidence / facts | Decision or action requested | Resolution | Impact on plan |
|---|---|---|---|---|---|---|
| 2026-03-13 | BRACE Pull | Shift into long-horizon planning using the migration pinboard | Bootstrap plan proposed the highest-risk helper tranche first. | Approve the next milestone plan before implementation. | Approved: run the highest-risk score/partial/timer helper tranche first. | Reassess remaining take/progress harmonization before the next migration batch. |
| 2026-03-23 | System Pull | `Question.Take.Image` targeted WTR was green but one earlier full gate failed in backend WTR. | Failure signature included `ETIMEDOUT ::1:5174` and `ECONNREFUSED 127.0.0.1:5174`; sampled ownership showed the WTR process bringing up `::1:5174` while the plugin proxied to `http://localhost:${vitePort}`. | Choose whether to harden backend WTR with a repo-local host-aware Vite wrapper or with a broader harness split. | Resolved: use a repo-local host-aware Vite wrapper that binds and proxies on the same explicit host (`127.0.0.1` by default). | Targeted image checks and `bash ./scripts/test-migration.sh` were green after the wrapper landed; watch for recurrence in CI or a fresh workspace. |

Pull classes:
- **BRACE Pull** — functional / risk / expertise / tradeoff
- **System Pull** — repo-local harness / build / test-system design
- **Environment Pull** — external blocker requiring user or harness action

---

## 9) Milestone journal / handoff notes

Short milestone closeouts only. These are the running history and lookup layer.

| Date/Session | Milestone / slice | What changed | Evidence run | Key learning / decision | Commit / ref |
|---|---|---|---|---|---|
| 2026-03-23 | `Question.Take.Image` closeout | Added mocked/backend image WTR coverage and hardened backend WTR with the host-aware Vite wrapper. | Targeted mocked image green; targeted backend image green; full gate green with `migration_total_seconds=552`. | The failure mode was a harness proxy-host seam, not an image-feature bug. | `5a4e7079` |
| 2026-03-23 | `Question.Take.Explanation` closeout | Added mocked/backend explanation WTR coverage and widened the shared backend question helper additively for explanation payloads. | Targeted mocked explanation green; targeted backend explanation green; full gate green with `migration_total_seconds=524`. | The explanation slice stayed feature-local on the standalone question route. | `38df0657` |
| 2026-03-23 | BRACE history bootstrap | Added `history/`, backfilled recent milestone reports, and adopted the report-reference commit-message rule. | Documentation only; no product tests run. | `PLANS.md` stays concise while full milestone reports move to `history/`. | `bdc97c10` |
| 2026-03-23 | `Question.Take.Feedback` closeout | Added mocked/backend feedback WTR coverage for standalone question correctness text and multiple-choice per-answer feedback classes. | Targeted mocked feedback green; targeted backend feedback green; first full gate hit one isolated legacy numpad red; isolated rerun green; second full gate green with `migration_total_seconds=517`. | The only contradictory signal was an unrelated legacy Playwright race that did not reproduce. | `dc1ca936` |
| 2026-03-26 | BRACE v2.2 upgrade hydration | Rehydrated the v2.2 `PLANS.md` stub from `PLANS-old`, the committed post-feedback baseline, and the new bootstrap prompt. | Documentation and repo-state inspection only. | The active run remains valid; upgrade approval confirmed the repo-level `AGENTS.md` has been replaced by system-wide instructions in `$HOME/.codex`. | N/A |
| 2026-03-26 | `Question.Take.NumPad` closeout | Added mocked/backend WTR coverage for standalone numpad answer selection on `/question/:id`, including a WTR-specific wait for the window keydown listener effect before dispatching the synthetic event. | Targeted mocked numpad green (`5 passed`, `0 failed`, `10.9s`); targeted backend numpad green (`5 passed`, `0 failed`, `6.1s` after server startup); full gate green with `wtr_mocked_seconds=47`, `playwright_seconds=410`, `wtr_backend_seconds=47`, `migration_total_seconds=529`. | The keyboard path stayed feature-local; the only issue was a test-timing race around the mount effect, not a production bug. | `2e0e0ced` |
| 2026-03-26 | `Question.Take.Feedback.Numerical` closeout | Added mocked/backend WTR coverage for the standalone `/test-numerical-question` route and reduced the remaining standalone backlog to score and easy mode. | Targeted mocked numerical green (`2 passed`, `0 failed`, `10.3s`); targeted backend numerical green (`2 passed`, `0 failed`, `5.1s` after server startup); full gate green with `wtr_mocked_seconds=48`, `playwright_seconds=412`, `wtr_backend_seconds=52`, `migration_total_seconds=537`. | The numerical route needed only feature-local proof; no production or shared-helper changes were required. | `59f52606` |
| 2026-03-26 | `Question.Take.MultipleChoice.Score` closeout | Added mocked/backend WTR coverage for standalone partial score feedback and score labels on `/question/:id`, then resolved one contradictory full-gate red via the legacy numpad recurrence protocol. | Targeted mocked score green (`6 passed`, `0 failed`, `11.2s`); targeted backend score green (`6 passed`, `0 failed`, `6.6s` after server startup); first full gate hit one isolated legacy Chromium numpad red; isolated legacy rerun green (`5 passed`, `11.0s`); second full gate green with mocked WTR `71 passed`, backend WTR `50 passed`, `wtr_backend_seconds=48`, `migration_total_seconds=511`, and Playwright lane status `passed` in `test-results/.last-run.json` (exact green summary line was not retained in the terminal capture). | The score slice stayed feature-local; the only contradiction was the known legacy numpad residue, not a score-route regression. | pending milestone commit |

---

## 10) Milestone artifact index (optional but recommended)

Use this if milestone BRACE reports are stored as separate files.

| Milestone | Artifact path / ref | Why it may matter later |
|---|---|---|
| Pre-v2.2 transferred history | `PLANS-old` | Source of the prior hydrated plan, transferred journal, and old pinboard state. |
| BRACE history bootstrap | `history/2026-03-23-brace-history-bootstrap.md` | Records when the one-file-per-milestone reporting workflow and commit-message reference rule became repo policy. |
| `Question.Take.Image` closeout | `history/2026-03-23-question-take-image.md` | Full milestone report for the image slice, including the backend-WTR host-aware hardening evidence. |
| `Question.Take.Explanation` closeout | `history/2026-03-23-question-take-explanation.md` | Full milestone report for the explanation slice, including the additive backend-helper widening evidence. |
| `Question.Take.Feedback` closeout | `history/2026-03-23-question-take-feedback.md` | Full milestone report for the feedback slice, including the isolated legacy numpad race and the clean rerun evidence. |
| `Question.Take.NumPad` closeout | `history/2026-03-26-question-take-numpad.md` | Full milestone report for the numpad slice, including the WTR listener-timing fix and the green full gate. |
| `Question.Take.Feedback.Numerical` closeout | `history/2026-03-26-question-take-feedback-numerical.md` | Full milestone report for the numerical standalone route, including the dedicated route-level evidence and the updated remaining backlog. |
| `Question.Take.MultipleChoice.Score` closeout | `history/2026-03-26-question-take-multiple-choice-score.md` | Full milestone report for the standalone score route, including the contradictory legacy numpad rerun and the green second full gate. |
| BRACE v2.2 milestone template | `history/TEMPLATE-v2.2.md` | Template to use for future v2.2 milestone plan/report files. |

---

## 11) Patterns / systemic learnings

Use this for things that should influence future work.
Examples: helper-contract rule, seam pattern, quality-control rule, isolation rule, environment reset rule.

- Scenario parity belongs in scenario descriptions; scenario robustness belongs in helper contracts.
- When a WTR helper crosses question, navigation, timeout, storage, or evaluation boundaries, it should prove active identity/state before acting.
- Prefer low-churn shared WTR helpers over repeated hand-crafted fixture shapes.
- Preserve backend-created question identity in test setup whenever shared helpers need to prove question ownership; discarding ids forces weaker assertions later.
- Treat persistent backend test-state accumulation as an environment-risk check during RCA before concluding the problem is code-level.
- When the legacy Playwright lane shows broad or contradictory failures under load, prove a serialized run before adding deeper product instrumentation or destructive cleanup.
- When the backend already trims or reshapes quiz payloads at the API boundary, mocked WTR tests should mirror that response contract instead of re-simulating upstream creation inputs.
- Reuse existing production seams before introducing new ones; the existing clock seam and host-aware wrapper were both sufficient for their validated slices.
- When a third-party harness proxies to `localhost`, capture the actual listener address before treating the problem as generic port contention; `localhost` vs `::1` / `127.0.0.1` ambiguity can be the real seam.
- After each completed milestone, write the full BRACE report to `history/YYYY-MM-DD-<milestone-slug>.md` and reference that path in the milestone commit message.
- For WTR tests that drive window-level keyboard listeners installed in `useEffect`, wait for mount effects before dispatching the synthetic key event.
- Special standalone routes like `/test-numerical-question` can usually stay feature-local by reusing the existing form harness helpers instead of widening shared fixtures.
- Standalone partial-score proof can also stay feature-local by reusing the existing question-form selection helpers and the `(Partial Score)` title marker that already drives the product correctness label.

---

## 12) System / environment notes

### Repo-local system / harness notes
- **Known harness constraints or brittle seams:**
  - Cross-browser WTR evidence must include Chromium and Firefox.
  - Sequential targeted WTR runs and the command of record have been stronger evidence than ad hoc combined direct mocked runs.
  - `scripts/run-backend-wtr-and-playwright.sh` defaults the legacy Playwright lane to `PW_WORKERS=1`; keep explicit env override for future tuning.
  - The combined backend+Playwright gate can still log `Port 5173 is in use, trying another one...` before backend WTR starts, even when the full gate finishes green; treat it as low-grade residue unless it starts correlating with failures.
  - Current backend-WTR hardening lives in `frontend/tests/wtr/support/host-aware-vite-plugin.mjs`; it keeps the transient Vite listener and the proxy on the same explicit host (`127.0.0.1` by default).
- **Known recurring test-system issues:**
  - Legacy Playwright still shows low-grade race potential under load, most recently around `Question.Take.NumPad`.

### External environment notes
- **Known machine / sandbox / service constraints:**
  - Prolonged local test use can accumulate backend DB state and distort RCA, but current evidence says DB accumulation is not the primary explanation for the latest backend-WTR failure.
  - Repo-local `AGENTS.md` has been retired; active operating instructions now come from the system-wide Codex configuration in `$HOME/.codex`, with `BOOTSTRAP_PROMPT-v2.2.md` used for this in-repo upgrade step.
- **Known cleanup or provisioning needs:**
  - DB reset and schema rebuild remain RCA tools, not default steps in the command of record.
  - If contradictory failures return in CI or another fresh environment, capture them before widening the harness or policy response.

---

## 13) Upgrade log

Use this when BRACE / PLANS semantics materially change mid-run.

| Date/Session | From version | To version | What still holds | What needed remapping / re-checking | Approval state |
|---|---|---|---|---|---|
| 2026-03-26 | BRACE v2.1 | BRACE v2.2 | The mission, command of record, evidence-first migration strategy, expertise boundaries, history-report workflow, and committed baseline through `dc1ca936` still hold. | Mission risk areas were recast into the v2.2 tiered table, the stub `PLANS.md` was rehydrated, the remaining standalone question parity map was re-opened for confirmation, and the control source was updated to the system-wide `$HOME/.codex` instructions plus this repo bootstrap prompt. | Approved |

---

## 14) Resume protocol

When resuming from this file:
1. read BRACE Mission, mission risk areas, expertise preferences, current pinboard, validation gates, current milestone, risks, and the last 1-3 journal entries
2. restate the current pinboard and current milestone
3. confirm whether the active system-wide instructions from `$HOME/.codex` plus any repo bootstrap prompt still match the latest approved control model
4. confirm whether the next step is still valid
5. continue autonomously unless a pull condition fires
6. after milestone closeout, update current milestone, residuals, journal, pull log, and artifact index as needed

---

## 15) BRACE Final scaffold

Populate near the end of the run.

- **Mission result:**
- **Explicit pull decisions that shaped the work:**
- **Major autonomous milestone work that happened without pulls:**
- **Evidence of success:**
- **Remaining residuals / unknowns:**
- **Recommended next work / proof:**
- **Key milestone artifacts / commits:**
