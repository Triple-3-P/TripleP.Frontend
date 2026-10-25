# Domain model

Condensed English adaptation of source domain model v0.3. All storage and command designs are proposals. The [API contract](api-contracts.md) defines the newer proposed HTTP shapes; it supersedes older nested-error and version examples. The backend's implemented schema remains authoritative for integration.

## Identity and ownership

- `User` is global. A `WorkspaceMember` joins a user to a workspace, which is the tenant and access boundary.
- A `Project` belongs to exactly one workspace. A `WorkItem` belongs to exactly one project.
- Board/List/Calendar/Timeline are `SavedView` configurations over work items, not task-owning containers.
- `Team` groups users and may grant project access in P1. `Portfolio` groups projects in P2.
- Internal IDs are immutable UUIDs. Human keys such as `WEB-123` are display identifiers, never foreign keys.
- A project key is unique within its workspace; an item number is unique within its project. Allocate numbers atomically.
- The proposed P0 policy freezes the project key after the first item. Later moves/renames preserve old keys with authorized aliases. Their exact rollout stage needs agreement.

See the [core diagram](erd-core.mmd) and [planning diagram](erd-planning.mmd). Diagrams are conceptual: self-links on WorkItem represent separate nullable `parentId` and `epicId` relationships, and some links are future scope.

## Entity map

| Area          | P0 entities                                                                   | Later additions                                          |
| ------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| Identity      | User, UserSession, UserPreferences                                            | Advanced authentication and security policies            |
| Workspace     | Workspace, WorkspaceMember, Invitation                                        | Team, TeamMember, ProjectTeamGrant, Portfolio            |
| Project       | Project, ProjectMember, ProjectSettings                                       | Module-specific settings                                 |
| Work          | WorkItem, WorkItemType, WorkItemCounter, WorkflowStatus, Label, WorkItemLabel | Epic, relations, watchers, custom fields, key migrations |
| Collaboration | Comment, CommentMention, Checklist, ChecklistItem, Attachment                 | Threaded comments and richer editor features             |
| Events        | ActivityEvent, OutboxEvent, Notification                                      | Additional notification channels and integrations        |
| Views         | System Board and List configurations                                          | Personal/shared SavedView and SavedFilter                |
| Planning      | None required for the first slice                                             | Sprint, SprintWorkItem, Release, Milestone, TimeEntry    |

## Core fields and constraints

| Entity          | Essential data and constraints                                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User            | ID, normalized unique email, display name, avatar, locale, IANA timezone, account state and timestamps. Email is mutable, not an FK.                                                |
| Workspace       | ID, name, slug, timezone, lifecycle, owner, timestamps and version. At least one active owner; slug uniqueness follows the chosen URL namespace.                                    |
| WorkspaceMember | Unique workspace/user pair; owner/admin/member/guest role, active/suspended state and membership dates. Revoked membership gives no derived access.                                 |
| Invitation      | Workspace, normalized email, inviter, role/project grants, hashed single-use token, expiry, acceptance and revocation timestamps.                                                   |
| Project         | Workspace, name, normalized key/slug, description, visibility, lead, template/modules, lifecycle, version and timestamps. Lead must have access; leadership is not a security role. |
| ProjectMember   | Unique project/user pair and manager/editor/viewer role. Requires active membership in the owning workspace.                                                                        |
| WorkflowStatus  | Project, name, category, color, rank, default and active state, version. Exactly one active default and at least one active status per project.                                     |
| WorkItem        | Workspace/project, number, type, title, structured description, status, priority, reporter, optional assignee/parent/epic/dates, rank, completion/lifecycle timestamps and version. |

WorkItem title is trimmed and nonempty; the source proposes a maximum of 255 characters. Priorities are `none`, `low`, `medium`, `high`, `urgent`. Date-only deadlines stay `YYYY-MM-DD`; timestamp values use UTC. An exact deadline time is a separate later concept. Effort estimate and time spent are distinct.

Every status/parent/epic relationship must agree with the work item's project. Types and labels must agree with the workspace. Enforce these constraints in backend transactions and appropriate composite foreign keys, not only in the UI.

## Types, subtasks and epics

Use an extensible `WorkItemType` catalog with seeded Task, Bug and Subtask types in P0. Story/Epic and configurable types are P1. Bug-specific details such as severity, environment and reproduction steps may use a one-to-one extension; required fields still need approval.

`parentId` means subtask hierarchy; `epicId` means logical epic membership. They are independent. Proposed P0 subtasks have one level, share the parent's project, and have their own status, assignee and deadline. No cycles or self-parenting. Checklist entries are simple checked/unchecked lines with no independent work-item identity, workflow or assignee.

P1 proposes one epic per non-epic/non-subtask item. A Story can belong to an Epic and have Subtasks; its subtasks inherit that grouping through their parent rather than having their own epic reference. Nested epics and deeper subtasks require a separate decision.

## Workflow and lifecycle

Statuses are project-defined and map to `todo`, `in_progress` or `done`. P0 proposes free transitions between active project statuses for actors with `item.transition`; P1 adds an explicit transition graph and validators.

Entering Done sets current `completedAt`; reopening clears it while preserving historical completion events. Archive does not mark work Done. Availability and execution are separate:

```text
Execution: project Todo / In Progress / Done statuses
Availability: Active <-> Archived -> Trash -> Purged (subject to retention)
```

An archived workspace makes its projects read-only. An archived project blocks ordinary item/comment/file mutations. Restoration recalculates current permissions and never restores revoked membership. Family archive/restore and retention details require agreement before implementation.

## Collaboration and derived data

- Comments retain their author/history after membership changes. Editing another author's comment requires moderation permission. Mentions must target people with access.
- Attachments record ownership, storage key, type, size, checksum and scan state. Access and a clean scan are required before download; temporary URLs are not permanent grants.
- Activity is append-only business history. Outbox events deliver committed changes; notifications/search/analytics are derived projections.
- Save domain changes, activity and outbox atomically. Deduplicate delivery by event ID; notification read state must not alter audit history. Do not record secrets in event payloads.
- Views store bounded, validated filter/sort/group/layout definitions. They never grant access and do not store an authoritative copy of item IDs. Invalidated filters must be recoverable.

## Storage and concurrency

PostgreSQL is the intended backend database but persistence is not implemented at the inspected revision. Proposed storage uses UUIDs, UTC timestamps, date-only columns, explicit lifecycle fields, version checks and indexes scoped to common tenant/project queries. Avoid destructive cascades for workspace/project/work-item deletion; use an explicit retention workflow.

Use conditional writes and exact opaque ETags. Never construct an ETag from an integer version. Preserve one idempotency key for each logical create/command across transport retries. Server-side ranking must validate neighbors and handle concurrent reorder/rebalance. A status transition does not imply a rank change unless the contract explicitly guarantees it.

## Later models

P1 proposes one active sprint per project, historical sprint membership and immutable completion snapshots. Closing a sprint explicitly places unfinished work into backlog or a planned sprint. Releases, milestones, estimates and logged time remain separate concepts.

Custom fields need typed definitions/options/values, constrained queries and explicit migrations when types change. Dependency links forbid self-links, duplicates and blocking cycles. Cross-project moves require source and target permissions, family/field/status mappings and old-key aliases.

P2 documents/forms/automations/integrations/billing remain separate areas. Automation rules are validated data, not executable user JavaScript, and run with bounded service permissions and recursion protection. None of these future modules justifies creating empty production tables now.
