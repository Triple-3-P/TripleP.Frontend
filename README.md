# TripleP Frontend

Next.js App Router frontend for the TripleP task manager. See [AGENTS.md](AGENTS.md) for architecture and contribution rules.

## Getting started

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Landing content works without the backend; account access requires the running backend and migrated PostgreSQL database.

### Authentication

The shared [shadcn Sonner](https://ui.shadcn.com/docs/components/radix/sonner) toaster displays localized registration/sign-in success, API failures and invalid-submit feedback. Field errors remain inline; two-factor challenges use an informational notification. The Google icon comes from [Google's official sign-in assets](https://developers.google.com/identity/branding-guidelines); the original padded asset is displayed through a 20px icon viewport.

Authentication uses the official shadcn registry Input, InputGroup, Field and Dialog components, adapted to the repository's named-props and localization conventions, plus the existing shadcn Tabs. See the [React Hook Form guide](https://ui.shadcn.com/docs/forms/react-hook-form), [Input Group](https://ui.shadcn.com/docs/components/radix/input-group), [Dialog](https://ui.shadcn.com/docs/components/radix/dialog) and [Tabs](https://ui.shadcn.com/docs/components/radix/tabs). Each password field has an independent show/hide button. Zod validates fields while typing and on submission; FieldDescription and FieldError provide accessible helper text. A separated Google sign-in button appears below both forms as an intentionally inactive placeholder; no OAuth requests are made. Tabs sit at the top of a compact fixed-height modal with an internally scrolling body on shorter screens. They preserve the email while clearing passwords and are disabled during submission.

The header and hero open sign-in/sign-up dialogs. Registration sends email and password to `POST /api/register`, then opens sign-in with the email preserved. Password confirmation is client-only. Login uses `POST /api/login?useSessionCookies=true`; ASP.NET Identity manages the HTTP-only session cookie. No tokens are stored in JavaScript or browser storage. Authenticator and recovery codes are supported when the API requires two-factor authentication.

Next.js proxies `/api/*` to `http://localhost:5047` (the backend HTTP launch profile), keeping browser requests same-origin. To use Docker Compose, set the frontend-only `BACKEND_URL=http://localhost:8080` in `.env.local` before starting or building Next.js. Production must use HTTPS and a trusted backend origin; configure the proxy target before building. Backend setup and migrations are documented in `../TripleP.Backend/README.md`.

`GET /api/manage/info` restores the account on reload and rechecks on focus/reconnect. Successful login closes the modal and shows a success toast. Signed-in users see Workspaces links in the header and hero, and a header avatar opening a [shadcn Popover](https://ui.shadcn.com/docs/components/radix/popover) with their email, avatar, Profile, Settings and Log out. `/workspaces`, `/profile` and `/settings` are intentionally empty pages with localized document titles; they contain no private data or implemented workspace/profile functionality.

The frontend owns `POST /api/session/logout`, which requires a matching Origin and expires the verified `.AspNetCore.Identity.Application` cookie and any numbered chunks at `/`. Successful logout clears the RTK Query cache; failures retain the account and show an error toast. This ends the current browser session without changing the backend or claiming to revoke other devices or bearer tokens. The remaining `/api/*` routes proxy to the backend. Email delivery is currently a no-op in the backend, so these forms do not offer password reset or claim that confirmation email was sent.

The contract was inspected at backend revision `497188f`. It uses the standard [.NET 10 Identity endpoints](https://github.com/dotnet/aspnetcore/blob/v10.0.0/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs) and default Identity password policy. The documentation branch describes broader planned behavior; the implemented backend governs this feature.

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

The landing page follows a dark editorial layout with a mountain backdrop, workspace concept, benefits, workflow, product direction, principles and FAQs. Links navigate to page sections; board/list buttons, accordions and the mobile menu work without an account. The product concept is explicitly illustrative. Pricing, integration support and user statistics are not asserted or simulated.

UI copy uses `useTranslate` from `@tolgee/react`. The server uses Tolgee's `getTranslate` for page metadata. English and Russian catalogs live in `src/shared/config/i18n/en.json` and `ru.json`; keep their keys aligned. `I18nProvider` creates an instance per mounted provider and supplies SSR data to avoid untranslated first renders. No Tolgee service credentials or external translation requests are required.

The shadcn Select calls a validated Server Action to remember the locale in an HTTP-only cookie for one year. It is disabled while saving and reports a failed change without discarding the current language. The root layout reads the cookie and sets the document language. English is the default. Cookie-based localization makes the page dynamic; language-specific URLs and search-engine indexing are not configured.

All landing content, including navigation, marketing copy, FAQs and the workspace concept, comes from local catalogs and components. Only the account area is intended to depend on session/user data. This describes data ownership, not static HTML generation: locale cookies still require request rendering.

The sticky header hides while scrolling down and returns while scrolling up or near the top. Keyboard focus and an open navigation menu keep it visible. The language select and account controls remain available on mobile.

Controls and reusable UI use the project-local shadcn components under `src/shared/ui`, generated with the configured Radix style. Button covers calls to action and account controls; Select handles languages; Dropdown Menu provides mobile navigation; Accordion handles benefits and FAQs; Tabs switches the workspace concept; Avatar and Skeleton handle account presentation. Cards, Badges, Breadcrumbs and Separators also cover the feature panels and workspace concept. Use these shared components for future UI. Portalled menus share the landing palette and keep the header visible while open. Keyboard navigation, focus return and dismissal come from the Radix primitives.

The FAQ uses one shadcn Accordion with two independent column wrappers. Opening an answer moves only its column; keyboard navigation still traverses all six questions. The columns stack in reading order on smaller screens.

The shared radius scale is zero: buttons, selects, menus, cards, tabs and badges use square corners. Set the radius tokens in `src/shared/styles/globals.css` to adjust this consistently. Avatars and status dots retain their circular shapes.

The hero repeats the guest account controls with Sign up as the primary action and Sign in as the outlined action. The existing section links remain below. Both placements share the authentication feature, translations and RTK Query account cache; hero auth actions disappear for signed-in users.

`AccountControls` in `src/features/account-navigation` accepts a presentation model with loading, signed-out and signed-in states. Guests see Sign in and Sign up; signed-in users see a notification control and a profile avatar, with initials on missing or failed images. Unread status is supplied by the caller. App composition supplies this account area separately from landing content.

The landing page uses `AuthControls` in `src/features/authentication` for the implemented Identity contract. The earlier `AccountControls` presentation component remains available for future profile and notification navigation once those routes exist.

The decorative image is served locally as an optimized WebP.

## Client state and API data

The root layout mounts `StoreProvider` while remaining a Server Component. Each provider creates its own store with `makeStore`; there is no shared server singleton. Client components can import `useAppDispatch`, `useAppSelector` and `useAppStore` from `@/store`.

The store registers the shared `baseApi` reducer and middleware. Browser focus and reconnect listeners are installed on mount and cleaned up on unmount; endpoints can opt into `refetchOnFocus` and `refetchOnReconnect`.

Domain slices should inject typed endpoints into `baseApi` from `@/shared/api`, adding cache tags with `enhanceEndpoints` as real domains are introduced. Keep fetched data in RTK Query and add regular reducers only for shared client state. Domain code should use its generated query/mutation hooks; Redux hooks live in the store infrastructure and can be used by app composition.

The base query uses `/api/` and same-origin cookies. Authentication injects registration, login and account-info endpoints with account cache invalidation after successful login. On the initial request, the root layout fetches account info directly from `BACKEND_URL` on the server, forwarding only the Identity session cookie and its chunks. This request uses `cache: 'no-store'`, rejects redirects and has a 15-second timeout. No session cookie or a backend 401 means a confirmed guest; network, server and schema failures leave the session unknown so the browser can retry.

`StoreProvider` initializes a fresh store with the validated account (or `null` for a guest), synchronously prefilling the RTK Query account cache before rendering children. The same result initializes the browser store, so hydration does not repeat a successful server lookup. Only account data crosses the server/client boundary, never the session cookie. Subsequent login invalidation, logout cache reset and focus/reconnect refetches remain client-owned; later layout renders do not overwrite the live client cache with an older server snapshot.

Installed feature dependencies include Redux Toolkit/RTK Query, React Redux, React Hook Form, Zod, TanStack Table and dnd-kit. API endpoints must use real backend contracts.

Tailwind CSS v4 provides semantic light/dark theme tokens. shadcn uses Radix primitives, with aliases configured in `components.json`; add components under `src/shared/ui`. A theme-switching interface will be added with the application shell.

Work on `FE-Domain-Feature-Implement` or `FE-Domain-Fix` branches; `main` receives changes only through PR merges.

## Testing

Vitest covers `withProps`, authentication validation/error normalization, logout cookie handling, and account cache initialization/isolation. Compile-time cases in `src/shared/utils/with-props.type-test.tsx` are checked by `npm run typecheck`. Playwright covers modal opening, focus return, validation, password visibility, switching forms, guest rendering without JavaScript and hydration without duplicate account requests, all without mocked APIs. Successful registration/login and authenticated SSR require separate verification against a running backend; they are not covered by these browser tests. Both runners fail when no matching tests exist; CI explicitly skips empty suites.

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
