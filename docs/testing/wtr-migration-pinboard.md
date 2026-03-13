# WTR Migration Pinboard

Last updated: 2026-03-13

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
- Helper harmonization may proceed in ranked slices; the highest-risk score/partial/timer tranche has now been realigned before choosing the next slice.

## Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on **two headless browsers**: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.
- Do not modify legacy Playwright tests during migration.

## Lessons Learned / Quality Control
- Principle:
  - Scenario parity belongs in scenario descriptions.
  - Scenario robustness belongs in helper contracts.
  - When a WTR helper crosses question, navigation, timeout, storage, or evaluation boundaries, it must prove the active identity/state before acting instead of inferring progress from loose timing or generic DOM change.
- Risk this addresses:
  - Prevent helper-level race conditions that can produce false failures, false passes, or mutation-prone recovery paths under suite pressure or browser differences.
  - Reduce helper diversity without rationale, which increases future churn and makes migration mistakes more likely.
- Current QC direction:
  - Keep re-aligning the remaining outlier helpers to this pattern before more migration batches add further helper diversity.
  - The highest-risk score/partial/timer tranche now shares explicit question-identity and score-transition proof through `frontend/tests/wtr/support/quiz-flow.ts`.
  - The ranked set below is the current remaining risk order for review.
  - Treat persistent backend test-state accumulation as an environment-risk check during RCA: if full-suite backend or legacy-browser flakes appear after many runs, reset the local Postgres DB before concluding the failure is code-level or tool-interference.
- Current ranked outlier helper set:
  1. `frontend/tests/wtr/mocked/quiz-take.test.tsx` and `frontend/tests/wtr/backend/quiz-take.backend.test.tsx`: answer helpers are still thin and mostly rely on downstream assertions rather than proving active-question identity before acting.
  2. `frontend/tests/wtr/mocked/quiz-progress.test.tsx` and `frontend/tests/wtr/backend/quiz-progress.backend.test.tsx`: scenario assertions still carry most of the robustness burden; helper contracts remain thinner than the newer shared pattern.
  3. `frontend/tests/wtr/mocked/quiz-timer.test.tsx` and `frontend/tests/wtr/backend/quiz-timer.backend.test.tsx`: now use explicit question identity before answer/timeout steps, but stronger timer-specific proof obligations remain a separate later investigation.

## Open decisions / questions
- Whether to finish take/progress helper harmonization before starting `Quiz.Welcome`, or carry the remaining helper residuals forward explicitly.
- Final CI policy: dual-suite on every PR vs staged/nightly legacy run.
- Final runtime budget checkpoints on the path to sub-5s feedback loops.
- Whether repeated WTR quiz/question fixture duplication should eventually trigger a clean pure-domain extraction beyond shared test-support builders.
- Whether timer-related WTR helpers need stronger proof obligations than the current score-family contract; save this for a later, separate investigation.
- Whether WTR backend tests or legacy Playwright need explicit database cleanup / fresh-db discipline so persistent local Postgres state does not reintroduce suite-pressure flakes.

## Handover snapshot (for next session)
- Latest migration commit: `da6e58ae` (`test: harden WTR score and timer helpers`).
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
- Current handover note: low-churn WTR helper updates in `frontend/tests/wtr/support/fixtures.ts`, `frontend/tests/wtr/support/backend-api.ts`, and `frontend/tests/wtr/support/quiz-flow.ts` now support the `Quiz.Take`, score-backend, partial-score, and timer helper contracts without introducing production-domain extraction; the highest-risk helper tranche landed in `da6e58ae`.
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
  - targeted `quiz-score.test.tsx` exit code `0` after the chosen helper fix (2026-03-09, Chromium + Firefox)
  - full mocked WTR lane exit code `0` with `31 passed`, `0 failed` (2026-03-09)
  - full backend WTR lane exit code `0` with `10 passed`, `0 failed` (2026-03-09)
  - legacy Playwright `Quiz.Score.feature` loop `3/3` green (`9 passed`, `1 skipped` each run) (2026-03-09)
  - `bash ./scripts/test-migration.sh` exit code `0` (2026-03-09)
  - `wtr_mocked_exit_code=0`
  - `playwright_exit_code=0`
  - `wtr_backend_exit_code=0`
  - `wtr_mocked_seconds=27`
  - `playwright_seconds=302`
  - `wtr_backend_seconds=25`
  - `migration_total_seconds=387`
  - targeted `quiz-score-partial.test.tsx` exit code `0` with `6 passed`, `0 failed` (2026-03-13, Chromium + Firefox)
  - targeted `quiz-timer.test.tsx` exit code `0` with `3 passed`, `0 failed` (2026-03-13, Chromium + Firefox)
  - targeted `quiz-score.backend.test.tsx` exit code `0` with `1 passed`, `0 failed` (2026-03-13, Chromium + Firefox)
  - targeted `quiz-score-partial.backend.test.tsx` exit code `0` with `1 passed`, `0 failed` (2026-03-13, Chromium + Firefox)
  - targeted `quiz-timer.backend.test.tsx` exit code `0` with `1 passed`, `0 failed` (2026-03-13, Chromium + Firefox)
  - mocked `quiz-score-partial.test.tsx` loop `5/5` green (2026-03-13)
  - legacy Playwright lane exit code `0` with `153 passed`, `2 skipped` (2026-03-13)
  - full mocked WTR lane exit code `0` with `31 passed`, `0 failed` (2026-03-13)
  - full backend WTR lane exit code `0` with `10 passed`, `0 failed` (2026-03-13)
  - `bash ./scripts/test-migration.sh` exit code `0` with `wtr_mocked_seconds=28`, `playwright_seconds=298`, `wtr_backend_seconds=23`, `migration_total_seconds=378` (2026-03-13)
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
- `frontend/tests/wtr/support/quiz-flow.ts`: shared explicit question-identity, submit-readiness, and score-transition helper for the hardened score-backend, partial-score, and timer WTR lanes.
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
- `bash ./scripts/test-migration.sh` later failed with exit code `1` in `specs/features/make/workspace/Workspace.feature.spec.js` after prolonged local test use, while isolated reruns of the same scenario/spec stayed green; after resetting the local `quizmaster` Postgres DB and rebuilding schema, the same full migration command completed with exit code `0` (`wtr_mocked_seconds=32`, `playwright_seconds=325`, `wtr_backend_seconds=27`, `migration_total_seconds=417`) on 2026-03-10.
- 2026-03-13 helper-harmonization tranche:
  - `frontend/tests/wtr/backend/quiz-score.backend.test.tsx` now uses explicit question identity and score-transition proof instead of position-change inference plus a recovery answer click.
  - `frontend/tests/wtr/mocked/quiz-score-partial.test.tsx` and `frontend/tests/wtr/backend/quiz-score-partial.backend.test.tsx` now use the shared helper to prove final-question identity before answering and before opening results.
  - `frontend/tests/wtr/mocked/quiz-timer.test.tsx` and `frontend/tests/wtr/backend/quiz-timer.backend.test.tsx` now prove question identity before answer/timeout actions; deeper timer-proof obligations remain open separately.

## Resolved flake investigation
- Context: an earlier 2026-03-08 full-gate attempt hit an intermittent mocked-lane failure in `frontend/tests/wtr/mocked/quiz-score.test.tsx`, but the rerun passed and the final migration gate was green.
- Follow-up evidence collected on 2026-03-08:
  - A 10-run serial loop of `frontend/tests/wtr/mocked/quiz-score.test.tsx` stayed green in Chromium + Firefox.
  - An opt-in 100-run repro first failed only in Firefox with `SecurityError: The operation is insecure.` after repeated `BrowserRouter` history churn; it did not isolate the original score-page transition.
  - The same 100-run repro passed in Chromium + Firefox after switching the repro harness to `MemoryRouter`, so the browser-history failure was a harness artifact rather than proof of the original flake.
- Additional follow-up evidence collected on 2026-03-08 with local-only instrumentation in `frontend/tests/wtr/mocked/quiz-score.test.tsx`:
  - A 10-run loop of `pnpm --dir frontend test:wtr:mocked` failed `7/10` times and passed `3/10` times.
  - The instrumented isolated file still passed when run alone, so the stronger repro is at suite level, not single-file level.
  - For `evaluates score for 3 correct and 1 incorrect`, some failing runs had `sessionStorage.quizAnswers.finalAnswers=[[0],[0],[0],[0]]` and the score page already showed `4/4`, `100%` at elapsed `0ms`.
  - For `evaluates score for 0 correct and 4 incorrect`, some failing runs had `sessionStorage.quizAnswers.finalAnswers=[[1],[1],[1],[0]]` and the score page already showed `1/4`, `25%` at elapsed `0ms`.
  - For the score-details scenario, the test selected `Blue` for the sky question, but the failing score page immediately showed `Red`; extra frame sampling did not converge to `Blue`, and the stored state was already wrong (`firstAnswers=[[1],[0]]`, `finalAnswers=[[0],[0]]`).
- Additional follow-up evidence collected on 2026-03-09 after removing the `goToScorePage()` fallback that clicked the first answer:
  - An isolated rerun of `frontend/tests/wtr/mocked/quiz-score.test.tsx` failed on Firefox with `Score page transition never exposed #evaluate or #results`.
  - A fresh 10-run `pnpm --dir frontend test:wtr:mocked` loop failed on run `1/10` with the same transition error in `frontend/tests/wtr/mocked/quiz-score.test.tsx`.
  - In the new failure snapshot, the test was still on pathname `/quiz/3101/questions/3`, `#question` was `Question 4`, `hasEvaluateButton=false`, `hasResults=false`, `hasSubmitButton=true`, `submitButtonDisabled=true`, and `sessionStorage.quizAnswers` was still `null`.
  - Interpretation: with the unsafe answer-click fallback removed, the remaining repro is no longer a wrong-score-page mutation at the first observed sample. The app is instead getting stuck before evaluation, with the last question still live and no persisted quiz answers.
- Additional follow-up evidence collected on 2026-03-09 after instrumenting the last-question answer/submit path:
  - A 10-run isolated loop of `frontend/tests/wtr/mocked/quiz-score.test.tsx` failed within the first 3 runs on Firefox.
  - In the failing trace for `evaluates score for 4 correct and 0 incorrect`, the helper label `sequence-last-question-3` started on pathname `/quiz/3101/questions/2` with `#question="Question 3"`, not Question 4.
  - The recorded click correctly checked `Correct 3` and enabled submit for Question 3.
  - After submit returned, the route advanced to `/quiz/3101/questions/3`; one extra frame later the UI rendered `Question 4` with `submitButtonDisabled=true`, no checked answers, no `#evaluate`, no `#results`, and `sessionStorage.quizAnswers` still `null`.
  - `goToScorePage()` then started from that unanswered Question 4 state and timed out waiting for evaluation UI.
- Comparison experiments completed on 2026-03-09 from the same pre-experiment baseline in `frontend/tests/wtr/mocked/quiz-score.test.tsx`:
  - Tighten variant: keep position-based answering, but wait for the expected question route/prompt/input ownership before each answer step. Results: isolated loop `10/10` green, mocked-suite loop `5/5` green.
  - Redesign variant: wait for the expected question, scope to `#question-form`, and select by answer label text instead of global position. Results: isolated loop `10/10` green, mocked-suite loop `5/5` green.
  - Churn comparison against the pre-experiment investigation baseline:
    - Tighten variant diff: `38 insertions`, `9 deletions`
    - Redesign variant diff: `57 insertions`, `22 deletions`
  - Decision: keep the tighten variant because it matched the redesign on observed stability while changing less code.
- Resolved cause:
  - The mocked score flake was primarily a WTR helper sequencing problem, not a proven production scoring bug.
  - Under Firefox pressure, `answerQuizSequence()` could begin its nominal final answer step while the app was still on the previous question.
  - That left the real last question unanswered, so `goToScorePage()` started waiting for `#evaluate` / `#results` one question too early.
  - An earlier fallback in `goToScorePage()` that clicked the first answer was also unsafe and was removed during the investigation.
- Chosen fix:
  - Keep the lower-churn tighten variant in `frontend/tests/wtr/mocked/quiz-score.test.tsx`.
  - The helper now waits for the expected question route, prompt, and input ownership before each answer step.
  - In the comparison run on 2026-03-09, both tighten and redesign variants were stable in sampled loops, and tighten won on smaller diff size.
- Post-fix status:
  - `frontend/tests/wtr/mocked/quiz-score.test.tsx` passed isolated Chromium + Firefox reruns.
  - The mocked WTR suite passed `5/5` sampled reruns after the chosen fix.
  - `bash ./scripts/test-migration.sh` passed on 2026-03-09 with mocked WTR, backend WTR, and legacy Playwright lanes green.
- Remaining helper harmonization work is tracked in `Lessons Learned / Quality Control`.
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
