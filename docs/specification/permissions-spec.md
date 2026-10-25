# Roles and effective permissions

English adaptation of the source permission proposal. The backend computes and enforces access on every request. A disabled or hidden frontend control is only a UX affordance.

## Roles

| Scope     | Role           | Proposed responsibility                                                                                                              |
| --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Workspace | Owner          | Ownership transfer, archive/deletion, settings and access management. Never remove the last active owner.                            |
| Workspace | Admin          | Members, invitations, shared catalogs and settings within policy. Cannot remove/demote Owner or promote itself beyond its authority. |
| Workspace | Member         | Participate in accessible projects; invitation/project creation depends on workspace policy.                                         |
| Workspace | Guest          | Explicitly granted projects only; no general member directory, billing or workspace-wide visibility.                                 |
| Project   | Manager        | Project settings, members, workflow and archive, plus Editor capabilities.                                                           |
| Project   | Editor         | Create/edit/assign/transition work, comments and files within contextual policy.                                                     |
| Project   | Viewer         | Read permitted work and reports. No comments or work changes in the proposed default.                                                |
| Project   | Commenter (P1) | Read, comment, react and watch without editing work items.                                                                           |

Workspace ownership/administration does not silently bypass a private project's access controls. Any emergency administrator access needs an explicit audited policy. Billing access also confers no private-project access.

## Effective access algorithm

1. Authenticate and require active workspace membership.
2. Verify the requested resource belongs to the expected tenant.
3. For private projects, require an explicit project grant (or P1 team grant). Workspace-visible projects give active non-guest members a proposed Viewer baseline.
4. Combine confirmed project grants using Manager > Editor > Commenter > Viewer, bounded by workspace policies and restrictions.
5. Work items inherit project access. Item-level ACL is deferred to P2 unless explicitly approved earlier.
6. Check the specific action and contextual conditions: archive state, assignment eligibility, workflow and resource version.
7. Re-evaluate on the server for every read/write, including list/count/search/report/file operations.

## Permission defaults

| Actions                                                 | Owner/Admin or Manager                   | Member or Editor                   | Guest or Viewer                                             |
| ------------------------------------------------------- | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| Workspace update, member role/removal, labels           | Owner/Admin, subject to owner protection | By explicit policy where supported | No                                                          |
| Workspace archive/delete/transfer                       | Owner only                               | No                                 | No                                                          |
| Workspace invitation/project creation                   | Owner/Admin                              | Workspace Member: policy           | Guest: no                                                   |
| Project update/members/workflow/archive                 | Manager                                  | Editor: no                         | Viewer: no                                                  |
| Project/item read and permitted reports                 | All granted project roles                | Yes                                | Viewer: yes; Guest still needs a grant                      |
| Item create/update/transition/assign                    | Manager                                  | Editor: yes                        | Viewer: no                                                  |
| Item archive/delete or later move/bulk changes          | Manager                                  | Editor: policy                     | Viewer: no                                                  |
| Create/edit own comments, upload/delete own attachments | Manager                                  | Editor: yes                        | Viewer: no; P1 Commenter can comment, attachments by policy |
| Moderate another user's comment                         | Manager                                  | No                                 | No                                                          |
| P1 personal views                                       | All granted project roles                | Yes                                | Viewer: yes                                                 |
| P1 shared views / export / sprint management            | Manager                                  | Editor: policy                     | Viewer: no                                                  |

Representative names: `workspace.update`, `workspace.members.invite`, `workspace.members.update_roles`, `workspace.members.remove`, `workspace.project.create`, `project.read`, `project.update`, `project.members.manage`, `project.workflow.manage`, `item.create`, `item.read`, `item.update`, `item.transition`, `item.assign`, `comment.create`, `comment.update_own`, `comment.moderate`, `attachment.upload`, `attachment.download`.

The source API also uses `project.create` and `workspace.members.manage` in some places. Reconcile those names against the permission catalog before freezing contracts; this import does not assert that a permission enum exists.

## Context and revocation

Only eligible members with item access can be assigned or mentioned. An invitation does not establish access before acceptance. A move requires permissions in both source and target projects. A shared view or copied link grants no additional visibility. A file URL must be issued only after checking the underlying item's access and scan state.

Expose backend capabilities for UI controls. On logout, session expiry, tenant change or revoked access, clear protected client caches and replace sensitive open views. Losing a team grant must take effect on the next backend request immediately; cache TTL is not an authorization mechanism. Preserve historical actors without retaining access.

Test direct private URLs, foreign-tenant IDs, viewer writes, guests enumerating workspace resources, administrator private-project bypass, revoked member reads, hidden notification previews/counts and signed file access. Use the actual backend contracts.
