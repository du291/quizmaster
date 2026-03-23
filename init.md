Switch to BRACE v2.1 long-horizon mode.

1. Load `AGENTS.md` and `PLANS.md`.
2. Hydrate `PLANS.md` from the current state of the work, the current pinboard, the stated goal, and any referenced history artifacts.
3. Produce a **BRACE Mission** for the current long-horizon work.
4. Ask for Mission approval if it has not yet been approved.
5. After Mission approval, continue autonomously milestone-to-milestone.
6. Use **BRACE Milestone** for milestone plan/report, write each completed milestone report to `history/YYYY-MM-DD-<milestone-slug>.md`, and update `PLANS.md` after each milestone.
7. Package each milestone in a commit whose subject is a one-line summary and whose body references the milestone report path.
8. Use **BRACE Pull**, **System Pull**, or **Environment Pull** only when the corresponding pull condition fires.
9. At the end, produce **BRACE Final**.

Important:
- Do not ask for approval on every milestone.
- Keep the user out of the loop unless a real pull condition fires.
- Record autonomous decisions in milestone history rather than interrupting the user.
- Keep `PLANS.md` milestone history concise; put the full milestone report in `history/`.
