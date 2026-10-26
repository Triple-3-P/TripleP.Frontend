# Product scope

English adaptation of the supplied PRD and design summary. This is a planning draft; see [implementation decisions](implementation-plan.md) before treating recommendations as settled requirements.

## Purpose and audience

TripleP is a collaborative task manager inspired by Jira, ClickUp, and Linear. Its intended audience is development, design, and product teams, startups, and small companies, approximately 3–100 people. The precise audience and SaaS/self-hosted delivery model remain undecided.

The core value is quick work capture, clear responsibility and priorities, visible project progress, and discussion context attached to the work. Keep required fields minimal, support keyboard operation and deep links, and explain permission and failure states. Advanced planning should be optional.

## Product hierarchy

| Level             | Responsibility                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Account / My Work | Identity, profile, preferences, workspace switching, personal tasks and notifications.                 |
| Workspace         | Tenant boundary, members, invitations, roles, shared catalogs and projects.                            |
| Project           | Work ownership, visibility, members, statuses, enabled modules and views.                              |
| WorkItem          | Task/Bug/Subtask in P0; Story/Epic later. Own identity, fields, workflow, comments, files and history. |
| View              | Filter, sort, group and display existing work items without copying them.                              |
| Team / Portfolio  | Later: groups of people / groups of projects, respectively. Neither replaces project ownership.        |

## Proposed rollout

| Stage    | Scope                                                                                                                                                                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 / MVP | Email auth and recovery; workspace creation and membership; public-to-workspace/private projects; role enforcement; statuses; Task/Bug/Subtask; labels and checklists; Board/List; comments and mentions; attachments and activity; My Tasks; basic search; in-app notifications; basic project counters. |
| P1       | Teams, Story/Epic, custom fields, transition graphs, saved views, Calendar, Scrum/backlog/sprints, dependencies, releases, milestones, time tracking, templates, richer reporting and imports.                                                                                                            |
| P2       | Portfolios, Timeline/Gantt, workload, documents/wiki, forms, automations, integrations, optional AI, enterprise security and billing.                                                                                                                                                                     |

The original catalog contains 364 capabilities: 78 P0, 165 P1 and 121 P2. These counts describe the source inventory, not completed work or a fixed release commitment. The [feature catalog](feature-catalog.md) preserves P0 identifiers and summarizes later areas.

Current repository policy defers mobile application implementation. The source's mobile P0 item is retained as a traceable source requirement, with the override documented. Native apps, offline-first editing, realtime delivery, Scrum, enterprise administration and billing are not prerequisites for the proposed first task-management slice.

## MVP acceptance

- A user can join or create a workspace, create a project and invite an eligible collaborator.
- A project supplies defaults so a task can be created from a title; type, status and reporter still resolve to valid backend values.
- Board and List expose the same task, and changes persist across navigation and reload.
- Users can change task details/status, assign permitted members, add subtasks/checklists, discuss work and access authorized attachments.
- Search, My Tasks, notifications and counters reveal only authorized data.
- Concurrent edits do not silently discard work; failures preserve form input and reconcile optimistic UI.
- Archived resources are readable where permitted and clearly read-only.

## Quality and measurement

Use paginated bounded payloads, stable sorting, accessible controls, visible focus and reduced-motion support. Treat tenant isolation, safe rich-text rendering, attachment access and audit as product behavior. Detailed acceptance cases are in the [business rules](business-rules.md) and [API contract](api-contracts.md).

The source proposes measuring activation/time to first project and task, active teams, task creation/completion, retention and feature use. Reporting must define its time window, timezone, visibility scope and freshness. Numeric targets, service levels, limits, pricing and release dates are not approved by this import.
