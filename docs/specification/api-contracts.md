# Task Manager — API Contract Specification

> **Draft v0.1 · 2026-10-16 · Status: proposed, NOT an implemented backend.**
> Source context: [Product summary](README.md), [domain-model.md](./domain-model.md), [business-rules.md](./business-rules.md), [permissions-spec.md](./permissions-spec.md), [feature-catalog.md](./feature-catalog.md).
>
> This document is the **functional source of truth for the proposed HTTP API**; `openapi-p0-core.yaml` models only the P0 contractual subset in machine-readable form. The two must be kept in sync before development. The RFC 9457 error shape here **supersedes** the illustrative nested `error` object shown in the previous Domain Model API examples; the local domain summary uses that newer proposal. See [open decisions](implementation-plan.md) for remaining disagreements.

## 0. Scope and decisions

### Product boundary

```text
User -> Membership -> Workspace (tenant)
                       |-- Teams, Portfolios (P1/P2)
                       |-- Projects
                             |-- Workflow + statuses
                             |-- Work Items (one primary project)
                             |    |-- parentId -> subtask
                             |    |-- epicId -> epic
                             |    |-- comments, checklists, files, relations
                             |-- Views (board/list/calendar = projections)
                             |-- Sprints, releases, milestones (optional)
                       |-- notifications, search, reporting, integrations
```

### Priority convention

- **P0**: first usable product. Core contracts specified at field level below.
- **P1**: team/planning expansion. Endpoint and invariant contracts are proposed; shape needs review before implementation.
- **P2**: advanced/enterprise modules. Intent-level endpoint catalog, not frozen schemas.
- The entire API is a **design proposal**; no endpoint in this document is claimed to exist.

### Non-negotiable invariants

1. All project- and item-related reads/writes enforce effective access on the **server**.
2. A WorkItem has exactly one immutable internal `id`, belongs to one main `projectId`, and has a changeable **display key** (`WEB-123`) with aliases for moved work.
3. `statusId` must belong to the WorkItem's project. Status change uses the dedicated transition command.
4. `projectId`, `number`, `key`, `version`, `workspaceId`, and audit fields are **not client-writable** via generic PATCH.
5. `parentId`/`epicId` are separate relationships. In P0, parent/child and epic/member live inside one project; cycles are forbidden.
6. Archived projects do not permit normal mutations. `done` status is not archive/delete.
7. Historical events, activity, notifications, and real-time events are distinct concepts.
8. User data from private projects may not leak through list counts, search, notifications, file URLs, errors, or analytics.

## 1. Global protocol contract

| Dimension               | Decision                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Transport               | HTTPS JSON REST API; `/api/v1` prefix                                                                                 |
| API description         | OpenAPI **3.1.2** (pragmatic ecosystem target; later upgrade possible)                                                |
| Naming                  | plural `kebab-case` path segments; JSON fields `camelCase`                                                            |
| Resource IDs            | UUID strings, never display keys as foreign keys                                                                      |
| Timestamps              | RFC 3339 UTC timestamp e.g. `2026-10-16T16:35:00Z`                                                                    |
| Date-only               | `YYYY-MM-DD`, **not** UTC midnight conversions                                                                        |
| Empty optional relation | explicit `null` in responses; omitted input fields mean “leave/default”                                               |
| Writes                  | `POST` create/commands; `PATCH` partial updates; `DELETE` remove ephemeral resources; archived resources use commands |
| Response object         | direct typed JSON object, **no** extra `data` wrapper                                                                 |
| Response lists          | `{ "data": [...], "pageInfo": { "nextCursor": null, "hasMore": false } }`                                             |
| Initial page size       | `limit=50`, maximum `100`; stable sort with `id` tie breaker                                                          |
| Create                  | `201 Created`, `Location` header, body is new object                                                                  |
| Mutation                | `200` when returning updated resource, `204` with empty body otherwise                                                |
| Security                | authenticated user session for browser; scoped bearer token for programmatic access in P1                             |
| Correlation             | `X-Request-Id` request/response header; propagate across services                                                     |
| Compression             | standard HTTP gzip/br where supported, especially lists                                                               |
| Rate limit              | `429` and `Retry-After`; do not hardcode quota in clients                                                             |
| Browser cache           | private authenticated responses `Cache-Control: private, no-store` by default                                         |
| API version evolution   | additive fields/endpoints within v1; incompatible changes require negotiation/v2                                      |

### 1.1 Browser auth and CSRF

For the Next.js frontend, propose a **same-origin proxy** (a BFF is optional) for `/api/v1` with a `HttpOnly`, `Secure`, `SameSite=Lax` session cookie. RTK Query requests use credentials automatically on the same origin; no access tokens in `localStorage`, sessionStorage, or Redux. Browser-changing requests validate `Origin` and anti-CSRF token (`X-CSRF-Token`) or equivalent proven CSRF protection; use HTTPS. Distinguish user browser sessions from scoped machine API tokens, whose rotation and revocation are P1.

Authentication endpoint names below assume the backend/auth service can issue these cookies. Never put secret password-reset or invitation tokens in logs or analytics. On a protected 401, clear private caches and follow the implemented login flow. No refresh mechanism or automatic command replay is assumed; any future renewal contract requires separate agreement.

### 1.2 HTTP statuses and error format

| Status    | Semantics                                                                          |
| --------- | ---------------------------------------------------------------------------------- |
| `400`     | Malformed body/query or invalid encoding                                           |
| `401`     | Authentication missing or expired                                                  |
| `403`     | Authenticated but forbidden where disclosure is permissible                        |
| `404`     | Not found **or** intentionally masked private resource                             |
| `409`     | Business/domain conflict (`INVALID_TRANSITION`, `PROJECT_ARCHIVED`, duplicate key) |
| `412`     | Supplied `If-Match` does not match resource strong ETag                            |
| `422`     | Well-formed request with field/domain validation failures                          |
| `428`     | Required `If-Match` header missing                                                 |
| `429`     | Rate limited (include `Retry-After` where possible)                                |
| `500/503` | Unexpected/transient server problem; never expose secrets                          |

Errors use `Content-Type: application/problem+json` (RFC 9457). `code` and `requestId` are API-specific extensions; no nested `{error:{...}}` object.

```json
{
  "type": "https://api.example.invalid/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "detail": "Please correct the highlighted fields.",
  "instance": "/api/v1/projects/00000000-0000-4000-8000-000000000001/items",
  "code": "VALIDATION_ERROR",
  "requestId": "req_01JAA",
  "errors": [
    { "pointer": "/title", "code": "REQUIRED", "message": "Title is required" }
  ]
}
```

`type` is a URI identifying the problem type; production must replace the illustrative domain. Use `code` for UI branching, never human text matching. For conflicts, include `currentVersion` and a safe `latestResourceUrl` if user has access. Do not include private resource names on masked 404s.

### 1.3 Concurrency and idempotency

- Every versioned resource in response has integer `version` and strong `ETag: "<opaque-or-version>"` header. **ETag is opaque** to client; version is informational. Every versioned list summary also includes its _own_ `etag: string` so inline editing does not need a separate GET. For a whole-resource mutation use the target resource ETag, not a parent collection ETag.
- `PATCH`, `transition`, `reorder`, workflow modifications, sprint state changes, and cross-project move require `If-Match`. On mismatch return **412**, missing header **428**, not generic 409. These conditions follow HTTP semantics.
- On stale write, the client shows conflict/reload and preserves unsaved form values; no automatic blind retry.
- `Idempotency-Key` on creating and business-command POSTs (tasks, comments, invitations, complete sprint, move, etc). Key is scoped by principal, workspace/target, method + route, retained for an agreed period (propose **24h**). Identical replay returns same status/body; different payload under same key returns `409 IDEMPOTENCY_KEY_REUSED`.
- Request/response versions and keys must be validated atomically with DB changes, audit event and outbox event.

### 1.4 Cursor, filter, and sorting contract

```http
GET /api/v1/projects/{projectId}/items?limit=50&cursor=opaque&statusId=UUID&assigneeId=UUID&sort=rank
```

A collection returns:

```json
{
  "data": [{ "id": "...", "key": "WEB-123", "title": "..." }],
  "pageInfo": { "nextCursor": "opaque-or-null", "hasMore": true }
}
```

- `cursor` is an opaque token signed/validated by server, scoped to the same actor/tenant/filter/sort; do not let a client forge offset or permission context.
- `sort=rank|updatedAt|createdAt|dueDate|priority` for P0 item list; stable `id` tie-breaker; max size defined.
- Complex queries **P1**: `POST /projects/{projectId}/items/search` with validated filter AST (depth/field/operator limits); although POST, this is read-only and MUST NOT create or mutate data; explicitly non-cacheable unless special caching is implemented.
- No full comment histories or rich text document bodies in list summaries. Detail endpoints load them separately.

### 1.5 Patching rules

- JSON body for `PATCH` follows **explicit partial-update semantics**, **not** JSON Merge Patch: omitted field = unchanged; `null` = clear field where allowed; unknown and server-managed fields => `422`.
- Arrays (`labelIds`, etc.) are **complete replacement** when included. For atomic set operations under heavy concurrency, use explicit relationship routes.
- Description editor uses structured, versioned rich-text JSON rather than raw HTML; validate and sanitize server side.

### 1.6 Capabilities

Responses for project/item detail include a safe `capabilities: string[]` list and, where useful, `allowedTransitions: string[]` (status IDs). `GET /projects/{projectId}/capabilities` returns `role`, `permissions`, `policyVersion`. This enables controls but **never replaces authorization on write**. Cache must be invalidated immediately after loss of access.

## 2. Core DTO schemas (P0)

### 2.1 Enumerations and IDs

```ts
type TUUID = string;
type TISODate = string; // YYYY-MM-DD, calendar date
type TISODateTime = string; // RFC 3339 UTC timestamp
type TStatusCategory = 'todo' | 'in_progress' | 'done';
type TPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
type TWorkItemKind = 'task' | 'bug' | 'story' | 'epic' | 'subtask' | 'custom';
type TProjectVisibility = 'workspace' | 'private';
type TWorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';
type TProjectRole = 'manager' | 'editor' | 'viewer';
```

### 2.2 Workspace, Project, Status

```ts
interface IWorkspaceDto {
  id: TUUID;
  name: string;
  slug: string;
  description: string | null;
  timezone: string;
  logoUrl: string | null;
  lifecycle: 'active' | 'archived';
  myRole: TWorkspaceRole;
  version: number;
  etag: string;
  createdAt: TISODateTime;
  updatedAt: TISODateTime;
}
interface IProjectDto {
  id: TUUID;
  workspaceId: TUUID;
  key: string;
  name: string;
  description: string | null;
  visibility: TProjectVisibility;
  lifecycle: 'active' | 'archived';
  leadId: TUUID | null;
  template: 'kanban' | 'scrum' | 'blank';
  enabledModules: string[];
  version: number;
  etag: string;
  createdAt: TISODateTime;
  updatedAt: TISODateTime;
  capabilities: string[];
}
interface IWorkflowStatusDto {
  id: TUUID;
  projectId: TUUID;
  name: string;
  category: TStatusCategory;
  color: string;
  rank: string;
  isDefault: boolean;
  isArchived: boolean;
  version: number;
  etag: string;
}
```

### 2.3 WorkItem summary vs detail

```ts
interface IWorkItemSummaryDto {
  id: TUUID;
  workspaceId: TUUID;
  projectId: TUUID;
  key: string;
  number: number;
  type: { id: TUUID; key: string; name: string; kind: TWorkItemKind };
  title: string;
  status: { id: TUUID; name: string; category: TStatusCategory };
  priority: TPriority;
  assigneeId: TUUID | null;
  reporterId: TUUID;
  parentId: TUUID | null;
  epicId: TUUID | null;
  dueDate: TISODate | null;
  rank: string;
  version: number;
  etag: string;
  updatedAt: TISODateTime;
  isArchived: boolean;
}
interface IWorkItemDetailDto extends IWorkItemSummaryDto {
  description: Record<string, unknown> | null;
  startDate: TISODate | null;
  completedAt: TISODateTime | null;
  labelIds: TUUID[];
  createdAt: TISODateTime;
  createdById: TUUID;
  capabilities: string[];
  allowedTransitions: TUUID[];
}
interface ICreateWorkItemDto {
  typeKey: TWorkItemKind | string;
  title: string;
  description?: Record<string, unknown> | null;
  priority?: TPriority;
  assigneeId?: TUUID | null;
  dueDate?: TISODate | null;
  parentId?: TUUID | null;
  epicId?: TUUID | null;
  labelIds?: TUUID[];
}
interface IPatchWorkItemDto {
  title?: string;
  description?: Record<string, unknown> | null;
  priority?: TPriority;
  assigneeId?: TUUID | null;
  dueDate?: TISODate | null;
  labelIds?: TUUID[];
  // statusId and projectId FORBIDDEN; use dedicated commands.
}
```

### 2.4 Comments, checklists, notifications

```ts
interface ICommentDto {
  id: TUUID;
  itemId: TUUID;
  authorId: TUUID;
  body: Record<string, unknown>;
  version: number;
  etag: string;
  createdAt: TISODateTime;
  updatedAt: TISODateTime | null;
  deletedAt: TISODateTime | null;
}
interface IChecklistItemDto {
  id: TUUID;
  itemId: TUUID;
  text: string;
  isCompleted: boolean;
  rank: string;
  version: number;
  etag: string;
  createdAt: TISODateTime;
}
interface INotificationDto {
  id: TUUID;
  workspaceId: TUUID;
  type: string;
  actorId: TUUID | null;
  subject: { type: string; id: TUUID };
  createdAt: TISODateTime;
  readAt: TISODateTime | null;
  preview: string | null; // redacted when subject access is revoked
}
```

## 3. Module endpoint catalog

**Legend**: `R` read; `C` create; `U` update; `X` domain command; `D` delete; `(P0/P1/P2)` feature stage. All paths are relative to `/api/v1`. Abbreviations `{wid}` workspace UUID, `{pid}` project UUID, `{iid}` WorkItem UUID, `{sid}` sprint UUID. When an ID is a path parameter, it is always a UUID unless explicitly documented.

### 3.1 Identity, Auth, Account (global)

| Method          | Path                              | Stage | Permission / result                                                          |
| --------------- | --------------------------------- | ----- | ---------------------------------------------------------------------------- |
| POST            | `/auth/register`                  | P0    | Register; 201 pending verification, generic responses to prevent enumeration |
| POST            | `/auth/login`                     | P0    | Establish HttpOnly browser session; returns `UserDto`                        |
| POST            | `/auth/logout`                    | P0    | Revoke browser session, 204                                                  |
| POST            | `/auth/email/verify`              | P0    | Consume one-time email verification token                                    |
| POST            | `/auth/password/forgot`           | P0    | Always generic 202; no account enumeration                                   |
| POST            | `/auth/password/reset`            | P0    | Consume one-time reset token; revoke sessions by policy                      |
| GET             | `/me`                             | P0    | Current user profile and account status                                      |
| PATCH           | `/me`                             | P0    | Edit profile; own only, `If-Match`                                           |
| GET/PATCH       | `/me/preferences`                 | P0    | Theme, locale, timezone, date formatting                                     |
| GET             | `/me/workspaces`                  | P0    | Active workspace memberships                                                 |
| GET             | `/me/tasks?workspaceId={wid}`     | P0    | Personal task list filtered to one workspace                                 |
| GET             | `/me/sessions`                    | P1    | Active sessions                                                              |
| DELETE          | `/me/sessions/{sessionId}`        | P1    | Revoke session                                                               |
| POST            | `/auth/oauth/{provider}/start`    | P1    | Provider initiation; return redirect URL or redirect                         |
| GET             | `/auth/oauth/{provider}/callback` | P1    | Server-handled auth code callback (not called by RTK Query)                  |
| POST/DELETE     | `/me/mfa/*`                       | P1    | Enable/verify/disable MFA with reauthentication                              |
| GET/POST/DELETE | `/me/api-tokens`                  | P1    | Scoped service tokens; token secret returned only on creation                |

**Auth/CSRF:** login state is not stored in RTK Query as a secret; `GET /me` returns non-sensitive profile. `GET /auth/csrf` is required by the later frontend proposal but absent from the core YAML; confirm and formalize it before implementing auth. All auth operations require IP/user rate controls.

### 3.2 Workspace (P0)

| Method    | Path                                           | Description / permission                                  |
| --------- | ---------------------------------------------- | --------------------------------------------------------- |
| GET       | `/workspaces`                                  | List workspaces visible to actor                          |
| POST      | `/workspaces`                                  | Create and become Owner; `Idempotency-Key`                |
| GET       | `/workspaces/{wid}`                            | Workspace detail; member only                             |
| PATCH     | `/workspaces/{wid}`                            | `workspace.update`; `If-Match`                            |
| POST      | `/workspaces/{wid}/archive`                    | Owner policy; require `If-Match`                          |
| POST      | `/workspaces/{wid}/restore`                    | Owner policy; require `If-Match`                          |
| GET       | `/workspaces/{wid}/capabilities`               | Effective workspace permissions                           |
| GET       | `/workspaces/{wid}/members`                    | Paginated workspace members, authorized roles only        |
| PATCH     | `/workspaces/{wid}/members/{userId}`           | Change role; never remove last active Owner               |
| DELETE    | `/workspaces/{wid}/members/{userId}`           | Revoke membership; forbidden if last Owner                |
| GET       | `/workspaces/{wid}/invitations`                | Admin/Owner invitation list                               |
| POST      | `/workspaces/{wid}/invitations`                | Invite email + role + optional project grants; idempotent |
| DELETE    | `/workspaces/{wid}/invitations/{invitationId}` | Revoke invite                                             |
| POST      | `/invitations/accept`                          | Consume one-time invite token; do not accept duplicate    |
| POST      | `/invitations/decline`                         | Decline invite                                            |
| GET       | `/workspaces/{wid}/activity`                   | P1 workspace audit/access-filtered activity               |
| GET/PATCH | `/workspaces/{wid}/settings`                   | P1 working days/holidays/default policies                 |
| POST      | `/workspaces/{wid}/ownership-transfer`         | P1 reauthentication + two-party policy                    |
| GET       | `/workspaces/{wid}/export-jobs`                | P2 authorized export jobs                                 |
| POST      | `/workspaces/{wid}/export-jobs`                | P2 async export job, 202                                  |

**Workspace create request P0**: `{name, slug?, description?, timezone}`. Response `WorkspaceDto`, 201. **Invitation P0**: `{email, role, projectGrants?: [{projectId, role}]}`; do not expose whether unknown email has account outside permitted admin UI. **Member PATCH**: `{role}` plus `If-Match`, `200 WorkspaceMemberDto`.

### 3.3 Team (P1) / Portfolio (P2)

| Method      | Path                                       | Stage | Semantics                              |
| ----------- | ------------------------------------------ | ----- | -------------------------------------- |
| GET/POST    | `/workspaces/{wid}/teams`                  | P1    | List/create team                       |
| GET/PATCH   | `/teams/{teamId}`                          | P1    | Detail/update team                     |
| POST        | `/teams/{teamId}/members`                  | P1    | Add member (already in workspace)      |
| DELETE      | `/teams/{teamId}/members/{userId}`         | P1    | Remove team membership                 |
| GET         | `/teams/{teamId}/workload`                 | P1    | Role-filtered workload summary         |
| GET/POST    | `/workspaces/{wid}/portfolios`             | P2    | List/create portfolio                  |
| GET/PATCH   | `/portfolios/{portfolioId}`                | P2    | Detail/update                          |
| POST/DELETE | `/portfolios/{portfolioId}/projects/{pid}` | P2    | Link/unlink projects, no task movement |
| GET         | `/portfolios/{portfolioId}/roadmap`        | P2    | Milestones and dependencies            |

### 3.4 Project (P0)

| Method    | Path                               | Description / permission                                                |
| --------- | ---------------------------------- | ----------------------------------------------------------------------- |
| GET       | `/workspaces/{wid}/projects`       | Visible project list, includes workspace-visible and authorized private |
| POST      | `/workspaces/{wid}/projects`       | `project.create`; `Idempotency-Key`; creates default statuses           |
| GET       | `/projects/{pid}`                  | Project detail with capabilities                                        |
| PATCH     | `/projects/{pid}`                  | `project.update` + `If-Match`                                           |
| POST      | `/projects/{pid}/archive`          | `project.archive` + `If-Match`                                          |
| POST      | `/projects/{pid}/restore`          | `project.restore` + `If-Match`                                          |
| GET       | `/projects/{pid}/capabilities`     | Effective role + permission names + policyVersion                       |
| GET       | `/projects/{pid}/members`          | Membership list for authorized actors                                   |
| POST      | `/projects/{pid}/members`          | Add workspace member with project role                                  |
| PATCH     | `/projects/{pid}/members/{userId}` | Change project role; `If-Match` membership ETag                         |
| DELETE    | `/projects/{pid}/members/{userId}` | Revoke direct project grant                                             |
| GET       | `/projects/{pid}/overview`         | Visible counters for authorized project                                 |
| GET/PATCH | `/projects/{pid}/settings`         | P1 per-project feature toggles/settings                                 |
| POST      | `/projects/{pid}/duplicate`        | P1 clone project with explicit copy flags                               |

**CreateProject**: `{name, key, description?, visibility: "workspace"|"private", template: "kanban"|"scrum"|"blank", leadId?}`. Returned Project includes actual `enabledModules` and default workflow. Project key immutable after first item in P0; rename key P2 migration flow, not generic PATCH.

### 3.5 Workflow and statuses (P0 basic, P1 graph)

| Method | Path                                                 | Stage | Semantics                                                                            |
| ------ | ---------------------------------------------------- | ----- | ------------------------------------------------------------------------------------ |
| GET    | `/projects/{pid}/statuses`                           | P0    | Active statuses in rank order                                                        |
| POST   | `/projects/{pid}/statuses`                           | P0    | Create status (name, category, color, afterStatusId?)                                |
| PATCH  | `/projects/{pid}/statuses/{statusId}`                | P0    | Rename/color/category, version check; category change with tasks may require preview |
| POST   | `/projects/{pid}/statuses/reorder`                   | P0    | Update order, project workflow ETag                                                  |
| POST   | `/projects/{pid}/statuses/{statusId}/retire-preview` | P0    | Count affected active/archived items, validate replacement                           |
| POST   | `/projects/{pid}/statuses/{statusId}/retire`         | P0    | `{replacementStatusId, previewToken}`; atomic remap + audit; `If-Match`              |
| GET    | `/projects/{pid}/workflow`                           | P1    | Graph + version                                                                      |
| PUT    | `/projects/{pid}/workflow/transitions`               | P1    | Atomic replacement of transition graph, `If-Match`                                   |
| GET    | `/items/{iid}/available-transitions`                 | P1    | Current allowed transitions, with restrictions                                       |

In **P0**, user with `item.transition` may move between any **active** project statuses. P1 adds transition rules, validators, guards, approval conditions; the same transition command stays stable. Can't delete final/default status without correct safe migration to another status. `retire-preview` is read-only despite being POST (complex preview input), may return 200. `retire` requires a recent preview token.

### 3.6 Work Items and their fields (P0)

| Method | Path                                 | Semantics                                                                       |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------- |
| GET    | `/projects/{pid}/items`              | Cursor list + simple filters; summary only                                      |
| POST   | `/projects/{pid}/items`              | Create work item, atomic unique key, event; 201                                 |
| GET    | `/items/{iid}`                       | Detail, allowedTransitions + capabilities                                       |
| PATCH  | `/items/{iid}`                       | Patch allowlisted ordinary fields; `If-Match`                                   |
| POST   | `/items/{iid}/transitions`           | `{toStatusId, rank?}`; workflow check + `If-Match`; returns item                |
| POST   | `/items/{iid}/reorder`               | `{beforeItemId?, afterItemId?, expectedGroupStatusId}`; stable rank, `If-Match` |
| POST   | `/items/{iid}/archive`               | Archive, `If-Match`                                                             |
| POST   | `/items/{iid}/restore`               | Restore, `If-Match`                                                             |
| GET    | `/items/{iid}/activity`              | Cursor-paginated immutable business events                                      |
| GET    | `/projects/{pid}/item-types`         | Enabled types + validated field schemas                                         |
| GET    | `/projects/{pid}/labels`             | Available labels                                                                |
| POST   | `/projects/{pid}/items/search`       | P1 complex validated filter AST                                                 |
| GET    | `/item-keys/{key}?workspaceId={wid}` | P1 resolve display key/alias; current authorized id/canonicalKey                |
| POST   | `/items/{iid}/duplicate`             | P1 copy selected fields, optional subtasks                                      |
| POST   | `/items/{iid}/move-preview`          | P1 request target project, mapping, conflicts, previewToken                     |
| POST   | `/items/{iid}/move`                  | P1 atomic move using preview + `If-Match`, new key, aliases                     |
| POST   | `/projects/{pid}/items/bulk-update`  | P1 per-item result; use explicit command + partial success contract             |
| GET    | `/projects/{pid}/fields`             | P1 custom field definitions                                                     |
| PATCH  | `/items/{iid}/field-values`          | P1 validate typed custom field values                                           |
| POST   | `/items/{iid}/links`                 | P1 add typed relation, check cycles                                             |
| DELETE | `/items/{iid}/links/{linkId}`        | P1 unlink relation                                                              |
| POST   | `/items/{iid}/watchers`              | P1 subscribe permitted user                                                     |
| DELETE | `/items/{iid}/watchers/{userId}`     | P1 remove watcher                                                               |

**Create** P0: `typeKey`, `title` required; optional `description`, `priority`, `assigneeId`, `dueDate`, `parentId`, `epicId`, `labelIds`. Server sets reporter, default status, item number. Check parent/epic is in same project and correct type; parent depth max 1 in P0. **Patch** fields: title, description, priority, assignee, dueDate, labels; do not allow status or project direct writes.

#### Transition command example

```http
POST /api/v1/items/11111111-1111-4111-8111-111111111111/transitions
Content-Type: application/json
If-Match: "4"
Idempotency-Key: 1d7a8db5-37ca-4a55-bd9d-b9c609255290

{"toStatusId":"22222222-2222-4222-8222-222222222222"}
```

`200 WorkItemDetailDto`, `ETag: "5"`; `412` stale version; `409 INVALID_TRANSITION` forbidden by workflow; `422 INVALID_STATUS` nonexistent/status wrong project; `403/404` effective access failure. Transitioning to done sets current completedAt; reopening clears current completedAt but retains activity.

#### Reorder semantics

`beforeItemId`/`afterItemId` are UUIDs of adjacent cards **in the same ordering group**. `expectedGroupStatusId` guards against races. At most one side may be null for endpoints; backend recalculates fractional ranks, uses stable sorting and returns updated rank. Drag operations with sort by priority/dueDate rather than manual `rank` should be disabled in UI.

#### Move-preview and move (P1)

```json
{
  "targetProjectId": "33333333-3333-4333-8333-333333333333",
  "includeSubtasks": true,
  "statusMappings": [{ "sourceStatusId": "...", "targetStatusId": "..." }],
  "dropUnsupportedFieldValues": false
}
```

Preview response: `{allowed, warnings, errors, estimatedAffectedItems, candidateMappings, previewToken, expiresAt}`. Move request repeats selected mappings and previewToken with `If-Match` + idempotency key. On commit preserve immutable item id, assign new `key`, write alias, audit and invalidate both project caches. Source/target must belong to same Workspace unless a separately secured import/transfer flow is designed. Abort if parent/epic/release/sprint constraints cannot be satisfied.

### 3.7 Checklist / comments / attachments / activity (P0)

| Method | Path                                                   | Stage | Semantics                                                 |
| ------ | ------------------------------------------------------ | ----- | --------------------------------------------------------- |
| GET    | `/items/{iid}/checklist`                               | P0    | List checklist entries                                    |
| POST   | `/items/{iid}/checklist`                               | P0    | Create entry, `Idempotency-Key`                           |
| PATCH  | `/items/{iid}/checklist/{checkId}`                     | P0    | Text, completed, rank; `If-Match` entry                   |
| DELETE | `/items/{iid}/checklist/{checkId}`                     | P0    | Delete item (activity policy applies)                     |
| GET    | `/items/{iid}/comments`                                | P0    | Cursor-paginated comments, rich-text body                 |
| POST   | `/items/{iid}/comments`                                | P0    | Create comment, mention validation, idempotent            |
| PATCH  | `/items/{iid}/comments/{commentId}`                    | P0    | Owner/moderator edit + `If-Match`                         |
| DELETE | `/items/{iid}/comments/{commentId}`                    | P0    | Soft-delete/tombstone                                     |
| POST   | `/items/{iid}/attachments/uploads`                     | P0    | Initiate upload; filename, size, MIME + checksum          |
| POST   | `/items/{iid}/attachments/{attachmentId}/complete`     | P0    | Finalize upload, scan/verify, attach resource             |
| GET    | `/items/{iid}/attachments`                             | P0    | Files list with metadata, no secret storage keys          |
| POST   | `/items/{iid}/attachments/{attachmentId}/download-url` | P0    | Check current permission and issue short-lived signed URL |
| DELETE | `/items/{iid}/attachments/{attachmentId}`              | P0    | Delete with authorization                                 |
| GET    | `/items/{iid}/activity`                                | P0    | Event log in reverse chronology                           |
| POST   | `/items/{iid}/comments/{commentId}/replies`            | P1    | Threaded replies                                          |
| POST   | `/items/{iid}/comments/{commentId}/reactions`          | P1    | Emoji reaction                                            |

Upload initiation response contains `{attachmentId, uploadUrl, uploadHeaders, expiresAt, maxBytes}`; direct binary upload bypasses JSON API, then `complete` verifies ownership, size, checksum and scanning. Files must **never be public by default**. Prefer downloadable URL with short expiry only after access check.

### 3.8 Project views and My Work

| Method           | Path                                   | Stage | Semantics                                                       |
| ---------------- | -------------------------------------- | ----- | --------------------------------------------------------------- |
| GET              | `/projects/{pid}/views`                | P0    | Default Board + List descriptors; no duplicate task collections |
| GET              | `/projects/{pid}/views/{viewId}/items` | P0    | View filter/sort result, summary DTO                            |
| GET              | `/me/tasks?workspaceId={wid}`          | P0    | Assigned tasks and simple filters                               |
| GET/POST         | `/projects/{pid}/views`                | P1    | Create and list custom views                                    |
| GET/PATCH/DELETE | `/views/{viewId}`                      | P1    | Manage view configuration, personal/shared scope                |
| POST             | `/views/{viewId}/duplicate`            | P1    | Duplicate view                                                  |
| POST             | `/views/{viewId}/favorite`             | P1    | Favorite view                                                   |
| GET              | `/projects/{pid}/calendar`             | P1    | Calendar aggregation, authorized tasks                          |
| GET              | `/projects/{pid}/timeline`             | P2    | Timeline projection; authorized tasks                           |
| GET              | `/teams/{teamId}/workload`             | P1    | Capacity projection                                             |

A View contains `scope`, `ownerId?`, `name`, `type`, `filter`, `sort`, `groupBy`, `columns`, `version`. Shared View permissions never grant read access to underlying private tasks. P0 default Board and List need not be separate persistent rows if view descriptors are deterministically exposed.

### 3.9 Notifications, search, favorites

| Method          | Path                                                  | Stage | Semantics                                     |
| --------------- | ----------------------------------------------------- | ----- | --------------------------------------------- |
| GET             | `/me/notifications?workspaceId={wid}&unreadOnly=true` | P0    | Cursor-paginated, access-redacted previews    |
| POST            | `/me/notifications/{notificationId}/read`             | P0    | Mark as read, idempotent                      |
| POST            | `/me/notifications/read-all`                          | P0    | Mark visible inbox read, `workspaceId` scoped |
| GET             | `/workspaces/{wid}/search?q=...&type=item,project`    | P0    | Search only accessible project/item metadata  |
| GET/PATCH       | `/me/notification-preferences`                        | P1    | Channels, digests and quiet hours             |
| GET/POST/DELETE | `/me/favorites`                                       | P1    | Favorite references to accessible objects     |
| GET             | `/search/suggestions?workspaceId={wid}&q=...`         | P1    | Cross-resource permission-checked suggestions |
| POST            | `/me/notifications/{notificationId}/snooze`           | P1    | Snooze until ISO datetime                     |

Search P0 can initially match item key/title and project name; do not promise full text on day one. Rate-limit and enforce min/max search term lengths. A referenced object can become inaccessible after notification creation: preview then becomes null / redacted.

### 3.10 Scrum, Backlog, Epics and Sprints (P1)

| Method    | Path                                      | Semantics                                              |
| --------- | ----------------------------------------- | ------------------------------------------------------ |
| GET       | `/projects/{pid}/backlog`                 | Ranked unplanned or future planned items, with filters |
| GET/POST  | `/projects/{pid}/sprints`                 | List/create planned Sprint                             |
| GET/PATCH | `/sprints/{sid}`                          | Sprint detail/update planned Sprint, `If-Match`        |
| POST      | `/sprints/{sid}/items`                    | Add items to Sprint, validate project and capacity     |
| DELETE    | `/sprints/{sid}/items/{iid}`              | Remove before completion, record scope changes         |
| POST      | `/sprints/{sid}/start`                    | Plan→Active command, `If-Match`                        |
| POST      | `/sprints/{sid}/complete-preview`         | Show finished/unfinished count, candidate destination  |
| POST      | `/sprints/{sid}/complete`                 | Active→Completed, snapshot and move unfinished         |
| GET       | `/sprints/{sid}/report`                   | Completed snapshot & scope changes                     |
| GET       | `/projects/{pid}/epics`                   | Epics in project (same item model)                     |
| POST      | `/items/{iid}/epic-membership`            | Assign/remove Epic (same-project, no cycles)           |
| GET       | `/projects/{pid}/velocity`                | Velocity history                                       |
| GET       | `/projects/{pid}/burndown?sprintId={sid}` | Burndown with immutable sprint history                 |

A Sprint is `planned → active → completed`; re-opening a completed Sprint is out of scope unless explicitly defined. P1 policy: one active Sprint per Project as default, optionally relaxed in later edition. Sprint scope snapshots and work item membership history must be audit-safe. `complete` uses a previewToken, `If-Match`, and Idempotency-Key.

### 3.11 Releases, milestones, time tracking (P1)

| Method       | Path                                | Semantics                                     |
| ------------ | ----------------------------------- | --------------------------------------------- |
| GET/POST     | `/projects/{pid}/releases`          | Version list/create                           |
| GET/PATCH    | `/releases/{releaseId}`             | Version details                               |
| POST         | `/releases/{releaseId}/publish`     | Mark Released, optional release notes         |
| POST         | `/releases/{releaseId}/items`       | Associate item with release                   |
| DELETE       | `/releases/{releaseId}/items/{iid}` | Remove association                            |
| GET/POST     | `/projects/{pid}/milestones`        | List/create checkpoint                        |
| GET/PATCH    | `/milestones/{milestoneId}`         | Modify checkpoint                             |
| POST         | `/milestones/{milestoneId}/items`   | Link items                                    |
| GET/POST     | `/items/{iid}/time-entries`         | List/create time log                          |
| PATCH/DELETE | `/time-entries/{entryId}`           | Update/remove own time entry                  |
| POST         | `/items/{iid}/timer/start`          | Start one personal timer (enforce one active) |
| POST         | `/items/{iid}/timer/stop`           | Stop active timer and write entry             |
| GET          | `/me/timesheet?week=YYYY-MM-DD`     | Weekly rollup                                 |

### 3.12 Dashboards and Reports

| Method           | Path                               | Stage | Semantics                     |
| ---------------- | ---------------------------------- | ----- | ----------------------------- |
| GET              | `/projects/{pid}/overview`         | P0    | Authorized overview counters  |
| GET/POST         | `/workspaces/{wid}/dashboards`     | P1    | List/create dashboard         |
| GET/PATCH/DELETE | `/dashboards/{dashboardId}`        | P1    | Dashboard layout/widgets      |
| GET              | `/dashboards/{dashboardId}/data`   | P1    | Access-filtered widget data   |
| GET              | `/projects/{pid}/reports/flow`     | P1    | Lead/cycle time projections   |
| POST             | `/reports/exports`                 | P1    | Async export task, 202        |
| GET              | `/reports/exports/{jobId}`         | P1    | Status/download when ready    |
| GET              | `/portfolios/{portfolioId}/health` | P2    | Aggregated risk/roadmap stats |

Do not return counts of private items user cannot read. Report responses should include `generatedAt`, `filtersApplied`, `asOf` or staleness indicator when projections are async.

### 3.13 Documents and Wiki (P2)

| Method           | Path                                       | Semantics                                   |
| ---------------- | ------------------------------------------ | ------------------------------------------- |
| GET/POST         | `/workspaces/{wid}/documents`              | List/create workspace docs                  |
| GET/POST         | `/projects/{pid}/documents`                | List/create project docs                    |
| GET/PATCH/DELETE | `/documents/{documentId}`                  | Document content, version conflict handling |
| GET              | `/documents/{documentId}/revisions`        | Version history                             |
| POST             | `/documents/{documentId}/restore-revision` | Restore selected revision, audit            |
| POST             | `/documents/{documentId}/links`            | Link to work item/project                   |

### 3.14 Forms, Requests, Intake (P2)

| Method    | Path                                      | Semantics                                               |
| --------- | ----------------------------------------- | ------------------------------------------------------- |
| GET/POST  | `/projects/{pid}/forms`                   | Manage request forms                                    |
| GET/PATCH | `/forms/{formId}`                         | Configure form and mappings                             |
| POST      | `/forms/{formId}/publish`                 | Publish with scope and rate limits                      |
| POST      | `/public/forms/{publicToken}/submissions` | Public submission, spam protection, no private metadata |
| GET       | `/projects/{pid}/intake`                  | Moderation queue                                        |
| POST      | `/intake/{submissionId}/accept`           | Create mapped item idempotently                         |
| POST      | `/intake/{submissionId}/reject`           | Reject, optional safe notification                      |

### 3.15 Automation (P2)

| Method           | Path                                 | Semantics                                      |
| ---------------- | ------------------------------------ | ---------------------------------------------- |
| GET/POST         | `/projects/{pid}/automation-rules`   | List/create rules                              |
| GET/PATCH/DELETE | `/automation-rules/{ruleId}`         | Edit/delete rule with version                  |
| POST             | `/automation-rules/{ruleId}/test`    | Validate + dry-run without side effects        |
| POST             | `/automation-rules/{ruleId}/enable`  | Activate after validation                      |
| POST             | `/automation-rules/{ruleId}/disable` | Deactivate                                     |
| GET              | `/automation-rules/{ruleId}/runs`    | Paginated execution log                        |
| POST             | `/automation-runs/{runId}/retry`     | Replay failed step with idempotency safeguards |

Prevent loops via causation IDs, max execution depth, quotas, and explicit “automation actor” permissions; no unauthorized privilege escalation.

### 3.16 Integrations, webhooks and public tokens (P2 unless noted)

| Method       | Path                                                | Semantics                         |
| ------------ | --------------------------------------------------- | --------------------------------- |
| GET          | `/workspaces/{wid}/integrations`                    | Installed integration list        |
| POST         | `/workspaces/{wid}/integrations/{provider}/connect` | Provider OAuth/installation start |
| DELETE       | `/integrations/{integrationId}`                     | Disconnect + revoke access        |
| GET          | `/integrations/{integrationId}/sync-runs`           | Sync diagnostics                  |
| GET/POST     | `/workspaces/{wid}/webhooks`                        | Manage outgoing webhooks          |
| PATCH/DELETE | `/webhooks/{webhookId}`                             | Edit/disable/delete               |
| GET          | `/webhooks/{webhookId}/deliveries`                  | Delivery logs, retry support      |
| POST         | `/webhooks/{webhookId}/rotate-secret`               | Rotate signing secret             |
| GET/POST     | `/workspaces/{wid}/imports`                         | Import jobs and mappings          |
| GET          | `/imports/{jobId}`                                  | Import status/issues              |
| POST         | `/imports/{jobId}/commit`                           | Apply validated import batch      |

Outgoing webhooks: signed body + delivery ID + event ID + retry schedule + redaction on permission scope. OAuth callbacks must validate `state`, PKCE when appropriate; secrets remain server-side.

### 3.17 Security, audit, billing, realtime (P2)

| Method    | Path                                          | Semantics                                             |
| --------- | --------------------------------------------- | ----------------------------------------------------- |
| GET       | `/workspaces/{wid}/audit-log`                 | Security events (authorized admins only)              |
| GET/PATCH | `/workspaces/{wid}/security-policy`           | MFA/domain/guest policies                             |
| GET       | `/workspaces/{wid}/usage`                     | Quotas/limits                                         |
| GET       | `/workspaces/{wid}/subscription`              | Plan and invoices (redacted)                          |
| POST      | `/workspaces/{wid}/billing/checkout-session`  | External checkout session, server side                |
| GET       | `/events/stream?workspaceId={wid}`            | P1 SSE with authenticated, permission-filtered events |
| GET       | `/events/resume?workspaceId={wid}&cursor=...` | P1 catch-up projection cursor                         |

Real-time event messages carry `{eventId, workspaceId, entityType, entityId, action, version, occurredAt}`; **no sensitive full WorkItem bodies**. Client invalidates RTK Query caches/refetches, not blindly applies every broadcast. On permission changes, scrub stale sensitive cached data. Implement heartbeats/backoff/Last-Event-ID without leaking events from other tenants.

## 4. Key P0 request/response examples

### 4.1 Create Workspace

```http
POST /api/v1/workspaces
Idempotency-Key: d3ef445f-c0de-43dc-900a-780303724559
Content-Type: application/json

{"name":"Acme Engineering","slug":"acme-engineering","timezone":"Europe/Paris"}
```

Result: `201 WorkspaceDto`, `Location: /api/v1/workspaces/{wid}`. Invalid/duplicate slug: `409 WORKSPACE_SLUG_TAKEN` (safe to disclose permitted public slug collision).

### 4.2 Create Project

```http
POST /api/v1/workspaces/{wid}/projects
Idempotency-Key: 816c6e1a-0eaa-47ca-a839-fe2cbc6819bc
Content-Type: application/json

{"name":"Website","key":"WEB","visibility":"private","template":"kanban"}
```

Result: `201 ProjectDto` plus provisioned statuses (`GET /projects/{pid}/statuses`). Response includes actual role/capabilities.

### 4.3 Create Work Item

```http
POST /api/v1/projects/{pid}/items
Idempotency-Key: 81573624-cdca-427a-ae3c-90f28a98c5bc
Content-Type: application/json

{"typeKey":"task","title":"Add filtering","priority":"high","assigneeId":null,"dueDate":"2026-11-02"}
```

Result `201 WorkItemDetailDto`, `Location: /api/v1/items/{iid}`, `ETag: "1"` (opaque). Reporter/status/number from server.

### 4.4 Update field

```http
PATCH /api/v1/items/{iid}
If-Match: "4"
Content-Type: application/json

{"title":"Add assignee filtering", "assigneeId":null}
```

Result `200 WorkItemDetailDto`, `ETag: "5"`. If write is stale, `412` problem details, `currentVersion`, user should merge/refresh. `PATCH` cannot set `statusId`, `projectId`, `completedAt` or `version`.

### 4.5 Comment and notification

```http
POST /api/v1/items/{iid}/comments
Idempotency-Key: 57223a31-a910-4e80-9d05-ae9cc27fdf93
Content-Type: application/json

{"body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Please check the API contract"}]}]},"mentionedUserIds":[]}
```

Result `201 CommentDto`. No duplicate comment/mention notification on idempotent retry. `mentionedUserIds` must match validated references in the rich-text doc if present; don't trust client-provided mention IDs alone.

### 4.6 Delete status with tasks

```http
POST /api/v1/projects/{pid}/statuses/{statusId}/retire-preview
Content-Type: application/json

{"replacementStatusId":"44444444-4444-4444-8444-444444444444"}
```

Result `200`: `{affectedActiveCount, affectedArchivedCount, warnings, previewToken, expiresAt}`; counts only visible to workflow managers. Apply `POST /retire` with same replacement and `previewToken`, `If-Match` status/project workflow version. If state changed since preview, return `409 PREVIEW_STALE`; no partial rewrite.

## 5. Permissions and UI gating — contract map

| API family          | Permission examples                                          | Important extra checks                                 |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Workspace write     | `workspace.update`, `workspace.members.manage`               | Owner protections, tenant match                        |
| Project write       | `project.create`, `project.update`, `project.members.manage` | visibility, target user workspace membership           |
| Workflow            | `project.workflow.manage`                                    | active status, not last/default; safe migration        |
| Items create/update | `item.create`, `item.update`, `item.assign`                  | assignee membership, archive, parent/epic, valid types |
| Item transition     | `item.transition`                                            | transition graph P1, current version, target status    |
| Item move           | `item.move` source + `item.create` target                    | same tenant, mapping, dependent relations              |
| Comments            | `comment.create`, `comment.update_own`                       | authorship, mention access, tombstone                  |
| Attachments         | `attachment.upload`, `attachment.download`                   | file scan, signed URL, currently authorized            |
| Sprint              | `sprint.manage`                                              | same project, active lifecycle and scope snapshot      |
| Views               | `view.personal.manage`, `view.shared.manage`                 | per-user filtering on underlying tasks                 |
| Reports             | `project.reports.read`, `report.export`                      | no private aggregate leakage                           |

P0 Project baseline: `Manager`, `Editor`, `Viewer`; a Workspace Admin can administer workspace but not silently read a private project without grant. P1: Team-granted roles and optional `Commenter`. Effective policy computed server-side with policyVersion.

## 6. Frontend RTK Query design

### 6.1 Slice and cache boundaries

```text
src/shared/api/base-api.ts
src/entities/workspace/api/workspace-api.ts
src/entities/project/api/project-api.ts
src/entities/workflow/api/workflow-api.ts
src/entities/work-item/api/work-item-api.ts
src/entities/comment/api/comment-api.ts
src/entities/notification/api/notification-api.ts
src/entities/sprint/api/sprint-api.ts        (P1)
```

Prefer **one shared RTK Query `baseApi` per API origin** with `injectEndpoints`. Cache identifiers:

```ts
tagTypes: [
  'Me',
  'Workspace',
  'WorkspaceMembers',
  'Project',
  'ProjectMembers',
  'ProjectStatuses',
  'ProjectItems',
  'WorkItem',
  'WorkItemComments',
  'WorkItemActivity',
  'ProjectViews',
  'MyTasks',
  'Inbox',
  'Capabilities',
  'Sprint',
  'SprintItems',
  'Report',
];
```

- `getWorkItem(id)` provides `WorkItem` tag by `id`.
- `getProjectItems(args)` provides `ProjectItems` by `projectId`/view identity; prefer stable tag strategy across arbitrary filters so mutation invalidates all relevant lists.
- `transitionWorkItem` invalidates item detail, project list(s), My Tasks and reports, optionally optimistic patch when rollback is safe.
- For paginated lists: maintain cursor/query keys; careful with invalidation of previous pages and rank reorders.
- No secrets in Redux; credentials by same-origin session cookie. For unexpected 403/404 after revocation, clear cached sensitive screens and invalidate membership/capability data.
- Handle `412` specially: fetch latest data and let user decide how to merge changes; no silent destructive retries.
- Treat `createdAt`, `dueDate`, IDs as **strings** at API boundary. Only format dates at UI layer.

### 6.2 Example RTK Query endpoint (conceptual)

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'same-origin',
    prepareHeaders: (headers) => {
      // A proxy does not add CSRF protection automatically.
      // Implement the agreed request-token header before connecting mutations.
      // Never attach long-lived access tokens from localStorage.
      return headers;
    },
  }),
  tagTypes: ['WorkItem', 'ProjectItems', 'MyTasks', 'Capabilities'],
  endpoints: () => ({}),
});

export const itemApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getItem: build.query<IWorkItemDetailDto, string>({
      query: (id) => `/items/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'WorkItem', id }],
    }),
    transitionItem: build.mutation<
      IWorkItemDetailDto,
      {
        id: string;
        toStatusId: string;
        etag: string;
        idempotencyKey: string;
      }
    >({
      query: ({ id, toStatusId, etag, idempotencyKey }) => ({
        url: `/items/${id}/transitions`,
        method: 'POST',
        headers: { 'If-Match': etag, 'Idempotency-Key': idempotencyKey },
        body: { toStatusId },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'WorkItem', id },
        'ProjectItems',
        'MyTasks',
      ],
    }),
  }),
});
```

In a production app `etag` comes from the resource DTO (or from a typed transport wrapper preserving the response header), never guessed from the numerical version, CSRF header handling must be implemented in baseApi/BFF, and tag invalidation must include reports/notification when affected. Code above is illustrative, not copy-paste complete.

## 7. API contract testing checklist

| Test ID | Scenario                                              | Expected                                         |
| ------- | ----------------------------------------------------- | ------------------------------------------------ |
| API-001 | Two simultaneous POST items to same Project           | Unique item key/number                           |
| API-002 | POST same payload and Idempotency-Key twice           | Same status/body, exactly one item/event         |
| API-003 | Reuse same Idempotency-Key with changed payload       | 409 with code `IDEMPOTENCY_KEY_REUSED`           |
| API-004 | PATCH without If-Match                                | 428, no change                                   |
| API-005 | PATCH with stale If-Match                             | 412, no overwrite                                |
| API-006 | PATCH item with foreign Project statusId              | 422, immutable                                   |
| API-007 | Transition to status of other project                 | 422 `INVALID_STATUS`                             |
| API-008 | Invalid workflow transition in P1                     | 409 `INVALID_TRANSITION`                         |
| API-009 | Guest access to private project via direct id         | 404 masked, no metadata                          |
| API-010 | Remove a member while board is open                   | Next request denied; client purges private cache |
| API-011 | Attempt to remove sole Owner                          | 409 `LAST_OWNER`                                 |
| API-012 | Delete last status or occupied status without mapping | 409, no partial changes                          |
| API-013 | Move child across projects without family mapping     | 409, no partial changes                          |
| API-014 | Upload URL requested after access revoke              | No signed URL; 404/403                           |
| API-015 | Search/report includes private other-project item     | Must not leak title/count                        |
| API-016 | Repeat close Sprint request                           | Single completion/snapshot                       |
| API-017 | Change rank concurrently                              | No lost rank, stale request rejected             |
| API-018 | Archived Project mutation                             | 409 `PROJECT_ARCHIVED`                           |
| API-019 | Same URL filter, different signed cursors/user        | Cursor invalid/403/422 without data leak         |
| API-020 | POST comment with mention without access              | Mention denied/redacted, no notification         |

**Contract test sources:** OpenAPI examples/schemas, actual backend request/response contracts, authorization matrix, E2E tests and pure client-logic tests. Repository policy does not permit mock services for integration. Maintain the same error code glossary in backend and frontend.

## 8. Open questions / approval decisions

| ID      | Decision to confirm                       | Current recommendation                                                   |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| API-D01 | Browser authentication boundary           | Same-origin proxy with HttpOnly cookie + CSRF; BFF optional              |
| API-D02 | OpenAPI version                           | 3.1.2 for ecosystem tooling; consider 3.2 after checking generators      |
| API-D03 | Type-specific required fields at creation | Only title/type required P0; strict template fields P1                   |
| API-D04 | Role hierarchy                            | Workspace role + Project effective capabilities, no admin private bypass |
| API-D05 | Direct work item PATCH vs commands        | Commands for status/move/sprint, PATCH allowlisted simple fields         |
| API-D06 | Current project default roles             | Workspace-visible baseline Viewer, private requires explicit grant       |
| API-D07 | Item-level ETag transport in list         | Include per-item `etag` field (chosen)                                   |
| API-D08 | Maximum parent depth                      | One level P0; revisit P1                                                 |
| API-D09 | One active Sprint                         | Yes P1 initially                                                         |
| API-D10 | P0 attachment scan pipeline               | Scan before file available; use 202 pending state if needed              |
| API-D11 | Report eventual consistency               | Always return `asOf`/`generatedAt`                                       |
| API-D12 | Idempotency retention                     | 24 hours, scope principal/target/method/path                             |
| API-D13 | PATCH media type                          | `application/json` custom partial semantics with allowlist               |
| API-D14 | Date-only business timezone               | Workspace timezone, project override later                               |

## 9. Suggested implementation order

1. Establish `/api/v1`, auth/cookie/CSRF, error handler, request ID, openapi validation and test harness.
2. Workspace + memberships/invitations + permission evaluator.
3. Project + project members + workflow status management.
4. WorkItem creation/detail/list/PATCH and business commands, version checks, audit/outbox/idempotency.
5. Checklist/comments/attachments/activity and My Tasks/Inbox.
6. Board/List views, cache tags, DnD optimistic reconciliation, search/overview.
7. P1 Scrum, custom fields, cross-project move, relationships, saved views, Reports, Teams.
8. P2 Portfolios, Documents, Automations, Integrations, Enterprise modules.

### Definition of Done before P0 backend work

- [ ] Resolve API-D01, D07, D10, D13 (and any team-specific backend constraints).
- [ ] Review permission matrix with backend team.
- [ ] Formalize request/response schema and error codes for every P0 endpoint in OpenAPI.
- [ ] Generate typed TypeScript client types from OpenAPI and validate in CI.
- [ ] Add contract/authorization tests, including 401/404/409/412/428.
- [ ] Run representative concurrency tests for item key generation, rank updates, status deletion and Idempotency-Key.
- [ ] Publish and validate implemented backend endpoints before frontend integration.

## 10. Artifacts and completeness

- [`openapi-p0-core.yaml`](./openapi-p0-core.yaml) — machine-readable **draft core**, 75 operations / 75 schemas. It does **not yet include every P0 endpoint or fully validate domain-specific rich-text content**; the table in this document is the more complete reference.
- [`api-examples.http`](./api-examples.http) — REST client examples; demo IDs and `If-Match` values must be replaced with runtime values.
- The source mentions generator/validator scripts, but neither was supplied. No reproducible generation command is available from this bundle. Structural checks are not full OpenAPI validation.

## 11. Sources / standards

- OpenAPI 3.1.2: https://spec.openapis.org/oas/v3.1.2.html
- RFC 9457 Problem Details: https://www.rfc-editor.org/rfc/rfc9457.html
- RFC 9110 HTTP Semantics (If-Match/412): https://www.rfc-editor.org/rfc/rfc9110.html
- RFC 6585 (428 Precondition Required): https://www.rfc-editor.org/rfc/rfc6585.html
