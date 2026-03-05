# WTR Migration Pinboard

Last updated: 2026-03-05

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
- Which feature groups are next after the current take-flow batch.
- Final CI policy: dual-suite on every PR vs staged/nightly legacy run.
- Final runtime budget checkpoints on the path to sub-5s feedback loops.
- Whether to add a shared fake-clock utility for deterministic timer scenarios.

## Handover snapshot (for next session)
- Latest migration commit: `b7758b08` (`test: migrate timer feature to WTR lanes`).
- Current take-flow migration commits:
  - `a4c590f5` (`test: migrate quiz progress feature to WTR lanes`)
  - `cff5a00d` (`test: migrate quiz score feature to WTR lanes`)
  - `28f49ccb` (`test: migrate partial score feature to WTR lanes`)
  - `b7758b08` (`test: migrate timer feature to WTR lanes`)
- Previous migration baseline commit: `5f698ca5`.
- Current command of record: `bash ./scripts/test-migration.sh`.
- Last validated run status:
  - `test:wtr:mocked` exit code `0` (2026-03-05)
  - `test:wtr:backend` exit code `0` (2026-03-05)
  - `wtr_mocked_exit_code=0`
  - `playwright_exit_code=0`
  - `wtr_backend_exit_code=0`
  - `migration_total_seconds=336`
- Legacy Playwright suite remains unchanged and still required during migration.

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
- `frontend/tests/wtr/mocked/quiz-progress.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Progress.feature`.
- `frontend/tests/wtr/mocked/quiz-score.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Score.feature`.
- `frontend/tests/wtr/mocked/quiz-score-partial.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Score.Partial.feature`.
- `frontend/tests/wtr/mocked/quiz-timer.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Timer.feature`.
- `frontend/tests/wtr/backend/quiz-progress.backend.test.tsx`: real-backend WTR smoke for progress behavior.
- `frontend/tests/wtr/backend/quiz-score.backend.test.tsx`: real-backend WTR smoke for score behavior.
- `frontend/tests/wtr/backend/quiz-score-partial.backend.test.tsx`: real-backend WTR smoke for partial-score behavior.
- `frontend/tests/wtr/backend/quiz-timer.backend.test.tsx`: real-backend WTR smoke for timer-timeout behavior.
- `frontend/tests/wtr/backend/*.backend.test.tsx`: real-backend WTR smoke coverage for the same migrated make-flow features.
- `frontend/tests/wtr/support/*`: shared harness, API boundary mock helper, backend setup helpers, fixtures.
- `frontend/web-test-runner.config.mjs`: WTR browser/test infrastructure.
- `scripts/test-migration.sh`: deterministic migration command with duration tracking.
- `scripts/run-backend-wtr-and-playwright.sh`: ordered backend+Playwright execution with per-lane duration/status.
- Root command: `bash ./scripts/test-migration.sh`.
- Latest evidence snapshot (2026-03-05):
  - `pnpm --dir frontend test:wtr:mocked` completed with exit code `0`.
  - `pnpm --dir frontend test:wtr:backend` completed with exit code `0`.
  - WTR mocked: `23 passed`, `0 failed` (Chromium + Firefox).
  - WTR backend: `8 passed`, `0 failed` (Chromium + Firefox).
  - `bash ./scripts/test-migration.sh` evidence remains from 2026-03-03.

## Scenario migration inventory
| Playwright feature | WTR status | Notes |
| --- | --- | --- |
| `specs/features/make/Home.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/home-page.test.tsx` |
| `specs/features/make/workspace/Workspace.Create.feature` | Migrated in WTR | mocked + backend smoke coverage |
| `specs/features/make/question/Question.Create.GUI.feature` | Migrated in WTR | mocked + backend smoke coverage |
| `specs/features/make/quiz/Quiz.CreateNew.feature` | Migrated in WTR | mocked + backend smoke coverage |
| `specs/features/take/quiz/Quiz.Progress.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/quiz-progress.test.tsx` + backend smoke |
| `specs/features/take/quiz/Quiz.Score.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/quiz-score.test.tsx` + backend smoke |
| `specs/features/take/quiz/Quiz.Score.Partial.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/quiz-score-partial.test.tsx` + backend smoke |
| `specs/features/take/quiz/Quiz.Timer.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/quiz-timer.test.tsx` + backend smoke |
| Remaining features | Not started | Continue in prioritized batches with legacy suite retained |

## Next suggested migration order (high impact)
1. `specs/features/take/quiz/Quiz.Welcome.feature`
2. `specs/features/take/quiz/Quiz.Take.feature`
3. `specs/features/take/quiz/Quiz.Take.Length.feature`
4. `specs/features/take/quiz/Quiz.Bookmarks.feature`

## Expensive/special-case exceptions to plan explicitly
- Screenshot-tagged scenarios (`@screenshot`) in feedback features.
- Timer-sensitive behavior under varying runtime load.
- Timer scenarios currently use short runtime limits (`1s`/`2s`) as a deterministic substitute for long waits.
- Image-specific question rendering cases.
- Clipboard/permission-dependent interactions.
