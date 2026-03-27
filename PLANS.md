# PLANS.md — BRACE v2.3 Live Control Surface

Purpose: persistent working memory and route for long-horizon work.

This file is the **live control surface**, not the full notebook.
The full body of the active milestone lives in the milestone artifact referenced from here.
Use milestone artifacts in `history/` for detailed BRACE Plan/Report history, pulls handled during a milestone, and milestone-local rationale.

---

## 1) BRACE Mission

### Primary mission
- **Outcome:**
- **Why this matters / target function:**
- **Success metric(s):**
- **Non-goals:**

### Current operating context
- **Work type:** feature / migration / RCA / refactor / other
- **Current phase:**
- **Execution mode:** autonomous milestones after Mission approval
- **Source artifacts used to hydrate this plan:**
  - current request / prompt
  - prior pinboard
  - prior BRACE artifacts
  - repo docs / notes
  - optional work log / blog

### Mission approval state
- **Approved?** yes / no
- **If not, what decision is still needed?**

---

## 2) Mission risk areas

Keep only the 3–7 areas that materially matter for this run.

| Risk area | Default tier | Why it matters | Assurance guidance |
|---|---|---|---|
|  |  |  |  |

Tiers:
- **High** — possible mission failure or loss of credibility
- **Medium** — degradation, detour, or local breakage
- **Low** — annoyance, nuisance, or bounded rework

---

## 3) Expertise / direction preferences

Mark only **Autonomous** or **Pull**.

| Area | Mode | Notes |
|---|---|---|
| Product / UX |  |  |
| Architecture / design |  |  |
| Testing strategy |  |  |
| Debugging / RCA |  |  |
| Security / risk |  |  |
| System / harness design |  |  |
| Environment / external blockers |  |  |

Rule: a pull is required if either tier guidance or expertise preference requires it.

---

## 4) Current pinboard

### Accepted decisions
- 

### Constraints
- 

### Open decisions / questions
- 

### Required evidence before current milestone is done
- 

---

## 5) Validation gate(s)

- **Primary gate command / script:**
- **What must pass after each milestone / session:**
- **Additional targeted checks:**
- **Timing / performance metrics to watch:**

---

## 6) Current milestone header

This section is intentionally compact. The authoritative body for the current milestone lives in the referenced artifact.

- **Milestone ID:**
- **Status:** planned / in_progress / completed / blocked
- **One-line goal:**
- **Exit condition:**
- **Active artifact path:** `history/...md`
- **Expected commit shape:** one or more VCS commits when VCS is available

Before working, read the active artifact referenced here.

---

## 7) Active residuals / live steering risks

Keep only the risks that matter for steering **right now**.
Resolved or milestone-local detail should move to milestone artifacts and journal entries.

| ID | Risk / uncertainty | Tier | Mission risk area | Current handling | Residual | Cheapest next proof | Pull class if escalation needed |
|---|---|---|---|---|---|---|---|
| R1 |  |  |  |  |  |  |  |

---

## 8) Pull log

Use this for actual human-facing interruptions.

| Date/Session | Pull class | Context | Evidence / facts | Decision or action requested | Resolution | Impact on plan |
|---|---|---|---|---|---|---|

Pull classes:
- **BRACE Pull** — functional / risk / expertise / tradeoff
- **System Pull** — repo-local harness / build / test-system design
- **Environment Pull** — external blocker requiring user or harness action

---

## 9) Milestone journal / handoff notes

One short line per milestone closeout or meaningful handoff.
Use milestone artifacts for the full detail.

| Date/Session | Milestone / slice | What changed | Evidence summary | Key learning / decision | Commit / ref |
|---|---|---|---|---|---|

---

## 10) Artifact index

Use this as the deterministic map from live state to milestone detail.

| Artifact kind | ID / Milestone | Path / ref | Why it may matter later |
|---|---|---|---|
| Current milestone |  |  |  |
| Milestone history |  |  |  |
| Milestone history |  |  |  |

---

## 11) Patterns / systemic learnings

Use this for things that should influence future work.
Examples: helper-contract rule, seam pattern, quality-control rule, isolation rule, environment reset rule.

- 

---

## 12) System / environment notes

### Repo-local system / harness notes
- **Known harness constraints or brittle seams:**
- **Known recurring test-system issues:**

### External environment notes
- **Known machine / sandbox / service constraints:**
- **Known cleanup or provisioning needs:**

---

## 13) Upgrade log

Use this when BRACE / PLANS semantics materially change mid-run.

| Date/Session | From version | To version | What still holds | What needed remapping / re-checking | Approval state |
|---|---|---|---|---|---|

---

## 14) Resume protocol

When resuming from this file:
1. read BRACE Mission, mission risk areas, expertise preferences, current pinboard, validation gates, current milestone header, active residuals, and the last 1–3 journal entries
2. read the active milestone artifact referenced in the current milestone header
3. restate the current pinboard and current milestone
4. confirm whether the next step is still valid
5. continue autonomously unless a pull condition fires
6. after milestone closeout, update the current milestone header, active residuals, journal, pull log, and artifact index as needed

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
