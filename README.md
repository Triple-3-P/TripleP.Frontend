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
- `src/widgets/landing-page`: translated landing-page sections and interactive product concept.

## Landing page and translations

The landing page follows a dark editorial layout with a mountain backdrop, workspace concept, benefits, workflow, product direction, principles and FAQs. Links navigate to page sections; board/list buttons, accordions and the mobile menu work without an account. The product concept is explicitly illustrative. Pricing, integration support, user statistics and registration are not asserted or simulated.

UI copy uses `useTranslate` from `@tolgee/react`. The server uses Tolgee's `getTranslate` for page metadata. English and Russian catalogs live in `src/shared/config/i18n/en.json` and `ru.json`; keep their keys aligned. `I18nProvider` creates an instance per mounted provider and supplies SSR data to avoid untranslated first renders. No Tolgee service credentials or external translation requests are required.

The native language select calls a validated Server Action to remember the locale in an HTTP-only cookie for one year. It is disabled while saving and reports a failed change without discarding the current language. The root layout reads the cookie and sets the document language. English is the default. Cookie-based localization makes the page dynamic; language-specific URLs and search-engine indexing are not configured.

All landing content, including navigation, marketing copy, FAQs and the workspace concept, comes from local catalogs and components. Only the account area is intended to depend on session/user data. This describes data ownership, not static HTML generation: locale cookies still require request rendering.

The sticky header hides while scrolling down and returns while scrolling up or near the top. Keyboard focus and an open navigation menu keep it visible. The language select and account controls remain available on mobile.

`AccountControls` in `src/features/account-navigation` accepts a presentation model with loading, signed-out and signed-in states. Guests see Sign in and Sign up; signed-in users see a notification control and a profile avatar, with initials on missing or failed images. Unread status is supplied by the caller. App composition supplies this account area separately from landing content.

The fetched backend currently exposes only health functionality; it has no authentication contract. The app therefore supplies the signed-out state. Account destinations must be supplied when real routes are confirmed; missing guest destinations render disabled controls rather than dead links or simulated authentication. Map validated session data to the account model once the contract is available. No account requests or invented authentication routes are added here.

The decorative image is served locally as an optimized WebP. Its generation prompt and provenance are recorded in [public/images/README.md](public/images/README.md).

## Client state and API data

The root layout mounts `StoreProvider` while remaining a Server Component. Each provider creates its own store with `makeStore`; there is no shared server singleton. Client components can import `useAppDispatch`, `useAppSelector` and `useAppStore` from `@/store`.

The store registers the shared `baseApi` reducer and middleware. Browser focus and reconnect listeners are installed on mount and cleaned up on unmount; endpoints can opt into `refetchOnFocus` and `refetchOnReconnect`.

Domain slices should inject typed endpoints into `baseApi` from `@/shared/api`, adding cache tags with `enhanceEndpoints` as real domains are introduced. Keep fetched data in RTK Query and add regular reducers only for shared client state. Domain code should use its generated query/mutation hooks; Redux hooks live in the store infrastructure and can be used by app composition.

The backend has no API contracts yet. The base query currently accepts relative URLs, but no endpoints are defined and no requests are made. Configure the confirmed backend base URL and authentication centrally in `src/shared/api/base-api.ts` before injecting endpoints. No environment variable or authentication scheme is assumed. Server Component data loading and RTK Query caching remain separate; server hydration is not configured.

Installed feature dependencies include Redux Toolkit/RTK Query, React Redux, React Hook Form, Zod, TanStack Table and dnd-kit. API endpoints must use real backend contracts.

Tailwind CSS v4 provides semantic light/dark theme tokens. shadcn uses Radix primitives, with aliases configured in `components.json`; add components under `src/shared/ui`. A theme-switching interface will be added with the application shell.

Work on `FE-Domain-Feature-Implement` or `FE-Domain-Fix` branches; `main` receives changes only through PR merges.
