# WTR Migration Pinboard

Last updated: 2026-03-03

## Accepted decisions (current truth)
- Migration strategy: **Option 2 (incremental)**.
- Legacy Playwright-BDD suite in `specs/` stays intact until parity is reached.
- One repeatable command must run both suites to keep migration outcomes stable.

## Constraints
- Keep CI and local developer flow usable during migration.
- Run WTR on **two headless browsers**: Chromium and Firefox.
- Avoid sudden coverage drops while scenarios are moved from Playwright to WTR.

## Open decisions / questions
- Which feature groups are next after Home page scenarios.
- Whether final-state testing remains BDD/feature-file based or moves fully to browser test files.
- Final CI policy: dual-suite on every PR vs staged/nightly legacy run.

## Required evidence before marking migration complete
- WTR suite passes in headless Chromium + Firefox.
- Migrated scenarios are mapped from Playwright features to WTR tests.
- Legacy Playwright suite still passes until migration completion.
- Combined migration command produces repeatable pass/fail outcomes.

## Current migration scope and progress
- `frontend/tests/wtr/home-page.test.tsx`: migrated from `specs/features/make/Home.feature`.
- `frontend/web-test-runner.config.mjs`: WTR browser/test infrastructure.
- `scripts/test-migration.sh`: deterministic dual-suite command.
- Root command: `bash ./scripts/test-migration.sh`.
- Latest evidence snapshot (2026-03-03):
  - `bash ./scripts/test-migration.sh` completed with exit code `0`
  - WTR: `2 passed` on Chromium + Firefox (`3.8s`)
  - Playwright: `153 passed`, `2 skipped` (`4.9m`)

## Scenario migration inventory
| Playwright feature | WTR status | Notes |
| --- | --- | --- |
| `specs/features/make/Home.feature` | Migrated in WTR | Link visibility + cube rotation covered in `frontend/tests/wtr/home-page.test.tsx` |
| Remaining features | Not started | Continue in small batches with legacy suite retained |
