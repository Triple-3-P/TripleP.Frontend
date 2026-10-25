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
- `src/store`: Redux store factory, typed client hooks and provider.
- `src/shared/api`: shared RTK Query API for injected domain endpoints.
- `src/widgets/landing-page`: translated landing-page sections and interactive product concept.

## Landing page and translations

The landing page follows a dark editorial layout with a mountain backdrop, workspace concept, benefits, workflow, product direction, principles and FAQs. Links navigate to page sections; board/list buttons, accordions and the mobile menu work without an account. The product concept is explicitly illustrative. Pricing, integration support, user statistics and registration are not asserted or simulated.

UI copy uses `useTranslate` from `@tolgee/react`. The server uses Tolgee's `getTranslate` for page metadata. English and Russian catalogs live in `src/shared/config/i18n/en.json` and `ru.json`; keep their keys aligned. `I18nProvider` creates an instance per mounted provider and supplies SSR data to avoid untranslated first renders. No Tolgee service credentials or external translation requests are required.

The shadcn Select calls a validated Server Action to remember the locale in an HTTP-only cookie for one year. It is disabled while saving and reports a failed change without discarding the current language. The root layout reads the cookie and sets the document language. English is the default. Cookie-based localization makes the page dynamic; language-specific URLs and search-engine indexing are not configured.

All landing content, including navigation, marketing copy, FAQs and the workspace concept, comes from local catalogs and components. Only the account area is intended to depend on session/user data. This describes data ownership, not static HTML generation: locale cookies still require request rendering.

The sticky header hides while scrolling down and returns while scrolling up or near the top. Keyboard focus and an open navigation menu keep it visible. The language select and account controls remain available on mobile.

Controls and reusable UI use the project-local shadcn components under `src/shared/ui`, generated with the configured Radix style. Button covers calls to action and account controls; Select handles languages; Dropdown Menu provides mobile navigation; Accordion handles benefits and FAQs; Tabs switches the workspace concept; Avatar and Skeleton handle account presentation. Cards, Badges, Breadcrumbs and Separators also cover the feature panels and workspace concept. Use these shared components for future UI. Portalled menus share the landing palette and keep the header visible while open. Keyboard navigation, focus return and dismissal come from the Radix primitives.

The FAQ uses one shadcn Accordion with two independent column wrappers. Opening an answer moves only its column; keyboard navigation still traverses all six questions. The columns stack in reading order on smaller screens.

The shared radius scale is zero: buttons, selects, menus, cards, tabs and badges use square corners. Set the radius tokens in `src/shared/styles/globals.css` to adjust this consistently. Avatars and status dots retain their circular shapes.

The hero repeats the guest account controls with Sign up as the primary action and Sign in as the outlined action. The existing section links remain below. Both placements share the account navigation model, translations and destination handling; hero auth actions disappear for signed-in users.

`AccountControls` in `src/features/account-navigation` accepts a presentation model with loading, signed-out and signed-in states. Guests see Sign in and Sign up; signed-in users see a notification control and a profile avatar, with initials on missing or failed images. Unread status is supplied by the caller. App composition supplies this account area separately from landing content.

The fetched backend currently exposes only health functionality; it has no authentication contract. The app therefore supplies the signed-out state. Account destinations must be supplied when real routes are confirmed; missing guest destinations render disabled controls rather than dead links or simulated authentication. Map validated session data to the account model once the contract is available. No account requests or invented authentication routes are added here.

The decorative image is served locally as an optimized WebP.

## Client state and API data

The root layout mounts `StoreProvider` while remaining a Server Component. Each provider creates its own store with `makeStore`; there is no shared server singleton. Client components can import `useAppDispatch`, `useAppSelector` and `useAppStore` from `@/store`.

The store registers the shared `baseApi` reducer and middleware. Browser focus and reconnect listeners are installed on mount and cleaned up on unmount; endpoints can opt into `refetchOnFocus` and `refetchOnReconnect`.

Domain slices should inject typed endpoints into `baseApi` from `@/shared/api`, adding cache tags with `enhanceEndpoints` as real domains are introduced. Keep fetched data in RTK Query and add regular reducers only for shared client state. Domain code should use its generated query/mutation hooks; Redux hooks live in the store infrastructure and can be used by app composition.

The backend has no API contracts yet. The base query currently accepts relative URLs, but no endpoints are defined and no requests are made. Configure the confirmed backend base URL and authentication centrally in `src/shared/api/base-api.ts` before injecting endpoints. No environment variable or authentication scheme is assumed. Server Component data loading and RTK Query caching remain separate; server hydration is not configured.

Installed feature dependencies include Redux Toolkit/RTK Query, React Redux, React Hook Form, Zod, TanStack Table and dnd-kit. API endpoints must use real backend contracts.

Tailwind CSS v4 provides semantic light/dark theme tokens. shadcn uses Radix primitives, with aliases configured in `components.json`; add components under `src/shared/ui`. A theme-switching interface will be added with the application shell.

Work on `FE-Domain-Feature-Implement` or `FE-Domain-Fix` branches; `main` receives changes only through PR merges.

## Testing

Vitest covers `withProps` rendering, state preservation, refs, composition and fixed-prop behavior. Compile-time cases in `src/shared/utils/with-props.type-test.tsx` are checked by `npm run typecheck`, including expected errors for invalid props. Browser test coverage is not yet committed. Both runners fail when no matching tests exist; CI explicitly skips empty suites.

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
