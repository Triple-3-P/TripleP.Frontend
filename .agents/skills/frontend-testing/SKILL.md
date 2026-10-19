---
name: frontend-testing
description: Add or maintain TripleP frontend Playwright E2E tests and Vitest unit or component tests. Use for browser flows, page coverage, shared test fixtures, and test failures in this repository.
---

# Frontend testing

Read repository AGENTS.md and the relevant page implementation before choosing assertions. Consult README.md for commands and the current suite status.

## Choose the test layer

- Use Playwright for browser navigation, complete user flows, and async Server Components. Run against the production build.
- Use Vitest with React Testing Library for synchronous components and isolated logic. Co-locate `*.test.ts` or `*.test.tsx` with the source. Explicitly import Vitest APIs; jest-dom matchers and cleanup are already configured.
- Keep E2E tests in `e2e/pages/<page>.spec.ts`; group a large page's scenarios under a page directory. Keep reusable UI interactions and assertions in `e2e/shared`, and lifecycle, authentication, or test-data setup in `e2e/fixtures`. Extract common behavior when actually reused; do not import one page's spec into another.

## Write reliable scenarios

Assert observable outcomes of real implemented behavior. Prefer accessible role, label, and text locators, Playwright's auto-waiting assertions, and user-event for component interactions. Avoid arbitrary sleeps, brittle CSS selectors, and assertions about internal implementation.

Keep scenarios independent with fresh contexts and isolated data. Use actual backend contracts and supported setup/cleanup APIs for backend flows; inspect the backend remote first as required by AGENTS.md. Do not invent endpoints, simulate unavailable product flows, or add mock backend services. Keep credentials and saved authentication state out of Git and reports.

Use fixtures for resource teardown even on failure. Do not add retries or weaken assertions to hide a failure. Preserve existing Chromium CI coverage unless the task requests a browser change.

## Validate

Run the affected Vitest file with `npm test -- <path>`. Run E2E with `npm run build`, install Chromium with `npx playwright install chromium`, then `npm run test:e2e -- <page>.spec.ts`. Use `npm run test:e2e:ui` for debugging and `npm run test:e2e:report` for the HTML report.

Run required repository checks. Report executed tests separately from skipped or absent coverage. This initial setup contains no committed tests: commands intentionally fail on empty suites, while CI explicitly skips a suite until a matching test file exists. Never enable pass-with-no-tests or add placeholder tests just to make CI green.
