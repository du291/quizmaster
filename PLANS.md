# PLANS.md - BRACE v2.3 Live Control Surface

Purpose: persistent working memory and route for the WTR migration effort.

This file is the live control surface, not the full notebook.
The full body of the active milestone lives in the milestone artifact referenced from here.
Use milestone artifacts in `history/` for detailed BRACE Plan/Report history, pulls handled during a milestone, and milestone-local rationale.

---

## 1) BRACE Mission

### Primary mission
- **Outcome:** Continue the incremental Playwright-BDD to WTR migration, preserve the legacy Playwright suite until parity is proven, and close the remaining migration frontier one slice at a time with executed evidence.
- **Why this matters / target function:** Improve local and CI feedback speed without losing migration stability, route-level and page-level behavior confidence, or a repeatable command of record.
- **Success metric(s):**
  - `bash ./scripts/test-migration.sh` remains the command of record and stays repeatable.
  - WTR mocked and backend lanes pass in headless Chromium and Firefox for each accepted slice.
  - Legacy Playwright remains green until migration completion.
  - Runtime tracking remains available for mocked WTR, backend WTR, and legacy Playwright lanes.
  - Each completed migration slice closes with a milestone report and an interpretable VCS boundary.
  - The next non-standalone frontier is selected deliberately and any subsequent slice closes with targeted mocked/backend evidence plus a green full gate, or an explicit `UNPROVEN` residual if the gate cannot be closed safely.
- **Non-goals:**
  - Removing the legacy Playwright suite before parity.
  - Forcing 1:1 scenario mapping when merged WTR tests are clearer.
  - Extracting broader production or domain helpers unless repeated duplication justifies it.
  - Treating this BRACE v2.3 hydration as approval to resume autonomous implementation.

### Current operating context
- **Work type:** migration
- **Current phase:** The dedicated standalone `Question.Take.*` backlog is closed through `7c70d13f`; BRACE v2.3 upgrade is approved; `Question.Edit.GUI` is evidence-complete in the working tree with targeted mocked/backend greens plus a green full migration gate.
- **Execution mode:** autonomous milestones
- **Source artifacts used to hydrate this plan:**
  - current request / prompt
  - `BOOTSTRAP_PROMPT.md`
  - prior pinboard in `PLANS-old`
  - prior BRACE artifacts in `history/`
  - current git history and worktree state
  - chat-provided `AGENTS.md` instructions plus the current Codex system instructions

### Mission approval state
- **Approved?** yes
- **If not, what decision is still needed?** N/A

---

## 2) Mission risk areas

Keep only the 3-7 areas that materially matter for this run.

| Risk area | Default tier | Why it matters | Assurance guidance |
|---|---|---|---|
| Migration credibility / parity drift | High | A stale or incomplete plan can misstate what is already proven and what still needs migration. | Anchor each milestone to committed artifacts, current history reports, and executed gates; pull if the parity map becomes ambiguous. |
| Slice-level behavior integrity | High | Route-level or page-level behavior can be lost if broader quiz-flow coverage is treated as sufficient proof. | Require slice-specific mocked and backend WTR evidence before claiming parity for the touched behavior. |
| Harness / gate reliability | High | Backend-WTR host seams and residual legacy Playwright race noise can hide or mimic regressions. | Preserve the host-aware wrapper baseline, keep the explicit recurrence protocol for contradictory reds, and pull if gate evidence conflicts. |
| Environment / external variability | Medium | CI or a fresh workspace may behave differently from the locally proven environment. | Treat cross-environment contradictions as real until explained; keep DB reset as RCA only, not a default gate step. |
| Scope / sequencing drift | Medium | Now that the standalone backlog is closed, choosing the wrong next frontier wastes effort or duplicates proof. | Rebuild the remaining feature inventory before choosing the next slice and record the rationale explicitly. |

Tiers:
- **High** - possible mission failure or loss of credibility
- **Medium** - degradation, detour, or local breakage
- **Low** - annoyance, nuisance, or bounded rework

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
| System / harness design | Pull | Repo-local harness changes still cross the user's stated decision boundary. |
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
- WTR `it(...)` descriptions are the long-term documentation; no separate BDD mirror is required.
- Runtime tracking of WTR vs Playwright is mandatory during migration.
- Prefer low-churn shared WTR test helpers when repeated hand-built fixture shapes would otherwise accumulate.
- Helper harmonization is already proven for higher-risk quiz-flow slices; feature-local proof remains acceptable unless repetition justifies widening a seam.
- The command of record defaults the legacy Playwright lane to `PW_WORKERS=1`; explicit env override remains available for future tuning.
- DB reset stays an RCA tool, not a default step in the command of record.
- Backend WTR uses the repo-local host-aware Vite wrapper so the transient Vite listener and proxy target stay on the same explicit host (`127.0.0.1` by default).
- Each completed BRACE milestone gets a full report file under `history/`, and milestone commit messages reference that report path.

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on two headless browsers: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

### Open decisions / questions
- Which remaining `Question.Edit.*` variant should come next now that `Question.Edit.GUI` is closed.
- Final CI policy for dual-suite execution cadence.
- Whether timer-related helpers need stronger proof obligations than the current score-family contract.

---

## 5) Validation gate(s)

- **Primary gate command / script:** `bash ./scripts/test-migration.sh`
- **What must pass after each milestone / session:**
  - mocked WTR lane in Chromium and Firefox
  - backend WTR lane in Chromium and Firefox
  - legacy Playwright lane while migration remains in progress
- **Additional targeted checks:**
  - targeted WTR files for the touched helper or test set
  - isolated legacy reruns when the full gate produces a contradictory red
  - instrumented reruns or loops when the change is intended to harden race-prone helpers or harness behavior
- **Timing / performance metrics to watch:**
  - `wtr_mocked_seconds`
  - `wtr_backend_seconds`
  - `playwright_seconds`
  - `migration_total_seconds`

---

## 6) Current milestone header

This section is intentionally compact. The authoritative body for the current milestone lives in the referenced artifact.

- **Milestone ID:** `2026-03-27-question-edit-gui`
- **Status:** completed
- **One-line goal:** Close `Question.Edit.GUI` as the first non-standalone edit-route migration slice.
- **Exit condition:** met; targeted mocked/backend greens plus a green full migration gate are recorded in `history/2026-03-27-question-edit-gui.md`.
- **Active artifact path:** `history/2026-03-27-question-edit-gui.md`
- **Expected commit shape:** One or more VCS commits when VCS is available.

Before working, read the active artifact referenced here.

---

## 7) Active residuals / live steering risks

Keep only the risks that matter for steering right now.
Resolved or milestone-local detail should move to milestone artifacts and journal entries.

| ID | Risk / uncertainty | Tier | Mission risk area | Current handling | Residual | Cheapest next proof | Pull class if escalation needed |
|---|---|---|---|---|---|---|---|
| R1 | `Question.Edit.GUI` is closed, but the remaining `Question.Edit.*` variants still need a deliberate next-slice choice. | Medium | Scope / sequencing drift | Keep the next slice inside the remaining edit family unless a fresh inventory check shows a better frontier. | Medium until the next edit variant is selected explicitly. | Compare delete-answer, show-hide-explanation, and validation variants against the new helper and pick the cheapest high-value slice. | BRACE Pull |
| R2 | Legacy Playwright still has low-grade race potential around `Question.Take.NumPad`, and it recurred once during the score milestone before clearing on isolation and rerun. | Medium | Harness / gate reliability | Keep the recurrence protocol explicit: isolated legacy rerun first, then a second full gate before accepting the slice. | Low-Medium | Re-run the full gate in CI or a fresh workspace; if the same failure repeats again, escalate with the accumulated evidence. | BRACE Pull |
| R3 | The host-aware backend-WTR wrapper is proven locally but not yet in a materially different environment. | Medium | Environment / external variability | Keep the current wrapper as the baseline and compare future contradictory evidence against it. | Medium | Run the command of record in CI or a fresh workspace after the next slice. | System Pull |
| R4 | Timer/helper proof remains narrower than the overall quiz-flow contract. | Medium | Slice-level behavior integrity | Keep the residual explicit instead of silently assuming the timer concern is closed. | Medium | Add a focused timer-helper experiment only if a later slice touches timer-sensitive behavior. | BRACE Pull |
| R5 | Repo-local `AGENTS.md` is no longer the active control source; current control now depends on the current Codex instructions plus `BOOTSTRAP_PROMPT.md`. | Low | Environment / external variability | Record the control source explicitly in plan notes and the resume protocol. | Low | Confirm future resumes still load the current instructions and bootstrap prompt before substantive work. | Environment Pull |

---

## 8) Pull log

Use this for actual human-facing interruptions.

| Date/Session | Pull class | Context | Evidence / facts | Decision or action requested | Resolution | Impact on plan |
|---|---|---|---|---|---|---|
| 2026-03-13 | BRACE Pull | Shift into long-horizon planning using the migration pinboard | Bootstrap plan proposed the highest-risk helper tranche first. | Approve the next milestone plan before implementation. | Approved: run the highest-risk score/partial/timer helper tranche first. | Reassess remaining take/progress harmonization before the next migration batch. |
| 2026-03-23 | System Pull | `Question.Take.Image` targeted WTR was green but one earlier full gate failed in backend WTR. | Failure signature included `ETIMEDOUT ::1:5174` and `ECONNREFUSED 127.0.0.1:5174`; sampled ownership showed the WTR process bringing up `::1:5174` while the plugin proxied to `http://localhost:${vitePort}`. | Choose whether to harden backend WTR with a repo-local host-aware Vite wrapper or with a broader harness split. | Resolved: use a repo-local host-aware Vite wrapper that binds and proxies on the same explicit host (`127.0.0.1` by default). | Targeted image checks and `bash ./scripts/test-migration.sh` were green after the wrapper landed; watch for recurrence in CI or a fresh workspace. |

Pull classes:
- **BRACE Pull** - functional / risk / expertise / tradeoff
- **System Pull** - repo-local harness / build / test-system design
- **Environment Pull** - external blocker requiring user or harness action

---

## 9) Milestone journal / handoff notes

One short line per milestone closeout or meaningful handoff.
Use milestone artifacts for the full detail.

| Date/Session | Milestone / slice | What changed | Evidence summary | Key learning / decision | Commit / ref |
|---|---|---|---|---|---|
| 2026-03-23 | `Question.Take.Feedback` closeout | Added mocked/backend feedback WTR coverage for standalone question correctness text and per-answer feedback classes. | Targeted mocked/backend feedback green; first full gate hit one isolated legacy numpad red; isolated rerun green; second full gate green. | The contradictory signal was unrelated legacy residue, not a feedback regression. | `dc1ca936` |
| 2026-03-26 | `Question.Take.NumPad` closeout | Added mocked/backend WTR coverage for standalone numpad answer selection and waited for the keydown listener mount effect before dispatching the synthetic event. | Targeted mocked/backend numpad green; full gate green with `migration_total_seconds=529`. | The issue was test timing around the mount effect, not product logic. | `2e0e0ced` |
| 2026-03-26 | `Question.Take.Feedback.Numerical` closeout | Added mocked/backend WTR coverage for the standalone `/test-numerical-question` route. | Targeted mocked/backend numerical green; full gate green with `migration_total_seconds=537`. | The numerical route needed only feature-local proof. | `59f52606` |
| 2026-03-26 | `Question.Take.MultipleChoice.Score` closeout | Added mocked/backend WTR coverage for standalone partial-score feedback and score labels. | Targeted mocked/backend score green; first full gate hit one isolated legacy Chromium numpad red; isolated legacy rerun green; second full gate green with `migration_total_seconds=511`. | The only contradiction was the known legacy numpad residue. | `801d309a` |
| 2026-03-26 | `Question.Take.EasyMode` closeout | Added mocked/backend WTR coverage for standalone easy-mode correct-answer count behavior and closed the dedicated standalone question backlog. | Targeted mocked/backend easy mode green; full gate green with mocked WTR `75 passed`, backend WTR `54 passed`, `migration_total_seconds=517`, and Playwright lane status `passed`. | The standalone `Question.Take.*` backlog now appears fully covered. | `7c70d13f` |
| 2026-03-27 | BRACE v2.3 upgrade hydration | Rehydrated the blank v2.3 `PLANS.md` from `PLANS-old`, `BOOTSTRAP_PROMPT.md`, recent history artifacts, and current repo inventory. | Repo-state inspection and inventory spot checks only; no product tests run. | BRACE v2.3 changes the control surface shape, not the underlying migration mission. | N/A |
| 2026-03-27 | Frontier selection closeout | Remapped the remaining inventory after standalone question closure and selected `Question.Edit.GUI` as the next implementation slice. | Inventory comparison between `specs/features/` and `frontend/tests/wtr/`; committed baseline anchored to `7c70d13f`. | `make/question` is now the highest-leverage uncovered family because it reuses the proven question-form seam while opening the whole edit tranche. | N/A |
| 2026-03-27 | `Question.Edit.GUI` closeout | Added mocked/backend WTR coverage for edit-route prepopulation, persisted edits, and single-to-multiple-choice persistence, plus a shared WTR question-form helper. | Targeted mocked green (`3 passed`, `0 failed`, `45.2s`); targeted backend green (`3 passed`, `0 failed`, `7.4s` after server startup); full gate green with mocked WTR `78 passed`, Playwright `153 passed`, `2 skipped`, backend WTR `57 passed`, and `migration_total_seconds=555`. | The first non-standalone edit slice stayed WTR-local and did not trigger the known legacy numpad residue. | pending milestone commit |

---

## 10) Artifact index

Use this as the deterministic map from live state to milestone detail.

| Artifact kind | ID / Milestone | Path / ref | Why it may matter later |
|---|---|---|---|
| Current milestone | `2026-03-27-question-edit-gui` | `history/2026-03-27-question-edit-gui.md` | Authoritative plan and report for the active `Question.Edit.GUI` implementation slice. |
| Milestone history | `2026-03-27-frontier-selection` | `history/2026-03-27-migration-frontier-selection.md` | Records why `Question.Edit.GUI` became the first non-standalone slice after standalone question closure. |
| Milestone history | `2026-03-27-question-edit-gui` | `history/2026-03-27-question-edit-gui.md` | Full milestone report for the first non-standalone edit-route slice, including targeted mocked/backend proof and the green full gate. |
| Milestone history | `Question.Take.EasyMode` | `history/2026-03-26-question-take-easy-mode.md` | Proves the dedicated standalone question backlog is closed and captures the latest green full gate. |
| Milestone history | `Question.Take.MultipleChoice.Score` | `history/2026-03-26-question-take-multiple-choice-score.md` | Captures the most recent contradictory legacy numpad rerun protocol. |
| Milestone history | `Question.Take.NumPad` | `history/2026-03-26-question-take-numpad.md` | Records the WTR keyboard-listener timing seam and the accepted local fix. |
| Transferred history | pre-v2.3 plan state | `PLANS-old` | Source of the previous hydrated pinboard, residuals, journal, and upgrade log. |
| Template | BRACE v2.3 milestone template | `history/TEMPLATE.md` | Template to use for future v2.3 milestone plan/report files. |

---

## 11) Patterns / systemic learnings

Use this for things that should influence future work.

- Scenario parity belongs in scenario descriptions; scenario robustness belongs in helper contracts.
- When a WTR helper crosses question, navigation, timeout, storage, or evaluation boundaries, it should prove active identity or state before acting.
- Prefer low-churn shared WTR helpers over repeated hand-crafted fixture shapes.
- Preserve backend-created question identity in test setup whenever shared helpers need to prove question ownership; discarding ids forces weaker assertions later.
- When the legacy Playwright lane shows broad or contradictory failures under load, prove a serialized run before adding deeper product instrumentation or destructive cleanup.
- When the backend already trims or reshapes quiz payloads at the API boundary, mocked WTR tests should mirror that response contract instead of re-simulating upstream creation inputs.
- Reuse existing production seams before introducing new ones; the existing clock seam and host-aware wrapper were both sufficient for their validated slices.
- When a third-party harness proxies to `localhost`, capture the actual listener address before treating the problem as generic port contention; `localhost` vs `::1` / `127.0.0.1` ambiguity can be the real seam.
- After each completed milestone, write the full BRACE report to `history/YYYY-MM-DD-<milestone-slug>.md` and reference that path in the milestone commit message.
- For WTR tests that drive window-level keyboard listeners installed in `useEffect`, wait for mount effects before dispatching the synthetic key event.
- Standalone display-only proof can stay feature-local when route behavior is driven entirely by render-time state and does not require answer submission.
- For edit-route persistence proof, reopening through the workspace redirect is stronger and cheaper than bypassing navigation because it proves both the PATCH contract and the post-save route.

---

## 12) System / environment notes

### Repo-local system / harness notes
- **Known harness constraints or brittle seams:**
  - Cross-browser WTR evidence must include Chromium and Firefox.
  - Sequential targeted WTR runs and the command of record have been stronger evidence than ad hoc combined direct mocked runs.
  - `scripts/run-backend-wtr-and-playwright.sh` defaults the legacy Playwright lane to `PW_WORKERS=1`; keep the explicit env override for future tuning.
  - The combined backend+Playwright gate can still log `Port 5173 is in use, trying another one...` before backend WTR starts, even when the full gate finishes green; treat it as low-grade residue unless it starts correlating with failures.
  - Current backend-WTR hardening lives in `frontend/tests/wtr/support/host-aware-vite-plugin.mjs`; it keeps the transient Vite listener and proxy on the same explicit host (`127.0.0.1` by default).
- **Known recurring test-system issues:**
  - Legacy Playwright still shows low-grade race potential under load, most recently around `Question.Take.NumPad`.

### External environment notes
- **Known machine / sandbox / service constraints:**
  - Prolonged local test use can accumulate backend DB state and distort RCA, but current evidence says DB accumulation is not the primary explanation for the latest backend-WTR failure.
  - Repo-local `AGENTS.md` is not present in the worktree; the current run depends on the current Codex instructions plus `BOOTSTRAP_PROMPT.md` for repo-local upgrade context.
- **Known cleanup or provisioning needs:**
  - DB reset and schema rebuild remain RCA tools, not default steps in the command of record.
  - If contradictory failures return in CI or another fresh environment, capture them before widening the harness or policy response.

---

## 13) Upgrade log

Use this when BRACE / PLANS semantics materially change mid-run.

| Date/Session | From version | To version | What still holds | What needed remapping / re-checking | Approval state |
|---|---|---|---|---|---|
| 2026-03-26 | BRACE v2.1 | BRACE v2.2 | The mission, command of record, evidence-first migration strategy, expertise boundaries, history-report workflow, and committed baseline through `dc1ca936` still hold. | Mission risk areas were recast into the v2.2 tiered table, the stub `PLANS.md` was rehydrated, the remaining standalone-question parity map was reopened for confirmation, and the control source was updated to the system-wide Codex instructions plus the repo bootstrap prompt in use at the time. | Approved |
| 2026-03-27 | BRACE v2.2 | BRACE v2.3 | The migration mission, command of record, evidence-first strategy, expertise boundaries, current residuals, and the committed standalone-question baseline through `7c70d13f` still hold. | `PLANS.md` was migrated to the v2.3 live-control structure, the current milestone pointer moved to a dedicated frontier-selection artifact, and the control source was re-anchored on `BOOTSTRAP_PROMPT.md` plus the current Codex instructions. | Approved |

---

## 14) Resume protocol

When resuming from this file:
1. read BRACE Mission, mission risk areas, expertise preferences, current pinboard, validation gates, current milestone header, active residuals, and the last 1-3 journal entries
2. read the active milestone artifact referenced in the current milestone header
3. restate the current pinboard and current milestone
4. confirm whether the next step is still valid
5. confirm that the current Codex instructions plus `BOOTSTRAP_PROMPT.md` still match the latest approved control model
6. continue autonomously unless a pull condition fires
7. after milestone closeout, update the current milestone header, active residuals, journal, pull log, and artifact index as needed

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
