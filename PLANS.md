# PLANS.md

## Version / status
- BRACE version: `2.5`
- Plan status: `active`
- Last updated: `2026-03-31 13:49 CEST`

## Primary mission
- Goal: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity, while preserving the legacy Playwright suite until parity is proven slice by slice.
- Non-goals / mission boundary:
  - Retiring the legacy Playwright suite before repo-wide WTR parity is proven.
  - Forcing a `1:1` feature-file mapping when one WTR slice clearly subsumes multiple legacy features.
  - Broad production or harness refactors unless a concrete migration slice proves they are necessary.
  - Treating the prior mission's finalization repair as proof that the new repo-wide parity mission is already complete.
- Command of record / acceptance floor: `bash ./scripts/test-migration.sh`

## Current operating context
- Current mode: `autonomous milestones`
- Short state summary: `Workspace.RowNavigation` now has dedicated mocked/backend WTR coverage plus a green `bash ./scripts/test-migration.sh`, which closes the remaining non-clipboard workspace row-action seam. `Workspace.CopiedLinks` is the new active proof target for the last uncovered workspace-list behavior.
- Current VCS / recoverability note: The closed `Workspace.RowNavigation` slice and the activation of `Workspace.CopiedLinks` are packaged together under the `2026-03-31-workspace-row-navigation-packaging` milestone, which establishes the clean bookkeeping boundary before the final workspace-list implementation step.
- Tool-facing plan note: keep one concrete next proof target live unless emitting a Pull or BRACE Final

## Current pinboard
### Accepted decisions
- Migration strategy remains incremental, slice-based, and evidence-bearing.
- Legacy Playwright-BDD in `specs/` stays intact until repo-wide WTR parity is proven.
- Accepted implementation slices still require targeted mocked and backend WTR proof in Chromium and Firefox plus the command-of-record gate, unless a slice is explicitly classified as frontend-only with no meaningful backend seam.
- `1:1` scenario or file mapping remains optional when one WTR slice clearly subsumes multiple legacy features.
- Runtime tracking for mocked WTR, backend WTR, legacy Playwright, and total migration time remains mandatory during migration.
- Prefer low-churn WTR-local helpers over production refactors when repeated DOM or fixture setup would otherwise accumulate.
- Backend WTR keeps the repo-local host-aware Vite wrapper baseline on explicit host `127.0.0.1`.
- The prior `make/question` frontier is closed and archived as its own finalized mission artifact.
- The prior mission's risk areas carry over substantively into the repo-wide parity mission; no prior mission-level default risk area has been dropped, and no new mission-level default risk area is required yet.
- `Workspace.CreateQuiz.feature` is currently treated as substantively covered by the existing `Quiz.CreateNew` WTR slice because the current WTR tests already prove creating a quiz from workspace questions and returning to the workspace list.
- `Quiz.Edit.feature` is now treated as covered by dedicated mocked/backend WTR tests plus a green `bash ./scripts/test-migration.sh` run.
- `Quiz.Validations.feature` is now treated as covered by dedicated mocked/backend WTR tests, and a later green `bash ./scripts/test-migration.sh` run reconfirmed the repository baseline with that slice in place.
- `Quiz.FilterQuestions.feature` is now treated as covered by dedicated mocked/backend WTR tests plus a green `bash ./scripts/test-migration.sh` run.
- `Workspace.feature` scenario `Show edited question in a workspace` is treated as substantively covered by the existing `Question.Edit.GUI` WTR slice because it already proves saving from the edit route returns to the workspace list with the updated question text and supports reopening from that list.
- `Workspace.feature` scenarios `Delete question in a workspace` and `Do not show delete button for question used in a quiz` are now treated as covered by dedicated mocked/backend WTR tests plus a green `bash ./scripts/test-migration.sh` run.
- `Workspace.feature` scenarios `Take question in a workspace` and `Edit question in a workspace` are now treated as covered by dedicated mocked/backend WTR tests plus a green `bash ./scripts/test-migration.sh` run.
- The next repo-wide migration frontier remains workspace list authoring, with `Workspace.CopiedLinks` selected as the next bounded implementation slice because it closes the final remaining workspace-list behavior before low-risk frontend-only parity questions.

### Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on headless Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration slices unless the mission explicitly changes.

### Open decisions / questions
- Final CI policy for dual-suite execution cadence after repo-wide parity.
- When and how to downshift or retire the legacy Playwright suite after parity is proven.
- Whether static or clipboard-heavy surfaces should require backend-lane proof or an explicit browser-capability proof beyond mocked coverage.

## Mission risk areas
| Risk area | Default tier | Why it matters | Assurance guidance |
|---|---|---|---|
| Migration credibility / parity drift | High | Repo-wide parity claims can drift if overlapping features or partial mappings are misclassified. | Rebuild inventory from repo state before each new family, record explicit mapping decisions, and mark anything uncertain as `UNPROVEN`. |
| Slice-level behavior integrity | High | Quiz and workspace authoring flows mix navigation, editing, validation, clipboard, and delete constraints, so shallow assertions can overclaim parity. | Keep milestones narrow and require slice-specific mocked and backend WTR evidence before closing touched behavior. |
| Harness / gate reliability | High | Backend-WTR host seams and low-grade legacy Playwright residue can still blur acceptance failures. | Preserve the host-aware wrapper baseline, apply the contradictory-red recurrence protocol, and run the full gate after targeted proof. |
| Scope / sequencing drift | Medium | A repo-wide mission can sprawl across unrelated families if no concrete frontier stays live. | Work family-by-family, choose one bounded slice at a time, and keep the next proof target explicit in `PLANS.md`. |
| Environment / external variability | Medium | CI or a fresh workspace may disagree with the locally proven host-aware baseline. | Treat cross-environment contradictions as real until explained and preserve fresh-environment proof as a carry-over need. |
| Control-surface consistency | Medium | Reopening under BRACE 2.5 after a finalized 2.4 surface can leave stale pointers, commit fields, or misleading residuals. | Tie milestone claims to history artifacts and git state, repair stale bookkeeping before implementation, and open a new active artifact before pausing. |

## Expertise / direction preferences
| Decision area | Mode (`Autonomous` / `Pull`) | Notes |
|---|---|---|
| Product / UX | Autonomous | Preserve existing feature behavior unless evidence shows the legacy expectation is ambiguous or wrong. |
| Mission / scope changes | Pull | Changing the mission boundary, acceptance floor, or retirement policy remains user-owned. |
| Architecture / design | Pull | Material helper, route, or migration-structure changes should still be escalated. |
| Testing strategy | Autonomous | Feature-local evidence strategy, overlap classification, and slice bundling may proceed without interruption. |
| Debugging / RCA | Pull | Contradictory reds or unclear root causes should be escalated once local evidence stalls. |
| Security / risk | Autonomous | No security-specific policy change is currently blocking the migration. |
| System / harness design | Pull | Repo-local harness changes still cross the user's stated decision boundary. |
| Environment / external blockers | Pull | External blockers should be escalated with a concrete action request. |

## Current milestone header
- ID: `2026-03-31-workspace-copied-links`
- Status: `in_progress`
- One-line goal: Add mocked and backend WTR coverage for copied take/edit question URLs from the workspace list in `Workspace.feature`.
- Exit condition: Targeted mocked/backend greens plus a green `bash ./scripts/test-migration.sh` are recorded, and `PLANS.md` points to the correct next action at closeout.
- Active artifact: `history/2026-03-31-workspace-copied-links.md`

## Active residuals
| Residual | Tier | Why it matters now | Cheapest next proof / action |
|---|---|---|---|
| `Workspace.feature` copied take/edit URLs are now the last uncovered workspace-list seam. | Medium | Repo-wide parity on workspace authoring is not credible until the copied-link behavior is proven directly from the workspace list. | Implement dedicated mocked/backend copied-link tests and rerun the acceptance evidence. |
| `Home.feature` currently has mocked-only WTR proof. | Low | The feature is static and low-risk, but final parity accounting still needs an explicit closure rule for frontend-only surfaces. | Decide later whether mocked-only proof is sufficient or whether a lightweight browser-capability slice is still warranted. |
| The host-aware backend-WTR wrapper remains primarily proven in the local environment. | Medium | A fresh environment could still expose a host or proxy contradiction. | Reuse the command of record in CI or another fresh workspace and compare it to the local baseline. |
| Legacy Playwright still carries recent contradictory-red history outside the touched WTR slice, even though the latest full gate is green. | Medium | The command of record is authoritative again today, but the retained lane has shown enough drift to justify caution if it contradicts a later slice. | If it recurs, isolate the legacy lane first and require a second run before interpreting the result as slice-level evidence. |

## Pull log
| Date | Pull type | Area tag(s) | Trigger | Decision / action requested | Resolution | Notes |
|---|---|---|---|---|---|---|
| 2026-03-13 | Decision Ownership Pull | `testing`, `scope` | Highest-risk migration tranche selection during the earlier BRACE plan bootstrap | Approve the next milestone plan before implementation. | Approved | Proceeded with the highest-risk score/partial/timer helper tranche first. |
| 2026-03-23 | Decision Ownership Pull | `system/harness`, `testing` | Backend-WTR showed `ETIMEDOUT ::1:5174` and `ECONNREFUSED 127.0.0.1:5174` during the full gate. | Choose whether to harden backend WTR with a repo-local host-aware Vite wrapper or a broader harness split. | Approved | Adopted the repo-local host-aware Vite wrapper baseline on explicit host `127.0.0.1`. |
| 2026-03-29 | Decision Ownership Pull | `planning/bookkeeping`, `testing` | BRACE v2.4 changed the live control surface while `PLANS.md` was blank, so mission continuity and next-action validity had to be rehydrated. | Approve the migrated BRACE v2.4 control surface and the pending `Question.Edit.GUI.Validations` milestone. | Approved | Proceeded with the bundled validation milestone under the rehydrated v2.4 control surface. |
| 2026-03-30 | Decision Ownership Pull | `planning/bookkeeping`, `testing` | BRACE v2.5 left `PLANS.md` blank while the prior mission's final lived only in `PLANS-old`, and March 29 bookkeeping was stale relative to `2b1fe447` / `1f2f0c86`. | Approve preserving the prior mission's final as a dedicated history artifact, hydrating a new BRACE 2.5 plan, and selecting a new repo-wide full-parity mission. | Approved | Proceeded with prior-mission finalization, repo-wide mission selection, and activation of `Quiz.Edit`. |

## Milestone index
| Milestone | Status | Summary | Commit(s) | Artifact | Pull(s) |
|---|---|---|---|---|---|
| `2026-03-31-workspace-copied-links` | in_progress | Active slice: add mocked/backend WTR coverage for copying take and edit question URLs from the workspace list and following them. | none | `history/2026-03-31-workspace-copied-links.md` | none |
| `2026-03-31-workspace-row-navigation-packaging` | completed | Packaged the closed `Workspace.RowNavigation` slice and activated `Workspace.CopiedLinks` as the next live proof target. | packaging milestone | `history/2026-03-31-workspace-row-navigation-packaging.md` | none |
| `2026-03-31-workspace-row-navigation` | completed | Added mocked/backend WTR coverage for taking and editing a question directly from the workspace list. | packaged by `2026-03-31-workspace-row-navigation-packaging` | `history/2026-03-31-workspace-row-navigation.md` | none |
| `2026-03-31-workspace-delete-constraints-packaging` | completed | Packaged the closed `Workspace.DeleteConstraints` slice and activated `Workspace.RowNavigation` as the next live proof target. | packaging milestone | `history/2026-03-31-workspace-delete-constraints-packaging.md` | none |
| `2026-03-31-workspace-delete-constraints` | completed | Added mocked/backend WTR coverage for deleting a standalone workspace question and hiding the delete affordance when a question is already used in a quiz. | packaged by `2026-03-31-workspace-delete-constraints-packaging` | `history/2026-03-31-workspace-delete-constraints.md` | none |
| `2026-03-31-quiz-filter-questions-packaging` | completed | Packaged the closed `Quiz.FilterQuestions` slice and activated `Workspace.DeleteConstraints` as the next live proof target. | packaging milestone | `history/2026-03-31-quiz-filter-questions-packaging.md` | none |
| `2026-03-30-quiz-filter-questions` | completed | Added mocked/backend WTR coverage for create-form filter behavior in `Quiz.FilterQuestions.feature` and closed the bounded quiz-create tranche. | packaged by `2026-03-31-quiz-filter-questions-packaging` | `history/2026-03-30-quiz-filter-questions.md` | none |
| `2026-03-30-quiz-validations-packaging` | completed | Packaged the closed `Quiz.Validations` slice and activated `Quiz.FilterQuestions` as the next live proof target. | packaging milestone | `history/2026-03-30-quiz-validations-packaging.md` | none |
| `2026-03-30-quiz-validations` | completed | Added mocked/backend WTR coverage for create-form defaults and validation behavior in `Quiz.Validations.feature`. | packaged by `2026-03-30-quiz-validations-packaging` | `history/2026-03-30-quiz-validations.md` | none |
| `2026-03-30-quiz-edit-packaging` | completed | Packaged the closed `Quiz.Edit` slice and activated `Quiz.Validations` as the next live proof target. | packaging milestone | `history/2026-03-30-quiz-edit-packaging.md` | none |
| `2026-03-30-quiz-edit` | completed | Added mocked/backend WTR coverage for editing quiz title and description from the workspace and proving the updated welcome page. | packaged by `2026-03-30-quiz-edit-packaging` | `history/2026-03-30-quiz-edit.md` | none |
| `2026-03-30-planning-bookkeeping-packaging` | completed | Packaged the BRACE 2.5 prior-final artifact, mission-selection artifact, and `Quiz.Edit` activation into one clean bookkeeping boundary. | packaging milestone | `history/2026-03-30-planning-bookkeeping-packaging.md` | none |
| `2026-03-30-full-wtr-parity-mission-selection` | completed | Rebuilt the repo-wide parity inventory, selected the new full-parity mission, and chose `Quiz.Edit` as the next proof target. | packaged by `2026-03-30-planning-bookkeeping-packaging` | `history/2026-03-30-full-wtr-parity-mission-selection.md` | none |
| `2026-03-30-prior-migration-mission-final` | completed | Preserved the prior mission's final as a dedicated BRACE history artifact and reconciled the stale March 29 bookkeeping against current git state. | packaged by `2026-03-30-planning-bookkeeping-packaging` | `history/2026-03-30-prior-migration-mission-final.md` | `2026-03-30` Decision Ownership Pull approval |
| `2026-03-29-question-create-gui-validations` | completed | Added mocked/backend WTR coverage for the remaining create-form validation rules plus validation-clear paths in single-choice and multiple-choice mode. | `2b1fe447` | `history/2026-03-29-question-create-gui-validations.md` | none |
| `2026-03-29-question-create-gui-single-multi` | completed | Added mocked/backend WTR coverage for create-form single/multiple-choice correctness transitions plus Easy mode visibility. | `2b1fe447` | `history/2026-03-29-question-create-gui-single-multi.md` | none |
| `2026-03-29-question-create-gui-delete-answer` | completed | Added mocked/backend WTR coverage for deleting the second answer from a three-answer create-form draft while preserving the remaining answers. | `2b1fe447` | `history/2026-03-29-question-create-gui-delete-answer.md` | none |
| `2026-03-29-question-create-gui-show-hide-explanation` | completed | Added mocked/backend WTR coverage for create-form explanation visibility defaults and checkbox toggle behavior. | `2b1fe447` | `history/2026-03-29-question-create-gui-show-hide-explanation.md` | none |
| `2026-03-29-question-edit-gui-validations` | completed | Added mocked/backend WTR coverage for the remaining single-choice and multiple-choice edit-form validation scenarios and closed the full edit family. | `2b1fe447` | `history/2026-03-29-question-edit-gui-validations.md` | `2026-03-29` BRACE upgrade approval |
| `2026-03-27-question-edit-gui-delete-answer` | completed | Added mocked/backend WTR coverage for removing the third prepopulated answer from the edit form and closed the bounded delete-answer slice. | `3dafa2b5` | `history/2026-03-27-question-edit-gui-delete-answer.md` | none |
| `2026-03-27-question-edit-gui-show-hide-explanation` | completed | Added mocked/backend WTR coverage for explanation visibility defaults and toggle behavior on the edit route. | `458d7da5` | `history/2026-03-27-question-edit-gui-show-hide-explanation.md` | none |
| `2026-03-27-question-edit-gui` | completed | Added mocked/backend WTR coverage for edit-route prepopulation, persistence, and single-to-multiple-choice persistence. | `14aa5824` | `history/2026-03-27-question-edit-gui.md` | none |
| `2026-03-27-migration-frontier-selection` | completed | Rebuilt the remaining feature inventory after standalone-question closure and selected the edit-question family as the next frontier. | none | `history/2026-03-27-migration-frontier-selection.md` | BRACE v2.3 upgrade approval |
| `2026-03-26-question-take-easy-mode` | completed | Closed the dedicated standalone `Question.Take.*` backlog and established the latest committed product baseline before the edit tranche. | `7c70d13f` | `history/2026-03-26-question-take-easy-mode.md` | none |

## BRACE Final scaffold
- Mission completion status: Open. Repo-wide WTR parity is not yet proven.
- Explicit decisions made through pulls: Preserve the repo-local host-aware backend baseline, keep the legacy Playwright suite during migration, and reopen under a new BRACE 2.5 full-parity mission after archiving the prior final.
- Autonomous milestone work completed: Prior-mission BRACE Final preservation, repo-wide mission selection, planning-bookkeeping packaging, `Quiz.Edit` closure, `Quiz.Validations` closure, `Quiz.FilterQuestions` closure, `Workspace.DeleteConstraints` closure, `Workspace.RowNavigation` closure, and `Workspace.CopiedLinks` activation.
- Evidence summary: Repo inventory confirms `take/*`, `make/question/*`, `Workspace.Create`, the bounded quiz-create tranche (`Quiz.CreateNew`, `Quiz.Edit`, `Quiz.Validations`, `Quiz.FilterQuestions`), workspace delete constraints, and workspace take/edit row navigation are covered, while the remaining open work clusters around copied workspace links plus low-risk frontend-only parity questions.
- Remaining unknowns / unproven areas: Workspace copied-link parity remains open, the retained legacy lane still has recent contradictory-red history even though the latest command of record is green, `Home.feature` closure criteria are still low-risk but explicit, and cross-environment proof of the host-aware wrapper remains outstanding.
- Recommended next proof / next mission: Execute the `Workspace.CopiedLinks` milestone with targeted mocked/backend evidence and then rerun `bash ./scripts/test-migration.sh`.
