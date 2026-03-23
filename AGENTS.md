# BRACE v2.1 — Long-Horizon Operating Mode

Goal: keep confidence grounded in controls and evidence rather than line-by-line review, while supporting long-running autonomous work with occasional, well-briefed pulls to the user.

This repository uses:
- `AGENTS.md` for the stable operating mode
- `PLANS.md` for long-horizon state, current truth, milestone route, and handoff
- `history/` for one-file-per-milestone BRACE Milestone reports

If `PLANS.md` exists, load it before substantive work.
If `PLANS.md` does not exist and the task is long-horizon, create/hydrate it from the current request and available artifacts before major action.

---

## Core stance

- Do not "just implement" when the work is non-trivial.
- Prefer evidence over confidence.
- Keep the map small.
- Avoid overclaiming.
- Treat the user like a senior resource to be pulled in when needed, not a metronome for every step.
- In autonomous mode, receipts are for control. Pulls are for collaboration.

---

## BRACE modes

Use the same BRACE spine at different levels.

### 1) BRACE Mission
Use at initial hydration or major mode shift.
Purpose:
- state the primary mission
- frame high-level behavior / risks / route
- define gates and pull conditions
- ask for initial approval

Mission asks for approval.
Do not start long-horizon execution until Mission is approved.

### 2) BRACE Milestone
Use for each milestone / slice during autonomous execution.
Purpose:
- keep the current milestone legible
- state top risks, assurances, evidence, residuals
- support commit-quality history and later synthesis

Milestone does **not** ask for approval by default.
After Mission approval, continue milestone-to-milestone autonomously unless a pull trigger fires.

### 3) BRACE Pull
Use when the work cannot be closed safely without user input.
Purpose:
- stop and escalate a decision, risk, expertise, system, or environment issue
- present evidence, options, recommendation, and exact action needed

Pull must explicitly wait for the user's response.

### 4) BRACE Final
Use at the end of the run.
Purpose:
- summarize what was done
- separate what was explicitly decided through pulls vs what happened autonomously inside milestones
- state evidence of success and remaining unknowns

---

## BRACE spine

All BRACE modes should preserve the same reasoning skeleton.

- **B — Behavior:** what must be true at this scope
- **R — Risks:** top uncertainties, failure modes, or tradeoffs that matter
- **A — Assurances:** controls to prevent or detect those risks
- **C — Coverage:** what is covered vs unproven at this scope
- **E — Evidence:** what checks exist or will be run
- **Residual / cheapest proof:** what is still unproven and the smallest next proof

Keep BRACE small and legible. Focus on top risks only.

---

## Mission contract

BRACE Mission must include:
- primary mission / success outcome
- current operating context
- top behaviors and risks
- initial route or milestone sequence
- validation gate(s)
- pull conditions
- current pinboard
- decisions to approve (if any)

After Mission approval:
- enter autonomous milestone mode
- continue until a pull trigger fires, the user explicitly asks to pause, or the final objective is reached

---

## Milestone contract

BRACE Milestone is the internal control artifact for a milestone or commit-sized slice.

For each milestone:
- state milestone goal / behavior
- state top risks and assurances
- state planned or actual evidence
- state residuals and cheapest next proof
- state expected inventory before work
- state actual inventory after work

Use a readable trace. A table is preferred.

| Behavior | Risk | Assurance | Planned/Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|

Rules:
- max 6–10 rows
- every assurance must point to evidence or be marked **UNPROVEN**
- if actual inventory differs from expected, label it clearly
- include objective scope evidence in milestone reports:
  - `git diff --name-status`
  - `git status --porcelain`

Milestone artifacts may double as detailed history.
Keep them concise but useful enough for later lookup and BRACE Final synthesis.

---

## Pull classes

Only pull the user in when a real boundary is crossed.

### 1) BRACE Pull
For functional / product / risk / expertise / tradeoff questions.
Examples:
- unclear behavior or UX direction
- residual risk too high to accept silently
- contradictory evidence
- multiple viable options with materially different tradeoffs
- user expertise would likely improve the outcome

### 2) System Pull
For repo-local harness / test-system / build-system / workbench design decisions.
Examples:
- flaky test-harness seam
- wrapper vs plugin choice
- gate architecture
- fixture model
- worker isolation strategy

This is still a decision/debate pull, not an environment request.

### 3) Environment Pull
For concrete external blockers that require user or harness action outside the repo.
Examples:
- install a tool/package
- free disk
- provide credentials
- enable a port/service
- adjust sandbox permissions

Environment Pulls should request a concrete action, not a broad redesign.

### Pull format
Use this compact format:
- **Pull class**
- **Context**
- **Facts / evidence**
- **Interpretation** (clearly marked as inference)
- **Top risks / unknowns**
- **Options** (1–3)
- **Recommendation**
- **Decision / advice / action needed**

This is an escalation packet, not a transcript dump.

---

## Pinboard (persistent current truth)

For long-horizon work, `PLANS.md` holds the current pinboard.
Restate the pinboard when resuming or when a pull changes it.

Pinboard fields:
- **Accepted decisions**
- **Constraints**
- **Open decisions / questions**
- **Required evidence**

Rules:
- implementation must match the latest approved pinboard
- if a new plan conflicts with the pinboard, stop and pull
- if accepted decisions need to change, explicitly request re-approval
- after a pull is resolved, update the pinboard in `PLANS.md`

---

## `PLANS.md` usage

`PLANS.md` is the source of truth for long-horizon work.
It should hold:
- primary mission
- current operating context
- current pinboard
- validation gate(s)
- current milestone and upcoming milestones
- current top risks / residuals
- pull log
- milestone journal / handoff notes
- patterns / systemic learnings
- optional references to milestone history artifacts

When resuming:
1. read Mission, current pinboard, gates, current milestone, risks, and the latest journal entries
2. confirm whether the next step is still valid
3. continue autonomously unless a pull trigger fires

After each completed milestone:
1. produce a BRACE Milestone report
2. write the full report to `history/YYYY-MM-DD-<milestone-slug>.md`
3. update `PLANS.md`
4. record learning, residuals, pull outcomes, and next step
5. package the milestone in a commit whose subject is a one-line summary and whose body references the milestone report path
6. continue unless a pull condition fires

---

## Expertise boundary

Use only two modes per area:
- **Autonomous** — proceed with normal BRACE evidence
- **Pull** — stop and escalate when this area materially affects the work

Do not use a separate "Notify" mode during unattended execution.
If a decision does not merit a pull, record it in milestone history and surface it later in BRACE Final if relevant.

---

## Evidence style

- prefer strong evidence (executed checks) over static or inspection-only evidence
- if a claim is not actually proven, mark it **UNPROVEN**
- UI/behavioral claims may require acceptance-style proof; if not available, say so and state the cheapest next proof
- for boundary/wiring/integration changes, include smoke, E2E, golden-output, or equivalent evidence where practical
- if contradictory evidence appears, do not smooth it over; open a pull or RCA loop

---

## Design / architecture decisions

When structure or architecture materially affects a milestone:
- provide 2–3 options
- name the tradeoffs and churn level
- recommend one
- open a pull if the choice changes behavior, blast radius, or future options in a material way

---

## Final contract

BRACE Final should summarize:
- primary mission and whether it was met
- what was explicitly decided through pulls
- what happened autonomously inside milestones
- major evidence of success
- current residuals / unknowns
- recommended next work or follow-up proof

The final should be understandable without rereading the whole transcript.

---

## Simplicity rules

- keep BRACE small and readable
- keep milestone artifacts useful as history, but not bloated
- do not bury evidence in prose
- do not create process theatre for low-risk tasks
- if unsure whether to pull, prefer pulling when the issue changes mission direction, residual risk, repo-local system design, or external environment needs
