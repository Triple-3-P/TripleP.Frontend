# TripleP product and API specification

This directory brings the relevant information from the supplied `task-manager-specification-v6-frontend-api (1)` bundle into version control. The source documents are dated October 16, 2026; this adaptation was prepared on October 25, 2026. Russian product documents are condensed in English, while the detailed English API proposals and machine-readable artifacts are retained. See [source import](source-import.md) for provenance, omissions, and corrections.

**Status: proposed product design, not an implemented API or an approved delivery commitment.** P0 means the proposed MVP, P1 the next product expansion, and P2 later capabilities. Open questions remain open; importing a specification does not resolve them.

## Read first

1. [Product scope](product-spec.md) and [feature catalog](feature-catalog.md).
2. [Domain model](domain-model.md), [business rules](business-rules.md), and [permissions](permissions-spec.md).
3. [User flows](user-flows.md) and [screen behavior](ux-screen-spec.md).
4. [API package](api-readme.md), [full API proposal](api-contracts.md), [frontend integration](frontend-api-layer.md), and [.NET handshake](dotnet-frontend-handshake.md).
5. [Implementation plan and unresolved decisions](implementation-plan.md).

Supporting artifacts: [OpenAPI P0 core](openapi-p0-core.yaml), [HTTP examples](api-examples.http), [core ER diagram](erd-core.mmd), and [planning ER diagram](erd-planning.mmd).

## Repository reality at import

| Repository revision inspected                 | Observed implementation                                                                                                                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend `origin/main` at `8695692`           | Next.js foundation, installed feature libraries, lint/typecheck/format/build scripts, and Vitest/Playwright configuration. No product tests or task-manager API integration.                               |
| Existing frontend landing branch at `a0f13d5` | Landing UI, English/Russian catalogs, Redux store/provider, an empty shared RTK Query API, and account presentation states. This is separate work, not included in the documentation branch.               |
| Backend `origin/main` at `270bb2f`            | .NET 10 layered scaffold with Web, RestApi, Logic, Database, Abstractions, and test projects. Only `GET /Health/health` is implemented. PostgreSQL is planned; product persistence and auth are not wired. |

These are historical observations, not a continuously updated release status. Fetch and inspect the relevant backend revision before implementing integration. The backend's development OpenAPI describes its implemented routes; the YAML here describes proposed routes.

## How this fits the workspace

The frontend repository hosts this shared planning set because the workspace root has no Git repository and the supplied bundle includes frontend integration guidance. Backend implementation must review the same domain and API proposals. Keep shared contract changes coordinated across repositories; do not create a second independently maintained contract copy.

The workspace and repository `AGENTS.md` files govern implementation. In particular:

- Use npm and the installed package versions. Do not adopt the bundle's pnpm setup.
- Use real backend contracts; missing endpoints are implementation dependencies. Do not introduce mock services from the reference bundle.
- Keep Redux infrastructure in `src/store`, with a fresh store and associated middleware per store instance. Reuse an existing shared API/provider when present.
- Use kebab-case module names, `T` type aliases, `I` interfaces, and separately named component props extending shared props utilities where applicable.
- Desktop application layouts are the current priority. The bundle's mobile MVP requirements are deferred by the repository's current policy.
- Product UI text must remain localizable. Documentation is maintained in English.

## Working product model

`User → Workspace membership → Workspace → Project → WorkItem` defines identity, access, and ownership. Board and List are views of the same work items. A project owns its statuses; a task has one primary assignee. Subtasks have their own status and assignee; checklist entries do not. Archive is read-only availability, distinct from Done.

The first end-to-end target is: authenticate, create a workspace, create a project, create a task, change its status, and see the same task in Board and List. Security, concurrency, error recovery, and permissions are part of that path.
