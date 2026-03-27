# BRACE Milestone

Milestone: `Question.Edit.GUI.ShowHideExplanation`
Date: 2026-03-27
Status: completed
Primary mission: Continue the incremental Playwright-BDD to WTR migration while preserving the legacy Playwright suite until parity is proven.
PLANS ref: `PLANS.md`
Commit(s): pending milestone commit
Related pull(s): none
Depends on: `Question.Edit.GUI`, frontier selection closeout

## BRACE Plan Snapshot

### B - Behavior
- Add dedicated mocked and backend WTR coverage for `Question.Edit.GUI.ShowHideExplanation.feature`.
- Prove the edit route shows answer explanation inputs by default when saved explanations exist, hides them when the checkbox is unchecked, and keeps them hidden on load when saved explanations are empty.
- Keep the slice bounded to explanation-visibility behavior without widening into delete-answer or validation semantics.

### R - Risks (top 1-5)
1. High / Slice-level behavior integrity: edit-route explanation visibility is initialized from saved answer explanations, so create-route defaults do not prove the edit contract.
2. Medium / Scope / sequencing drift: the shared question form makes it easy to spill into delete-answer or validation behavior while touching the same DOM.
3. Medium / Harness / gate reliability: the full gate still carries the known low-grade legacy numpad residue even though this slice never exercises keyboard submission.
4. Medium / Environment / external variability: backend proof depends on the current edit fetch path and host-aware wrapper behaving consistently in the local environment.

For each risk, include tier and mission risk-area mapping where possible.

### A - Assurances
- Reuse the existing edit-route loader and question-form helper instead of introducing new production seams.
- Keep assertions feature-local to the answer explanation inputs and the existing `#show-explanation` checkbox.
- Mirror the three legacy scenarios only: visible by default, hidden after toggle, and hidden on load when saved explanations are empty.
- Preserve the established gate protocol: targeted mocked green, targeted backend green, then `bash ./scripts/test-migration.sh`.

### Planned Coverage
- Covered:
  - edit-route explanation inputs visible by default when saved explanations exist
  - edit-route explanation inputs hidden after unchecking `#show-explanation`
  - edit-route explanation inputs hidden on load when saved explanations are empty
  - mocked and backend lanes in Chromium and Firefox
- Not covered:
  - `Question.Edit.GUI.DeleteAnswer`
  - `Question.Edit.GUI.Validations` and `Question.Edit.GUI.Validations.MultipleChoice`
  - Cheapest proof: keep the next slice inside the remaining edit family and reuse the current edit-load contract

### Planned Evidence
- Intent: prove edit-route explanation visibility under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui-show-hide-explanation.test.tsx"`
  Result: green, `3 passed`, `0 failed` in Chromium and Firefox, `5.8s`
  Interpretation: proves the route-level visibility contract independent of backend wiring; does not by itself prove the real edit fetch path
- Intent: prove the same explanation-visibility scenarios against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui-show-hide-explanation.backend.test.tsx\""`
  Result: green, `3 passed`, `0 failed` in Chromium and Firefox, `8.0s` after server startup
  Interpretation: proves the same visibility contract when the question is fetched from the real backend
- Intent: prove the slice against the migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: green end-to-end; mocked WTR `81 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `60 passed`, `0 failed`; `wtr_mocked_seconds=67`; `playwright_seconds=452`; `wtr_backend_seconds=68`; `migration_total_seconds=618`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and no recurrence from the known legacy numpad residue during this gate

### Planned Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui-show-hide-explanation.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui-show-hide-explanation.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-27-question-edit-gui-show-hide-explanation.md`

### Planned Trace

| Behavior | Risk (Tier / Area) | Assurance | Planned Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Saved explanations make the edit form show explanation inputs by default | High / Slice-level behavior integrity | Load a saved question with non-empty explanations in mocked and backend lanes | Targeted mocked/backend show-hide runs | Low once both targeted lanes pass | Re-run the targeted files after future edit-form state changes |
| Unchecking show explanation hides the answer explanation inputs | High / Slice-level behavior integrity | Assert against the existing checkbox and answer-row DOM contract only | Targeted mocked/backend show-hide runs | Low-Medium until both lanes pass | Extend the same DOM assertion style to delete-answer or validations only if needed |
| Saved empty explanations keep answer explanation inputs hidden on load | High / Slice-level behavior integrity | Seed questions with empty answer explanations and assert the initial hidden state | Targeted mocked/backend show-hide runs | Low | Re-run the same scenario if explanation initialization changes later |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Run the command of record after targeted proof | `bash ./scripts/test-migration.sh` | Low-Medium | Apply the numpad recurrence protocol only if a future full gate contradicts this baseline |

## Execution Notes
- No shared helper expansion was needed; direct assertions against `.answer-row input.explanation` and the existing checkbox state were sufficient.
- Browser logs still emit the pre-existing React key warning and SVG property warnings during question-form suites; this milestone did not change that noise profile.

## BRACE Report

### Outcome
- Added dedicated mocked and backend WTR coverage for `Question.Edit.GUI.ShowHideExplanation`.
- Closed the edit-route explanation-visibility slice with targeted greens plus a green full migration gate.

### Coverage Achieved
- Edit-route answer explanation inputs are now proven to be visible by default when saved explanations exist.
- Edit-route answer explanation inputs are now proven to hide when toggled off and to remain hidden on load when saved explanations are empty.

### Evidence Run
- Intent: prove edit-route explanation visibility under deterministic mocked responses
  Command / artifact: `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/question-edit-gui-show-hide-explanation.test.tsx"`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `5.8s`
  Interpretation: strong proof for the edit-route visibility contract without backend variability
- Intent: prove the same explanation-visibility scenarios against the real backend contract
  Command / artifact: `pnpm --dir specs exec start-server-and-test "concurrently \"cd /workspaces/quizmaster/backend && ./gradlew bootRun\" \"cd /workspaces/quizmaster/frontend && pnpm dev\"" "8080|5173" "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_VITE_HOST=127.0.0.1 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/question-edit-gui-show-hide-explanation.backend.test.tsx\""`
  Result: Chromium + Firefox green, `3 passed`, `0 failed`, `8.0s` after server startup
  Interpretation: strong proof for the same visibility contract when the question is loaded through the real backend edit API
- Intent: prove the slice against the current migration acceptance floor
  Command / artifact: `bash ./scripts/test-migration.sh`
  Result: mocked WTR `81 passed`, `0 failed`; Playwright `153 passed`, `2 skipped`; backend WTR `60 passed`, `0 failed`; `wtr_mocked_seconds=67`; `playwright_seconds=452`; `wtr_backend_seconds=68`; `migration_total_seconds=618`; Playwright lane status `passed` in `test-results/.last-run.json`
  Interpretation: strong acceptance evidence for the slice and the known legacy numpad residue did not recur in this run

### Actual Scope Inventory
- `frontend/tests/wtr/mocked/question-edit-gui-show-hide-explanation.test.tsx`
- `frontend/tests/wtr/backend/question-edit-gui-show-hide-explanation.backend.test.tsx`
- `PLANS.md`
- `history/2026-03-27-question-edit-gui.md`
- `history/2026-03-27-question-edit-gui-show-hide-explanation.md`

If VCS is available, include objective scope evidence:

```text
git diff --name-status
M	PLANS.md
M	history/2026-03-27-question-edit-gui.md

git status --porcelain
 M PLANS.md
 M history/2026-03-27-question-edit-gui.md
?? frontend/tests/wtr/backend/question-edit-gui-show-hide-explanation.backend.test.tsx
?? frontend/tests/wtr/mocked/question-edit-gui-show-hide-explanation.test.tsx
?? history/2026-03-27-question-edit-gui-show-hide-explanation.md
```

### Remaining Uncertainty
- The remaining edit-route variants are still open: delete-answer plus the single-choice and multiple-choice validation files.
- Cheapest next proof: keep the next slice inside the edit family, with `Question.Edit.GUI.DeleteAnswer` looking like the cheapest remaining route-local behavior.

### Actual Trace

| Behavior | Risk (Tier / Area) | Assurance | Actual Evidence | Residual risk | Cheapest proof |
|---|---|---|---|---|---|
| Saved explanations make the edit form show explanation inputs by default | High / Slice-level behavior integrity | Loaded a saved question with non-empty explanations in mocked and backend lanes | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the targeted files after future edit-form state changes |
| Unchecking show explanation hides the answer explanation inputs | High / Slice-level behavior integrity | Asserted only against the existing checkbox and answer-row DOM contract | Targeted mocked and backend runs green in Chromium and Firefox | Low | Reuse the same DOM contract for nearby edit-family slices when needed |
| Saved empty explanations keep answer explanation inputs hidden on load | High / Slice-level behavior integrity | Seeded questions with empty answer explanations and asserted the initial hidden state | Targeted mocked and backend runs green in Chromium and Firefox | Low | Re-run the same scenario if explanation initialization changes later |
| Full migration confidence remains intact | Medium / Harness / gate reliability | Ran the command of record after targeted proof | `bash ./scripts/test-migration.sh` green with all three lanes passing | Low-Medium | Apply the existing numpad recurrence protocol only if a later full gate contradicts this baseline |

## Delta From Plan
- New risks discovered:
  - None
- Assurances changed:
  - None
- Scope changes:
  - The implementation stayed entirely in WTR tests plus BRACE artifacts; no production files changed.
  - Corrected the stale committed ref in `history/2026-03-27-question-edit-gui.md` so the previous milestone now matches git history.
- Decision changes:
  - `Question.Edit.GUI.DeleteAnswer` now looks like the cheapest next remaining edit slice before the validation family.

## Reusable Learning / Handoff
- Edit-route show/hide explanation behavior can stay feature-local; direct DOM assertions were enough and no extra WTR helper seam was needed.
- The remaining edit family is naturally splitting into one cheap route-local delete-answer slice and a final validation slice.

## Milestone Closeout Choice

1. **Continue autonomously** - the next slice should likely be `Question.Edit.GUI.DeleteAnswer`, followed by the remaining validation files.
