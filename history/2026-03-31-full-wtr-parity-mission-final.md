# BRACE Milestone

Milestone: `Full WTR parity mission BRACE Final`
Date: 2026-03-31
Status: in_progress
Primary mission: Close the repo-wide full-parity mission by summarizing delivered work, separating user-owned decisions from autonomous milestones, and recording the final evidence plus remaining unknowns.
PLANS ref: `PLANS.md`
Commit(s): none
Related pull(s): `2026-03-13`, `2026-03-23`, `2026-03-29`, `2026-03-30` Decision Ownership Pull approvals
Depends on: `2026-03-30-full-wtr-parity-mission-selection`, `2026-03-31-home-browser-proof`

## BRACE Plan Snapshot

### B — Behavior
- Verify that the retained Playwright feature inventory is now fully covered by dedicated WTR slices or explicit overlap decisions already recorded in the live control surface.
- Record a BRACE Final that distinguishes pulled decisions from autonomous milestone execution.
- State the final evidence of success and the remaining unknowns without overstating them.
- Leave `PLANS.md`, the new BRACE Final artifact, and git bookkeeping telling one consistent mission-complete-enough story.

### R — Risks (top 1–5)
1. High / Control-surface consistency: BRACE Final is invalid if the live plan still points at another concrete proof target or if the final scaffold contradicts the active milestone state.
2. High / Migration credibility / parity drift: a repo-wide parity claim can still overreach if any feature family or overlap decision is stale relative to current repo state.
3. Medium / Harness / gate reliability: the latest gates are green, but the host-aware wrapper still lacks fresh-environment proof and must be carried forward honestly as a residual.
4. Medium / Bookkeeping truth: finalization must not strand any closed milestone without a coherent VCS boundary or leave the live surface implying more implementation work.

### A — Assurances
- Ground the final in the current `specs/features` inventory, current WTR test inventory, recorded overlap decisions in `PLANS.md`, and the latest green `bash ./scripts/test-migration.sh` run.
- Treat cross-environment wrapper proof and historical Playwright contradictions as explicit residual unknowns, not hidden blockers or omitted caveats.
- Run a closeout consistency check across `PLANS.md`, the milestone index, the active artifact pointer, and current git status before emitting BRACE Final.

### Planned Coverage
- Covered:
  - mission-level parity closeout for the retained feature inventory
  - final accounting of explicit pull decisions versus autonomous milestone work
  - final residual accounting for harness and environment unknowns
- Not covered:
  - new product or harness implementation
  - fresh-environment proof of the host-aware wrapper
  - Cheapest proof: reconcile the current inventory and the latest green gate into a completed BRACE Final artifact and bookkeeping commit

### Planned Evidence
- Intent: verify the retained Playwright feature inventory at closeout
  Command / artifact: `find specs/features -name '*.feature' | sort`
  Result: pending
  Interpretation: will confirm the final feature inventory against the current repo state
- Intent: verify the current WTR footprint at closeout
  Command / artifact: `find frontend/tests/wtr/mocked frontend/tests/wtr/backend -name '*.test.tsx' | sort`
  Result: pending
  Interpretation: will confirm the explicit WTR footprint used to support the final parity claim
- Intent: verify the overlap decisions that make repo-wide parity coherent
  Command / artifact: `PLANS.md` accepted decisions plus the closed milestone artifacts
  Result: pending
  Interpretation: will confirm that non-`1:1` mappings such as `Workspace.CreateQuiz` and `Workspace.feature` remain explicitly justified
- Intent: verify the latest acceptance-floor evidence at mission closeout
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: pending
  Interpretation: will confirm that the final parity claim sits on the latest green repository baseline

### Planned Scope Inventory
- `PLANS.md`
- `history/2026-03-31-full-wtr-parity-mission-final.md`

### Exit condition
- The final artifact records a coherent repo-wide parity claim with explicit evidence and residuals, `PLANS.md` agrees that the mission is complete enough to close, and the bookkeeping commit leaves no active implementation milestone behind.

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Repo-wide parity claim remains trustworthy at closeout | High / Migration credibility / parity drift | Reconcile the live feature inventory, WTR inventory, and recorded overlap decisions before closing | Inventory listings plus `PLANS.md` accepted decisions | Medium until the final artifact is written | Re-run the inventory queries if new features land later |
| BRACE Final is control-surface coherent | High / Control-surface consistency | Check the current milestone header, active artifact pointer, final scaffold, and git state together before closing | `PLANS.md`, final artifact draft, and `git status` | Low once the bookkeeping commit lands | Re-read the final artifact and live plan together after commit |
| Remaining unknowns are stated honestly without blocking closure unnecessarily | Medium / Harness / gate reliability | Carry wrapper fresh-environment proof and historical contradiction residue into final unknowns explicitly | Latest green gate plus live residuals | Medium | Pursue fresh-environment proof only if a later environment contradicts the local baseline |

## Execution Notes
- This milestone exists because BRACE Final is its own milestone and must have its own artifact and bookkeeping commit.
- No new product behavior is expected here; the work is mission-level verification and final reporting.

## Pulls Handled During This Milestone
- None yet.

## Current State
- What is true right now: `Home.BrowserProof` is closed in substance, the latest command of record is green, and the live inventory suggests repo-wide WTR parity is now complete enough to finalize.
- What remains blocked / incomplete: the BRACE Final artifact has not yet been completed, the final scaffold in `PLANS.md` still needs to be reconciled to mission-complete state, and the bookkeeping commit has not been created.
- Current evidence or hydration notes: the retained feature inventory and WTR footprint were re-read during the home milestone, and the latest gate is green across mocked WTR, retained Playwright, and backend WTR.
- Next action / cheapest proof: reconcile the inventory listings, overlap decisions, and latest green gate into a completed BRACE Final artifact, then commit the final bookkeeping boundary.
