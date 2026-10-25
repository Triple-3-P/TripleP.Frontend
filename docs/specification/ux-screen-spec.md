# Screen behavior and interaction

English adaptation of the supplied UX screen specification. This is the target screen map, not a list of implemented routes. Desktop application layouts take priority under current repository policy.

## Navigation and screens

| Level          | P0 screens                                                                                          | Later screens                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Public/account | Landing, login, registration, password recovery, invitation acceptance, onboarding                  | Advanced account/session security                                     |
| Global shell   | Workspace switcher, account controls, search, quick create                                          | Command palette and broader personal work views                       |
| Workspace      | Home, My Tasks, Inbox, projects, members/invitations, basic settings                                | Teams, calendars, reports, portfolios, documents, enterprise settings |
| Project        | Overview, Board, List, members/settings/workflow                                                    | Calendar, Saved Views, Backlog/Sprints, Releases, Reports             |
| Work item      | Detail drawer and standalone deep-link page, fields, subtasks/checklists, comments, files, activity | Dependencies, Epic/Sprint, custom fields and time tracking            |

Show later modules only when enabled and permitted. A disabled product module is distinct from a missing resource. Route patterns in the original bundle were illustrative; do not create destinations just to match that diagram.

## Interaction requirements

- The shell retains workspace/project context and provides predictable breadcrumbs and back/forward navigation.
- Board columns correspond to project statuses; cards show enough identity, assignment, priority and deadline context without loading full descriptions/activity.
- Board movement supports keyboard/menu actions as well as drag-and-drop. Indicate pending writes, reject unavailable transitions and reconcile failed optimism.
- List shares Board's collection and filters. P0 supports sorting/filtering/open/create; advanced inline/bulk editing is P1.
- URL parameters own shareable filters, sort, pagination and active view. Form drafts and open transient controls remain local state.
- A task opened from a view preserves the background context. A direct URL works independently. Closing a modal restores focus to the trigger.
- Task controls use backend capabilities. Archived tasks/projects show read-only state and a restore action only where permitted.
- Workflow retirement and membership removal explain affected data before applying destructive changes.
- Rich-text format and limits need agreement before choosing the production editor. Render only validated/sanitized content.

## Required states

| State                        | UX requirement                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Loading                      | Stable skeleton/layout; no false empty state before data resolves.                   |
| Empty                        | Explain the collection and offer a permitted create/join action.                     |
| No matches                   | Explain active filtering and offer Clear filters.                                    |
| Unauthenticated              | Follow the real session flow and clear private caches.                               |
| Forbidden / masked not found | No private names, descriptions, counts or previews.                                  |
| Archived                     | Visible read-only banner; permitted restoration path.                                |
| Pending mutation             | Saving indicator, prevent duplicate actions, preserve draft.                         |
| Validation                   | Field errors tied to inputs; retain entered values.                                  |
| Network/server failure       | Explain retry availability without pretending the change saved.                      |
| Conflict                     | Preserve draft, fetch current values, offer reload/compare/reapply; no blind replay. |
| Partial result               | Identify successful and failed items separately.                                     |
| Offline                      | Honest connectivity state; offline-first writes are not promised.                    |
| Access revoked               | Remove sensitive content immediately and explain lost access.                        |

Map transport failures using machine error codes and structured fields, not translated server text. Keep product copy localizable.

## Accessibility and future mobile work

Support keyboard navigation, visible focus, accessible labels, meaningful table/dialog semantics and correct focus return. Status/priority cannot rely on color alone. Announce important operation results accessibly. Respect reduced motion and preserve focus/reading order if virtualization is introduced.

The source proposes mobile drawers, full-screen task sheets and accessible touch targets. Those are future adaptation guidance, because repository policy defers mobile application implementation. Do not treat source item UX-04 as an immediate expansion of the current scope.
