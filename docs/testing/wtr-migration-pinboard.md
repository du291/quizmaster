# WTR Migration Pinboard

Last updated: 2026-03-03

## Accepted decisions (current truth)
- Migration strategy: **Option 2 (incremental)**.
- Legacy Playwright-BDD suite in `specs/` stays intact until parity is reached.
- One repeatable command must run both suites to keep migration outcomes stable.
- WTR uses **system-boundary mocks** for main migration coverage.
- Hybrid approach is used via WTR-only lanes:
  - `test:wtr:mocked` (mocked API boundary)
  - `test:wtr:backend` (real backend via `/api` proxy)
- 1:1 scenario mapping is not required; merged WTR tests are allowed.
- Long-term BDD-style docs are not required; test descriptions in `it(...)` are the documentation.
- Runtime tracking of WTR vs Playwright is mandatory during migration.

## Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on **two headless browsers**: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

## Open decisions / questions
- Which feature groups are next after the current make-flow batch.
- Final CI policy: dual-suite on every PR vs staged/nightly legacy run.
- Final runtime budget checkpoints on the path to sub-5s feedback loops.

## Required evidence before marking migration complete
- WTR suite passes in headless Chromium + Firefox.
- Migrated scenarios are mapped from Playwright features to WTR tests.
- Legacy Playwright suite still passes until migration completion.
- Combined migration command produces repeatable pass/fail outcomes.
- Migration command reports durations for:
  - mocked WTR lane
  - backend WTR lane
  - legacy Playwright lane

## Current migration scope and progress
- `frontend/tests/wtr/mocked/home-page.test.tsx`: migrated from `specs/features/make/Home.feature`.
- `frontend/tests/wtr/mocked/workspace-create.test.tsx`: migrated from `specs/features/make/workspace/Workspace.Create.feature`.
- `frontend/tests/wtr/mocked/question-create-gui.test.tsx`: migrated from `specs/features/make/question/Question.Create.GUI.feature`.
- `frontend/tests/wtr/mocked/quiz-create-new.test.tsx`: migrated from `specs/features/make/quiz/Quiz.CreateNew.feature`.
- `frontend/tests/wtr/backend/*.backend.test.tsx`: real-backend WTR smoke coverage for the same migrated make-flow features.
- `frontend/tests/wtr/support/*`: shared harness, API boundary mock helper, backend setup helpers, fixtures.
- `frontend/web-test-runner.config.mjs`: WTR browser/test infrastructure.
- `scripts/test-migration.sh`: deterministic migration command with duration tracking.
- `scripts/run-backend-wtr-and-playwright.sh`: ordered backend+Playwright execution with per-lane duration/status.
- Root command: `bash ./scripts/test-migration.sh`.
- Latest evidence snapshot (2026-03-03):
  - `bash ./scripts/test-migration.sh` completed with exit code `0`.
  - `wtr_mocked_seconds=11`, `wtr_backend_seconds=12`, `playwright_seconds=284`, `migration_total_seconds=336`.
  - WTR mocked: `7 passed`, `0 failed` (Chromium + Firefox).
  - WTR backend: `3 passed`, `0 failed` (Chromium + Firefox).
  - Playwright: `153 passed`, `2 skipped`.

## Scenario migration inventory
| Playwright feature | WTR status | Notes |
| --- | --- | --- |
| `specs/features/make/Home.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/home-page.test.tsx` |
| `specs/features/make/workspace/Workspace.Create.feature` | Migrated in WTR | mocked + backend smoke coverage |
| `specs/features/make/question/Question.Create.GUI.feature` | Migrated in WTR | mocked + backend smoke coverage |
| `specs/features/make/quiz/Quiz.CreateNew.feature` | Migrated in WTR | mocked + backend smoke coverage |
| Remaining features | Not started | Continue in prioritized batches with legacy suite retained |
