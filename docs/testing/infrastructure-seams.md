# Infrastructure Seams for Testing

Use this pattern when direct mocks of browser, runtime, or platform APIs would push tests away from real behavior.

The goal is to avoid:
- mock-reality drift: the test double behaves differently from production
- "mock cancer": test-only abstractions and stubs spreading through more of the codebase over time

## When to use it

Prefer an infrastructure seam when the code under test talks to the outside world through:
- time or timers
- browser storage
- clipboard or permissioned browser APIs
- network/API clients
- randomness or generated IDs
- file, image, or other browser/runtime I/O

## Pattern

1. Identify the boundary that touches the external world.
2. Put a production-owned seam in front of that boundary.
3. Provide a real implementation that wraps the real browser/runtime API.
4. Provide a deterministic simulator for tests.
5. Inject the seam at an app boundary, not deep inside each test.
6. Assert system behavior, not seam internals, in feature tests.

## Guardrails

- Own the seam in production code. Do not make tests invent an interface the app does not use.
- Name the seam after the domain behavior when possible. `Clock` is better than `DateNowMock`.
- Keep the interface narrow. Add only the capabilities the app actually needs.
- Make the simulator plausible and deterministic. Reject nonsense input instead of silently allowing it.
- Prefer one shared seam over many local mocks of `Date`, `fetch`, `sessionStorage`, `navigator.clipboard`, or similar globals.
- Add simulator capabilities only when a real scenario needs them.
- If a direct mock really is the cheaper and safer choice, say so explicitly instead of half-adopting this pattern.

## Quizmaster Example: Clock Seam

The current clock wrapper is an example of the broader seam pattern, not the pattern itself.

- [clock.tsx](/workspaces/quizmaster/frontend/src/infrastructure/clock.tsx) defines the production-owned `Clock` seam.
- [app.tsx](/workspaces/quizmaster/frontend/src/app.tsx) injects the seam once through `ClockProvider`.
- [countdown.tsx](/workspaces/quizmaster/frontend/src/pages/take/quiz-take/time-limit/countdown.tsx) consumes the seam for timer behavior.
- [quiz-welcome-page.tsx](/workspaces/quizmaster/frontend/src/pages/take/quiz-take/quiz-welcome/quiz-welcome-page.tsx) and [quiz-take-page.tsx](/workspaces/quizmaster/frontend/src/pages/take/quiz-take/quiz-take-page.tsx) consume the same seam for timestamps.
- [clock.test.tsx](/workspaces/quizmaster/frontend/tests/wtr/mocked/clock.test.tsx) verifies both the real wrapper delegation and simulated behavior.
- [test-harness.tsx](/workspaces/quizmaster/frontend/tests/wtr/support/test-harness.tsx) advances the simulated clock through app-level tests.

The seam works because production code owns both sides:
- `createRealClock()` wraps `Date.now()`, `window.setInterval()`, and `window.clearInterval()`
- `createSimulatedClock()` exposes the same contract with deterministic `advanceBy(...)`
- tests inject the simulator through the app boundary instead of patching global time

## Likely Next Seam Candidates in Quizmaster

- Clipboard behavior in [workspace.tsx](/workspaces/quizmaster/frontend/src/pages/make/workspace/workspace.tsx) and [quiz-item.tsx](/workspaces/quizmaster/frontend/src/pages/make/quiz-create/quiz-item.tsx)
- Browser storage in [quiz-take-page.tsx](/workspaces/quizmaster/frontend/src/pages/take/quiz-take/quiz-take-page.tsx), [stats.ts](/workspaces/quizmaster/frontend/src/api/stats.ts), and [helpers.ts](/workspaces/quizmaster/frontend/src/helpers.ts)
- API boundary helpers in [helpers.ts](/workspaces/quizmaster/frontend/src/api/helpers.ts)
- Random run ID generation in [helpers.ts](/workspaces/quizmaster/frontend/src/helpers.ts)

## Migration Guidance

When a WTR migration candidate touches one of these boundaries, prefer introducing or refining a shared seam over adding more global mocks. The same seam should ideally work in both WTR lanes:
- mocked lane: deterministic simulator or boundary stub
- backend lane: real backend plus the same production seam where relevant

Update this document when a new seam pattern becomes reusable across multiple tests or features.
