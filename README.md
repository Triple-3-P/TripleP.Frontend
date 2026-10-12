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

Husky runs lint-staged before commits. PR CI runs the same application checks. Unit, integration and E2E tests are deferred; there is no placeholder `test` script.

## Structure

- `src/app`: server-rendered routes and layouts.
- `src/shared`: messages, styles and reusable utilities.
- `src/store`: Redux store factory, typed client hooks and provider.
- `src/shared/api`: shared RTK Query API for injected domain endpoints.

## Client state and API data

The root layout mounts `StoreProvider` while remaining a Server Component. Each provider creates its own store with `makeStore`; there is no shared server singleton. Client components can import `useAppDispatch`, `useAppSelector` and `useAppStore` from `@/store`.

The store registers the shared `baseApi` reducer and middleware. Browser focus and reconnect listeners are installed on mount and cleaned up on unmount; endpoints can opt into `refetchOnFocus` and `refetchOnReconnect`.

Domain slices should inject typed endpoints into `baseApi` from `@/shared/api`, adding cache tags with `enhanceEndpoints` as real domains are introduced. Keep fetched data in RTK Query and add regular reducers only for shared client state. Domain code should use its generated query/mutation hooks; Redux hooks live in the store infrastructure and can be used by app composition.

The backend has no API contracts yet. The base query currently accepts relative URLs, but no endpoints are defined and no requests are made. Configure the confirmed backend base URL and authentication centrally in `src/shared/api/base-api.ts` before injecting endpoints. No environment variable or authentication scheme is assumed. Server Component data loading and RTK Query caching remain separate; server hydration is not configured.

Installed feature dependencies include Redux Toolkit/RTK Query, React Redux, React Hook Form, Zod, TanStack Table and dnd-kit. API endpoints must use real backend contracts.

Tailwind CSS v4 provides semantic light/dark theme tokens. shadcn uses Radix primitives, with aliases configured in `components.json`; add components under `src/shared/ui`. A theme-switching interface will be added with the application shell.

Work on `FE-Domain-Feature-Implement` or `FE-Domain-Fix` branches; `main` receives changes only through PR merges.
