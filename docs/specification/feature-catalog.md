# Feature catalog

English planning digest of the source catalog. P0 entries retain all 78 source IDs; P1/P2 are summarized by area rather than reproduced as 286 individual commitments. The original totals are 364 capabilities: 78 P0, 165 P1, 121 P2. These are proposed capabilities, not implemented features.

## P0 inventory

| ID      | Capability                                                                                |
| ------- | ----------------------------------------------------------------------------------------- |
| ACC-01  | Register with email, verify it, sign in and sign out.                                     |
| ACC-02  | Recover and change password.                                                              |
| ACC-03  | Edit name, avatar, position and profile description.                                      |
| ACC-04  | Choose language, timezone and date/time formats.                                          |
| ACC-05  | Switch workspace; accept or decline invitations.                                          |
| ACC-06  | Choose light, dark or system theme.                                                       |
| PER-01  | See assigned active work in an accessible workspace.                                      |
| PER-02  | See Today, Overdue, Upcoming, No deadline and Completed groups.                           |
| PER-03  | See work created by me and recently opened items.                                         |
| PER-04  | Open a personal task and change its status from the list.                                 |
| WKS-01  | Create a workspace with name, slug, description and icon.                                 |
| WKS-02  | Rename and edit workspace details.                                                        |
| WKS-03  | Switch workspace and see permitted projects.                                              |
| WKS-04  | Leave a workspace without stranding its sole owner.                                       |
| MEM-01  | List members, guests and pending invitations.                                             |
| MEM-02  | Invite by email with a workspace role.                                                    |
| MEM-03  | Resend or revoke an invitation.                                                           |
| MEM-04  | Change workspace roles and remove/suspend members.                                        |
| CFG-01  | Manage the shared label catalog: name, color and description.                             |
| CFG-02  | Select standard priorities and work-type names; configurable catalogs remain later scope. |
| PRJ-01  | Create a project with name, unique key, description, icon and color.                      |
| PRJ-02  | Choose General/Kanban and a starter workflow; Scrum is later.                             |
| PRJ-03  | Set workspace-visible or private access.                                                  |
| PRJ-04  | Open overview with description, progress, members and recent activity.                    |
| PRJ-05  | Edit project details and settings.                                                        |
| PRJ-06  | Archive, browse archived projects and restore.                                            |
| PACC-01 | View project members and roles.                                                           |
| PACC-02 | Add an eligible workspace member with a project role.                                     |
| PACC-03 | Change project roles and remove grants.                                                   |
| PACC-04 | Protect private projects through direct URLs and API access.                              |
| WF-01   | Create, rename, order and color project statuses.                                         |
| WF-02   | Map statuses to todo / in_progress / done categories.                                     |
| WF-03   | Set the default status for new work.                                                      |
| WF-04   | Transition between permitted active statuses.                                             |
| WF-05   | Retire an occupied status only after safely migrating its work.                           |
| TASK-01 | Create work from global or project/view context; Task/Bug first, Story/Epic in P1.        |
| TASK-02 | Create with a title while valid defaults supply other required values.                    |
| TASK-03 | Open stable task URLs and human keys such as WEB-123.                                     |
| TASK-04 | Edit title and structured description with supported rich-text content.                   |
| TASK-05 | Change status, priority, assignee and reporter where permitted.                           |
| TASK-06 | Set deadline and labels; start-date scheduling is later in the source catalog.            |
| TASK-07 | Create a Subtask with its own status and assignee.                                        |
| TASK-08 | Maintain multiple checklists with entries and progress.                                   |
| TASK-09 | Copy a task link and open from Board/List/Search/Inbox.                                   |
| TASK-10 | Archive, restore and inspect task history.                                                |
| COL-01  | Comment and mention an authorized participant.                                            |
| COL-02  | Edit/delete own comments under policy and display edited state.                           |
| COL-03  | Attach and download authorized files.                                                     |
| COL-04  | Read who changed what and when.                                                           |
| COL-05  | Receive assignment and mention notifications.                                             |
| VIEW-01 | Open Board and List over the same collection.                                             |
| VIEW-02 | Filter by status, assignee, priority, label, deadline and type.                           |
| VIEW-03 | Sort by deadline, update, creation, priority or manual rank.                              |
| VIEW-04 | Persist filters in shareable URLs without widening access.                                |
| BRD-01  | Display cards in status columns.                                                          |
| BRD-02  | Move cards between statuses and reorder them.                                             |
| BRD-03  | Create a task from a column.                                                              |
| BRD-04  | Open details from a card.                                                                 |
| BRD-05  | Collapse/expand columns and show authorized counts.                                       |
| BRD-06  | Show loading/errors and reconcile failed drag-and-drop changes.                           |
| LST-01  | Display tasks in a sortable/filterable table.                                             |
| LST-02  | Open from a row and create from the list.                                                 |
| RPT-01  | Show project total, active, completed and overdue counts.                                 |
| RPT-02  | Show distributions by status, priority and assignee.                                      |
| RPT-03  | Navigate from a counter/chart to its filtered list.                                       |
| NOT-01  | Receive assignment and mention notifications.                                             |
| NOT-02  | See source/time and navigate to the relevant change.                                      |
| NOT-03  | Mark read/unread and show unread count.                                                   |
| UX-01   | Search accessible tasks by key/title and projects by name.                                |
| UX-02   | Use stable task/project/comment deep links.                                               |
| UX-03   | Support breadcrumbs, browser navigation and empty/loading/error states.                   |
| UX-04   | Use main screens at mobile widths. **Source P0; deferred by current repository policy.**  |
| UX-05   | Support keyboard use, focus, screen readers and contrast.                                 |
| ADM-01  | Distinguish workspace Owner/Admin/Member/Guest.                                           |
| ADM-02  | Distinguish project Manager/Editor/Viewer; Commenter later.                               |
| ADM-03  | Protect private projects, tasks, files, search and notifications.                         |
| ADM-04  | Enforce resource authorization and tenant isolation on the server.                        |
| ADM-05  | Archive/restore primary entities instead of immediate irreversible removal.               |

## Later capability areas

| Area / source ID family                             | P1 direction                                                                                      | P2 direction                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Account / personal (`ACC`, `PER`)                   | Session/security controls, richer preferences, favorites and personal views                       | Advanced account/personal features                                                                    |
| Workspace / members (`WKS`, `MEM`, `CFG`)           | Ownership/lifecycle controls, policies, templates and expanded catalogs                           | Enterprise administration                                                                             |
| Teams (`TEAM`)                                      | Team membership, leadership and project grants                                                    | Advanced organization structure                                                                       |
| Portfolios (`PORT`)                                 | None required                                                                                     | Cross-project portfolios, objectives and roadmaps                                                     |
| Projects / access (`PRJ`, `PACC`)                   | Templates, project modules, team grants and richer roles                                          | Advanced configuration/access                                                                         |
| Workflow / work (`WF`, `TASK`)                      | Graph/validators, Story/Epic, fields, relations, watchers, moves, duplication and bulk operations | Advanced lifecycle and customization                                                                  |
| Collaboration (`COL`)                               | Threads, richer collaboration and editor features                                                 | Extended collaborative features                                                                       |
| Views / Board / List (`VIEW`, `BRD`, `LST`)         | Saved views, grouping, table editing/columns, bulk actions and board customization                | Advanced view capabilities                                                                            |
| Calendar / Timeline / capacity (`CAL`, `TL`, `CAP`) | Calendar planning                                                                                 | Timeline/Gantt and workload                                                                           |
| Scrum / releases / milestones (`SCR`, `REL`, `MLS`) | Backlog, sprints, story points, release readiness, milestones and dependencies                    | Advanced planning                                                                                     |
| Reports / time (`RPT`, `TIME`)                      | Trends, sprint metrics, estimates, logged time and exports                                        | Advanced dashboards and accounting                                                                    |
| Documents / intake (`DOC`, `FORM`)                  | None required                                                                                     | Wiki, document revisions, forms and request triage                                                    |
| Notifications / navigation (`NOT`, `UX`)            | Subscriptions, channels, advanced search and navigation                                           | Advanced notification/navigation features                                                             |
| Automation (`AUTO`)                                 | None required                                                                                     | Trigger/condition/action rules, dry runs, execution logs and safe retries                             |
| Integrations (`INT`)                                | Initial import/export capabilities                                                                | Provider integrations, webhooks and extended API ecosystem                                            |
| Administration (`ADM`)                              | Expanded access/security administration                                                           | Enterprise controls, billing and compliance features                                                  |
| AI (`AI`)                                           | None required                                                                                     | Optional decomposition, summaries, duplicate discovery and reporting, with confirmation for mutations |

Source catalogs disagree on a few stage boundaries and field details. See [implementation decisions](implementation-plan.md), especially archive/restore, project keys, task types, mobile and notification endpoints. A source P0 label alone is not authorization to invent a missing backend contract.
