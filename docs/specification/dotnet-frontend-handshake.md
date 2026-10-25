# ASP.NET Core ↔ Next.js/RTK Query — Integration Checklist

> Proposed contract additions and acceptance tests, 2026-10-16. Not yet implemented.

## Network and authentication

- [ ] Browser calls only `https://<frontend-host>/api/v1/*`; gateway forwards to ASP.NET Core.
- [ ] Reverse proxy forwards `Cookie` and `Set-Cookie` correctly, forwards `If-Match`, `ETag`, `Idempotency-Key`, `X-CSRF-Token`, `X-Request-Id` without stripping.
- [ ] `.NET` auth cookie has agreed `Name`, `Path=/`, appropriate `Domain`, `Secure`, `HttpOnly`, `SameSite=Lax` unless justified otherwise; cookie attributes are validated through ingress.
- [ ] Browser session endpoint `GET /me` works without exposing bearer tokens to JS.
- [ ] Set up ASP.NET Core `IAntiforgery`; add **new** `GET /api/v1/auth/csrf` endpoint issuing JS-readable `XSRF-TOKEN` request token; secure antiforgery validation cookie remains HttpOnly.
- [ ] Validate `X-CSRF-Token` for **all unsafe cookie-authenticated requests**, including login/logout; validate Origin and redirects according to threat model.
- [ ] Login/session rotation refreshes CSRF token; logout revokes session server-side.
- [ ] Denied access must not expose private project/task metadata in errors, counts or notifications.

## HTTP semantics

- [ ] Versioned GET endpoints return strong opaque `ETag` header; WorkItem summaries contain `etag` field matching resource version.
- [ ] PATCH and domain commands require `If-Match`, return `412` stale, `428` missing.
- [ ] `Idempotency-Key` accepted for defined POST commands; replaying identical request returns same response; reused key with different payload returns 409 domain code.
- [ ] Errors are RFC 9457 `application/problem+json` with consistent `code`, `requestId`, and optional `errors[]` as documented (including ASP.NET Core model validation).
- [ ] Paged lists return `{ data: [], pageInfo: { nextCursor, hasMore } }`; cursor scoped to tenant/filter/sort.
- [ ] Reordering operation defines rank behavior. Consider atomic move+order for Kanban cross-column drag.
- [ ] Do not allow generic PATCH to change project, status, display key, version or audit fields.
- [ ] `Cache-Control: private, no-store` for authenticated sensitive responses.

## API discovery and generation

- [ ] ASP.NET Core emits canonical OpenAPI 3.1 in CI (stable, semantic `operationId` values).
- [ ] Validate existing proposed `openapi-p0-core.yaml` against published backend schema, not only its internal references.
- [ ] Resolve documented vs YAML mismatch for item list filters (`statusId`, `assigneeId`, `sort`).
- [ ] Add missing CSRF bootstrap endpoint to OpenAPI.
- [ ] Generate TS DTOs with `openapi-typescript`; fail CI if output changes unexpectedly.

## Contract tests for backend + frontend

1. Fetch `/auth/csrf` → ensure request token is delivered.
2. POST login with CSRF → session cookie set, token rotation performed, `GET /me` succeeds.
3. POST without CSRF → rejected; ensure no mutation happened.
4. Create task, duplicate POST with same key → exactly one WorkItem created and same response replayed.
5. Fetch task and PATCH with its ETag → success with a new ETag.
6. PATCH with stale ETag → `412`, no mutation, proper ProblemDetails.
7. Missing If-Match on required operation → `428`.
8. Transition to forbidden status → domain `409` and no audit outbox event for failure.
9. Private project from another workspace → no data disclosure.
10. Logged-out browser or revoked member → no successful reads/writes after revocation.
11. Two clients drag task simultaneously → deterministic conflict/reconciliation.
12. Signed attachment URLs expire and are not reused without authorization.

## Related docs

- `frontend-api-layer.md`
- `api-contracts.md`
- `openapi-p0-core.yaml`
- `business-rules.md`
- `permissions-spec.md`
