# WTR Migration Pinboard

Last updated: 2026-03-08

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
- The next migration batch should include at least one feature that exercises an infrastructure/external-world seam so the seam pattern is used early.
- When a migration step would otherwise hand-craft quiz/question shapes repeatedly, prefer low-churn shared WTR test helpers scoped to that feature step.

## Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on **two headless browsers**: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

## Open decisions / questions
- Which feature groups are next after the current take-flow batch.
- Final CI policy: dual-suite on every PR vs staged/nightly legacy run.
- Final runtime budget checkpoints on the path to sub-5s feedback loops.
- Whether repeated WTR quiz/question fixture duplication should eventually trigger a clean pure-domain extraction beyond shared test-support builders.

## Handover snapshot (for next session)
- Latest migration commit: `bedf33a8` (`test: add shared clock for timer coverage`).
- For seam-heavy migration work, use the `infrastructure-seams` skill and `docs/testing/infrastructure-seams.md`.
- Current take-flow migration commits:
  - `a4c590f5` (`test: migrate quiz progress feature to WTR lanes`)
  - `cff5a00d` (`test: migrate quiz score feature to WTR lanes`)
  - `28f49ccb` (`test: migrate partial score feature to WTR lanes`)
  - `b7758b08` (`test: migrate timer feature to WTR lanes`)
  - `bedf33a8` (`test: add shared clock for timer coverage`)
- Previous migration baseline commit: `5f698ca5`.
- Current command of record: `bash ./scripts/test-migration.sh`.
- Current migration priority after `Quiz.Take`: `Quiz.Welcome` -> `Quiz.Take.Length` -> `Quiz.Bookmarks`.
- Shared fixture note: current low-churn migrations may extend WTR test-support builders/helpers, but production/domain extraction is deferred unless duplication keeps repeating.
- Current handover note: low-churn WTR helper updates in `frontend/tests/wtr/support/fixtures.ts` and `frontend/tests/wtr/support/backend-api.ts` now support the `Quiz.Take` migration without introducing production-domain extraction.
- Fake timer status: quiz-taking flow now uses a production clock wrapper with a simulated clock path for WTR timer tests.
- Last validated run status:
  - `clock.test.tsx` exit code `0` (2026-03-07)
  - targeted `quiz-timer.test.tsx` exit code `0` with `real 7.02s` (2026-03-07, sequential Chromium + Firefox)
  - targeted `quiz-timer.backend.test.tsx` exit code `0` with `real 27.90s` including backend startup (2026-03-07)
  - targeted `quiz-take.test.tsx` exit code `0` (2026-03-08, Chromium + Firefox)
  - targeted `quiz-take.backend.test.tsx` exit code `0` (2026-03-08, Chromium + Firefox)
  - full mocked WTR lane exit code `0` with `30 passed`, `0 failed` (2026-03-08)
  - full backend WTR lane exit code `0` with `10 passed`, `0 failed` (2026-03-08)
  - `bash ./scripts/test-migration.sh` exit code `0` (2026-03-08)
  - `wtr_mocked_exit_code=0`
  - `playwright_exit_code=0`
  - `wtr_backend_exit_code=0`
  - `wtr_mocked_seconds=23`
  - `playwright_seconds=289`
  - `wtr_backend_seconds=22`
  - `migration_total_seconds=361`
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
- `frontend/tests/wtr/support/fixtures.ts`: low-churn question/quiz builders for WTR to reduce ad hoc object-shape drift.
- `frontend/tests/wtr/support/backend-api.ts`: shared backend quiz creator for WTR backend tests.
- `frontend/src/infrastructure/clock.tsx`: production clock wrapper plus simulated clock implementation for WTR timer control.
- `frontend/tests/wtr/mocked/home-page.test.tsx`: migrated from `specs/features/make/Home.feature`.
- `frontend/tests/wtr/mocked/workspace-create.test.tsx`: migrated from `specs/features/make/workspace/Workspace.Create.feature`.
- `frontend/tests/wtr/mocked/question-create-gui.test.tsx`: migrated from `specs/features/make/question/Question.Create.GUI.feature`.
- `frontend/tests/wtr/mocked/quiz-create-new.test.tsx`: migrated from `specs/features/make/quiz/Quiz.CreateNew.feature`.
- `frontend/tests/wtr/mocked/clock.test.tsx`: coverage for real-clock delegation and simulated-clock interval behavior.
- `frontend/tests/wtr/mocked/quiz-progress.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Progress.feature`.
- `frontend/tests/wtr/mocked/quiz-score.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Score.feature`.
- `frontend/tests/wtr/mocked/quiz-score-partial.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Score.Partial.feature`.
- `frontend/tests/wtr/mocked/quiz-take.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Take.feature`.
- `frontend/tests/wtr/mocked/quiz-timer.test.tsx`: migrated from `specs/features/take/quiz/Quiz.Timer.feature`.
- `frontend/tests/wtr/backend/quiz-progress.backend.test.tsx`: real-backend WTR smoke for progress behavior.
- `frontend/tests/wtr/backend/quiz-score.backend.test.tsx`: real-backend WTR smoke for score behavior.
- `frontend/tests/wtr/backend/quiz-score-partial.backend.test.tsx`: real-backend WTR smoke for partial-score behavior.
- `frontend/tests/wtr/backend/quiz-take.backend.test.tsx`: real-backend WTR smoke for `Quiz.Take` exam/learn branching.
- `frontend/tests/wtr/backend/quiz-timer.backend.test.tsx`: real-backend WTR smoke for timer-timeout behavior.
- `frontend/tests/wtr/backend/*.backend.test.tsx`: real-backend WTR smoke coverage for the same migrated make-flow features.
- `frontend/src/pages/take/quiz-take/time-limit/countdown.tsx`: countdown now reads time from the shared clock wrapper.
- `frontend/src/pages/take/quiz-take/quiz-welcome/quiz-welcome-page.tsx`: quiz start stats timestamp now reads from the shared clock wrapper.
- `frontend/src/pages/take/quiz-take/quiz-take-page.tsx`: quiz finish stats timestamp now reads from the shared clock wrapper.
- `frontend/tests/wtr/support/*`: shared harness, API boundary mock helper, backend setup helpers, fixtures, app render clock injection helpers.
- `frontend/web-test-runner.config.mjs`: WTR browser/test infrastructure.
- `scripts/test-migration.sh`: deterministic migration command with duration tracking.
- `scripts/run-backend-wtr-and-playwright.sh`: ordered backend+Playwright execution with per-lane duration/status.
- Root command: `bash ./scripts/test-migration.sh`.
- Latest evidence snapshot (2026-03-08):
  - `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/quiz-take.test.tsx"` completed with exit code `0`.
  - `pnpm --dir specs exec start-server-and-test "cd /workspaces/quizmaster/backend && ./gradlew bootRun" 8080 "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/quiz-take.backend.test.tsx\""` completed with exit code `0`.
  - `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/clock.test.tsx"` completed with exit code `0`.
  - Targeted timer baseline before clock wrapper: mocked `real 28.73s`; backend `real 55.65s` including backend startup.
  - Targeted timer verification after clock wrapper: mocked `real 7.02s`; backend `real 27.90s` including backend startup.
- `pnpm --dir frontend test:wtr:mocked` completed with exit code `0`.
- `pnpm --dir specs exec start-server-and-test "cd /workspaces/quizmaster/backend && ./gradlew bootRun" 8080 "WTR_API_PROXY_TARGET=http://localhost:8080 WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 WTR_TEST_TIMEOUT=20000 pnpm --dir /workspaces/quizmaster/frontend exec web-test-runner --config /workspaces/quizmaster/frontend/web-test-runner.config.mjs --files \"tests/wtr/backend/**/*.test.tsx\""` completed with exit code `0`.
- WTR mocked: `30 passed`, `0 failed` (Chromium + Firefox).
- WTR backend: `10 passed`, `0 failed` (Chromium + Firefox).
- `bash ./scripts/test-migration.sh` completed with exit code `0`, `wtr_mocked_seconds=23`, `playwright_seconds=289`, `wtr_backend_seconds=22`, `migration_total_seconds=361`.
- `WTR_CONCURRENT_BROWSERS=1 WTR_CONCURRENCY=1 pnpm --dir frontend exec web-test-runner --config web-test-runner.config.mjs --files "tests/wtr/mocked/quiz-score-page-warning.test.tsx"` completed with exit code `0` (2026-03-08).
- `bash ./scripts/test-migration.sh` later failed with exit code `1` because the mocked WTR lane hit `frontend/tests/wtr/mocked/quiz-score.test.tsx` flake(s) on Chromium (2026-03-08).
- `pnpm --dir frontend test:wtr:mocked` rerun later also failed with exit code `1` in `frontend/tests/wtr/mocked/quiz-score.test.tsx` on Chromium, while short isolated reruns of that file stayed green (2026-03-08).

## Intermittent flake follow-up (if it reappears)
- Context: an earlier 2026-03-08 full-gate attempt hit an intermittent mocked-lane failure in `frontend/tests/wtr/mocked/quiz-score.test.tsx`, but the rerun passed and the final migration gate was green.
- Follow-up evidence collected on 2026-03-08:
  - A 10-run serial loop of `frontend/tests/wtr/mocked/quiz-score.test.tsx` stayed green in Chromium + Firefox.
  - An opt-in 100-run repro first failed only in Firefox with `SecurityError: The operation is insecure.` after repeated `BrowserRouter` history churn; it did not isolate the original score-page transition.
  - The same 100-run repro passed in Chromium + Firefox after switching the repro harness to `MemoryRouter`, so the browser-history failure was a harness artifact rather than proof of the original flake.
- Current conclusion: the original score-page flake remains **UNPROVEN**, but the full mocked suite is still intermittently failing in `frontend/tests/wtr/mocked/quiz-score.test.tsx` under suite pressure. The earlier `goToScorePage()` / React-state / timeout hypotheses are not supported by current evidence and should not drive future work unless a fresh failure appears.
- Keep as future learning: long repeated WTR navigations through `BrowserRouter` can trigger Firefox history-related `SecurityError` failures in test harnesses before the application path under investigation fails.

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
| `specs/features/take/quiz/Quiz.Take.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/quiz-take.test.tsx` + backend smoke |
| `specs/features/take/quiz/Quiz.Timer.feature` | Migrated in WTR | `frontend/tests/wtr/mocked/quiz-timer.test.tsx` + backend smoke |
| Remaining features | Not started | Continue in prioritized batches with legacy suite retained |

## Next suggested migration order (high impact)
1. `specs/features/take/quiz/Quiz.Welcome.feature`
2. `specs/features/take/quiz/Quiz.Take.Length.feature`
3. `specs/features/take/quiz/Quiz.Bookmarks.feature`

Selection note: choose at least one upcoming feature whose implementation touches time, browser storage, clipboard/permissions, randomness, or another external-world boundary.

## Expensive/special-case exceptions to plan explicitly
- Screenshot-tagged scenarios (`@screenshot`) in feedback features.
- Timer-sensitive behavior under varying runtime load.
- Timer scenarios in WTR now use the simulated clock path; real-time load behavior is still only indirectly covered.
- Image-specific question rendering cases.
- Clipboard/permission-dependent interactions.
