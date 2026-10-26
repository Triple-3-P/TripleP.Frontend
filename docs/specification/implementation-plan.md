# Implementation plan and decisions

This plan adapts the supplied progress report to the repository snapshot in the [documentation index](README.md). It is a proposed dependency order, not a schedule or an assertion of completed product features.

## Ordered slices

| Slice                       | Backend dependency                                                                         | Frontend result / acceptance                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1. Contract foundation      | Agree auth, CSRF, permissions, errors, ETags, idempotency and published OpenAPI            | Confirm transport against real endpoints; typed/validated boundaries; no invented routes or mock integration.       |
| 2. Identity and tenancy     | Session/account, Workspace, membership, invitations and permissions                        | Auth/onboarding, workspace switching and cache isolation; last-owner/invite denial paths.                           |
| 3. Projects and workflow    | Project CRUD/lifecycle/grants, defaults, status operations/capabilities                    | Project create/overview/settings, permitted member management, safe status retirement.                              |
| 4. Work-item vertical slice | Seeded types, item create/detail/list/edit/transition/reorder, atomic counter/audit/outbox | Create Workspace → Project → Task → transition → consistent Board/List; keyboard interaction and conflict recovery. |
| 5. Collaboration            | Comments/mentions, checklists, attachment lifecycle, activity and notifications            | Discussion/files/history, My Tasks and Inbox with permission-safe previews.                                         |
| 6. P0 hardening             | Filters/pagination/search/counters, concurrency and authorization coverage                 | Shareable filters, bounded rendering, errors/empty/loading states, retries and revocation behavior.                 |
| 7. P1/P2                    | Reviewed contracts for each optional module                                                | Incremental features on the existing architecture; do not build empty future layers or duplicate API roots.         |

The frontend already has tooling and the backend has a layered host, so the source's instruction to create both projects from scratch is obsolete. Before reusing store/provider code from the separate landing work, check whether that feature has merged.

## Decisions still needed

| Decision                      | Source recommendation / unresolved point                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product audience and delivery | General teams versus engineering-first; SaaS, self-hosted or both; pricing/limits unset.                                                                                                  |
| Final P0 scope                | Confirm the catalog's breadth, basic reporting and archive/restore. UX labels project restore P1 while the feature catalog includes it in P0.                                             |
| Authentication                | Same-origin .NET session cookie plus CSRF is proposed. Cookie names/attributes/lifetime, login/logout, TLS ingress and rotation need implementation agreement. No refresh API is assumed. |
| CSRF contract                 | Frontend notes require `GET /auth/csrf`; it is absent from the supplied OpenAPI and earlier prose treats it as optional. Reconcile before auth work.                                      |
| Permission names              | Reconcile `workspace.project.create` versus `project.create`, member management names and restore permissions. Confirm Viewer/Commenter behavior and any audited admin recovery access.   |
| Work types                    | Task/Bug/Subtask P0; Story/Epic P1. Some draft DTO enums also admit Story/Epic/custom/Scrum; schema acceptance alone must not enable those modules in P0.                                 |
| Required Bug fields / editor  | Optional structured Bug fields proposed; confirm creation/QA validation, rich-text JSON schema, sanitization and upload limits.                                                           |
| Subtask/Epic policy           | One subtask level and one epic per eligible item proposed. Confirm family archive/restore and later depth.                                                                                |
| Project key                   | Immutable after first work item in P0 proposed. Rename migration appears in P1 domain notes but P2 API prose. Alias resolution is listed P1 despite stable-key UX in P0.                  |
| Dates                         | Calendar dates remain date-only; workspace timezone proposed. Start dates are present in DTOs but scheduled later in the catalog.                                                         |
| Ordering                      | Choose server ranking/rebalance and atomic cross-column move/order behavior. Transition and reorder are currently separate commands.                                                      |
| Filters and cursors           | Item filters/sort appear in prose and HTTP examples but are omitted from the core YAML operation. Define complete query and cursor rules.                                                 |
| Notification contract         | Source wants read/unread; confirm endpoint/schema coverage, workspace scope and revocation redaction.                                                                                     |
| Concurrency                   | Agree exact opaque ETags, `412`/`428`, protected operations and membership/status aggregate versions.                                                                                     |
| Idempotency                   | Proposed 24-hour retention and principal/target/method/path scope; agree persistence, replay and races.                                                                                   |
| Retention                     | Archive/trash/purge, recovery, audit/PII and file retention remain undecided.                                                                                                             |
| Sprint/release policy         | Proposed one active sprint, preserved membership/history, one target release. Confirm before P1.                                                                                          |
| Realtime                      | Optional after MVP. Source mentions SSE and SignalR; transport, revocation and resync remain undecided.                                                                                   |

## Applying the frontend reference safely

The bundle's `frontend-api-layer` is unvalidated example code. Its design lessons are captured in [frontend integration](frontend-api-layer.md); its executable files are not copied into the app.

- Reuse one shared RTK Query root and inject domain endpoints. Create the Redux store and listener middleware per store instance under `src/store`.
- Follow local public APIs, aliases, kebab-case module names, prefixed types and named props instead of the skeleton's inline props and deep relative imports.
- Replace hand-maintained DTO subsets with types generated from the reviewed backend-published schema when available; validate untrusted response/error shapes at runtime.
- The sample error guard only checks for a `code` property before casting. It is insufficient runtime validation.
- The sample single-flight guard protects one mounted control, not all controls/tabs. Avoid undoing overlapping optimistic patches; reconcile through authoritative invalidation/refetch unless stronger synchronization is guaranteed.
- An operation key must survive a retry after an ambiguous timeout. The sample creates a new key on each hook invocation, so a new invocation cannot automatically be treated as a transport retry.
- Handle CSRF bootstrap/rotation errors explicitly. The sample login catch can swallow a failed post-login bootstrap; do not adopt it without a visible recovery path.
- The sample sets focus/reconnect refetch flags but does not install `setupListeners`; wire and clean up listeners in the actual provider.
- No proxy environment variable, cookie name or product endpoint becomes configured merely because it appears in this draft.

## Validation for implementation

Follow repository checks and testing policy. Use unit tests for pure logic, actual backend contract/authorization tests and Playwright for critical browser paths. Do not introduce the bundle's MSW/mock services. Empty suites must be disclosed, not represented as passed tests.

Structural YAML/reference checks only validate document integrity. They do not prove OpenAPI conformance, generated client compatibility, security behavior or backend implementation. Before an API slice is integrated, complete the [.NET handshake](dotnet-frontend-handshake.md) and its relevant acceptance cases.
