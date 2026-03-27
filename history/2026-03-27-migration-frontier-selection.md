# BRACE Milestone

Milestone: Remaining migration frontier selection after standalone question closure
Date: 2026-03-27
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending
Related pull(s): BRACE v2.3 upgrade approval
Depends on: `Question.Take.Image`, `Question.Take.Explanation`, `Question.Take.Feedback`, `Question.Take.NumPad`, `Question.Take.Feedback.Numerical`, `Question.Take.MultipleChoice.Score`, `Question.Take.EasyMode`

## BRACE Plan Snapshot

### B - Behavior
- Verify that the standalone `Question.Take.*` backlog is fully covered by dedicated mocked and backend WTR files.
- Rebuild the remaining migration inventory from `specs/features/` vs `frontend/tests/wtr/`.
- Select the next non-standalone implementation slice and record why it is the next highest-value frontier under the current acceptance model.

### R - Risks (top 1-5)
1. High / Migration credibility / parity drift: copying the old pinboard forward without rechecking current inventory could misstate what is already proven and what still lacks migration.
2. Medium / Scope / sequencing drift: the next slice could be chosen for convenience instead of coverage value now that the standalone-question map is closed.
3. Medium / Harness / gate reliability: the next implementation slice will still inherit the legacy numpad recurrence risk during the full gate even if the product area is unrelated.
4. Medium / Environment / external variability: the host-aware backend-WTR wrapper remains primarily locally proven until a fresh environment reuses it cleanly.

For each risk, include tier and mission risk-area mapping where possible.

### A - Assurances
- Use direct inventory queries against `specs/features/` and `frontend/tests/wtr/` rather than choosing the next frontier from memory.
- Treat the standalone backlog as closed only because each `Question.Take.*` feature has both mocked and backend WTR counterparts in the repo.
- Keep this milestone documentation-only; do not claim new parity until the subsequent implementation milestone carries targeted mocked/backend greens plus the full gate.
- Preserve the explicit recurrence protocol for future contradictory legacy numpad reds and keep the host-aware wrapper as the accepted backend-WTR baseline.

### Planned Coverage
- Covered:
  - standalone-question backlog closure as the accepted baseline
  - remaining feature groups under `make/`, `take/quiz/`, and other non-standalone areas
  - explicit next-slice rationale in the pinboard and milestone history
- Not covered:
  - implementation of the chosen next slice
  - new targeted mocked/backend execution for a future slice
  - Cheapest proof: run the subsequent implementation milestone with targeted mocked/backend greens plus `bash ./scripts/test-migration.sh`

### Planned Evidence
- Intent: confirm standalone-question backlog closure from current repo state
  Command / artifact: `rg --files specs/features/take/question` and `rg --files frontend/tests/wtr | rg 'question-take'`
  Result: all seven standalone `Question.Take.*` feature files are present under `specs/features/take/question/`, and each has both mocked and backend WTR counterparts in the current repo
  Interpretation: strong evidence that the dedicated standalone backlog is closed; this does not by itself choose the next broader slice
- Intent: enumerate the broader remaining feature inventory
  Command / artifact: `find specs/features -type f | sed 's#^specs/features/##' | sort` plus current WTR mocked/backend inventory listings
  Result: the repo still has broader unmapped areas under `make/` and `take/quiz/` beyond the now-closed standalone question backlog
  Interpretation: the carried-forward next milestone remains valid; the next slice should be chosen from current inventory rather than inferred from the old plan
- Intent: anchor the next step to the committed baseline
  Command / artifact: `git log --oneline --decorate -8` plus `history/2026-03-26-question-take-easy-mode.md`
  Result: the latest accepted product milestone is `7c70d13f`, followed by the documentation-only v2.3 scaffold commit `082579f6`
  Interpretation: the frontier-selection milestone should start from the committed easy-mode closeout, not the older post-feedback baseline

### Planned Scope Inventory
- `PLANS.md`
- `PLANS-old`
- `BOOTSTRAP_PROMPT.md`
- `history/2026-03-27-migration-frontier-selection.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone backlog closure is real | High / Migration credibility / parity drift | Compare current standalone feature inventory directly to mocked/backend WTR files | Current repo inventory queries | Low once the mapping is recorded in the milestone | Re-run the same inventory comparison if new standalone coverage appears later |
| The next frontier is selected deliberately | Medium / Scope / sequencing drift | Rebuild the overall feature inventory before naming the next slice | Inventory listing for `specs/features/` and `frontend/tests/wtr/` | Medium until a concrete next slice is chosen | Document the selected slice with rationale in the pinboard and milestone report |
| Future gate interpretation remains controlled | Medium / Harness / gate reliability | Carry forward the recurrence protocol and wrapper baseline without changing harness policy here | Prior milestone reports plus current residual table | Low-Medium | Apply the protocol again only if the next implementation milestone hits a contradictory full-gate red |

## Execution Notes
- This milestone was instantiated during BRACE v2.3 upgrade hydration rather than after a greenfield planning step.
- Current evidence is limited to repo-state inspection and inventory checks; no new product tests were run in this milestone yet.

## BRACE Report

### Outcome
- The milestone selected `Question.Edit.GUI` as the next non-standalone implementation slice.
- Upgrade hydration and follow-through confirmed that the standalone `Question.Take.*` backlog remains closed in the current repo state and that `make/question` is now the highest-leverage uncovered family.

### Coverage Achieved
- Verified the current standalone-question inventory against the current mocked/backend WTR file set.
- Confirmed that broader remaining work still exists under non-standalone feature groups.
- Chose `Question.Edit.GUI` as the next slice because the entire edit family is still uncovered while reusing the already-proven question-form seam and backend creation helpers.

### Evidence Run
- Intent: verify that the carried-forward next step is still valid during upgrade hydration
  Command / artifact: `rg --files specs/features/take/question`
  Result: seven standalone feature files found: `Question.Take.NumPad`, `Question.Take.Explanation`, `Question.Take.Image`, `Question.Take.MultipleChoice.Score`, `Question.Take.EasyMode`, `Question.Take.Feedback.Numerical`, and `Question.Take.Feedback`
  Interpretation: confirms the current standalone inventory baseline
- Intent: verify that mocked and backend WTR counterparts exist for the standalone backlog
  Command / artifact: `rg --files frontend/tests/wtr | rg 'question-take|take-question|question/|take/'`
  Result: mocked and backend WTR files exist for each standalone `Question.Take.*` feature currently in `specs/features/take/question/`
  Interpretation: strong evidence that the dedicated standalone backlog is closed in the current repo
- Intent: confirm that broader migration inventory still exists beyond the standalone backlog
  Command / artifact: `find specs/features -type f | sed 's#^specs/features/##' | sort`
  Result: additional feature groups remain under `make/` and `take/quiz/`, including edit/validation flows and broader quiz flows
  Interpretation: the next step is still frontier selection rather than another standalone-question implementation slice
- Intent: anchor the milestone to the current committed baseline
  Command / artifact: `git log --oneline --decorate -8`
  Result: `7c70d13f` is the latest product milestone commit, followed by `082579f6` for the BRACE v2.3 scaffold
  Interpretation: the migrated plan should carry forward the easy-mode closeout while selecting the next slice from the current broader inventory
- Intent: choose the next non-standalone implementation slice with explicit rationale
  Command / artifact: current repo inventory plus inspection of `frontend/tests/wtr/mocked/question-create-gui.test.tsx`, `frontend/tests/wtr/backend/question-create-gui.backend.test.tsx`, and `specs/features/make/question/*.feature`
  Result: `make/question` contains the largest coherent uncovered family; `Question.Edit.GUI.feature` is the best first slice because it covers prepopulation, persistence, and single-to-multiple-choice behavior on top of the already-proven question form
  Interpretation: `Question.Edit.GUI` is the next highest-value slice and can stay feature-local without widening the harness or production seams

### Actual Scope Inventory
- `PLANS.md`
- `history/2026-03-27-migration-frontier-selection.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md

git status --porcelain
 M PLANS.md
?? history/2026-03-27-migration-frontier-selection.md
```

### Remaining Uncertainty
- The broader `Question.Edit.*` validation, delete-answer, and show-hide-explanation variants remain after the initial `Question.Edit.GUI` slice.
- Cheapest next proof: execute the `Question.Edit.GUI` implementation milestone with targeted mocked/backend proof plus the full migration gate.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Standalone backlog closure is real | High / Migration credibility / parity drift | Compared current standalone feature inventory directly to mocked/backend WTR files | Current repo inventory queries showed a mocked and backend WTR counterpart for each standalone feature | Low | Re-run the same comparison if new standalone feature files appear later |
| The next frontier still needs deliberate selection | Medium / Scope / sequencing drift | Enumerated the broader repo inventory before carrying the milestone forward | `specs/features/` still contains non-standalone `make/` and `take/quiz/` work beyond the closed standalone backlog | Low | Re-run the broader mapping only if new WTR files or feature files materially change the current frontier map |
| `Question.Edit.GUI` is the first non-standalone slice | Medium / Scope / sequencing drift | Selected the slice with explicit leverage-based rationale | The uncovered `make/question` edit family reuses the proven question-form seam and existing backend creation helpers | Medium | Keep the implementation bounded to the core `Question.Edit.GUI.feature` behaviors in the next milestone |
| No new gate claims were made during hydration | Medium / Harness / gate reliability | Limited this milestone to repo-state inspection and documentation updates | No product tests were run; the plan explicitly carries forward the existing recurrence protocol and wrapper baseline instead of reinterpreting them | Low-Medium | Run targeted plus full-gate evidence only in the subsequent implementation milestone |

## Delta From Plan
- New risks discovered:
  - None
- Assurances changed:
  - None
- Scope changes:
  - The milestone now closes with a concrete next slice rather than remaining blocked on selection.
- Decision changes:
  - The next implementation milestone is `Question.Edit.GUI`, not another standalone question slice and not a broader make/quiz tranche.

## Reusable Learning / Handoff
- Do not carry forward a next-slice assumption from an older pinboard after a tranche closes; re-check the current repo inventory first.
- Once a backlog is closed, the right next milestone is often inventory remapping rather than another implementation slice.

## Milestone Closeout Choice

1. **Continue autonomously** - instantiated the `Question.Edit.GUI` implementation milestone and continued.
