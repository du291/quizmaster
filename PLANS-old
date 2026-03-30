# PLANS.md

## Version / status
- BRACE version: `2.4`
- Plan status: `finalized`
- Last updated: `2026-03-29 19:34 CEST`

## Primary mission
- Goal: Continue the incremental Playwright-BDD to WTR migration, preserve the legacy Playwright suite until parity is proven, and close the remaining migration frontier one slice at a time with executed evidence.
- Non-goals / mission boundary:
  - Removing the legacy Playwright suite before parity.
  - Forcing 1:1 scenario mapping when merged WTR tests are clearer.
  - Extracting broader production or domain helpers unless repeated duplication justifies it.
  - Treating this BRACE v2.4 upgrade as approval to resume substantive implementation.
- Command of record / acceptance floor: `bash ./scripts/test-migration.sh`

## Current operating context
- Current mode: `BRACE Final`
- Short state summary: `Question.Create.GUI.Validations` is now closed with targeted mocked/backend greens plus a green full migration gate. The full `make/question` migration frontier is now covered, and no concrete next migration slice remains on the live control surface.
- Current VCS / recoverability note: `master` is ahead of `origin/master` by `1` commit (`9ffc9751`, `brace 2.4`). Worktree recoverability is clear; local edits contain completed milestone closeouts through create validations plus the supporting WTR test files and helper additions. No new commit was created in this final pass.

## Current pinboard
### Accepted decisions
- Migration strategy remains incremental.
- Legacy Playwright-BDD in `specs/` stays intact until parity is proven.
- Each accepted slice requires mocked and backend WTR evidence in Chromium and Firefox plus the command-of-record gate.
- `1:1` scenario mapping is optional; merged WTR coverage is acceptable when clearer.
- WTR `it(...)` descriptions are the long-term documentation; no separate BDD mirror is required.
- Runtime tracking for mocked WTR, backend WTR, legacy Playwright, and total migration time remains mandatory during migration.
- Prefer low-churn shared WTR helpers when repeated hand-built fixture or DOM setup would otherwise accumulate.
- Backend WTR keeps the repo-local host-aware Vite wrapper baseline on explicit host `127.0.0.1`.
- DB reset remains an RCA tool, not a default gate step.
- The remaining `Question.Edit.GUI.Validations*` scenarios will be treated as one final edit-family milestone because both features sit on the same validator seam and differ mainly in correctness-cardinality assertions.
- The full `Question.Edit.GUI*` family is now covered by dedicated mocked/backend WTR files plus a green acceptance gate.
- `Question.Create.GUI.ShowHideExplanation` is now covered by dedicated mocked/backend WTR files plus a green acceptance gate.
- `Question.Create.GUI.DeleteAnswer` is now covered by dedicated mocked/backend WTR files plus a green acceptance gate.
- `Question.Create.GUI.SingleMulti` is now covered by dedicated mocked/backend WTR files plus a green acceptance gate.
- `Question.Create.GUI.Validations` and `Question.Create.GUI.Validations.MultipleChoice` are now covered by dedicated mocked/backend WTR files plus a green acceptance gate.
- The current `specs/features/make/question/*.feature` inventory is now fully represented by dedicated mocked/backend WTR counterparts in `frontend/tests/wtr/`.

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on headless Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration slices.

### Open decisions / questions
- Final CI policy for dual-suite execution cadence after parity.
- Whether timer-related helpers need stronger proof obligations than the current quiz-flow contract if a later slice touches timer-sensitive behavior.

## Mission risk areas
| Risk area | Default tier | Why it matters | Assurance guidance |
|---|---|---|---|
| Migration credibility / parity drift | High | A stale or incomplete control surface can misstate what is already proven and what still lacks migration. | Anchor each milestone to committed artifacts, current history reports, and executed gates; pull if the parity map becomes ambiguous. |
| Slice-level behavior integrity | High | Route-level and form-level behavior can be lost if adjacent edit coverage is treated as proof for untested validation rules. | Require slice-specific mocked and backend WTR evidence before claiming parity for the touched behavior. |
| Harness / gate reliability | High | Backend-WTR host seams and low-grade legacy Playwright race noise can hide or mimic regressions. | Preserve the explicit recurrence protocol for contradictory reds and keep the host-aware wrapper baseline unless stronger evidence says otherwise. |
| Environment / external variability | Medium | CI or a fresh workspace may behave differently from the locally proven environment. | Treat cross-environment contradictions as real until explained; keep DB reset as RCA only, not a default gate step. |
| Scope / sequencing drift | Medium | Choosing the wrong next frontier wastes effort or duplicates proof now that the edit family is nearly closed. | Rebuild the remaining feature inventory before naming the next slice and record the rationale explicitly. |
| Control-surface consistency | Medium | A blank or stale `PLANS.md` can make milestone identity, evidence meaning, and next-action validity untrustworthy. | Rehydrate from `PLANS-old`, `history/`, and git state; stop for approval when BRACE semantics change mid-run. |

## Expertise / direction preferences
| Decision area | Mode (`Autonomous` / `Pull`) | Notes |
|---|---|---|
| Product / UX | Autonomous | Existing feature behavior should be preserved unless evidence shows ambiguity. |
| Architecture / design | Pull | Material helper, route, or migration-structure changes should be escalated. |
| Testing strategy | Autonomous | Feature-local evidence strategy and slice bundling may proceed without interruption. |
| Debugging / RCA | Pull | Contradictory reds or unclear root causes should be escalated once local evidence stalls. |
| Security / risk | Autonomous | No security-specific policy change is currently blocking the migration. |
| System / harness design | Pull | Repo-local harness changes still cross the user's stated decision boundary. |
| Environment / external blockers | Pull | External blockers should be escalated with a concrete action request. |

## Current milestone header
- ID: `2026-03-29-question-create-gui-validations`
- Status: `completed`
- One-line goal: Close the remaining create-form single-choice and multiple-choice validation scenarios.
- Exit condition: Met; targeted mocked/backend greens plus a green `bash ./scripts/test-migration.sh` are recorded in `history/2026-03-29-question-create-gui-validations.md`.
- Active artifact: `history/2026-03-29-question-create-gui-validations.md`

## Active residuals
| Residual | Tier | Why it matters now | Cheapest next proof / action |
|---|---|---|---|
| The host-aware backend-WTR wrapper remains primarily proven in the local environment. | Medium | The latest acceptance evidence is strong locally, but a materially different environment could still expose a host/proxy contradiction. | Reuse the command of record in CI or another fresh workspace and compare the result to the local baseline. |
| Legacy Playwright still has low-grade race potential around `Question.Take.NumPad`. | Medium | The migration command remains green, but the retained legacy lane still carries a known low-grade contradiction risk. | If it recurs, isolate the legacy lane first and require a second full gate before interpreting the result. |
| Final CI policy for dual-suite execution cadence after parity is still undecided. | Low | Migration parity is now strong enough to close this mission, but a follow-on mission still needs to decide how the two suites should coexist operationally. | Choose the follow-on CI policy and any legacy-suite retirement plan in a new mission. |

## Pull log
| Date | Pull type | Trigger | Decision / action requested | Resolution | Notes |
|---|---|---|---|---|---|
| 2026-03-13 | BRACE Pull | Highest-risk migration tranche selection during the earlier BRACE plan bootstrap | Approve the next milestone plan before implementation. | Approved | Proceeded with the highest-risk score/partial/timer helper tranche first. |
| 2026-03-23 | System Pull | Backend-WTR showed `ETIMEDOUT ::1:5174` and `ECONNREFUSED 127.0.0.1:5174` during the full gate | Choose whether to harden backend WTR with a repo-local host-aware Vite wrapper or a broader harness split. | Approved | Adopted the repo-local host-aware Vite wrapper baseline on explicit host `127.0.0.1`. |
| 2026-03-29 | BRACE Pull | BRACE v2.4 changed the live control surface while `PLANS.md` was blank, so mission continuity and next-action validity had to be rehydrated. | Approve the migrated BRACE v2.4 control surface and the pending `Question.Edit.GUI.Validations` milestone. | Approved | Proceeded with the bundled validation milestone under the rehydrated v2.4 control surface. |

## Milestone index
| Milestone | Status | Summary | Commit(s) | Artifact | Pull(s) |
|---|---|---|---|---|---|
| `2026-03-29-question-create-gui-validations` | completed | Added mocked/backend WTR coverage for the remaining create-form validation rules plus validation-clear paths in single-choice and multiple-choice mode. | pending milestone commit | `history/2026-03-29-question-create-gui-validations.md` | none |
| `2026-03-29-question-create-gui-single-multi` | completed | Added mocked/backend WTR coverage for create-form single/multiple-choice correctness transitions plus Easy mode visibility. | pending milestone commit | `history/2026-03-29-question-create-gui-single-multi.md` | none |
| `2026-03-29-question-create-gui-delete-answer` | completed | Added mocked/backend WTR coverage for deleting the second answer from a three-answer create-form draft while preserving the remaining answers. | pending milestone commit | `history/2026-03-29-question-create-gui-delete-answer.md` | none |
| `2026-03-29-question-create-gui-show-hide-explanation` | completed | Added mocked/backend WTR coverage for create-form explanation visibility defaults and checkbox toggle behavior. | pending milestone commit | `history/2026-03-29-question-create-gui-show-hide-explanation.md` | none |
| `2026-03-29-question-edit-gui-validations` | completed | Added mocked/backend WTR coverage for the remaining single-choice and multiple-choice edit-form validation scenarios and closed the full edit family. | pending milestone commit | `history/2026-03-29-question-edit-gui-validations.md` | `2026-03-29` BRACE upgrade approval |
| `2026-03-27-question-edit-gui-delete-answer` | completed | Added mocked/backend WTR coverage for removing the third prepopulated answer from the edit form and closed the bounded delete-answer slice. | `3dafa2b5` | `history/2026-03-27-question-edit-gui-delete-answer.md` | none |
| `2026-03-27-question-edit-gui-show-hide-explanation` | completed | Added mocked/backend WTR coverage for explanation visibility defaults and toggle behavior on the edit route. | `458d7da5` | `history/2026-03-27-question-edit-gui-show-hide-explanation.md` | none |
| `2026-03-27-question-edit-gui` | completed | Added mocked/backend WTR coverage for edit-route prepopulation, persistence, and single-to-multiple-choice persistence. | `14aa5824` | `history/2026-03-27-question-edit-gui.md` | none |
| `2026-03-27-migration-frontier-selection` | completed | Rebuilt the remaining feature inventory after standalone-question closure and selected the edit-question family as the next frontier. | none | `history/2026-03-27-migration-frontier-selection.md` | BRACE v2.3 upgrade approval |
| `2026-03-26-question-take-easy-mode` | completed | Closed the dedicated standalone `Question.Take.*` backlog and established the latest committed product baseline before the edit tranche. | `7c70d13f` | `history/2026-03-26-question-take-easy-mode.md` | none |

## BRACE Final scaffold
- Mission completion status: Complete enough to close. The current live frontier is exhausted, the full `make/question` feature inventory now has dedicated mocked/backend WTR counterparts, and the command of record is green.
- Explicit decisions made through pulls: Prior tranche prioritization, the backend host-aware Vite wrapper, and the BRACE v2.4 upgrade are approved.
- Autonomous milestone work completed: Standalone `Question.Take.*` closure through `7c70d13f`, frontier selection, the committed edit-route slices `Question.Edit.GUI`, `Question.Edit.GUI.ShowHideExplanation`, and `Question.Edit.GUI.DeleteAnswer`, the completed `Question.Edit.GUI.Validations` closeout, and the completed create-route closeouts `Question.Create.GUI.ShowHideExplanation`, `Question.Create.GUI.DeleteAnswer`, `Question.Create.GUI.SingleMulti`, and `Question.Create.GUI.Validations`.
- Evidence summary: Targeted mocked/backend greens plus green full migration gates are recorded in `history/` through `history/2026-03-29-question-create-gui-validations.md`. The latest acceptance floor is green with mocked WTR `93 passed`, Playwright `153 passed` / `2 skipped`, backend WTR `72 passed`, and `migration_total_seconds=581`.
- Remaining unknowns / unproven areas: Cross-environment proof of the host-aware wrapper, low-grade residual race potential in the retained legacy `Question.Take.NumPad` lane, and the still-open policy choice for dual-suite CI cadence after parity.
- Recommended next proof / next mission: Run `bash ./scripts/test-migration.sh` in CI or another fresh workspace, then decide the follow-on CI / legacy-suite policy in a new mission.
