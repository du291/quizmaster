# BRACE Milestone

Milestone: `<short id / name>`
Date: `<YYYY-MM-DD>`
Status: `pending | in_progress | blocked | completed | failed | abandoned`
Primary mission: `<one line>`
PLANS ref: `<PLANS.md section / anchor / line>`
Commit(s): `<hashes | packaging milestone | pending milestone commit | none>`
Related pull(s): `<none | refs>`
Depends on: `<prior milestones or none>`

## BRACE Plan Snapshot

### B — Behavior
- 
- 

### R — Risks (top 1–5)
1. `<Tier / Risk area>: ...`
2. 
3. 

### A — Assurances
- 
- 
- 

### Planned Coverage
- Covered:
  - 
- Not covered:
  - 
  - Cheapest proof: 

### Planned Evidence
- Intent:
  Command / artifact:
  Result:
  Interpretation:
- Intent:
  Command / artifact:
  Result:
  Interpretation:

### Planned Scope Inventory
- 
- 

### Exit condition
- 

### Planned Trace
| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| | | | | | |

## Execution Notes
- 
- 

## Pulls Handled During This Milestone
### Pull 1
- Type: `Decision Ownership Pull | Evidence Pull | Capability Pull`
- Area tag(s): `<product | risk | testing | debugging | system/harness | environment | security | ...>`
- Trigger:
- Question / decision / evidence / capability needed:
- Resolution:
- Impact on milestone:

## Current State
Use this section when status is `pending`, `in_progress`, or `blocked`.
- What is true right now:
- What remains blocked / incomplete:
- Current evidence or hydration notes:
- Next action / cheapest proof:

## BRACE Report
Use this section when status is `completed`, `failed`, or `abandoned`.

### Outcome
- 
- 

### Coverage Achieved
- 
- 

### Evidence Run
- Intent:
  Command / artifact:
  Result:
  Interpretation:
- Intent:
  Command / artifact:
  Result:
  Interpretation:

### Actual Scope Inventory
- 
- 

If VCS is available, include objective scope evidence:
```text
git diff --name-status

git status --porcelain
```

### Remaining Uncertainty
- 
- Cheapest next proof: 

### Actual Trace
| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| | | | | | |

## Delta From Plan
- New risks discovered:
  - 
- Assurances changed:
  - 
- Scope changes:
  - 
- Decision changes:
  - 

## Reusable Learning / Handoff
- 
- 

## Milestone closeout choice
Choose exactly one and state it explicitly:
- **Continue autonomously**
- **Emit a Pull**
- **Emit BRACE Final**

Before choosing, run the closeout consistency check.
If choosing **Continue autonomously**, complete the state transition:
- mark current milestone closed
- create the bookkeeping boundary: milestone commit, explicit packaging milestone, or Pull
- instantiate/select next active milestone
- update `PLANS.md`
- repair stale bookkeeping
- re-seed the tool-facing plan with the next concrete proof target
