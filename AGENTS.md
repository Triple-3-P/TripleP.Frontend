# AGENTS.md — Task Manager Frontend

## 0. Purpose and working agreement

This project is a Jira/ClickUp-like task manager. Build maintainable, accessible, testable features rather than demo-quality prototypes.

- Follow existing repository conventions and inspect nearby implementations before writing code.
- Make the smallest coherent change. Do not perform unrelated refactors.
- Before a substantial change, summarize the approach and affected layers.
- Never invent backend contracts, environment variables, routes, permissions, or product requirements. Fetch the backend repository updates and inspect its actual contracts before integration. Do not use mocks or invented contracts. If a contract is missing, report the blocker and continue independent work.
- Prefer clear, boring implementations to clever abstractions. No premature generic frameworks.
- Avoid new dependencies unless justified; prefer the installed stack.
- Keep source code identifiers and code comments in English; product UI copy must be localizable.
- After changes, report what changed, which checks ran, and any limitations.

## 1. Technology stack

- Next.js App Router and React; use versions already pinned in `package.json`.
- TypeScript with strict compiler settings.
- Redux Toolkit for globally shared mutable client state.
- RTK Query for remote data and mutations.
- shadcn/ui (Radix primitives) and Tailwind CSS v4 with semantic CSS variables. CSS Modules are allowed for complex isolated styling; do not add runtime CSS-in-JS by default.
- React Hook Form + Zod for forms and boundary validation.
- TanStack Table for advanced task tables; dnd-kit for drag-and-drop.
- Use Playwright for browser E2E tests and Vitest with React Testing Library for unit and component tests.
- ESLint flat config, Prettier, npm, Husky, lint-staged.

## 2. Architecture and dependency direction

Use pragmatic Feature-Sliced Design:

```text
src/
  app/                    # Next.js routes, layouts, route handlers and providers only
  widgets/                # composed UI sections (kanban-board, app-sidebar, task-list)
  features/               # user actions (create-task, move-task, assign-task)
  entities/               # domain concepts (task, project, workspace, user, board)
  shared/                 # reusable UI primitives, API base, config, utilities, styles
  store/                  # Redux store factory, typed hooks and provider
```

- Dependency direction: `app → widgets → features → entities → shared`.
- A layer must not import from a higher layer.
- Slices within the same layer must not import one another directly. Compose them in an upper layer; extract shared contracts to a lower layer when warranted.
- `store/` is infrastructure for Redux wiring, not a place for domain-specific feature logic. Feature reducers live with their owning slices.
- Prefer slice public APIs (`index.ts`) for cross-slice imports. Keep internal implementation private. Avoid giant barrel files and circular imports.
- `app/` contains routing/composition, not business logic. Keep `page.tsx` and `layout.tsx` thin.
- Do not create empty layers/directories solely to satisfy a template. Introduce abstraction when a real use case needs it.

### Suggested initial domains

- Entities: `task`, `project`, `workspace`, `board`, `user`, `comment`, `label`.
- Features: `create-task`, `edit-task`, `move-task`, `assign-task`, `filter-tasks`, `create-project`.
- Widgets: `kanban-board`, `task-list`, `task-details-panel`, `project-sidebar`, `project-header`.

### Naming and module boundaries

- Use kebab-case for file and directory names, including React components (`task-card.tsx`), hooks (`use-task-filters.ts`), and other modules (`task-slice.ts`). Preserve filenames required by frameworks or tools, such as `page.tsx`, `layout.tsx`, `AGENTS.md`, and `README.md`.
- Use PascalCase for React component identifiers and descriptive camelCase for hooks, functions, and slice identifiers. Filename casing does not change code identifier conventions.
- Use named exports by default; use default exports only when required by Next.js conventions.
- Co-locate feature tests, validators, selectors, API endpoints and components with their slice.
- Keep loading skeleton components in separate co-located files (for example, `account-controls-skeleton.tsx`); render them from the owning component instead of inlining skeleton markup.
- Do not add a generic `utils.ts` or `types.ts` dumping ground for domain code.
- Prefer `@/` aliases for cross-slice imports and relative paths within a slice.

## 3. Next.js and React

- Server Components by default. Add `'use client'` only at interactive boundaries requiring hooks, context, events or browser APIs.
- Do not turn the root layout or entire route tree into Client Components merely for convenience.
- Avoid importing server-only modules into client code. Never expose secrets or privileged server-side credentials to browser bundles.
- Authorization must be enforced by the backend/server; hiding UI actions is not access control.
- Provide `loading.tsx`, `error.tsx` and `not-found.tsx` where they materially improve UX.
- Use Next.js navigation APIs and typed route parameters; validate untrusted IDs and parameters at boundaries.
- Treat URL search params as the source of truth for shareable task filters, sorting, pagination and active views.
- Avoid unnecessary `useEffect`; derive state and use event handlers when possible.
- Avoid `useMemo`/`useCallback` without a concrete reason or profiling evidence.

## 4. State management and RTK Query

- Use RTK Query as the authoritative client cache for fetched entities. Do not duplicate server collections into regular Redux slices.
- Use Redux Toolkit slices only for shared mutable UI/workflow state that cannot live locally or in the URL.
- Use component state for transient interactions; React Hook Form for form state.
- Create a fresh Redux store with a `makeStore` factory; do not use a module-level singleton server store in Next.js App Router.
- Mount Redux Provider in a Client Component at the narrowest appropriate boundary. Do not use Redux hooks in React Server Components.
- Define one base API (`createApi`) per backend/base URL by default, and inject endpoints from domain slices as needed; avoid a separate `createApi` for every feature.
- Centralize base URL, authentication headers and retry/error normalization in the shared API layer.
- Endpoint definitions, cache tag types, queries and mutations should be typed. Prefer generated backend contract types when available; validate untrusted responses with Zod at appropriate boundaries.
- Define a coherent tag invalidation strategy. Use targeted optimistic updates (`onQueryStarted`) for fast user interactions when rollback is reliable.
- Treat pagination, cursor handling, filtering, sorting and stale response handling explicitly.
- Never blindly overwrite the full task cache after a drag-and-drop operation.
- Do not store non-serializable objects in Redux except where explicitly supported and justified.
- Backend data loading through RSC and RTK Query client caching must have a deliberate ownership boundary to prevent redundant requests and contradictory caches. Do not assume server-side RTK Query hydration is automatic.

## 5. Domain modeling

- Model identity and ownership explicitly: workspace → project → board/task; use stable IDs, not names, as keys.
- Model task lifecycle using explicit statuses and transitions; avoid free-form magic status strings.
- Separate task entities from view-specific column/card UI models.
- Permissions are domain data, not scattered `isAdmin` checks.
- Support empty, loading, error, and partial-success states for every data-driven UI.
- Preserve task ordering and handle concurrent updates. Optimistic reordering must be reversible on API failure.
- Handle timestamps and timezones consistently, using backend contract semantics.
- Design for accessibility and keyboard-driven task operations from the beginning.

## 6. Styling, design system and accessibility

- Use shadcn/ui components as the default base; extend project-local components instead of copy-pasting slight variations everywhere.
- Use Tailwind v4 plus semantic design tokens (CSS variables) for colors, spacing and themes. Avoid hardcoded colors or arbitrary pixel values when a token exists.
- CSS Modules are permitted for isolated complex visuals; do not mix multiple competing styling systems without justification.
- Keep custom components keyboard accessible, with visible focus, accessible names and correct semantic HTML.
- Dialogs, dropdowns, sortable lists and keyboard shortcuts must work without a mouse where practical.
- Respect reduced-motion preferences and ensure usable contrast.
- Avoid layout shifts, excessive re-renders and rendering full large boards without a virtualization strategy.
- Prioritize desktop layouts now. Keep the architecture ready for later mobile and touch support; mobile implementation is deferred. Support theme switching through semantic design tokens.

## 7. TypeScript and runtime safety

- `strict: true` is mandatory, with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames` and `useUnknownInCatchVariables` enabled.
- No `any`, `@ts-ignore`, non-null assertions (`!`) or unchecked `as` casts unless a documented exception is unavoidable.
- Prefer `unknown` at untrusted boundaries, discriminated unions, exhaustive switches and type guards.
- Use `import type` for type-only imports; infer types when clear, annotate public contracts and boundary APIs.
- Zod validates user input, environment variables and unreliable external responses. TypeScript types alone do not validate network payloads.
- Never change `typescript.ignoreBuildErrors` or suppress linting to make a build pass.

## 8. Code quality rules

- ESLint flat config: Next.js `core-web-vitals` + `typescript` config; add `typescript-eslint` type-aware recommended rules after verifying compatibility with the installed version. Include `eslint-config-prettier` last.
- Enforce `@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises`, `@typescript-eslint/consistent-type-imports`, and `@typescript-eslint/no-explicit-any`.
- Enforce import boundaries with `eslint-plugin-boundaries` or a verified equivalent once aliases/layers are configured; CI must reject illegal cross-layer imports.
- Keep React Hooks and Next.js rules enabled; do not blanket-disable rules.
- Prettier handles formatting, not ESLint styling rules. Prefer small, explicit exceptions with justification.
- Avoid unused exports and circular dependencies; add a dedicated checker when the project grows.

## 9. Testing policy

- Use Playwright for browser E2E tests in e2e/pages/**/*.spec.ts, split by page.
- Keep reusable UI interactions in e2e/shared and lifecycle/test-data setup in e2e/fixtures.
- Use Vitest for unit and component tests, co-located as src/**/*.test.ts or *.test.tsx.
- Consult [.agents/skills/frontend-testing/SKILL.md](.agents/skills/frontend-testing/SKILL.md) for test work.
- This setup includes no product tests. CI explicitly skips empty suites; test commands must fail on empty suites. Do not add placeholder tests or enable pass-with-no-tests.
- Run relevant tests and all required application checks. Use actual backend contracts; do not add mock services.

## 10. Performance and security

- Use pagination or virtualization for large lists and boards; avoid N+1 network request patterns.
- Debounce search where appropriate and cancel/ignore stale requests.
- Split heavy editors, charts and rarely used interactive panels when beneficial.
- Validate input, escape/render user-provided content safely and do not use `dangerouslySetInnerHTML` without a reviewed sanitizer.
- Use secure auth/session practices compatible with the backend. Never store sensitive access tokens in Redux persistence or browser storage by default.
- Keep secrets server-side; respect same-origin/CORS/CSRF rules and backend authorization.
- Add appropriate error reporting without leaking tokens or private task contents.

## 11. Mandatory verification and CI

Use npm and commit `package-lock.json` when dependencies are initialized.

Required application scripts:

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "typecheck": "next typegen && tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "build": "next build",
    "check": "npm run lint && npm run typecheck && npm run format:check && npm run build"
  }
}
```

- Before merging, CI must install dependencies with `npm ci` and pass `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`.
- CI runs npm test and Chromium npm run test:e2e when matching files exist. Empty suites are explicitly skipped and must not be reported as passed tests.
- Husky + lint-staged must run ESLint and Prettier on staged TS/TSX files when application tooling is initialized. Hooks do not replace full CI.
- Never claim checks passed unless actually executed. State which checks could not run.
- All applicable pipelines for the latest PR revision must pass, with no open or unresolved review threads before merge.

### Git workflow

- Never commit or push directly to `main`; update it only by merging pull requests.
- Work autonomously on feature branches using `FE-Domain-Feature-Implement` or `FE-Domain-Fix`.
- Use simple English commit messages such as `add feature`, `refactor something` or `drop filename`.
- Fetch updates from `../TripleP.Backend` before API integration. Inspect the appropriate remote revision without discarding or overwriting the backend team's local changes.

## 12. Definition of Done (for AI agents and humans)

A change is complete only when:

1. Its scope and acceptance criteria are implemented without unrelated rewrites.
2. New modules obey architecture and public API rules.
3. Domain/API contracts are typed and external inputs are validated where needed.
4. Loading, empty, success and error paths are addressed.
5. Keyboard accessibility and responsive behavior are considered.
6. Relevant manual verification and automated tests are performed when coverage exists; absent coverage is disclosed.
7. Lint, typecheck, format check and build pass when configured; unavailable checks and absent test coverage are disclosed.
8. The final response lists touched areas, behavioral changes, checks performed and remaining risks.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
