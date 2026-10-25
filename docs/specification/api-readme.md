# API design package — 2026-10-16

This API is **not yet implemented**. The following are design proposals for frontend/backend review.

| File                                           | Purpose                                                                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [api-contracts.md](./api-contracts.md)         | Main contract: global conventions, endpoints for every planned module, core DTOs, business commands, permissions, errors, RTK Query usage, test cases and decisions |
| [openapi-p0-core.yaml](./openapi-p0-core.yaml) | Machine-readable OpenAPI **3.1.2** subset: 58 paths, 75 operations, 75 schemas                                                                                      |
| [api-examples.http](./api-examples.http)       | Request examples for REST clients                                                                                                                                   |
| [domain-model.md](./domain-model.md)           | Domain invariants and relation model                                                                                                                                |
| [business-rules.md](./business-rules.md)       | State transitions, edge cases                                                                                                                                       |
| [permissions-spec.md](./permissions-spec.md)   | Effective role/permission evaluation                                                                                                                                |

The source refers to `scripts/generate_openapi.py` and `scripts/validate_openapi.py`, but those files were not included. Do not run those absent commands. Full OpenAPI lint, code-generation compatibility and backend conformance still require validation.

## Decision notes

1. Most of the P0 data schemas are modeled. P1/P2 routes are design-stage catalogs and not stable contracts.
2. OpenAPI **core subset** intentionally does not contain every route in the main catalog, so don't interpret missing routes as canceled features.
3. Some domain examples in older docs use an illustrative `{error:{...}}` response. The **new canonical error response** is RFC 9457 Problem Details, as written in `api-contracts.md`.
4. URI parameters (`wid`, `pid`, `iid`) always contain UUIDs. Display keys like `WEB-123` resolve through a separately authorized alias route (P1).
5. Versioned list records expose `etag`; conditional mutations send the same value as `If-Match`.
6. This is a draft until backend review, code generation, validator checks and acceptance tests pass.

## Integration gaps

The core YAML omits the proposed `/auth/csrf` endpoint and item-list filter/sort parameters described in prose. Its presence does not configure the application or prove backend support. Read [frontend integration](frontend-api-layer.md), the [.NET handshake](dotnet-frontend-handshake.md), and [open decisions](implementation-plan.md) before implementation.
