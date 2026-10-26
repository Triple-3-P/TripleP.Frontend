# User flows

English consolidation of the source user journeys and UX scenarios. All authenticated routes and backend operations below are planned behavior. Exact route names must follow implemented contracts.

## First usable vertical slice

1. Sign in/register and establish a validated session.
2. Accept an invitation or create a workspace; the creator becomes Owner.
3. Create a project with an available key, explicit visibility and starter workflow.
4. Create a Task with a title and valid project defaults.
5. Open its details and set eligible assignee/priority/deadline.
6. Change status and observe the same canonical task in Board and List.
7. Reload or use a deep link and recover the saved state.

Acceptance includes loading, validation, permission denial, failed requests and stale-version conflicts, not only successful navigation.

## Main journeys

| Journey                   | Behavior and recovery                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invitation                | Authorized inviter selects role/grants; recipient accepts with the intended identity. Expired, revoked, already consumed and wrong-account links have explicit states. No duplicate membership.               |
| Workspace switching       | Show permitted workspaces; clear/re-scope protected caches; choose an accessible landing context. An old private drawer must not display the prior workspace's data.                                          |
| Create project            | Name/key/visibility/template; explain duplicate key and permission errors; persist project and defaults consistently.                                                                                         |
| Quick create task         | Infer project/type/status from context when valid; focus title; keep input on failure; avoid duplicate submissions and replay with the same operation key.                                                    |
| Open task                 | Drawer from Board/List, full page from direct URL; retain list filters, scroll and focus when returning. A private link does not reveal metadata.                                                             |
| Edit task                 | Validate ordinary fields; show pending/saved/failure state; retain local draft on conflict and offer reload/reapply. Never silently overwrite newer content.                                                  |
| Board move                | Show allowed targets; provide keyboard/menu equivalent; submit exact ETag and stable idempotency key; reconcile detail and affected lists on success/failure. Coordinate ordering with transition explicitly. |
| Workflow management       | Add status/category; update selectors/columns. Retirement previews affected work, requires replacement/default mapping and handles a stale preview without partial changes.                                   |
| Comment and mention       | Suggest only permitted recipients; save comment and event; notification opens the relevant comment. Redact content after access revocation.                                                                   |
| Attachment                | Upload through an authorized session, show pending/scan/rejected state, and download only after current authorization. Expired URLs require renewal.                                                          |
| Remove member             | Explain impact; protect last owner; proposed P0 unassigns affected tasks; preserve historical actors and revoke access immediately.                                                                           |
| My Tasks / search / Inbox | Filter by current workspace/access; retain shareable search state; distinguish no data from no matches; prevent hidden data in previews or counts.                                                            |
| Archive/restore           | Explain read-only state and family impact; restore using current membership and valid status mapping. No implicit regrant to removed users.                                                                   |

## Later journeys

- **P1 bulk edit:** show applicable/skipped work before mutation; return per-item results and retries rather than claiming overall success after partial failure.
- **P1 sprint:** plan goal/dates/scope, start with a baseline, record scope changes, close with explicit unfinished-work disposition, preserve historical metrics.
- **P1 project move:** require source and target permissions; preview status/type/field/family/assignee/planning changes; preserve ID and old-key aliases; apply atomically.
- **P1 saved view:** save filters/grouping/columns/sort with personal/shared visibility; stable URL reproduces configuration without granting resource access.
- **P2 portfolio:** aggregate only permitted projects; removing a project from the portfolio does not delete it.
- **P2 automation:** configure bounded scope, dry run and execution logs; guard against recursion and duplicate side effects.

## End-to-end acceptance paths

Test onboarding through Board/List; invitation acceptance; viewer and guest restrictions; direct private links; two-client conflicting edits; simultaneous card moves; archived writes; revoked membership while a drawer is open; task creation after a timeout; date-only deadlines after timezone changes; and access-controlled notification/file navigation.

Test against implemented backend behavior. Existing test tooling is documented in the repository README; this document does not assert that these scenarios already have automated coverage.
