# Business rules and acceptance cases

English consolidation of the source business rules and domain invariants. These are proposed requirements for implementation. See [open decisions](implementation-plan.md) for unresolved policy details.

## Invariants

| Source ID | Rule                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| INV-001   | Project, work item, label and type must agree on workspace.                                    |
| INV-002   | A work item's status belongs to its project.                                                   |
| INV-003   | Work-item type belongs to the workspace and is enabled for the project.                        |
| INV-004   | Item number is unique within the project.                                                      |
| INV-005   | Current display keys and reserved aliases do not collide within the workspace.                 |
| INV-006   | Exactly one active default status and at least one active status exist per project.            |
| INV-007   | Parent/subtask links are same-project, acyclic and one level in proposed P0.                   |
| INV-008   | An epic reference targets a same-project Epic; a Subtask has no direct epic reference.         |
| INV-009   | The current assignee has access to the item. Pending invitees are not eligible.                |
| INV-010   | Historical reporters and comment authors survive membership/account deactivation.              |
| INV-011   | Blocking relationships are acyclic, non-self and deduplicated.                                 |
| INV-012   | Archived/trashed resources reject ordinary writes.                                             |
| INV-013   | Stale protected mutations fail without overwriting data.                                       |
| INV-014   | Retried creation/commands do not duplicate items, comments or effects.                         |
| INV-015   | Domain writes, activity and outbox records commit atomically.                                  |
| INV-016   | Reads by ID/key, search, reports and counts enforce current access.                            |
| INV-017   | Shared views, links and notifications never grant access.                                      |
| INV-018   | Date-only fields are not converted through UTC midnight.                                       |
| INV-019   | Changing a populated custom-field type requires explicit migration.                            |
| INV-020   | Sprint/release membership agrees with the owning project.                                      |
| INV-021   | Inactive team/workspace memberships confer no access.                                          |
| INV-022   | Retiring a used status requires mapping, including archived work.                              |
| INV-023   | User-facing APIs cannot edit append-only activity.                                             |
| INV-024   | Workflow, filters and automations cannot execute arbitrary user code.                          |
| INV-025   | Files require current authorization and an acceptable scan state before issuing download URLs. |

## Command behavior

| Command              | Acceptance criteria                                                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create work item     | Check create permission, active project, type and parent; allocate number atomically; persist item/events; return one canonical item on an identical idempotent replay.                        |
| Edit work item       | Allowlist ordinary fields; validate assignee/labels; reject server-managed fields; conditionally write against the exact ETag; preserve unsaved input on conflict.                             |
| Transition           | Validate target status, access, lifecycle and current version; apply completion semantics and audit atomically. P1 adds graph validation.                                                      |
| Reorder              | Permit manual ordering only in a manual view; validate same-group neighbors; server computes rank. No lost cards under concurrent moves.                                                       |
| Retire status        | Preview impact across active, archived and retained deleted work; require a valid replacement and default migration; reject stale preview; apply atomically or expose a tracked migration job. |
| Archive/restore      | Explain affected children; enforce read-only state; restore only where current parent/project/status and permissions allow. Exact family policy is still a decision.                           |
| Remove member        | Protect the last owner; revoke membership and derived grants; proposed P0 unassigns affected tasks; preserve author/history references.                                                        |
| Move project (P1)    | Require source move and target create permissions; preview mappings and parent family; preserve internal IDs and old-key aliases; apply all changes atomically.                                |
| Complete sprint (P1) | Capture scope/completion/estimate snapshot and explicit disposition of unfinished work; repeated requests cannot create another completion.                                                    |

Use separate commands for transitions, reorder and project moves. A generic item PATCH cannot mutate project, workspace, key, number, status, version or audit fields. Omitted PATCH fields are unchanged; nullable fields can be cleared with `null`; supplied arrays replace their prior contents. The API proposal defines the exact allowlist.

## Collaboration, dates and reporting

Validate/sanitize rich text. Mention pickers and delivery respect the recipient's current access. Revocation removes sensitive notification previews and search results. In-app notifications are P0; email/push/digests are later. Avoid notifying actors about their own ordinary actions by default.

Deleting a comment may retain a tombstone; attachment deletion blocks metadata/download access immediately and removes storage asynchronously. Deleting teams or portfolios does not delete projects or tasks. Retention periods, purge recovery and audit retention remain undecided.

Use workspace timezone for proposed deadline interpretation, preserve calendar dates when users change timezone, and distinguish overdue unfinished work from completed work. Completion events in a period and current Done counts are different metrics. Reports filter all source data by access and expose freshness; sprint history must not change when a completed sprint's items later change.

## Validation scenarios

Cover concurrent key allocation; same/changed-body idempotent retries; missing/stale ETags; foreign-workspace assignee/label/type; foreign-project status/parent; parent cycles and depth; last-owner removal; occupied/default/last status retirement; archived writes; restoration after access revocation; safe file URLs; filtered pagination; date-only timezone changes; reopened Done work; and overlapping card moves.

P1 additionally covers cyclic dependencies, atomic family moves and old keys, typed custom-field values, team grant revocation and stable sprint snapshots. See [API test cases](api-contracts.md) and the [.NET integration checklist](dotnet-frontend-handshake.md). These are acceptance requirements, not tests that already exist or have passed.
