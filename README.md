# TripleP Frontend

Next.js App Router frontend for the TripleP task manager. See [AGENTS.md](AGENTS.md) for architecture and contribution rules.

## Getting started

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No backend connection or environment variables are needed for the initial landing page.

## Checks

```sh
npm run check
```

This runs ESLint (including FSD boundaries), TypeScript, Prettier and the production build. `npm run typecheck` generates Next.js route types before checking TypeScript, so it also works on a fresh checkout.

Husky runs lint-staged before commits. PR CI runs the same application checks. Playwright and Vitest are configured; see testing below.

## Structure

- `src/app`: server-rendered routes and layouts.
- `src/shared`: messages, styles and reusable utilities.
- Domain slices and Redux store wiring will be added when features need them.

Installed feature dependencies include Redux Toolkit/RTK Query, React Redux, React Hook Form, Zod, TanStack Table and dnd-kit. API endpoints must use real backend contracts.

Tailwind CSS v4 provides semantic light/dark theme tokens. shadcn uses Radix primitives, with aliases configured in `components.json`; add components under `src/shared/ui`. A theme-switching interface will be added with the application shell.

Work on `FE-Domain-Feature-Implement` or `FE-Domain-Fix` branches; `main` receives changes only through PR merges.

## Testing

This setup contains no product tests. Both runners fail when no matching tests exist. CI explicitly skips empty suites and automatically runs each suite once matching files are committed.

```sh
npm test                         # Vitest, single run
npm run test:watch               # Vitest watch mode
npx playwright install chromium # Install the browser once
npm run build                    # Required before E2E
npm run test:e2e                 # Playwright, Chromium
npm run test:e2e:ui              # Interactive debugging
npm run test:e2e:report          # Open the HTML report
```

Playwright starts and stops a production server at http://127.0.0.1:3100 and never reuses an existing server. CI builds first, installs Chromium with its Linux dependencies, and uploads reports and failure artifacts for seven days. Use isolated test data: traces and screenshots can contain application data. Never commit credentials or saved authentication state.

- e2e/pages/<page>.spec.ts: page-specific scenarios; nested page folders are supported.
- e2e/shared/: reusable interactions and assertions for common UI.
- e2e/fixtures/: shared lifecycle and test-data setup, added as needed.
- src/**/*.test.{ts,tsx}: co-located Vitest tests. React Testing Library, user-event, jest-dom and automatic cleanup are configured.
- test/setup.ts: shared Vitest setup. Explicitly import APIs from vitest; the @/ alias resolves to src/. Use a per-file @vitest-environment node directive for Node-specific logic.

Vitest does not support async Server Components; cover those with Playwright. E2E flows must use actual implemented backend contracts rather than mock services. Follow the repository skill at [.agents/skills/frontend-testing/SKILL.md](.agents/skills/frontend-testing/SKILL.md).
