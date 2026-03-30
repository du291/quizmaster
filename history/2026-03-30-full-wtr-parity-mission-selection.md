# BRACE Milestone

Milestone: `Full WTR parity mission selection`
Date: 2026-03-30
Status: completed
Primary mission: Continue the Playwright-BDD to WTR migration until the retained Playwright feature inventory has full WTR parity while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): `packaged by 2026-03-30-planning-bookkeeping-packaging`
Related pull(s): `2026-03-30 Decision Ownership Pull approval`
Depends on: `2026-03-30-prior-migration-mission-final`

## BRACE Plan Snapshot

### B — Behavior
- Rebuild the repo-wide parity inventory from `specs/features/` and current WTR coverage instead of carrying the old frontier forward from memory.
- Record the new mission selection and mission risk round as their own history artifact.
- Choose the next bounded implementation slice and leave it as the active milestone in `PLANS.md`.

### R — Risks (top 1–5)
1. High / Migration credibility / parity drift: overlapping or subsumed features can make repo-wide parity look fuller or thinner than it really is.
2. High / Coverage classification: static surfaces and workspace-integrated quiz flows do not always need the same evidence shape, so naive filename comparison can misclassify gaps.
3. Medium / Scope / sequencing drift: a repo-wide mission can sprawl across unrelated families if a concrete next slice is not selected immediately.
4. Medium / Harness / gate reliability: the command of record still inherits the host-aware backend wrapper baseline and low-grade legacy Playwright residue.
5. Medium / Control-surface consistency: reopening immediately after archiving the prior final can still leave the new mission under-specified if the next active artifact is not created.

### A — Assurances
- Use direct inventory queries against `specs/features/` and `frontend/tests/wtr/` rather than inferring the remaining frontier from old notes.
- Inspect ambiguous overlaps explicitly, especially `Quiz.CreateNew`, `Workspace.CreateQuiz`, and `Home`.
- Choose one coherent family and one bounded first slice instead of a broad multi-surface implementation start.
- Carry forward the accepted host-aware wrapper baseline and contradiction protocol without changing harness policy in this milestone.

### Planned Coverage
- Covered:
  - repo-wide feature inventory rebuild after the archived prior mission
  - explicit recording of the new mission selection and risk round
  - selection of the next bounded implementation slice
- Not covered:
  - implementation of the chosen slice
  - new targeted mocked/backend execution
  - Cheapest proof: execute the newly selected slice with targeted mocked/backend proof plus `bash ./scripts/test-migration.sh`

### Planned Evidence
- Intent: enumerate the full retained Playwright feature inventory
  Command / artifact: `rg --files specs/features | sort`
  Result: the retained feature inventory spans `make/`, `take/question`, and `take/quiz`, with remaining uncovered work concentrated in quiz authoring and workspace list flows
  Interpretation: repo-wide parity remains open, but the gaps cluster cleanly rather than being diffuse across the whole tree
- Intent: enumerate the current WTR footprint
  Command / artifact: `rg --files frontend/tests/wtr | sort`
  Result: WTR coverage is already strong for `take/*`, `make/question/*`, `Workspace.Create`, and `Quiz.CreateNew`
  Interpretation: the highest-value remaining work is not on the already-covered question or take families
- Intent: resolve ambiguous overlap before naming the next slice
  Command / artifact: inspection of `specs/features/make/quiz/Quiz.CreateNew.feature`, `specs/features/make/workspace/Workspace.CreateQuiz.feature`, `frontend/tests/wtr/mocked/quiz-create-new.test.tsx`, and `frontend/tests/wtr/backend/quiz-create-new.backend.test.tsx`
  Result: `Workspace.CreateQuiz.feature` is substantively subsumed by the existing `Quiz.CreateNew` WTR slice, while `Home.feature` already has low-risk mocked-only coverage
  Interpretation: the next implementation slice should target genuinely open behavior, not duplicate a covered create-quiz seam
- Intent: verify the feasibility of starting with quiz editing
  Command / artifact: inspection of `frontend/src/pages/make/quiz-create/quiz-edit-page.tsx`, `frontend/src/pages/make/quiz-create/quiz-item.tsx`, and `specs/features/make/quiz/Quiz.Edit.feature`
  Result: the edit route, workspace edit button, and feature expectation already exist as a bounded title-and-description editing seam
  Interpretation: `Quiz.Edit` is the best first slice for the new mission because it reuses already-proven quiz-authoring and workspace-list seams without widening immediately into validations or clipboard behavior

### Planned Scope Inventory
- `PLANS.md`
- `history/2026-03-30-full-wtr-parity-mission-selection.md`
- `history/2026-03-30-quiz-edit.md`

### Exit condition
- The new mission and risk round are recorded, a concrete next slice is selected, and `PLANS.md` points to a real active milestone artifact.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Repo-wide parity inventory is current | High / Migration credibility / parity drift | Rebuild the inventory directly from repo state | Feature and WTR file listings | Low once the selection artifact records the result | Re-run the same inventory queries when a family closes |
| Ambiguous overlap is handled deliberately | High / Coverage classification | Inspect overlapping features and tests rather than trusting filename diff alone | Feature and WTR inspection around create-quiz and home coverage | Medium until every family closes | Revisit overlap decisions if a later contradiction appears |
| The new mission starts with one bounded proof target | Medium / Scope / sequencing drift | Select a single next slice immediately | `Quiz.Edit` route and feature inspection | Low | Keep `Quiz.Edit` bounded in the next milestone |

## Execution Notes
- This milestone is documentation-only and exists because the user wanted the new mission selection and risk round preserved as a history artifact.
- No product tests were run in this milestone; it is inventory and mission-selection work only.

## BRACE Report

### Outcome
- Selected a new repo-wide mission focused on driving the retained Playwright feature inventory to full WTR parity.
- Confirmed that the prior mission-level risk areas carry over substantively because the work remains the same class of migration problem.
- Chose `Quiz.Edit` as the next active implementation slice.

### Coverage Achieved
- Rebuilt the repo-wide inventory after archiving the prior mission.
- Recorded the new mission risk round and overlap-handling rationale in history.
- Left the live plan pointing at a concrete next proof target instead of an abstract repo-wide ambition.

### Evidence Run
- Intent: enumerate the retained Playwright feature inventory
  Command / artifact: `rg --files specs/features | sort`
  Result: retained features still exist under `make/home`, `make/quiz`, `make/workspace`, `take/question`, and `take/quiz`
  Interpretation: repo-wide parity remains open, but the take and question families are already much farther along than the remaining authoring surfaces
- Intent: enumerate the current WTR footprint
  Command / artifact: `rg --files frontend/tests/wtr | sort`
  Result: WTR coverage already exists for `take/*`, `make/question/*`, `Workspace.Create`, `Quiz.CreateNew`, and most quiz-taking flows
  Interpretation: the highest-leverage remaining work is now authoring and workspace interaction
- Intent: resolve ambiguous coverage overlap before selecting the next slice
  Command / artifact: inspect `Quiz.CreateNew`, `Workspace.CreateQuiz`, and the current create-quiz WTR tests
  Result: `Workspace.CreateQuiz.feature` is already substantively covered by the current create-quiz WTR slice, while `Home.feature` remains low-risk with mocked-only coverage
  Interpretation: those surfaces should not block selection of the next higher-value authoring slice
- Intent: verify that `Quiz.Edit` is a bounded first slice
  Command / artifact: inspect `Quiz.Edit.feature`, `quiz-edit-page.tsx`, and `quiz-item.tsx`
  Result: the edit path is already wired from the workspace list into a dedicated quiz-edit route and only needs focused WTR proof
  Interpretation: `Quiz.Edit` is the best first slice because it stays on the quiz-authoring seam and reuses existing create-quiz coverage

### Actual Scope Inventory
- `PLANS.md`
- `history/2026-03-30-full-wtr-parity-mission-selection.md`
- `history/2026-03-30-quiz-edit.md`

If VCS is available, include objective scope evidence:
```text
git diff --name-status
M	PLANS.md

git status --porcelain
 M PLANS.md
?? history/2026-03-30-full-wtr-parity-mission-selection.md
?? history/2026-03-30-prior-migration-mission-final.md
?? history/2026-03-30-quiz-edit.md
```

### Remaining Uncertainty
- `Workspace.feature` remains a broad uncovered family that will need its own bounded sub-slices later.
- `Home.feature` still needs an explicit final closure rule because its current WTR evidence is mocked-only.
- Cheapest next proof: execute the `Quiz.Edit` milestone with targeted mocked/backend proof plus the command-of-record gate.

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Repo-wide parity inventory is current | High / Migration credibility / parity drift | Rebuilt the inventory directly from repo state | Feature and WTR file listings reflect the current repository rather than the archived pinboard | Low | Re-run the inventory after the next family closes |
| Ambiguous overlap is handled deliberately | High / Coverage classification | Inspected overlap around create-quiz and home coverage explicitly | Existing create-quiz WTR tests substantively cover `Workspace.CreateQuiz`, and `Home` is low-risk mocked-only | Medium | Revisit if a later contradiction or missing behavior appears |
| The new mission starts with one bounded proof target | Medium / Scope / sequencing drift | Selected a single next slice and created its active artifact immediately | `Quiz.Edit` has a dedicated route, workspace entry point, and bounded feature contract | Low | Keep the next milestone limited to title and description editing behavior |

## Delta From Plan
- New risks discovered:
  - None.
- Assurances changed:
  - None.
- Scope changes:
  - The milestone selected the next slice and instantiated its active artifact instead of stopping at a mission statement only.
- Decision changes:
  - The new mission is repo-wide full parity, and `Quiz.Edit` is the first active slice under that mission.
  - The mission-level risk areas were carried over substantively rather than replaced with a new default set.

## Reusable Learning / Handoff
- When a migration mission broadens from a closed family frontier to repo-wide parity, run a fresh inventory milestone before naming the next slice.
- Overlap decisions should be recorded explicitly; otherwise, repo-wide parity work accumulates false gaps and false closures at the same time.

## Milestone closeout choice
Choose exactly one and state it explicitly:
- **Continue autonomously** - selected the new mission, recorded the risk round, and instantiated `Quiz.Edit` as the next active milestone.
